import { MessageSquarePlus, BarChart3, Settings, Menu, X, Crown, Sparkles } from "lucide-react";
import ConversationList from "./ConversationList";
import { cn } from "../lib/utils";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onOpenAnalytics: () => void;
  onOpenSettings: () => void;
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  refreshTrigger: number;
  subscriptionStatus?: any;
  onOpenUpgrade: () => void;
}

export default function Sidebar({
  isCollapsed,
  onToggle,
  onNewChat,
  onOpenAnalytics,
  onOpenSettings,
  activeConversationId,
  onSelectConversation,
  refreshTrigger,
  subscriptionStatus,
  onOpenUpgrade,
}: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-black/95 backdrop-blur-xl border-r border-blue-900/30 transition-all duration-300 z-40 flex flex-col",
          isCollapsed ? "w-0 md:w-16" : "w-72"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-900/30">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Twinpeakin
            </h2>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-blue-900/20 transition-colors text-blue-400"
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="p-3">
              <button
                onClick={onNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg transition-all duration-200 shadow-lg shadow-blue-500/20"
              >
                <MessageSquarePlus size={20} />
                <span className="font-medium">New Chat</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ConversationList
                activeConversationId={activeConversationId}
                onSelectConversation={onSelectConversation}
                refreshTrigger={refreshTrigger}
              />
            </div>

            <div className="border-t border-blue-900/30 p-3 space-y-2">
              {subscriptionStatus?.tier === "pro" ? (
                <div className="px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Crown size={18} />
                    <span className="font-semibold">Pro Member</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Full access to all features</p>
                </div>
              ) : (
                <button
                  onClick={onOpenUpgrade}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
                >
                  <Sparkles size={20} />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">Upgrade to Pro</div>
                    <div className="text-xs opacity-90">Unlock full insights</div>
                  </div>
                </button>
              )}
              
              <button
                onClick={onOpenAnalytics}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-900/20 rounded-lg transition-colors text-gray-300 hover:text-blue-400"
              >
                <BarChart3 size={20} />
                <span>Analytics</span>
              </button>
              <button
                onClick={onOpenSettings}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-900/20 rounded-lg transition-colors text-gray-300 hover:text-blue-400"
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
            </div>
          </>
        )}
      </div>

      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
}
