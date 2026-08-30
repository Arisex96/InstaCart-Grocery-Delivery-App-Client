import React, { useState } from "react";
import { MessageSquareText, Sparkles, X } from "lucide-react";
import type { Message } from "./types";
import { sendChatMessage } from "./chatService";
import ChatWindow from "./ChatWindow";
import useUserStore from "../../store/useUserStore";

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { _id: userId } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "assistant",
      content:
        "Hi! How can I help you? I can recommend fresh produce, calculate order totals, check active deals, or answer delivery queries.",
      timestamp: new Date(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSendMessage = async (content: string) => {
    // 1. Append user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);

    try {
      // 2. Fetch AI response from the modular service layer
      const responseText = await sendChatMessage(
        content,
        [...messages, userMessage],
        userId,
      );

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);

      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content:
          "Oops! Something went wrong while getting response. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating Chat Window */}
      <div
        className={`fixed right-4 sm:right-6 bottom-22 sm:bottom-24 z-50 overflow-hidden rounded-2xl border border-zinc-200/60 bg-white shadow-2xl transition-all duration-300 origin-bottom-right ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100 pointer-events-auto"
            : "translate-y-10 scale-75 opacity-0 pointer-events-none"
        } w-[calc(100vw-32px)] sm:w-95 h-120 sm:h-137.5 max-h-[calc(100vh-140px)]`}
      >
        <ChatWindow
          messages={messages}
          isThinking={isThinking}
          onSendMessage={handleSendMessage}
          onClose={() => setIsOpen(false)}
        />
      </div>

      {/* Floating Active Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900 text-white shadow-lg hover:bg-emerald-800 hover:scale-105 active:scale-95 transition-all duration-300 select-none group border border-emerald-950/20"
        aria-label="Toggle AI Chatbot"
        type="button"
      >
        {isOpen ? (
          <X className="size-6 transition-transform duration-300 rotate-90" />
        ) : (
          <div className="relative">
            <MessageSquareText className="size-6 transition-transform duration-300 group-hover:scale-110" />
            <Sparkles className="absolute -top-2.5 -right-2.5 size-3.5 text-yellow-300 animate-pulse" />
          </div>
        )}
      </button>
    </>
  );
};

export default ChatWidget;
