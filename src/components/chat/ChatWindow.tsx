import React, { useEffect, useRef } from "react";
import { X, Bot } from "lucide-react";
import type { Message } from "./types";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  messages: Message[];
  isThinking: boolean;
  onSendMessage: (content: string) => void;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isThinking,
  onSendMessage,
  onClose,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between bg-emerald-950 px-4 py-3.5 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-xl bg-emerald-900 border border-emerald-800 shadow-inner">
            <Bot className="size-5 text-emerald-100" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 select-none">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-emerald-950"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide">
              Grocery Assistant
            </span>
            <span className="text-[10px] text-emerald-300 font-medium tracking-wider">
              Online
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-300 transition hover:bg-emerald-900 hover:text-white"
          title="Minimize Chat"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-zinc-50/50">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex justify-start items-end gap-2.5 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 shadow-sm">
              <Bot className="size-4.5" />
            </div>
            <div className="flex flex-col items-start max-w-[75%]">
              <div className="bg-zinc-100 border border-zinc-200/40 text-zinc-800 rounded-2xl rounded-bl-none px-4 py-3 flex items-center justify-center gap-1.5 shadow-sm min-h-9">
                <div className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-[bounce_1.4s_infinite_0ms]"></div>
                <div className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-[bounce_1.4s_infinite_200ms]"></div>
                <div className="h-1.5 w-1.5 bg-zinc-500 rounded-full animate-[bounce_1.4s_infinite_400ms]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-zinc-100 bg-white p-3.5">
        <ChatInput onSendMessage={onSendMessage} disabled={isThinking} />
      </div>
    </div>
  );
};

export default ChatWindow;
