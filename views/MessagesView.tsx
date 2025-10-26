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

{/* FIX: Define MessageIcon to resolve "Cannot find name 'MessageIcon'" error. */}
const MessageIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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
        <div className="relative flex h-[calc(100vh-6.5rem)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Conversation List Panel */}
            <div className={`
                w-full md:w-1/3 xl:w-1/4 border-r border-gray-200 dark:border-gray-700 flex flex-col
                ${(selectedConversation || isBroadcastMode) && 'hidden md:flex'}
            `}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Mensajería</h2>
                    <div className="mt-2 flex border border-gray-300 dark:border-gray-600 rounded-md">
                        <button onClick={() => setActiveTab('customers')} className={`flex-1 py-1.5 text-sm rounded-l-md ${activeTab === 'customers' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Clientes</button>
                        <button onClick={() => setActiveTab('merchants')} className={`flex-1 py-1.5 text-sm rounded-r-md ${activeTab === 'merchants' ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Comercios</button>
                    </div>
                </div>

                <div ref={searchContainerRef} className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0 relative">
                     <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none"><path d="M21 21L15.803 15.803M15.803 15.803C17.2096 14.3964 18 12.4883 18 10.5C18 6.35786 14.6421 3 10.5 3C6.35786 3 3 6.35786 3 10.5C3 14.6421 6.35786 18 10.5 18C12.4883 18 14.3964 17.2096 15.803 15.803Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path></svg>
                        </span>
                        <input 
                            type="text" 
                            placeholder="Buscar o iniciar un chat nuevo..." 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onFocus={handleSearchFocus}
                            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border-transparent rounded-lg dark:bg-gray-700 dark:text-gray-300 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary-500" 
                        />
                    </div>

                    {isUserListVisible && (
                         <div className="absolute top-full left-0 right-0 mt-1 mx-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
                            <div className="flex border-b dark:border-gray-700">
                                <button onClick={() => setUserListTab('customers')} className={`flex-1 py-2 text-sm ${userListTab === 'customers' ? 'bg-primary-50 dark:bg-gray-900 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Clientes</button>
                                <button onClick={() => setUserListTab('merchants')} className={`flex-1 py-2 text-sm ${userListTab === 'merchants' ? 'bg-primary-50 dark:bg-gray-900 font-semibold' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>Comercios</button>
                            </div>
                            <div className="p-2 flex justify-between items-center border-b dark:border-gray-700">
                                <span className="text-xs font-bold uppercase text-gray-500">Seleccionar todos</span>
                                <input type="checkbox" onChange={handleSelectAllUsers} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
                            </div>
                             {isUsersLoading ? <div className="p-4 text-center text-gray-500">Cargando...</div> : (
                                filteredUsersForSelection.map(user => (
                                    <div key={user.id} onClick={() => handleRecipientToggle(user)} className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                                        <input type="checkbox" readOnly checked={selectedRecipients.some(r => r.id === user.id)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 mr-3" />
                                        <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full mr-3" />
                                        <span className="text-sm font-medium">{user.name}</span>
                                    </div>
                                ))
                            )}
                         </div>
                    )}
                </div>

                <div className="flex justify-between items-center px-4 py-2 border-b dark:border-gray-700">
                    <button onClick={() => setIsArchiveView(!isArchiveView)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                        {isArchiveView ? 'Ver Activos' : 'Ver Archivados'}
                    </button>
                    {!isSelectionMode ? (
                        <button onClick={() => setIsSelectionMode(true)} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">Seleccionar</button>
                    ) : (
                        <div className="flex items-center space-x-2">
                             <button onClick={handleSelectAll} className="text-sm p-1">
                                {selectedConversationIds.size === filteredConversations.length ? 'Ninguno' : 'Todos'}
                             </button>
                             <button onClick={() => handleAction('archive')} disabled={selectedConversationIds.size === 0} className="p-1 disabled:opacity-50"><ArchiveBoxIcon className="w-5 h-5" /></button>
                             <button onClick={() => setIsDeleteModalOpen(true)} disabled={selectedConversationIds.size === 0} className="p-1 disabled:opacity-50"><TrashIcon className="w-5 h-5 text-red-500" /></button>
                             <button onClick={() => { setIsSelectionMode(false); setSelectedConversationIds(new Set()); }} className="text-sm">Cancelar</button>
                        </div>
                    )}
                </div>

                <div className="flex-grow overflow-y-auto">
                    {isLoadingConversations ? (
                        <div className="p-4 text-center text-gray-500">Cargando conversaciones...</div>
                    ) : filteredConversations.length > 0 ? (
                        filteredConversations.map(conv => (
                            <button
                                key={conv.id}
                                onClick={() => {
                                    if (isSelectionMode) handleToggleSelection(conv.id);
                                    else { setSelectedConversation(conv); setSelectedRecipients([]); }
                                }}
                                className={`w-full text-left flex items-center p-3 border-b border-gray-200 dark:border-gray-700 transition-colors duration-150
                                    ${selectedConversation?.id === conv.id ? 'bg-primary-50 dark:bg-gray-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                                    ${selectedConversationIds.has(conv.id) ? 'bg-blue-100 dark:bg-blue-900/50' : ''}
                                `}
                            >
                                {isSelectionMode && <input type="checkbox" readOnly checked={selectedConversationIds.has(conv.id)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 mr-3" />}
                                <img src={conv.userAvatarUrl} alt={conv.userName} className="h-10 w-10 rounded-full mr-3" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-semibold truncate text-gray-800 dark:text-white">{conv.userName}</p>
                                        <p className="text-xs text-gray-400 flex-shrink-0">{new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                                        {conv.unreadCount > 0 && <span className="ml-2 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{conv.unreadCount}</span>}
                                    </div>
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500">{isArchiveView ? 'No hay conversaciones archivadas.' : 'No hay conversaciones activas.'}</div>
                    )}
                </div>
            </div>

            {/* Chat Panel */}
            <div className={`
                w-full md:w-2/3 xl:w-3/4 flex flex-col bg-gray-50 dark:bg-gray-800/50
                ${!(selectedConversation || isBroadcastMode) && 'hidden md:flex'}
            `}>
                {selectedConversation || isBroadcastMode ? (
                    <>
                        <div className="flex-shrink-0 flex items-center p-3 border-b border-gray-200 dark:border-gray-700">
                             <button onClick={() => { setSelectedConversation(null); setSelectedRecipients([]); }} className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <ArrowLeftIcon className="w-5 h-5"/>
                            </button>
                            {selectedConversation && (
                                <>
                                    <img src={selectedConversation.userAvatarUrl} alt={selectedConversation.userName} className="h-10 w-10 rounded-full mr-3" />
                                    <div>
                                        <h3 className="font-semibold">{selectedConversation.userName}</h3>
                                        <p className="text-xs text-gray-500">{selectedConversation.role}</p>
                                    </div>
                                </>
                            )}
                            {isBroadcastMode && (
                                <div>
                                    <h3 className="font-semibold">Mensaje Masivo</h3>
                                    <p className="text-xs text-gray-500">{selectedRecipients.length} destinatarios</p>
                                </div>
                            )}
                        </div>
                        <div className="flex-grow p-4 overflow-y-auto space-y-4">
                            {isLoadingMessages && <div className="text-center text-gray-500">Cargando mensajes...</div>}
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.sender === 'admin' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <div className="flex items-center justify-end mt-1">
                                            <p className="text-xs opacity-70 mr-1">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            {msg.sender === 'admin' && (
                                                msg.status === MessageStatus.READ ? <DoubleCheckIcon color="#4ade80" className="w-4 h-4" /> :
                                                msg.status === MessageStatus.DELIVERED ? <DoubleCheckIcon className="w-4 h-4" /> :
                                                <CheckIcon className="w-4 h-4" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        {isBroadcastMode && (
                             <div className="flex-shrink-0 p-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-wrap gap-1">
                                    {selectedRecipients.map(r => (
                                        <span key={r.id} className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-0.5 text-xs">
                                            {r.name}
                                            <button onClick={() => handleRecipientToggle(r)} className="ml-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                                                &times;
                                            </button>
                                        </span>
                                    ))}
                                </div>
                             </div>
                        )}
                        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    placeholder={isBroadcastMode ? "Escribe un mensaje para todos..." : "Escribe un mensaje..."}
                                    disabled={isActionLoading}
                                    className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-700 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <button type="submit" disabled={!newMessage.trim() || isActionLoading} className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <SendIcon className="w-5 h-5" />
                                </button>
                            </form>
                             {broadcastSuccess && <p className="text-green-500 text-sm mt-2 text-center">Mensaje masivo enviado con éxito.</p>}
                        </div>
                    </>
                ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
                        <MessageIcon className="w-16 h-16 mb-4"/>
                        <h3 className="text-xl font-semibold">Bienvenido a Mensajería</h3>
                        <p>Selecciona una conversación para empezar a chatear o busca un usuario para iniciar una nueva.</p>
                    </div>
                )}
            </div>
            <ConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => handleAction('delete')}
                isConfirming={isActionLoading}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar ${selectedConversationIds.size} conversación(es)? Esta acción es permanente.`}
            />
        </div>
    );
};

export default MessagesView;