import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize search input as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setValue("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent standard browser newline inclusion
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2 border border-zinc-200/80 rounded-2xl p-2 bg-zinc-50 focus-within:border-emerald-700 focus-within:bg-white focus-within:ring-1 focus-within:ring-emerald-700/30 transition-all duration-200">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Thinking..." : "Type a message..."}
        disabled={disabled}
        className="flex-1 max-h-[120px] min-h-[24px] resize-none bg-transparent py-1 px-2.5 text-sm text-zinc-800 placeholder-zinc-400 outline-hidden border-none focus:outline-hidden focus:ring-0 no-scrollbar"
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-900 text-white shadow-sm transition-all duration-200 select-none ${
          disabled || !value.trim()
            ? "opacity-35 cursor-not-allowed bg-zinc-300 text-zinc-500 shadow-none"
            : "hover:bg-emerald-800 hover:scale-105 active:scale-95 cursor-pointer"
        }`}
        type="button"
        title="Send message"
      >
        <SendHorizontal className="size-4" />
      </button>
    </div>
  );
};

export default ChatInput;
