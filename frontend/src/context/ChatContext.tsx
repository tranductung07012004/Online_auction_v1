import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/authStore';

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  isRead: boolean;
  senderRole: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  messages: Message[];
  sendMessage: (message: string, receiverId?: string) => void;
  unreadCount: number;
  isConnected: boolean;
  isChatOpen: boolean;
  toggleChat: () => void;
  markAsRead: (messageId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    if (!userId || !role) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const fetchMessages = async () => {
      try {
        console.log('Fetching messages via REST API');
        const response = await fetch('http:
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('Messages from REST API:', data);

        if (data.success && data.messages) {
          setMessages(data.messages);

          const unread = data.messages.filter(
            (msg: Message) => !msg.isRead && msg.receiverId === userId
          ).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [userId, role]);

  useEffect(() => {
    
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);

        const unread = parsedMessages.filter(
          (msg: Message) => !msg.isRead && (msg.receiverId === userId || msg.receiverId === null)
        ).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !role) return;

    const newSocket = io('http:
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);

      newSocket.emit('register', { 
        userId: userId, 
        role: role 
      });

      newSocket.emit('getConversation', { userId: userId }, (response: any) => {
        if (response.status === 'success') {
          console.log('Conversation loaded via socket:', response.data.length, 'messages');
          setMessages(response.data);

          const unread = response.data.filter(
            (msg: Message) => !msg.isRead && msg.receiverId === userId
          ).length;
          setUnreadCount(unread);

          localStorage.setItem('chatMessages', JSON.stringify(response.data));
        }
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log('New message received:', message);
      setMessages((prev) => {
        
        const messageExists = prev.some(msg => msg._id === message._id);
        if (messageExists) {
          return prev;
        }
        
        const updatedMessages = [...prev, message];
        
        localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      if ((message.receiverId === userId || message.receiverId === null) && !message.isRead) {
        setUnreadCount((prev) => prev + 1);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, role]);

  const sendMessage = (message: string, receiverId?: string) => {
    if (!socket || !userId || !role) return;

    const targetReceiverId = receiverId || (role === 'admin' ? '' : null); 
    
    const messageData = {
      senderId: userId,
      receiverId: targetReceiverId,
      message,
      senderRole: role,
    };
    
    console.log('Sending message:', messageData);
    
    socket.emit('sendMessage', messageData, (response: any) => {
      console.log('Send message response:', response);
      if (response.status === 'success' && response.data) {
        
        const newMessage = response.data;
        setMessages(prev => {
          
          const messageExists = prev.some(msg => msg._id === newMessage._id);
          if (messageExists) {
            return prev;
          }
          
          const updatedMessages = [...prev, newMessage];
          
          localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
          return updatedMessages;
        });
      }
    });
  };

  const markAsRead = (messageId: string) => {
    if (!socket) return;

    socket.emit('markAsRead', { messageId }, (response: any) => {
      if (response.status === 'success') {
        
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true } : msg
          )
        );

        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    });
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);

    if (!isChatOpen && userId) {
      messages.forEach((msg) => {
        if (!msg.isRead && msg.receiverId === userId) {
          markAsRead(msg._id);
        }
      });
    }
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        sendMessage,
        unreadCount,
        isConnected,
        isChatOpen,
        toggleChat,
        markAsRead,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
