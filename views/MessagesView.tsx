import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { Conversation, Message, Role, MessageStatus, MarketplaceUser } from '../types';
import ConfirmationModal from '../components/modals/ConfirmationModal';

// Icons for the view
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
);

const DoubleCheckIcon = ({ color = 'currentColor', ...props }: React.SVGProps<SVGSVGElement> & { color?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={color} {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12.75L18.75 15 15 12.75" />
    </svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
);
const ArchiveBoxIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.033-2.124H8.033c-1.12 0-2.033.944-2.033 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

const ArrowLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

interface MessagesViewProps {
    contextId: string | null;
    setContextId: (id: string | null) => void;
}

// Main View Component
const MessagesView: React.FC<MessagesViewProps> = ({ contextId, setContextId }) => {
    const [activeTab, setActiveTab] = useState<'customers' | 'merchants'>('customers');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedConversationIds, setSelectedConversationIds] = useState<Set<string>>(new Set());
    const [isArchiveView, setIsArchiveView] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    // New state for broadcast feature
    const [isUserListVisible, setIsUserListVisible] = useState(false);
    const [allUsers, setAllUsers] = useState<{ customers: MarketplaceUser[], merchants: MarketplaceUser[] } | null>(null);
    const [isUsersLoading, setIsUsersLoading] = useState(false);
    const [userListTab, setUserListTab] = useState<'customers' | 'merchants'>('customers');
    const [selectedRecipients, setSelectedRecipients] = useState<MarketplaceUser[]>([]);
    const [broadcastSuccess, setBroadcastSuccess] = useState(false);


    const messagesEndRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    const isBroadcastMode = selectedRecipients.length > 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    // Effect for click-outside to close user selection list
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsUserListVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchConversations = async () => {
        setIsLoadingConversations(true);
        setSelectedConversation(null);
        setMessages([]);
        try {
            const role = activeTab === 'customers' ? Role.CUSTOMER : Role.MERCHANT;
            const data = isArchiveView 
                ? await api.getArchivedConversations(role)
                : await api.getConversations(role);
            setConversations(data);
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        } finally {
            setIsLoadingConversations(false);
        }
    };

    useEffect(() => {
        // When recipients are selected, exit conversation selection mode
        if (selectedRecipients.length > 0) {
            setSelectedConversation(null);
        }
    }, [selectedRecipients]);

    useEffect(() => {
        fetchConversations();
    }, [activeTab, isArchiveView]);

    useEffect(() => {
        const handleContextNavigation = async () => {
            if (contextId) {
                const result = await api.getConversationById(contextId);
                if (result) {
                    const { conversation, isArchived } = result;
                    const targetTab = conversation.role === Role.CUSTOMER ? 'customers' : 'merchants';
                    
                    if (isArchiveView !== isArchived) setIsArchiveView(isArchived);
                    if (activeTab !== targetTab) setActiveTab(targetTab);
                } else {
                    setContextId(null);
                }
            }
        };
        handleContextNavigation();
    }, [contextId]);

    useEffect(() => {
        if (contextId && conversations.length > 0) {
            const conversationToSelect = conversations.find(c => c.id === contextId);
            if (conversationToSelect) {
                setSelectedConversation(conversationToSelect);
                setSelectedRecipients([]); // Ensure broadcast mode is off
                setContextId(null);
            }
        } else if (contextId && !isLoadingConversations) {
            setContextId(null);
        }
    }, [conversations, contextId, isLoadingConversations, setContextId]);
    
    useEffect(() => {
        if (!selectedConversation) return;

        const fetchMessages = async () => {
            setIsLoadingMessages(true);
            try {
                const data = await api.getMessages(selectedConversation.id);
                setMessages(data);
                if (selectedConversation.unreadCount > 0 && !isArchiveView) {
                    await api.markConversationAsRead(selectedConversation.id);
                    setConversations(prev => prev.map(c => 
                        c.id === selectedConversation.id ? { ...c, unreadCount: 0 } : c
                    ));
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [selectedConversation, isArchiveView]);

    const filteredConversations = useMemo(() => {
        if (isUserListVisible) return conversations;
        return conversations.filter(c => c.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [conversations, searchQuery, isUserListVisible]);
    
    const filteredUsersForSelection = useMemo(() => {
        if (!allUsers) return [];
        const users = allUsers[userListTab];
        return users.filter(user => user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allUsers, userListTab, searchQuery]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        if (selectedRecipients.length > 0) { // BROADCAST
            setIsActionLoading(true);
            try {
                await api.sendBroadcastMessage(selectedRecipients, newMessage);
                setBroadcastSuccess(true);
                setTimeout(() => setBroadcastSuccess(false), 3000);
                // Reset state
                setNewMessage('');
                setSelectedRecipients([]);
                setIsUserListVisible(false);
                setSearchQuery('');
                fetchConversations();
            } catch (error) {
                 console.error("Failed to send broadcast message", error);
            } finally {
                 setIsActionLoading(false);
            }
        } else if (selectedConversation) { // SINGLE CHAT
            const optimisticMessage: Message = {
                id: `temp-${Date.now()}`,
                conversationId: selectedConversation.id,
                sender: 'admin',
                text: newMessage,
                timestamp: new Date().toISOString(),
                status: MessageStatus.SENT,
            };
            setMessages(prev => [...prev, optimisticMessage]);
            setNewMessage('');
            try {
                const sentMessage = await api.sendMessage(selectedConversation.id, newMessage);
                setMessages(prev => prev.map(m => m.id === optimisticMessage.id ? sentMessage : m));
            } catch (error) {
                console.error("Failed to send message", error);
                setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
            }
        }
    };
    
    const handleToggleSelection = (id: string) => {
        const newSelection = new Set(selectedConversationIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedConversationIds(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedConversationIds.size === filteredConversations.length) {
            setSelectedConversationIds(new Set());
        } else {
            setSelectedConversationIds(new Set(filteredConversations.map(c => c.id)));
        }
    };

    const handleAction = async (action: 'archive' | 'delete') => {
        setIsActionLoading(true);
        const ids = [...selectedConversationIds];
        try {
            if (action === 'archive') await api.archiveConversations(ids);
            else if (action === 'delete') await api.deleteConversations(ids, isArchiveView);
            fetchConversations();
            setSelectedConversationIds(new Set());
            setIsSelectionMode(false);
        } catch (error) { console.error(`Failed to ${action} conversations`, error);
        } finally { setIsActionLoading(false); setIsDeleteModalOpen(false); }
    };
    
    // --- Broadcast specific handlers ---
    const handleSearchFocus = () => {
        setIsUserListVisible(true);
        if (!allUsers) {
            setIsUsersLoading(true);
            Promise.all([api.getAllCustomersForBroadcast(), api.getAllMerchantsForBroadcast()])
                .then(([customers, merchants]) => setAllUsers({ customers, merchants }))
                .catch(err => console.error("Failed to fetch all users", err))
                .finally(() => setIsUsersLoading(false));
        }
    };
    
    const handleRecipientToggle = (user: MarketplaceUser) => {
        setSelectedRecipients(prev => 
            prev.some(r => r.id === user.id) 
                ? prev.filter(r => r.id !== user.id) 
                : [...prev, user]
        );
    };
    
    const handleSelectAllUsers = () => {
        const currentList = filteredUsersForSelection;
        const currentListIds = new Set(currentList.map(u => u.id));
        const selectedIds = new Set(selectedRecipients.map(r => r.id));
        const areAllSelected = currentList.every(u => selectedIds.has(u.id));

        if (areAllSelected) {
            setSelectedRecipients(prev => prev.filter(r => !currentListIds.has(r.id)));
        } else {
            const newRecipients = currentList.filter(u => !selectedIds.has(u.id));
            setSelectedRecipients(prev => [...prev, ...newRecipients]);
        }
    };


    return (
        <div className="relative flex h-[calc(100vh-6.5rem)] bg-white dark:bg-gray-800 rounded-lg shadow