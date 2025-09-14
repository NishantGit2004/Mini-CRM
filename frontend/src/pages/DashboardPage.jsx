import React from "react";
import Header from "../components/Header";
import CampaignCard from "../components/CampaignCard";

export default function DashboardPage({ user, campaigns, onNavigate, onLogout, onSummarize, summaryModal, setSummaryModal }) {
  return (
    <div>
      <Header user={user} onLogout={onLogout} onNavigate={onNavigate} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">Campaigns</h2>
            <p className="text-slate-400">Overview of recent campaigns</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => onNavigate("createSegment")} className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-md font-semibold">
              + New Campaign
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <CampaignCard key={c._id} campaign={c} onSummarize={onSummarize} summaryModal={summaryModal} setSummaryModal={setSummaryModal} />
          ))}
        </div>
      </main>
    </div>
  );
}