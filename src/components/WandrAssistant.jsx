"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

const SUGGESTED_QUESTIONS = [
  "What destinations can I plan a trip to?",
  "How does the Safety Shield work?",
  "What is the Explorer vs Premium budget tier?",
  "How do I find travel companions?",
  "What is Wandr AI?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffc880] to-[#f5a623] flex items-center justify-center shrink-0 shadow-md">
        <span className="material-symbols-outlined text-[#452b00] text-[13px]">
          explore
        </span>
      </div>
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-none"
        style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="flex gap-1 items-center h-4">
          <span
            className="w-2 h-2 rounded-full bg-[#ffc880] animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[#ffc880] animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 rounded-full bg-[#ffc880] animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

function ChatMessage({ message }) {
  const isUser = message.role === "user";
  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffc880] to-[#f5a623] flex items-center justify-center shrink-0 shadow-md">
          <span className="material-symbols-outlined text-[#452b00] text-[13px]">
            explore
          </span>
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 text-[13px] leading-relaxed ${
          isUser
            ? "rounded-2xl rounded-br-none text-[#452b00] font-medium"
            : "rounded-2xl rounded-bl-none text-[#e2e2e2]"
        }`}
        style={
          isUser
            ? { background: "#ffc880" }
            : {
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
              }
        }
      >
        {message.content}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.15)] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#e2e2e2] text-[13px]">
            person
          </span>
        </div>
      )}
    </div>
  );
}

export default function WandrAssistant() {
  const pathname = usePathname();
  if (pathname === "/companion") return null;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm the Wandr AI assistant. I can help you with trip planning, destination discovery, companion matching, safety tools, and anything else about our platform. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
      setHasUnread(false);
    }
  }, [isOpen, messages]);

  const sendMessage = async (text) => {
    const userText = text || inputValue.trim();
    if (!userText || isLoading) return;

    const updatedMessages = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await response.json();
      const replyText =
        data.reply || "I could not find that information in the Wandr AI website content.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: replyText },
      ]);
      if (!isOpen) setHasUnread(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Panel */}
      <div
        id="wandr-assistant-panel"
        className="fixed bottom-24 right-5 md:right-8 z-[9999] transition-all duration-500"
        style={{
          width: isOpen ? "360px" : "0px",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transform: isOpen ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transformOrigin: "bottom right",
        }}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          style={{
            height: "520px",
            background: "rgba(10, 15, 30, 0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(30px)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,200,128,0.08)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,200,128,0.12) 0%, rgba(0,201,167,0.06) 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ffc880] to-[#f5a623] flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[#452b00] text-[18px]">
                    explore
                  </span>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#00C9A7] rounded-full border-2 border-[#0a0f1e]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#e2e2e2] leading-tight">
                  Wandr AI Assistant
                </p>
                <p className="text-[10px] text-[#00C9A7] font-mono tracking-wider">
                  ONLINE · READY TO ASSIST
                </p>
              </div>
            </div>
            <button
              id="wandr-assistant-close"
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              aria-label="Close assistant"
            >
              <span className="material-symbols-outlined text-[#d7c3ae] text-[18px]">
                close
              </span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 no-scrollbar">
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions (only on fresh start) */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-[10px] px-3 py-1.5 rounded-full transition-all hover:border-[#ffc880] hover:text-[#ffc880]"
                  style={{
                    background: "rgba(255,200,128,0.05)",
                    border: "1px solid rgba(255,200,128,0.2)",
                    color: "#d7c3ae",
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div
            className="px-4 py-3 shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <input
                ref={inputRef}
                id="wandr-assistant-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Wandr AI..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-[13px] text-[#e2e2e2] placeholder:text-[#d7c3ae]/40 outline-none border-none focus:ring-0 disabled:opacity-50"
              />
              <button
                id="wandr-assistant-send"
                onClick={() => sendMessage()}
                disabled={isLoading || !inputValue.trim()}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
                style={{ background: "#ffc880" }}
                aria-label="Send message"
              >
                <span className="material-symbols-outlined text-[#452b00] text-[16px]">
                  send
                </span>
              </button>
            </div>
            <p className="text-center text-[9px] text-[#d7c3ae]/30 mt-2 font-mono tracking-wider">
              WANDR AI CONCIERGE · PLATFORM QUERIES ONLY
            </p>
          </div>
        </div>
      </div>

      {/* FAB Toggle Button */}
      <button
        id="wandr-assistant-toggle"
        onClick={() => {
          setIsOpen((prev) => !prev);
          setHasUnread(false);
        }}
        aria-label="Toggle Wandr AI Assistant"
        className="fixed bottom-5 right-5 md:right-8 z-[9999] w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #ffc880, #f5a623)",
          boxShadow: isOpen
            ? "0 8px 30px rgba(245,166,35,0.5)"
            : "0 8px 30px rgba(245,166,35,0.35), 0 0 0 0 rgba(245,166,35,0.4)",
          animation: !isOpen ? "assistantPulse 3s ease-in-out infinite" : "none",
        }}
      >
        <span
          className="material-symbols-outlined text-[#452b00] text-[24px] transition-all duration-300"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          {isOpen ? "close" : "support_agent"}
        </span>

        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00C9A7] rounded-full border-2 border-[#0a0f1e] flex items-center justify-center">
            <span className="text-[8px] text-[#0a0f1e] font-bold">1</span>
          </span>
        )}
      </button>

      <style>{`
        @keyframes assistantPulse {
          0%, 100% { box-shadow: 0 8px 30px rgba(245,166,35,0.35), 0 0 0 0 rgba(245,166,35,0.4); }
          50% { box-shadow: 0 8px 30px rgba(245,166,35,0.5), 0 0 0 12px rgba(245,166,35,0); }
        }
      `}</style>
    </>
  );
}
