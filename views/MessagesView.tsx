import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../services/api';
import { Conversation, Message, Role, MessageStatus } from '../types';
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


    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
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
        fetchConversations();
    }, [activeTab, isArchiveView]);

    useEffect(() => {
        const handleContextNavigation = async () => {
            if (contextId) {
                const result = await api.getConversationById(contextId);
                if (result) {
                    const { conversation, isArchived } = result;
                    const targetTab = conversation.role === Role.CUSTOMER ? 'customers' : 'merchants';

                    // Set view states. Effects will cascade to fetch data and select item.
                    if (isArchiveView !== isArchived) {
                        setIsArchiveView(isArchived);
                    }
                    if (activeTab !== targetTab) {
                        setActiveTab(targetTab);
                    }
                } else {
                    // Conversation not found, just clear context
                    setContextId(null);
                }
            }
        };
        handleContextNavigation();
    }, [contextId]);

    useEffect(() => {
        // This effect runs after conversations for the active tab have been fetched.
        if (contextId && conversations.length > 0) {
            const conversationToSelect = conversations.find(c => c.id === contextId);
            if (conversationToSelect) {
                setSelectedConversation(conversationToSelect);
                setContextId(null); // Clear context after successful selection
            }
        } else if (contextId && !isLoadingConversations) {
            // If conversations are loaded but the target isn't there (e.g., after a tab switch),
            // and we are not loading anymore, it means it's not in this list. Clear context.
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
        return conversations.filter(c => c.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [conversations, searchQuery]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

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
        // Fix: Use spread syntax to convert the Set of conversation IDs to an array, ensuring correct type inference as string[] for API calls.
        const ids = [...selectedConversationIds];
        try {
            if (action === 'archive') {
                await api.archiveConversations(ids);
            } else if (action === 'delete') {
                await api.deleteConversations(ids, isArchiveView);
            }
            fetchConversations();
            setSelectedConversationIds(new Set());
            setIsSelectionMode(false);
        } catch (error) {
            console.error(`Failed to ${action} conversations`, error);
        } finally {
            setIsActionLoading(false);
            setIsDeleteModalOpen(false);
        }
    };
    
    return (
        <div className="flex h-[calc(100vh-6.5rem)] bg-white dark:bg-gray-800 rounded-lg shadow-md">
            {/* Left Pane: Conversation List */}
            <aside className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
                     <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                        {isArchiveView ? 'Mensajes Archivados' : 'Mensajes'}
                     </h1>
                     <div className="flex items-center space-x-2">
                        {!isSelectionMode && (
                            <>
                                <button onClick={() => { setIsSelectionMode(true); setSelectedConversationIds(new Set())}} className="text-sm font-medium text-primary-600 hover:text-primary-800">Seleccionar</button>
                                <div className="flex-grow"></div>
                                <button onClick={() => setIsArchiveView(!isArchiveView)} className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">
                                    {isArchiveView ? 'Volver a la bandeja' : 'Archivados'} 
                                    {!isArchiveView && <ArchiveBoxIcon className="w-4 h-4 ml-1" />}
                                </button>
                            </>
                        )}
                        {isSelectionMode && (
                            <>
                                <input type="checkbox" onChange={handleSelectAll} checked={selectedConversationIds.size > 0 && selectedConversationIds.size === filteredConversations.length} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" />
                                <button onClick={() => { setIsSelectionMode(false); setSelectedConversationIds(new Set())}} className="text-sm font-medium text-gray-600 hover:text-gray-800">Cancelar</button>
                                <div className="flex-grow"></div>
                                <button onClick={() => setIsDeleteModalOpen(true)} disabled={selectedConversationIds.size === 0 || isActionLoading} className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50">Eliminar</button>
                                {!isArchiveView && <button onClick={() => handleAction('archive')} disabled={selectedConversationIds.size === 0 || isActionLoading} className="text-sm font-medium text-primary-600 hover:text-primary-800 disabled:opacity-50">Archivar</button>}
                            </>
                        )}
                     </div>
                     <input 
                        type="text" 
                        placeholder="Buscar por nombre..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full py-2 px-4 text-gray-700 bg-gray-100 border border-transparent rounded-lg dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:bg-white dark:focus:bg-gray-600 focus:border-primary-500"
                    />
                </div>
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActiveTab('customers')} className={`flex-1 p-3 text-sm font-medium ${activeTab === 'customers' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        Clientes
                    </button>
                    <button onClick={() => setActiveTab('merchants')} className={`flex-1 p-3 text-sm font-medium ${activeTab === 'merchants' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                        Comercios
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {isLoadingConversations ? (
                        <div className="p-4 text-center text-gray-500">Cargando...</div>
                    ) : (
                        filteredConversations.map(conv => (
                            <div key={conv.id} onClick={() => isSelectionMode ? handleToggleSelection(conv.id) : setSelectedConversation(conv)} className={`p-4 flex items-center cursor-pointer border-l-4 ${selectedConversation?.id === conv.id ? 'bg-primary-50 dark:bg-gray-900/50 border-primary-500' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                                {isSelectionMode && <input type="checkbox" checked={selectedConversationIds.has(conv.id)} onChange={() => handleToggleSelection(conv.id)} className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 mr-4" />}
                                <img src={conv.userAvatarUrl} alt={conv.userName} className="w-10 h-10 rounded-full mr-3" />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold truncate text-gray-800 dark:text-gray-200">{conv.userName}</p>
                                        <p className="text-xs text-gray-400 flex-shrink-0">{new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                        {conv.unreadCount > 0 && <span className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0 mt-1"></span>}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>
            {/* Right Pane: Chat Window */}
            <main className="w-2/3 flex flex-col">
                {!selectedConversation ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500">
                        <p>{isSelectionMode ? `Seleccionado(s) ${selectedConversationIds.size} chat(s)` : 'Selecciona una conversación para empezar a chatear.'}</p>
                    </div>
                ) : (
                    <>
                        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                             <img src={selectedConversation.userAvatarUrl} alt={selectedConversation.userName} className="w-10 h-10 rounded-full mr-3" />
                            <h2 className="font-bold text-lg text-gray-800 dark:text-white">{selectedConversation.userName}</h2>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                            {isLoadingMessages ? (
                                <div className="text-center text-gray-500">Cargando mensajes...</div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.sender === 'user' && <img src={selectedConversation.userAvatarUrl} alt="user" className="w-6 h-6 rounded-full" />}
                                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.sender === 'admin' ? 'bg-primary-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}`}>
                                                <p>{msg.text}</p>
                                                <div className="flex justify-end items-center gap-1 mt-1">
                                                    <p className="text-xs opacity-70">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    {msg.sender === 'admin' && (
                                                         <div className="w-4 h-4">
                                                          {msg.status === MessageStatus.SENT && <CheckIcon className="w-full h-full text-gray-400" />}
                                                          {msg.status === MessageStatus.DELIVERED && <DoubleCheckIcon className="w-full h-full text-gray-400" />}
                                                          {msg.status === MessageStatus.READ && <DoubleCheckIcon className="w-full h-full text-blue-400" />}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>
                        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none dark:bg-gray-700 dark:text-gray-200" />
                                <button type="submit" className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50" disabled={!newMessage.trim()}>
                                    <SendIcon className="w-6 h-6" />
                                </button>
                            </form>
                        </footer>
                    </>
                )}
            </main>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={() => handleAction('delete')}
                isConfirming={isActionLoading}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que quieres eliminar ${selectedConversationIds.size} conversación(es) seleccionada(s)? Esta acción es permanente.`}
                confirmText="Eliminar"
            />
        </div>
    );
};

export default MessagesView;