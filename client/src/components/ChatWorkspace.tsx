import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

type ModeType = "core" | "field";

interface Message {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  mode?: ModeType;
  createdAt: Date;
}

interface ChatWorkspaceProps {
  conversationId: number | null;
  onConversationCreated: (id: number) => void;
  profile: any;
}

export default function ChatWorkspace({
  conversationId,
  onConversationCreated,
  profile,
}: ChatWorkspaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      setMessages([]);
    }
  }, [conversationId]);

  const loadConversation = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/conversations/${id}/messages`);
      if (!response.ok) throw new Error("Failed to load messages");
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error("Error loading conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setIsLoading(false);
    }
  };

  const createConversation = async (firstMessage: string): Promise<number> => {
    const title = firstMessage.length > 40 
      ? firstMessage.substring(0, 37) + "..." 
      : firstMessage;
    
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) throw new Error("Failed to create conversation");
    const data = await response.json();
    onConversationCreated(data.conversation.id);
    return data.conversation.id;
  };

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = input.trim();
    setInput("");
    setIsSending(true);

    let currentConversationId = conversationId;

    try {
      if (!currentConversationId) {
        currentConversationId = await createConversation(userMessage);
      }

      const tempUserMsg: Message = {
        id: Date.now(),
        conversationId: currentConversationId,
        role: "user",
        content: userMessage,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversationId,
          userProfile: {
            coreSelfLabel: profile?.coreSelfLabel,
            fieldSelfLabel: profile?.fieldSelfLabel,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No response stream");

      let buffer = "";
      let aiText = "";
      const aiMessageId = Date.now() + 1;

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
              const tempAiMsg: Message = {
                id: aiMessageId,
                conversationId: currentConversationId,
                role: "assistant",
                content: "",
                mode: data.mode,
                createdAt: new Date(),
              };
              setMessages((prev) => [...prev, tempAiMsg]);
            } else if (data.type === "content") {
              aiText += data.content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === aiMessageId
                    ? { ...m, content: aiText }
                    : m
                )
              );
            } else if (data.type === "error") {
              toast.error(data.error || "Failed to generate response");
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-black via-gray-950 to-blue-950/20">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center px-4">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                  Welcome to Twinpeakin
                </h2>
                <p className="text-gray-400 max-w-md mb-8">
                  Start a conversation and experience dual-mode AI assistance
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
                  <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-900/30">
                    <div className="text-blue-400 font-semibold mb-2">
                      {profile?.coreSelfLabel || "Core Mode"}
                    </div>
                    <p className="text-sm text-gray-400">
                      Reflective, introspective assistance
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-900/10 border border-blue-900/30">
                    <div className="text-blue-400 font-semibold mb-2">
                      {profile?.fieldSelfLabel || "Field Mode"}
                    </div>
                    <p className="text-sm text-gray-400">
                      Action-oriented, practical guidance
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/20"
                        : msg.mode === "core"
                        ? "bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-500/30 text-gray-100 backdrop-blur-sm"
                        : msg.mode === "field"
                        ? "bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30 text-gray-100 backdrop-blur-sm"
                        : "bg-gray-800/50 border border-gray-700/50 text-gray-100 backdrop-blur-sm"
                    }`}
                  >
                    {msg.role === "assistant" && msg.mode && (
                      <div className="text-xs font-semibold mb-2 opacity-75">
                        {msg.mode === "core"
                          ? profile?.coreSelfLabel || "Core Mode"
                          : profile?.fieldSelfLabel || "Field Mode"}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-blue-900/30 bg-black/80 backdrop-blur-xl p-4">
            <div className="max-w-4xl mx-auto">
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
                  disabled={isSending}
                  className="flex-1 px-5 py-3 bg-gray-900/50 border border-blue-900/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500 disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={isSending || !input.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 flex items-center gap-2"
                >
                  {isSending ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                By Connor Belanger
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
