// src/App.jsx
import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SegmentBuilderPage from "./pages/SegmentBuilderPage";
import CampaignCreatePage from "./pages/CampaignCreatePage";
import LoadingOverlay from "./components/LoadingOverlay";
import SummaryModal from "./components/SummaryModal";
import { mockUser, mockCampaignsData } from "./services/mockData";
import {
  createSegmentAPI,
  previewSegmentAPI,
  createCampaignAPI,
  listCampaignsAPI
} from "./api/backendAPI";
import "./App.css";
import axiosInstance from "./api/axiosInstance";

const operators = {
  total_spend: ['>', '<', '='],
  visits: ['>', '<', '='],
  last_order_at: ['older_than_days', 'newer_than_days'],
  tags: ['contains', 'not_contains']
};

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [newSegment, setNewSegment] = useState({ name: "", rules: [], combinator: "AND" });
  const [aiPrompt, setAiPrompt] = useState("");
  const [audienceCount, setAudienceCount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [newCampaign, setNewCampaign] = useState({ segment: null, message: "" });
  const [summaryModal, setSummaryModal] = useState({ isOpen: false, campaign: null, summary: "", isLoading: false });

  useEffect(() => {
    const loggedInUser = sessionStorage.getItem("xeno-crm-user");

    if (loggedInUser) {
      const userData = JSON.parse(loggedInUser);
      setUser(userData);

      // Fetch campaigns from backend
      const fetchCampaigns = async () => {
        try {
          const { campaigns: fetchedCampaigns } = await listCampaignsAPI();
          console.log(fetchedCampaigns)
          setCampaigns(fetchedCampaigns.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        } catch (err) {
          console.error("Error fetching campaigns:", err);
          setCampaigns(mockCampaignsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
        }
      };

      fetchCampaigns();
      setPage("dashboard");
    }
  }, []);

  const handleAddRule = () => {
    const defaultField = "total_spend";
    const defaultOperator = ">";
    setNewSegment({
      ...newSegment,
      rules: [
        ...newSegment.rules,
        { id: Date.now(), field: defaultField, operator: defaultOperator, value: "" },
      ],
    });
  };


  // Keep handleLogin flexible: accept either backend-verified user object or mock user
  const handleLogin = (userData = null) => {
    const userToUse = userData || mockUser;
    setUser(userToUse);
    sessionStorage.setItem("xeno-crm-user", JSON.stringify(userToUse));
    setCampaigns(mockCampaignsData.sort((a, b) => b.created_at - a.created_at));
    setPage("dashboard");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("xeno-crm-user");
    setUser(null);
    setPage("login");
  };

  const handleGenerateRulesFromAI = async () => {
    if (!aiPrompt) return;
  setIsLoading(true);
  setLoadingMessage("✨ Gemini is generating rules...");

  try {
    const res = await axiosInstance.post("/segments/ai-generate", { prompt: aiPrompt });
    console.log(res.data)

      if (res.data) {
        setNewSegment({
          name: aiPrompt,
          rules: res.data.ast.children,
          combinator: res.data.ast.op
        });
      }
      console.log(newSegment)
    } catch (err) {
      console.error("Gemini call error:", err);
      alert("Failed to generate rules. Try again.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleNavigate = (targetPage) => {
    setPage(targetPage);
  };

  const handlePreviewAudience = async () => {
    if (!newSegment.name) return;

    setIsLoading(true);
    setLoadingMessage("Previewing audience...");

    try {
      console.log(newSegment)
      const tempSegment = await createSegmentAPI(newSegment);
      const { preview_count } = await previewSegmentAPI(tempSegment.segment._id);
      setAudienceCount(preview_count);
    } catch (err) {
      console.error("Error previewing audience:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleSaveSegment = async () => {
    if (!newSegment.name || newSegment.rules.length === 0) return;

    setIsLoading(true);
    setLoadingMessage("Saving segment...");

    try {
      console.log('Saving Segment')
      console.log(newSegment)
      const { segment } = await createSegmentAPI(newSegment);
      setNewCampaign({ ...newCampaign, segment });
      setPage("createCampaign");
    } catch (err) {
      console.error("Error saving segment:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const handleUpdateRule = (id, key, value) => {
    const updatedRules = newSegment.rules.map((rule) => {
      if (rule.id !== id) return rule;

      if (key === "field") {
        const defaultOperator = operators[value][0];
        return { ...rule, field: value, operator: defaultOperator, value: "" };
      }

      return { ...rule, [key]: value };
    });

    setNewSegment({ ...newSegment, rules: updatedRules });
  };

  const handleRemoveRule = (id) => {
    setNewSegment({ ...newSegment, rules: newSegment.rules.filter((rule) => rule.id !== id) });
  };

  const handleLaunchCampaign = async () => {
    if (!newCampaign.segment || !newCampaign.message) return;

    setIsLoading(true);
    setLoadingMessage("Launching campaign...");

    try {
      const { campaign_id, status } = await createCampaignAPI({
        segment_id: newCampaign.segment._id,
        message_template: newCampaign.message,
        channel: "sms",
      });

      const { campaigns: updatedCampaigns } = await listCampaignsAPI();
      setCampaigns(updatedCampaigns);

      setNewSegment({ name: "", rules: [], combinator: "AND" });
      setNewCampaign({ segment: null, message: "" });
      setAudienceCount(null);
      setAiPrompt("");
      setPage("dashboard");
    } catch (err) {
      console.error("Error launching campaign:", err.response?.data || err.message);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };


  const handleAiMessageSuggest = async () => {
    if (!newCampaign.segment?.name) return;

    setIsLoading(true);
    setLoadingMessage("✨ Gemini is crafting messages...");

    try {
      const res = await axiosInstance.post("/campaigns/message", {
        segmentName: newCampaign.segment.name,
      });

      if (res.data?.message) {
        setNewCampaign({ ...newCampaign, message: res.data.message });
      }
    } catch (err) {
      console.error("Gemini message suggest error:", err);
      alert("Failed to generate AI message. Try again later.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const renderPage = () => {
    switch (page) {
      case "login":
        return <LoginPage onLogin={handleLogin} />;
      case "dashboard":
        return <DashboardPage user={user} campaigns={campaigns} onNavigate={setPage} onLogout={handleLogout} summaryModal={summaryModal} setSummaryModal={setSummaryModal} />;
      case "createSegment":
        return (
          <SegmentBuilderPage
            newSegment={newSegment}
            setNewSegment={setNewSegment}
            aiPrompt={aiPrompt}
            setAiPrompt={setAiPrompt}
            onGenerateRules={handleGenerateRulesFromAI}
            onPreview={handlePreviewAudience}
            onSave={handleSaveSegment}
            audienceCount={audienceCount}
            isLoading={isLoading}
            onUpdateRule={handleUpdateRule}
            onAddRule={handleAddRule}
            onRemoveRule={handleRemoveRule}
            onNavigate={handleNavigate}
          />
        );
      case "createCampaign":
        return (
          <CampaignCreatePage
            newCampaign={newCampaign}
            setNewCampaign={setNewCampaign}
            onAiSuggest={handleAiMessageSuggest}
            onLaunch={handleLaunchCampaign}
            isLoading={isLoading}
            onNavigate={handleNavigate}
          />
        );
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans">
      {renderPage()}
      {summaryModal.isOpen && <SummaryModal modalState={summaryModal} setModalState={setSummaryModal} />}
      {isLoading && <LoadingOverlay message={loadingMessage} />}
    </div>
  );
}

// Wrap App with GoogleOAuthProvider and export wrapper as default
export default function AppWrapper() {
  // Make sure your VITE_GOOGLE_CLIENT_ID is set in .env (VITE_GOOGLE_CLIENT_ID=your-client-id)
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  );
}