import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdate: () => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}: SettingsPanelProps) {
  const [coreSelfLabel, setCoreSelfLabel] = useState("");
  const [fieldSelfLabel, setFieldSelfLabel] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setCoreSelfLabel(profile.coreSelfLabel || "");
      setFieldSelfLabel(profile.fieldSelfLabel || "");
      loadPreferences();
    }
  }, [isOpen, profile]);

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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coreSelfLabel: coreSelfLabel.trim() || null,
          fieldSelfLabel: fieldSelfLabel.trim() || null,
        }),
      });

      if (!profileResponse.ok) throw new Error("Failed to update profile");

      const preferencesResponse = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sidebarCollapsed,
        }),
      });

      if (!preferencesResponse.ok)
        throw new Error("Failed to update preferences");

      toast.success("Settings saved successfully");
      onProfileUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full md:w-96 bg-gradient-to-br from-gray-950 to-blue-950/30 border-l border-blue-900/30 shadow-2xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Settings
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-blue-900/20 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">
                Personalization
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Core Mode Label
                  </label>
                  <input
                    type="text"
                    value={coreSelfLabel}
                    onChange={(e) => setCoreSelfLabel(e.target.value)}
                    placeholder="e.g., Inner Self, Reflector"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Customize the name for your reflective mode
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Field Mode Label
                  </label>
                  <input
                    type="text"
                    value={fieldSelfLabel}
                    onChange={(e) => setFieldSelfLabel(e.target.value)}
                    placeholder="e.g., Field Alpha, Executor"
                    className="w-full px-4 py-2 bg-gray-900/50 border border-blue-900/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Customize the name for your action-oriented mode
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-900/30 pt-6">
              <h3 className="text-lg font-semibold text-blue-400 mb-4">
                Interface
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Auto-collapse Sidebar
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically collapse sidebar on startup
                    </p>
                  </div>
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      sidebarCollapsed ? "bg-blue-600" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sidebarCollapsed ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-lg">
                  <p className="text-sm text-gray-400">
                    <strong className="text-blue-400">Theme:</strong> Dark mode
                    (default)
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Additional themes coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-blue-900/30">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
