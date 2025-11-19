import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";
import ChatWorkspace from "../components/ChatWorkspace";
import SettingsPanel from "../components/SettingsPanel";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [conversationRefreshTrigger, setConversationRefreshTrigger] = useState(0);

  useEffect(() => {
    loadProfile();
    loadPreferences();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (!response.ok) throw new Error("Failed to load profile");
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    }
  };

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/preferences");
      if (!response.ok) return;
      const data = await response.json();
      setSidebarCollapsed(data.preferences.sidebarCollapsed || false);
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setLocation("/");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const handleSelectConversation = (id: number) => {
    setActiveConversationId(id);
  };

  const handleConversationCreated = (id: number) => {
    setActiveConversationId(id);
    setConversationRefreshTrigger((prev) => prev + 1);
  };

  const handleProfileUpdate = () => {
    loadProfile();
  };

  return (
    <div className="h-screen flex overflow-hidden bg-black">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={handleNewChat}
        onOpenAnalytics={() => setAnalyticsOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        refreshTrigger={conversationRefreshTrigger}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-16" : "ml-0 md:ml-72"
        }`}
      >
        <header className="border-b border-blue-900/30 bg-black/95 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Twinpeakin
            </h1>
            {profile && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-purple-900/30 border border-purple-500/30 rounded text-purple-300">
                  {profile.coreSelfLabel || "Core"}
                </span>
                <span className="px-2 py-1 bg-blue-900/30 border border-blue-500/30 rounded text-blue-300">
                  {profile.fieldSelfLabel || "Field"}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-blue-900/20 rounded-lg transition-colors"
          >
            Logout
          </button>
        </header>

        <div className="flex-1 overflow-hidden">
          <ChatWorkspace
            conversationId={activeConversationId}
            onConversationCreated={handleConversationCreated}
            profile={profile}
          />
        </div>
      </div>

      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profile={profile}
        onProfileUpdate={handleProfileUpdate}
      />

      <AnalyticsDashboard
        isOpen={analyticsOpen}
        onClose={() => setAnalyticsOpen(false)}
        profile={profile}
      />
    </div>
  );
}
