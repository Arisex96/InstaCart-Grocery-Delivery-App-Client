import React from "react";
import { Bot, User } from "lucide-react";
import type { Message } from "./types";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";

  // Format timestamp (e.g., "12:30 PM")
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`flex w-full items-end gap-2.5 ${
        isAssistant ? "justify-start" : "justify-end"
      } animate-fade-in`}
    >
      {/* Bot Avatar */}
      {isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 shadow-sm">
          <Bot className="size-4.5" />
        </div>
      )}

      {/* Bubble Container */}
      <div
        className={`flex flex-col max-w-[75%] ${
          isAssistant ? "items-start" : "items-end"
        }`}
      >
        {/* Message Bubble */}
        <div
          className={`px-4 py-2.5 shadow-sm text-sm whitespace-pre-wrap break-words leading-relaxed transition-all duration-200 ${
            isAssistant
              ? "bg-zinc-100 border border-zinc-200/40 text-zinc-800 rounded-2xl rounded-bl-none"
              : "bg-emerald-900 border border-emerald-950 text-white rounded-2xl rounded-br-none"
          }`}
        >
          {message.content}
        </div>

        {/* Timestamp */}
        <span className="mt-1 px-1 text-[10px] font-medium text-zinc-400 select-none">
          {formatTime(message.timestamp)}
        </span>
      </div>

      {/* User Avatar (Optional - keep clean and hidden or show simple user circle) */}
      {!isAssistant && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 border border-orange-100 text-orange-600 shadow-sm">
          <User className="size-4.5" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
