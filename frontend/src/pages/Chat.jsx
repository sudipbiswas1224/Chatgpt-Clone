import { useChats } from "../components/chat/useChats";
import { Sidebar } from "../components/chat/Sidebar";
import { ChatMessages } from "../components/chat/ChatMessages";
import { Composer } from "../components/chat/Composer";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

import { toast } from "react-toastify";
import logoutApi from "../services/authApi";

const Chat = () => {
  const navigate = useNavigate();
  const {
    chats,
    selectedChat,
    selectedChatId,
    isLoading,
    createLocalChat,
    saveChat,
    selectChat,
    appendMessage,
    makeTitleFrom,
    loadMessages,
  } = useChats();

  const socketRef = useRef(null);
  const [isAiTyping, setIsAiTyping] = useState(false);

  //initialize the socket.io
  useEffect(() => {
    //initialize socket
    socketRef.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    //listen for connection
    socketRef.current.on("connect", () => {
      console.log("Socket connected: ", socketRef.current.id);
    });

    //listen for ai-resposne event
    socketRef.current.on("ai-response", (data) => {
      console.log("AI Response : ", data);
      setIsAiTyping(false);
      appendMessage(data.chat, {
        role: "model",
        content: data.content,
        timestamp: Date.now(),
      });
    });

    //listen for errors
    socketRef.current.on("error", (error) => {
      console.log("Socket error : ", error);
    });

    //clean up
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [appendMessage]);

  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Controls whether the entire left sidebar is collapsed to a slim bar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Create a new temporary local chat (not saved to backend yet)
  // Will be saved when first message is sent
  const handleNewChat = () => {
    createLocalChat();
    setSidebarOpen(false);
  };

  // Select existing chat and close mobile sidebar
  const handleSelectChat = (id) => {
    selectChat(id);
    setSidebarOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutApi();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error : ", error);
      toast.error("Logout Failed");
    }
  };

  // Send current draft message & simulate AI echo reply
  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;

    try {
      let chat = selectedChat;

      // If no chat selected, create a temporary one
      if (!chat) {
        chat = createLocalChat();
      }

      // Create user message
      const userMsg = {
        id: `u_${Date.now()}`,
        role: "user",
        content: text,
        ts: Date.now(),
      };

      // If this is a temporary chat (first message), save it to backend FIRST
      // before appending any messages, to avoid ID mismatch
      let finalChatId = chat.id;
      if (chat.isTemporary) {
        try {
          const title = makeTitleFrom(text);
          const savedChat = await saveChat(chat, title);
          finalChatId = savedChat.id; // Use the saved chat's ID
        } catch (error) {
          console.error("Failed to save chat to backend:", error);
          // Continue with temp chat ID if backend save fails
          finalChatId = chat.id;
        }
      }

      // Now append message to the correct chat (either saved or temp)
      appendMessage(finalChatId, userMsg);
      setMessage("");

      // TODO: Replace with Socket.IO real-time AI response
      //emit message for backend
      socketRef.current.emit("user-message", {
        chat: selectedChatId,
        content: text,
      });
      setIsAiTyping(true);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Shown when no chat selected or chat has no messages
  const emptyState = (
    <div className="h-full flex items-center justify-center text-neutral-400">
      <div className="text-center p-6">
        <h3 className="md:text-3xl text-lg font-medium text-neutral-200">
          What's on the agenda today?
        </h3>
        <p className="text-sm mt-2">Your conversations will show up here.</p>
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
            onLogout={handleLogout}
            variant="desktop"
            isLoading={isLoading}
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
                onLogout={handleLogout}
                variant="mobile"
                isLoading={isLoading}
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
                {selectedChat?.title || "No Chat Created"}
              </div>
            </div>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto bg-black/40 no-scrollbar">
            <ChatMessages
              selectedChat={selectedChat}
              emptyState={emptyState}
              isAiTyping={isAiTyping}
            />
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

export default Chat;
