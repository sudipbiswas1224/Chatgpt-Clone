import React from "react";

export function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onCollapseSidebar,
  variant = "desktop",
}) {
  const inner = (
    <div className="flex flex-col h-full w-72 border-r border-neutral-800 bg-gradient-to-b from-[#0f0f0f]/80 to-[#0b0b0b]/80 backdrop-blur shadow-inner">
      {/* Top: logo/name + collapse button */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-sm font-semibold text-neutral-100 shadow-sm">
            G
          </div>
          <div className="text-sm font-semibold text-neutral-100">ChatGPT</div>
        </div>
        <button
          onClick={onCollapseSidebar}
          aria-label="Collapse sidebar"
          className="w-9 h-9 rounded-md flex items-center justify-center text-neutral-300 hover:bg-neutral-900/40"
        >
          <span className="text-lg">‹</span>
        </button>
      </div>

      {/* New chat button */}
      <div className="p-3 border-b border-neutral-800">
        <button
          onClick={onNewChat}
          className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-780 text-neutral-100 text-sm shadow-sm"
        >
          New chat
        </button>
      </div>

      {/* Recent chats list */}
      <div className="overflow-y-auto p-2 space-y-2">
        {chats.length === 0 && (
          <div className="text-neutral-500 text-sm p-3">No chats yet</div>
        )}
        {chats.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelectChat(c.id)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors text-neutral-200 hover:bg-neutral-900/40 ${
              c.id === selectedChatId
                ? "bg-neutral-900/60 border border-neutral-800"
                : ""
            }`}
          >
            <div className="text-sm font-medium truncate">{c.title}</div>
            <div className="text-xs text-neutral-400 truncate">
              {c.messages[c.messages.length - 1]?.content || "Empty chat"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  if (variant === "desktop")
    return (
      <aside className="hidden md:flex w-72 shrink-0 flex-col">{inner}</aside>
    );
  return inner;
}
