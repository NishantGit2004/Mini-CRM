import React from "react";
import SparklesIcon from "../icons/SparklesIcon";
import axiosInstance from "../api/axiosInstance";

export default function CampaignCard({ campaign, onSummarize, summaryModal, setSummaryModal }) {
  const statusStyles = {
    completed: "bg-emerald-800/30 text-emerald-400",
    processing: "bg-sky-800/30 text-sky-400",
    draft: "bg-slate-700/30 text-slate-300",
    failed: "bg-red-800/30 text-red-400",
  };

  // Safe defaults for numbers
  const audienceSize = campaign?.audience_size ?? 0;
  const sentCount = campaign?.metrics?.sent ?? 0;
  const failedCount = campaign?.metrics?.failed ?? 0;

  const sentPercentage = audienceSize ? (sentCount / audienceSize) * 100 : 0;

  // Safe default for created_at
  const createdAt = campaign.createdAt ? new Date(campaign?.createdAt).toLocaleDateString() : "N/A";

  const handleSummary = async (campaign) => {
    setSummaryModal({
      isOpen: true,
      campaign,
      summary: "",
      isLoading: true,
    });

    try {
      const res = await axiosInstance.post(`/campaigns/${campaign.campaign_id}/summary`);
      console.log("Campaign Summary:", res.data.summary);

      setSummaryModal({
        isOpen: true,
        campaign,
        summary: res.data.summary,
        isLoading: false,
      });

      return res.data.summary;
    } catch (err) {
      console.error("Error generating summary:", err);
      setSummaryModal({
        isOpen: true,
        campaign,
        summary: "⚠️ Failed to generate summary. Please try again.",
        isLoading: false,
      });
      return null;
    }
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">{campaign?.name || "Untitled Campaign"}</h3>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              statusStyles[campaign.status] || "bg-slate-700/40"
            }`}
          >
            {campaign.status || "Unknown"}
          </span>
        </div>

        <div className="text-sm text-slate-400 mb-4">Created: {createdAt}</div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Audience</span>
            <strong className="font-mono">{audienceSize.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Sent</span>
            <strong className="text-emerald-400 font-mono">{sentCount.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Failed</span>
            <strong className="text-red-400 font-mono">{failedCount.toLocaleString()}</strong>
          </div>
        </div>

        <div className="mt-4">
          <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              style={{ width: `${Math.round(sentPercentage)}%` }}
              className="h-2.5 bg-teal-500 rounded-full"
            ></div>
          </div>
          <div className="text-xs text-right text-slate-400 mt-1">{Math.round(sentPercentage)}% delivered</div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        {campaign?.status === "completed" && (
          <button
            onClick={() => handleSummary(campaign)}
            className="text-sm text-teal-400 flex items-center gap-2 hover:text-teal-300"
          >
            <SparklesIcon className="w-4 h-4" />
            Summarize
          </button>
        )}
      </div>
    </div>
  );
}