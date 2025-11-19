import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type ModeType = "core" | "field";

interface Message {
  id: string;
  text: string;
  sender: "user" | "system";
  mode?: ModeType;
  timestamp: Date;
}

export default function ChatPage() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [currentMode, setCurrentMode] = useState<ModeType | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data.profile))
      .catch(() => toast.error("Failed to load profile"));

    fetch("/api/chat/mode")
      .then((res) => res.json())
      .then((data) => setCurrentMode(data.mode))
      .catch(() => {});

    setMessages([
      {
        id: "welcome",
        text: "TwinPeakingOS v1.3 initialized. Ready for dual-mode operation.",
        sender: "system",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    const aiMessageId = (Date.now() + 1).toString();
    let aiMode: ModeType = "core";

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userInput,
          userProfile: {
            coreSelfLabel: profile?.coreSelfLabel,
            fieldSelfLabel: profile?.fieldSelfLabel,
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream");
      }

      let buffer = "";
      let aiText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.substring(6));

            if (data.type === "mode") {
              aiMode = data.mode;
              const modeLabel = data.mode === "core" 
                ? profile?.coreSelfLabel || "Inner Self" 
                : profile?.fieldSelfLabel || "Field Alpha";
              
              setMessages((prev) => [
                ...prev,
                {
                  id: aiMessageId,
                  text: `[${modeLabel}] `,
                  sender: "system",
                  mode: data.mode,
                  timestamp: new Date(),
                },
              ]);
            } else if (data.type === "content") {
              aiText += data.content;
              setMessages((prev) => {
                const existing = prev.find((m) => m.id === aiMessageId);
                if (existing) {
                  const modeLabel = aiMode === "core" 
                    ? profile?.coreSelfLabel || "Inner Self" 
                    : profile?.fieldSelfLabel || "Field Alpha";
                  return prev.map((m) =>
                    m.id === aiMessageId
                      ? { ...m, text: `[${modeLabel}]\n\n${aiText}` }
                      : m
                  );
                }
                return prev;
              });
            } else if (data.type === "error") {
              toast.error(data.error || "Failed to generate response");
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to process message");
    }
  };

  const setMode = async (mode: ModeType) => {
    try {
      await fetch("/api/chat/set-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, duration: 1800000 }),
      });
      setCurrentMode(mode);
      toast.success(`Mode locked: ${mode === "core" ? "Inner Self" : "Field Alpha"}`);
    } catch (error) {
      toast.error("Failed to set mode");
    }
  };

  const clearMode = async () => {
    try {
      await fetch("/api/chat/clear-mode", { method: "POST" });
      setCurrentMode(null);
      toast.success("Mode unlocked");
    } catch (error) {
      toast.error("Failed to clear mode");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20">
      <div className="container mx-auto max-w-6xl h-screen flex flex-col">
        <header className="border-b border-border bg-secondary/50 backdrop-blur p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">TwinPeakingOS</h1>
              {profile && (
                <p className="text-sm text-muted-foreground">
                  Core: {profile.coreSelfLabel} • Field: {profile.fieldSelfLabel}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode("core")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  currentMode === "core"
                    ? "bg-purple-500 text-white"
                    : "bg-secondary border border-border hover:bg-secondary/80"
                }`}
              >
                Core Mode
              </button>
              <button
                onClick={() => setMode("field")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  currentMode === "field"
                    ? "bg-blue-500 text-white"
                    : "bg-secondary border border-border hover:bg-secondary/80"
                }`}
              >
                Field Mode
              </button>
              {currentMode && (
                <button
                  onClick={clearMode}
                  className="px-4 py-2 bg-secondary border border-border rounded-md text-sm font-medium hover:bg-secondary/80 transition"
                >
                  Auto
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-secondary border border-border rounded-md text-sm font-medium hover:bg-secondary/80 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : msg.mode === "core"
                    ? "bg-purple-900/50 border border-purple-500/50"
                    : msg.mode === "field"
                    ? "bg-blue-900/50 border border-blue-500/50"
                    : "bg-secondary border border-border"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className="text-xs opacity-70 mt-2">
                  {msg.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-border bg-secondary/50 backdrop-blur p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Privacy-first: Messages are not logged or stored
          </p>
        </div>
      </div>
    </div>
  );
}
