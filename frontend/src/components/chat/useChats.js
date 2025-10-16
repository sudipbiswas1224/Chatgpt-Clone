import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createChatApi, fetchChatsApi, fetchMessagesApi } from '../../services/chatApi';
import { toast } from 'react-toastify';

// useChats
// Centralized state + helpers for managing chat sessions & messages.
// Responsibilities:
// - Fetch chats from backend on mount
// - Create/select chats via backend API
// - Append messages & keep chats sorted by recent activity
// - Generate a title from first message when needed
export function useChats() {
    // All chat sessions (fetched from backend, most recent first)
    const [chats, setChats] = useState([]);

    // Loading state for initial chat fetch
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Which chat is currently open (kept in localStorage for UX)
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

    // Persist currently selected chat id (UX: remember last opened chat)
    useEffect(() => {
        try {
            if (selectedChatId) {
                localStorage.setItem('selectedChatId', selectedChatId);
            } else {
                localStorage.removeItem('selectedChatId');
            }
        } catch { }
    }, [selectedChatId]);

    // Fetch chats from backend on mount
    useEffect(() => {
        const loadChats = async () => {
            try {
                setIsLoading(true);
                const backendChats = await fetchChatsApi();

                // Map backend format to frontend format
                const mappedChats = backendChats.map(chat => ({
                    id: chat._id,
                    title: chat.title,
                    messages: [], // Messages loaded separately when chat is opened
                    updatedAt: new Date(chat.lastActivity || chat.createdAt).getTime(),
                }));

                // Sort by most recent first
                mappedChats.sort((a, b) => b.updatedAt - a.updatedAt);

                setChats(mappedChats);
            } catch (error) {
                console.error('Failed to load chats:', error);
                if (error.response?.status === 401) {
                    // User not authenticated - that's ok, show empty state
                    setChats([]);
                } else {
                    toast.error('Failed to load chats from server');
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadChats();
    }, []);

    
    // Build a short truncated chat title from initial text
    const makeTitleFrom = useCallback((text) => {
        const cleaned = text.trim().replace(/\s+/g, ' ');
        return cleaned.length > 32 ? cleaned.slice(0, 32) + '…' : cleaned || 'New chat';
    }, []);

    // Create a temporary local chat (not saved to backend yet)
    // This will be saved when the first message is sent
    const createLocalChat = useCallback(() => {
        const tempId = `temp_${Date.now()}`;
        const newChat = {
            id: tempId,
            title: 'New chat',
            messages: [],
            updatedAt: Date.now(),
            isTemporary: true, // Flag to indicate this chat is not yet saved to backend
        };

        setChats((prev) => [newChat, ...prev]);
        setSelectedChatId(tempId);
        return newChat;
    }, []);

    // Save chat to backend with actual title from first message
    // This is called when the first message is sent
    const saveChat = useCallback(async (tempChat, title) => {
        try {
            // Call backend API to create chat with actual title
            const backendChat = await createChatApi(title);
            console.log(backendChat);

            // Get the current messages from the temp chat in state (in case it was updated)
            const currentTempChat = chats.find(c => c.id === tempChat.id);
            const currentMessages = currentTempChat?.messages || tempChat.messages;

            // Map backend response (_id) to frontend format (id)
            const savedChat = {
                id: backendChat._id,
                title: backendChat.title,
                messages: currentMessages, // Use the latest messages from state
                updatedAt: new Date(backendChat.lastActivity || backendChat.createdAt).getTime(),
                isTemporary: false,
            };

            // IMPORTANT: Update both chats array and selectedChatId together in a single batch
            // This prevents React from rendering with mismatched state
            setChats((prev) =>
                prev.map((c) => (c.id === tempChat.id ? savedChat : c))
            );

            // Update selected chat ID to the new backend ID
            setSelectedChatId(savedChat.id);

            return savedChat;
        } catch (error) {
            console.error('Failed to save chat:', error);

            // Show user-friendly error message
            if (error.response?.status === 401) {
                toast.error('Please login to save chat');
            } else if (error.response?.status === 400) {
                toast.error('Invalid chat data');
            } else {
                toast.error('Failed to save chat to server');
            }

            throw error; // Re-throw so caller knows it failed
        }
    }, [chats]);


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

    //for loading the messages of a chat 
    const loadMessages = useCallback(async (chatId) => {
        if(chatId?.startsWith('temp_')) return ;

        try {
            setIsLoadingMessages(true);
            const data = await fetchMessagesApi(chatId);
            console.log(data);
            
            const mappedMessages = data.messages.map(msg => {
                return {
                    id:msg._id,
                    role:msg.role,
                    content: msg.content,
                    timestamp:new Date(msg.createdAt).getTime()
                }
            })

            setChats((prev) => prev.map((c) => c.id === chatId ? {...c,messages: mappedMessages }: c))

        } catch (error) {
            console.log("Failed to load the messages", error);
            toast.error("Failed to load messages from server");
        }
        finally{
            setIsLoadingMessages(false);
        }
    }, []);

    // Load messages when selected chat changes
    useEffect(() => {
        if (selectedChatId && !selectedChatId.startsWith('temp_')) {
            loadMessages(selectedChatId);
        }
    }, [selectedChatId, loadMessages]);

    return {
        chats,            // Array of chat sessions (from backend)
        selectedChat,     // Active chat object (or null)
        selectedChatId,   // Active chat id (or null)
        isLoading,        // Loading state for initial fetch
        isLoadingMessages, // Loading state for messages fetch
        createLocalChat,  // Function to create temporary local chat
        saveChat,         // Function to save chat to backend with title
        selectChat,       // Function to switch active chat
        appendMessage,    // Append a message & resort chats
        makeTitleFrom,    // Utility for deriving titles
        loadMessages      // Function to load messages for a chat
    };
}
