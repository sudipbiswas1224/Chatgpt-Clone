import React from "react";
import logo from "../../assets/logo.png";

export function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  onNewChat,
  onCollapseSidebar,
  onLogout,
  variant = "desktop",
  isLoading = false,
}) {
  const inner = (
    <div className="flex flex-col h-full w-72 border-r border-neutral-800 bg-gradient-to-b from-[#0f0f0f]/80 to-[#0b0b0b]/80 backdrop-blur shadow-inner">
      {/* Top: logo/name + collapse button */}
      <div className="p-3 border-b border-neutral-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-sm font-semibold text-neutral-100 shadow-sm">
            <img
              src={logo}
              className="h-full w-full object-cover rounded-lg"
              alt="Aurion Logo"
            />
          </div>
          <div className="text-sm font-bold text-neutral-100">AurionGPT</div>
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
      <div className="flex-1 overflow-y-auto p-2 space-y-2 no-scrollbar">
        {isLoading ? (
          <div className="text-neutral-500 text-sm p-3 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-neutral-600 border-t-neutral-400 rounded-full animate-spin" />
            Loading chats...
          </div>
        ) : chats.length === 0 ? (
          <div className="text-neutral-500 text-sm p-3">No chats yet</div>
        ) : (
          chats.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectChat(c.id)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors text-neutral-200 hover:bg-neutral-900/40 ${
                c.id === selectedChatId
                  ? "bg-neutral-700/60  border border-neutral-800"
                  : ""
              }`}
            >
              <div className="text-sm font-medium truncate flex items-center gap-2">
                {c.title}
                {c.isTemporary && (
                  <span className="text-xs text-neutral-500 italic">
                    (unsaved)
                  </span>
                )}
              </div>
              <div className="text-xs text-neutral-400 truncate">
                {c.messages[c.messages.length - 1]?.content}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Logout button at bottom */}
      {onLogout && (
        <div className="p-3 border-t border-neutral-800">
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );

  if (variant === "desktop")
    return (
      <aside className="hidden md:flex w-72 shrink-0 flex-col">{inner}</aside>
    );
  return inner;
}
