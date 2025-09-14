import Campaign from '../models/Campaign.js';
import redis from '../config/redis-client.js';
import { v4 as uuidv4 } from 'uuid';
import Segment from '../models/Segment.js';
import CommunicationLog from '../models/CommunicationLog.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function createCampaign(req, res) {
  const { segment_id, message_template, channel } = req.body;
  if(!segment_id || !message_template) return res.status(400).json({ error: 'segment_id + message_template required' });
  const segment = await Segment.findById(segment_id);
  if(!segment) return res.status(404).json({ error: 'segment not found' });

  const campaign_id = 'camp_' + uuidv4();
  const campaign = await Campaign.create({
    campaign_id, user_id: req.user._id, name: segment.name, segment_id, message_template, status: 'processing', channel, audience_size: segment.preview_count || 0
  });

  // publish to campaign_start stream
  await redis.xadd('campaign_start', '*', 'payload', JSON.stringify({ campaign_id, segment_id }));

  return res.status(202).json({ campaign_id, status: 'started' });
}

export async function listCampaigns(req, res) {
  try {
    const campaigns = await Campaign.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $lookup: {
          from: "communicationlogs",
          localField: "campaign_id",
          foreignField: "campaign_id",
          as: "logs"
        }
      },
      {
        $addFields: {
          metrics: {
            sent: { $size: { $filter: { input: "$logs", cond: { $eq: ["$$this.status", "sent"] } } } },
            failed: { $size: { $filter: { input: "$logs", cond: { $eq: ["$$this.status", "failed"] } } } },
            pending: { $size: { $filter: { input: "$logs", cond: { $eq: ["$$this.status", "pending"] } } } },
            total: { $size: "$logs" }
          }
        }
      },
      { $project: { logs: 0 } },
      { $sort: { createdAt: -1 } }
    ]);

    const bulkUpdates = [];
    for (const campaign of campaigns) {
      const { sent, failed } = campaign.metrics;
      if (sent + failed >= campaign.audience_size && campaign.status !== "completed") {
        bulkUpdates.push({
          updateOne: {
            filter: { campaign_id: campaign.campaign_id },
            update: { $set: { status: "completed", updatedAt: new Date() } }
          }
        });
        campaign.status = "completed";
      }
    }

    if (bulkUpdates.length) await Campaign.bulkWrite(bulkUpdates);

    res.json({ campaigns });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch campaigns with metrics" });
  }
}

async function generateWithRetry(model, prompt, maxRetries = 3, initialDelay = 1000) {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      if (err.status === 503 && retries < maxRetries - 1) {
        console.log(`Model is overloaded. Retrying in ${delay / 1000}s... (Attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; 
        retries++;
      } else {
        throw err;
      }
    }
  }
}


export async function generateCampaignSummary(req, res) {
  try {
    const { id } = req.params;

    // A basic validation for the ID format can prevent unnecessary database queries
    if (!id || typeof id !== 'string') { // Add more specific validation if needed, e.g., for ObjectId
        return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    // 1. Fetch campaign details
    const campaign = await Campaign.findOne({ campaign_id: id, user_id: req.user._id });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // 2. Fetch log metrics efficiently using database queries
    // This is more performant than fetching all logs into memory, especially for large campaigns.
    const [sent, failed, pending, total] = await Promise.all([
      CommunicationLog.countDocuments({ campaign_id: id, status: "sent" }),
      CommunicationLog.countDocuments({ campaign_id: id, status: "failed" }),
      CommunicationLog.countDocuments({ campaign_id: id, status: "pending" }),
      CommunicationLog.countDocuments({ campaign_id: id })
    ]);

    const metrics = { sent, failed, pending, total };

    // 3. Prepare input for Gemini
    // Using a system instruction helps guide the model's persona and tone for more consistent results.
    const systemInstruction = {
      role: "system",
      parts: [{ text: "You are an enthusiastic marketing strategist. Your role is to craft an uplifting and engaging summary of a marketing campaign's performance. Celebrate the successes shown in the data and frame the results in a positive light, while still being factually accurate. The tone should be motivational." }]
    };

    const userPrompt = `
      Campaign Summary Request:
      Name: ${campaign.name}
      Message Template: ${campaign.message_template}
      Channel: ${campaign.channel}
      Audience Size: ${campaign.audience_size}
      Metrics: ${JSON.stringify(metrics, null, 2)}

      Frame the summary with a positive and encouraging tone, highlighting key achievements.
      Please provide a concise campaign summary (max 150 words).
    `;

    // 4. Call the Gemini API
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: systemInstruction,
    });
    
    const result = await generateWithRetry(model, userPrompt);
    const summary = result.response.text();

    // 5. Send the response
    res.json({ campaign_id: id, summary });

  } catch (err) {
    console.error("Summary generation failed:", err);
    const errorMessage = err.status ? `API Error: ${err.message}` : "Failed to generate campaign summary";
    res.status(err.status || 500).json({ error: errorMessage });
  }
}

export async function generateCampaignMessage(req, res) {
  try {
    const { segmentName } = req.body;
    if (!segmentName) {
      return res.status(400).json({ error: "segmentName is required" });
    }

    // We construct a clear, direct prompt for the model.
    const prompt = `
      You are an expert marketing copywriter specialized in SMS campaigns for e-commerce.
      Rules:
      1. The message must be under 160 characters.
      2. It must include a personalization placeholder like {{name}}.
      3. The tone should be engaging and compelling.
      4. Tailor the message specifically for this audience segment: "${segmentName}".
      5. IMPORTANT: Only return the raw SMS message content, nothing else. No quotes, no extra text.

      Write one short SMS message for the segment.
    `;

    // We reuse the same model setup as the summary generator.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    // Use the robust retry helper to handle potential API overload.
    const result = await generateWithRetry(model, prompt);
    const message = result.response.text();

    console.log("Generated Message:", message);

    if (!message) {
      console.error("Gemini returned an empty response:", result.response);
      return res.status(500).json({ error: "Failed to generate message from AI" });
    }

    // Clean up the response to ensure it's just the raw message text.
    const cleanedMessage = message.trim().replace(/^"|"$/g, '');

    return res.json({ message: cleanedMessage });

  } catch (err) {
    console.error("Error generating campaign message:", err);
    const errorMessage = err.status ? `API Error: ${err.message}` : "Failed to generate campaign message";
    return res.status(err.status || 500).json({ error: errorMessage });
  }
}