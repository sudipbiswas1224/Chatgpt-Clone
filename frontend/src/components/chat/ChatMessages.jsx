import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

// ChatMessages
// Renders all messages for the active chat + auto-scrolls to bottom on update.
// Props:
// - selectedChat: active chat object (or null)
// - emptyState: React node shown when no chat / empty messages
export function ChatMessages({ selectedChat, emptyState }) {
  const messagesEndRef = useRef(null); // anchor div for scrolling

  // Scroll to bottom whenever message count changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages?.length]);

  // Show empty state if no chat or no messages yet
  if (!selectedChat) return emptyState;
  if (selectedChat.messages.length === 0) return emptyState;

  return (
    <div className="max-w-4xl mx-auto w-full px-6 py-6 space-y-6 text-[#e6e6e6]">
      {selectedChat.messages.map((m) => (
        <div key={m.id} className="flex flex-col gap-2">
          {m.role === "model" ? (
            <div className="flex flex-col items-start max-w-[80%]">
              <div className="bg-[#1f1f1f] text-[#f3f3f3] rounded-2xl px-5 py-3 text-base shadow-sm prose prose-invert prose-sm w-full">
                <ReactMarkdown
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex items-end justify-end">
              <div className="bg-[#2b2b2b] text-[#e6e6e6] rounded-2xl px-5 py-3 text-md max-w-[40%] shadow-sm">
                {m.content}
              </div>
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
