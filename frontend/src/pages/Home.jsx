import { useChats } from "../components/chat/useChats";
import { Sidebar } from "../components/chat/Sidebar";
import { ChatMessages } from "../components/chat/ChatMessages";
import { Composer } from "../components/chat/Composer";
import { useState } from "react";

// Home
// High-level container that wires together sidebar, messages & composer.
// Uses the useChats hook for state management and keeps only page-level UI state here.
const Home = () => {
  const {
    chats,
    selectedChat,
    selectedChatId,
    createChat,
    selectChat,
    appendMessage,
    ensureTitle,
    makeTitleFrom,
  } = useChats();

  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Controls whether the entire left sidebar is collapsed to a slim bar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Create a new chat and close mobile sidebar
  const handleNewChat = () => {
    createChat();
    setSidebarOpen(false);
  };

  // Select existing chat and close mobile sidebar
  const handleSelectChat = (id) => {
    selectChat(id);
    setSidebarOpen(false);
  };

  // Send current draft message & simulate AI echo reply
  const handleSend = () => {
    const text = message.trim();
    if (!text) return;
    let chat = selectedChat;
    if (!chat) {
      chat = createChat(makeTitleFrom(text));
    } else {
      ensureTitle(chat, text);
    }
    const userMsg = {
      id: `u_${Date.now()}`,
      role: "user",
      content: text,
      ts: Date.now(),
    };
    appendMessage(chat.id, userMsg);
    setMessage("");
    setTimeout(() => {
      const aiMsg = {
        id: `a_${Date.now()}`,
        role: "ai",
        content: `You said: "${text}"`,
        ts: Date.now(),
      };
      appendMessage(chat.id, aiMsg);
    }, 400);
  };

  // Shown when no chat selected or chat has no messages
  const emptyState = (
    <div className="h-full flex items-center justify-center text-neutral-400">
      <div className="text-center p-6">
        <h3 className="text-lg font-medium text-neutral-200">
          Start a new chat
        </h3>
        <p className="text-sm mt-2">Your conversations will show up here.</p>
        <button
          onClick={handleNewChat}
          className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          New chat
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-neutral-200">
      {/* Layout */}
      <div className="flex h-dvh max-h-dvh">
        {/* Sidebar (desktop) */}
        {!sidebarCollapsed ? (
          <Sidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onCollapseSidebar={() => setSidebarCollapsed(true)}
            variant="desktop"
          />
        ) : (
          // slim expand bar when collapsed
          <div className="hidden md:flex items-center justify-center w-12 bg-neutral-950/60 border-r border-neutral-900">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-neutral-300 hover:bg-neutral-900"
              aria-label="Expand sidebar"
            >
              ›
            </button>
          </div>
        )}

        {/* Sidebar (mobile overlay) */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-neutral-950 border-r border-neutral-900 p-2">
              <Sidebar
                chats={chats}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onCollapseSidebar={() => setSidebarOpen(false)}
                variant="mobile"
              />
            </div>
          </div>
        )}

        {/* Main Chat Pane */}
        <main className="flex-1 flex flex-col">
          {/* Header (includes mobile menu button + current chat title) */}
          <div className="h-14 shrink-0 border-b border-neutral-800 bg-[#0f0f0f]/60 backdrop-blur flex items-center px-3 gap-2">
            <button
              className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-neutral-800 text-neutral-300 hover:bg-neutral-900"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ☰
            </button>
            <div className="truncate">
              <div className="text-sm text-neutral-400">Chat</div>
              <div className="text-base font-medium truncate">
                {selectedChat?.title || "New chat"}
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto bg-black/40">
            <ChatMessages selectedChat={selectedChat} emptyState={emptyState} />
          </div>
          {/* Composer */}
          <Composer
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
          />
        </main>
      </div>
    </div>
  );
};

export default Home;
