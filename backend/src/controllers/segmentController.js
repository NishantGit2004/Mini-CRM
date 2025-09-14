import Segment from '../models/Segment.js';
import Customer from '../models/Customer.js';
import { astToMongoQuery } from '../utils/ruleEvaluator.js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export async function createSegment(req, res) {
  try {
    const { name, rules, combinator } = req.body;
    if (!name || !rules) return res.status(400).json({ error: 'name and rules required' });

    // Wrap rules in AST
    const mongoQuery = astToMongoQuery({ op: combinator, children: rules });
    const preview_count = await Customer.countDocuments(mongoQuery);

    const segment = await Segment.create({
      name,
      rules,
      preview_count,
      created_by: req.user?.sub || 'unknown'
    });

    return res.status(201).json({ segment });
  } catch (err) {
    console.error("Error creating segment:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function previewSegment(req, res) {
  try {
    const { id } = req.params;
    const segment = await Segment.findById(id);
    if (!segment) return res.status(404).json({ error: 'not found' });

    const mongoQuery = astToMongoQuery({ op: 'AND', children: segment.rules });
    const sample = await Customer.find(mongoQuery).limit(50).lean();

    return res.json({ preview_count: segment.preview_count, sample });
  } catch (err) {
    console.error("Error previewing segment:", err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function generateSegmentFromAI(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const result = await model.generateContent({
      contents: [
        {
          parts: [
            {
              text: `Convert the following natural-language audience description into a JSON AST.
    Available fields:
    - 'total_spend' (number)
    - 'visits' (number)
    - 'last_order_at' (number, days ago)
    - 'tags' (array of strings)

    Operators:
    - >, >=, <, <=, ==, in, contains, not_contains, older_than_days, newer_than_days
    - Use "op" with "children" for logical groups (AND / OR)

    Requirements:
    - Return valid JSON only, no explanations.
    - Each child must include: field, operator, value.
    - Logical groups must use "op" and "children".

    Example:
    Input: "Customers who spent over 10000 and haven't visited in 3 months"
    Output:
    {
      "op": "AND",
      "children": [
        { "field": "total_spend", "operator": ">", "value": 10000 },
        { "field": "last_order_at", "operator": "older_than_days", "value": 90 }
      ]
    }

    Now generate AST for: "${prompt}"`
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || null;
    if (!text) throw new Error("No response from Gemini");

    const ast = JSON.parse(text);

    let preview_count = 0;
    try {
      const mongoQuery = astToMongoQuery({ op: ast.op, children: ast.children });
      preview_count = await Customer.countDocuments(mongoQuery);
    } catch (e) {
      console.warn("AST validation failed, skipping preview count:", e.message);
    }

    return res.json({
      name: prompt,
      ast,
      preview_count,
    });
  } catch (err) {
    console.error("Error generating segment with AI:", err);
    return res.status(500).json({ error: "Failed to generate rules" });
  }
}