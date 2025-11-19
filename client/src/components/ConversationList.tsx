import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { formatRelativeTime } from "../lib/utils";
import { toast } from "sonner";

interface Conversation {
  id: number;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationListProps {
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  refreshTrigger: number;
}

export default function ConversationList({
  activeConversationId,
  onSelectConversation,
  refreshTrigger,
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (!response.ok) throw new Error("Failed to fetch conversations");
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [refreshTrigger]);

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Delete this conversation? This cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");

      setConversations((prev) => prev.filter((c) => c.id !== id));
      toast.success("Conversation deleted");

      if (activeConversationId === id) {
        onSelectConversation(null as any);
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            activeConversationId === conversation.id
              ? "bg-gradient-to-r from-blue-900/40 to-blue-800/30 border border-blue-500/30"
              : "hover:bg-blue-900/10 border border-transparent"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">
                {conversation.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatRelativeTime(conversation.updatedAt)}
              </p>
            </div>
            <button
              onClick={(e) => handleDelete(conversation.id, e)}
              disabled={deletingId === conversation.id}
              className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-900/30 rounded transition-all text-red-400 hover:text-red-300"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
