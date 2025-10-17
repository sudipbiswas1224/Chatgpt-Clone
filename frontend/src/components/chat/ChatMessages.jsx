import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export function ChatMessages({ selectedChat, emptyState, isAiTyping }) {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages?.length]);

  if (!selectedChat) return emptyState;
  if (selectedChat.messages.length === 0) return emptyState;

  return (
    <div className="w-full mx-auto md:max-w-4xl px-3 md:px-6 py-6 space-y-6 text-[#e6e6e6] overflow-x-hidden">
      {selectedChat.messages.map((m) => (
        <div key={m.id} className="flex flex-col gap-2 w-full min-w-0">
          {/* AI Message */}
          {m.role === "model" ? (
            <div className="w-full flex justify-start min-w-0">
              <div className="max-w-[90%] sm:max-w-[85%] md:max-w-[80%]">
                <div className="rounded-2xl bg-[#1f1f1f] text-[#f3f3f3] p-4 text-base shadow-sm overflow-hidden break-words">
                  <div className="prose prose-invert prose-sm max-w-none break-words overflow-wrap-anywhere">
                    <ReactMarkdown
                      components={{
                        code({ inline, className, children, ...props }) {
                          if (!inline) {
                            return (
                              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-[#0f0f0f] p-3">
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          }
                          return (
                            <code
                              className="break-words whitespace-pre-wrap"
                              {...props}
                            >
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
              </div>
            </div>
          ) : (
            /* User Message */
            <div className="w-full flex justify-end min-w-0">
              <div className="bg-[#2b2b2b] text-[#e6e6e6] rounded-2xl px-5 py-3 text-md shadow-sm max-w-[90%] sm:max-w-[80%] break-words overflow-wrap-anywhere">
                {m.content}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Typing Indicator */}
      {isAiTyping && (
        <div className="flex flex-col items-start w-full max-w-[90%] sm:max-w-[85%] md:max-w-[80%] min-w-0">
          <div className="bg-[#1f1f1f] text-[#f3f3f3] rounded-2xl px-5 py-3 text-base shadow-sm">
            <div className="flex gap-1.5">
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></span>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
