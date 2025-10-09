import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// useChats
// Centralized state + helpers for managing chat sessions & messages.
// Responsibilities:
// - Load & persist chats/selected chat from/to localStorage
// - Create/select chats
// - Append messages & keep chats sorted by recent activity
// - Generate a title from first message when needed
export function useChats() {
    // All chat sessions (most recent first after each update)
    const [chats, setChats] = useState(() => {
        try {
            const saved = localStorage.getItem('chats');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    // Which chat is currently open
    const [selectedChatId, setSelectedChatId] = useState(() => {
        try {
            return localStorage.getItem('selectedChatId') || null;
        } catch {
            return null;
        }
    });
    // Derive selected chat object for convenience
    const selectedChat = useMemo(
        () => chats.find((c) => c.id === selectedChatId) || null,
        [chats, selectedChatId]
    );
    // Persist chats whenever they change
    useEffect(() => {
        try { localStorage.setItem('chats', JSON.stringify(chats)); } catch { }
    }, [chats]);
    // Persist currently selected chat id
    useEffect(() => {
        try {
            if (selectedChatId) localStorage.setItem('selectedChatId', selectedChatId);
        } catch { }
    }, [selectedChatId]);
    // Build a short truncated chat title from initial text
    const makeTitleFrom = useCallback((text) => {
        const cleaned = text.trim().replace(/\s+/g, ' ');
        return cleaned.length > 32 ? cleaned.slice(0, 32) + '…' : cleaned || 'New chat';
    }, []);
    // Create a new empty chat and select it
    const createChat = useCallback((title = 'New chat') => {
        const id = String(Date.now());
        const newChat = { id, title, messages: [], updatedAt: Date.now() };
        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(id);
        return newChat;
    }, []);
    // Switch active chat
    const selectChat = useCallback((id) => {
        setSelectedChatId(id);
    }, []);
    // Append a message to a chat & resort by latest activity
    const appendMessage = useCallback((chatId, newMsg) => {
        setChats((prev) =>
            prev
                .map((c) =>
                    c.id === chatId
                        ? { ...c, messages: [...c.messages, newMsg], updatedAt: Date.now() }
                        : c
                )
                .sort((a, b) => b.updatedAt - a.updatedAt)
        );
    }, []);
    // If first message of a chat, update its title based on content
    const ensureTitle = useCallback((chat, firstMessageText) => {
        if (chat && chat.messages.length === 0) {
            setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, title: makeTitleFrom(firstMessageText) } : c)));
        }
    }, [makeTitleFrom]);

    return {
        chats,            // Array of chat sessions
        selectedChat,     // Active chat object (or null)
        selectedChatId,   // Active chat id (or null)
        createChat,       // Function to create & select new chat
        selectChat,       // Function to switch active chat
        appendMessage,    // Append a message & resort chats
        ensureTitle,      // Ensure first message sets title
        makeTitleFrom,    // Utility for deriving titles
    };
}
