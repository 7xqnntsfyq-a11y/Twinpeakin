import { useState, useEffect } from "react";
import { X, Loader2, MessageSquare, BarChart3, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { toast } from "sonner";

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

interface AnalyticsData {
  totalConversations: number;
  totalMessages: number;
  modeUsage: Record<string, number>;
}

export default function AnalyticsDashboard({
  isOpen,
  onClose,
  profile,
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
    }
  }, [isOpen]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/analytics/summary");
      if (!response.ok) throw new Error("Failed to load analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const coreCount = analytics?.modeUsage?.core || 0;
  const fieldCount = analytics?.modeUsage?.field || 0;
  const totalModeMessages = coreCount + fieldCount;

  const pieData = [
    {
      name: profile?.coreSelfLabel || "Core Mode",
      value: coreCount,
      color: "#a855f7",
    },
    {
      name: profile?.fieldSelfLabel || "Field Mode",
      value: fieldCount,
      color: "#3b82f6",
    },
  ];

  const favoriteMode =
    coreCount > fieldCount
      ? profile?.coreSelfLabel || "Core Mode"
      : fieldCount > coreCount
      ? profile?.fieldSelfLabel || "Field Mode"
      : "Balanced";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-4 md:inset-10 lg:inset-20 bg-gradient-to-br from-gray-950 to-blue-950/30 border border-blue-900/30 rounded-2xl shadow-2xl z-50 overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-900/20 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-900/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <MessageSquare className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.totalConversations || 0}
                      </p>
                      <p className="text-sm text-gray-400">
                        Total Conversations
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-900/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <BarChart3 className="text-purple-400" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.totalMessages || 0}
                      </p>
                      <p className="text-sm text-gray-400">Total Messages</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-cyan-900/20 to-cyan-800/10 border border-cyan-900/30 rounded-xl backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Target className="text-cyan-400" size={24} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {favoriteMode}
                      </p>
                      <p className="text-sm text-gray-400">Preferred Mode</p>
                    </div>
                  </div>
                </div>
              </div>

              {totalModeMessages > 0 && (
                <div className="bg-gradient-to-br from-gray-900/50 to-blue-900/10 border border-blue-900/30 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-semibold text-blue-400 mb-6">
                    Mode Usage Distribution
                  </h3>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-1/2 h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                            }
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#1a1a1a",
                              border: "1px solid #1e3a8a",
                              borderRadius: "8px",
                              color: "#fff",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="w-full md:w-1/2 space-y-4">
                      <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-300 font-medium">
                            {profile?.coreSelfLabel || "Core Mode"}
                          </span>
                          <span className="text-white font-bold">
                            {coreCount}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                totalModeMessages > 0
                                  ? (coreCount / totalModeMessages) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-300 font-medium">
                            {profile?.fieldSelfLabel || "Field Mode"}
                          </span>
                          <span className="text-white font-bold">
                            {fieldCount}
                          </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                totalModeMessages > 0
                                  ? (fieldCount / totalModeMessages) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {totalModeMessages === 0 && (
                <div className="bg-gradient-to-br from-gray-900/50 to-blue-900/10 border border-blue-900/30 rounded-xl p-12 text-center backdrop-blur-sm">
                  <BarChart3 className="mx-auto mb-4 text-gray-600" size={48} />
                  <p className="text-gray-400 text-lg">
                    No analytics data yet
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Start conversations to see your usage patterns
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
