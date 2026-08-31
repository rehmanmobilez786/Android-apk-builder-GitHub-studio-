import React, { useState } from "react";
import { Sparkles, Send, X, Bot, User, CornerDownLeft } from "lucide-react";
import { ChatMessage } from "../types";

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <aside className="fixed top-0 right-0 bottom-0 w-80 bg-slate-900 border-l border-slate-800 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-xs">AI Android Architect</h3>
            <p className="text-[10px] text-slate-400">Kotlin, Compose & Gradle Assistant</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col gap-1 ${
              m.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[85%] ${
                m.role === "user"
                  ? "bg-sky-600 text-white font-medium rounded-tr-none"
                  : "bg-slate-950 text-slate-200 border border-slate-800 rounded-tl-none whitespace-pre-wrap font-sans"
              }`}
            >
              {m.content}
            </div>
            <span className="text-[9px] text-slate-500 px-1">{m.timestamp}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
            <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <span>AI Architect is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="relative">
          <input
            type="text"
            placeholder="Ask about Kotlin, Compose, XML..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs pl-3 pr-8 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 text-indigo-400 hover:text-indigo-300 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
};
