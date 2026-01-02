import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import './AdminChatPanel.css';
import { io, Socket } from 'socket.io-client';

interface User {
  userId: string;
  name: string;
  email: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

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

const AdminChatPanel: React.FC = () => {
  const userId = useAuthStore((state) => state.userId);
  const role = useAuthStore((state) => state.role);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId || role !== 'admin') return;

    const newSocket = io('http:
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Admin socket connected');
      setIsConnected(true);

      newSocket.emit('register', { 
        userId: userId, 
        role: 'admin' 
      });

      refreshConversations();
    });

    const refreshConversations = () => {
      console.log('Refreshing conversations list');

      fetch('http:
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log('Fetched conversations:', data);
        if (data.success && data.conversations) {
          if (data.conversations.length === 0) {
            console.log('No conversations returned from API');
          } else {
            console.log('Setting users with:', data.conversations.length, 'conversations');
            setUsers(data.conversations);

            if (selectedUser) {
              const stillExists = data.conversations.some((u: User) => u.userId === selectedUser.userId);
              if (!stillExists) {
                console.log('Selected user no longer in list, clearing selection');
                setSelectedUser(null);
                setMessages([]);
              }
            }
          }
        } else {
          console.error('Invalid response format or no conversations:', data);
        }
      })
      .catch(err => console.error('Error fetching conversations:', err));
    };

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('newMessage', (message: Message) => {
      console.log('Admin received new message:', message);

      if (selectedUser && 
          (message.senderId === selectedUser.userId || 
           message.receiverId === selectedUser.userId || 
           message.receiverId === null)) {

        if (message.senderId === userId && message.senderRole === 'admin') {
          console.log('Skipping duplicate admin message:', message._id);
          return;
        }
        
        setMessages(prev => {
          
          const exists = prev.some(msg => msg._id === message._id);
          if (exists) {
            console.log('Message already exists, not adding duplicate:', message._id);
            return prev;
          }

          return removeDuplicateMessages([...prev, message]);
        });

        if ((message.receiverId === userId || message.receiverId === null) && !message.isRead) {
          newSocket.emit('markAsRead', { messageId: message._id });
        }
      }

      setPreloadedConversations(prev => {
        const updated = {...prev};
        let targetUserId = '';
        
        if (message.senderRole === 'user') {
          targetUserId = message.senderId;
        } else {
          targetUserId = message.receiverId;
        }
        
        if (targetUserId && updated[targetUserId]) {
          updated[targetUserId] = removeDuplicateMessages([...updated[targetUserId], message]);
        }
        
        return updated;
      });

      refreshConversations();

      setUsers(prev => {
        const updatedUsers = [...prev];

        let targetUserId = '';
        if (message.senderRole === 'user') {
          targetUserId = message.senderId;
        } else {
          targetUserId = message.receiverId;
        }

        const userIndex = updatedUsers.findIndex(u => u.userId === targetUserId);
        
        if (userIndex !== -1) {
          updatedUsers[userIndex] = {
            ...updatedUsers[userIndex],
            lastMessage: message.message,
            lastMessageTime: message.createdAt,
            unreadCount: selectedUser && selectedUser.userId === updatedUsers[userIndex].userId
              ? 0
              : updatedUsers[userIndex].unreadCount + (message.senderRole === 'user' ? 1 : 0)
          };
        } else if (message.senderRole === 'user') {
          
          console.log('Adding new user to list:', message.senderId);
          updatedUsers.push({
            userId: message.senderId,
            name: 'User ' + message.senderId.substring(0, 5),
            email: 'user@example.com',
            lastMessage: message.message,
            lastMessageTime: message.createdAt,
            unreadCount: 1
          });
        }

        return updatedUsers.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId, role, selectedUser]);

  useEffect(() => {
    
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    console.log(`Messages updated, now showing ${messages.length} messages`);
    if (messages.length > 0) {
      console.log('First message:', messages[0].message);
      console.log('Last message:', messages[messages.length - 1].message);
    }
  }, [messages]);

  const [preloadedConversations, setPreloadedConversations] = useState<{[key: string]: Message[]}>({});

  useEffect(() => {
    if (!socket || !users.length) return;

    users.forEach(user => {
      if (!preloadedConversations[user.userId]) {
        console.log('Preloading conversation for user:', user.userId);
        socket.emit('getConversation', { userId: user.userId }, (response: any) => {
          if (response.status === 'success' && Array.isArray(response.data)) {
            console.log('Preloaded conversation for user:', user.userId, 'with', response.data.length, 'messages');
            setPreloadedConversations(prev => ({
              ...prev,
              [user.userId]: response.data
            }));
          }
        });
      }
    });
  }, [socket, users, preloadedConversations]);

  const handleSelectUser = (user: User) => {
    console.log('Selected user:', user);
    setSelectedUser(user);

    setUsers(prev => prev.map((u: User) => 
      u.userId === user.userId 
        ? { ...u, unreadCount: 0 }
        : u
    ));

    if (preloadedConversations[user.userId]) {
      console.log('Using preloaded conversation for user:', user.userId);
      setMessages(preloadedConversations[user.userId]);

      preloadedConversations[user.userId].forEach((msg: Message) => {
        if ((msg.receiverId === userId || msg.receiverId === null) && !msg.isRead && socket) {
          socket.emit('markAsRead', { messageId: msg._id });
        }
      });
    } else {
      
      if (socket) {
        console.log('Fetching conversation for user:', user.userId);

        console.log('Loading conversation for selected user:', user.userId);
        socket.emit('getConversation', { userId: user.userId }, (response: any) => {
          console.log('Conversation response for user:', user.userId);
          
          if (response.status === 'success' && Array.isArray(response.data)) {
            console.log('Conversation loaded via socket:', response.data.length, 'messages');

            setPreloadedConversations(prev => ({
              ...prev,
              [user.userId]: response.data
            }));

            setMessages(response.data);

            response.data.forEach((msg: Message) => {
              if ((msg.receiverId === userId || msg.receiverId === null) && !msg.isRead) {
                socket.emit('markAsRead', { messageId: msg._id });
              }
            });
          } else {
            console.error('Response data is not an array:', response.data);
            setMessages([]);
          }
        });
      } else {
        console.error('Socket not connected');
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !socket || !selectedUser || !userId) return;

    console.log('Admin sending message to:', selectedUser.userId);
    const messageData = {
      senderId: userId,
      receiverId: selectedUser.userId,
      message: newMessage,
      senderRole: 'admin',
    };

    const tempId = 'temp_' + Date.now().toString();
    const tempMsg: Message = {
      _id: tempId,
      senderId: userId || '',
      receiverId: selectedUser.userId,
      message: newMessage,
      isRead: false,
      senderRole: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMessages(prev => removeDuplicateMessages([...prev, tempMsg]));

    socket.emit('sendMessage', messageData, (response: any) => {
      console.log('Send message response:', response);
      if (response.status === 'success') {
        
        const actualMsg = response.data;

        const realMessageId = actualMsg._id;
        console.log(`Message sent successfully: ${tempId} -> ${realMessageId}`);
        
        setMessages(prev => {
          
          const filteredMessages = prev.filter(msg => 
            msg._id !== realMessageId && msg._id !== tempId
          );

          return removeDuplicateMessages([...filteredMessages, actualMsg]);
        });

        setPreloadedConversations(prev => {
          const updated = {...prev};
          if (updated[selectedUser.userId]) {
            
            const filteredConvo = updated[selectedUser.userId].filter(msg => 
              msg._id !== realMessageId && msg._id !== tempId
            );
            
            updated[selectedUser.userId] = [...filteredConvo, actualMsg];
          }
          return updated;
        });

        setUsers(prev => prev.map((u: User) => 
          u.userId === selectedUser.userId ? {
            ...u,
            lastMessage: newMessage,
            lastMessageTime: new Date().toISOString()
          } : u
        ));
      } else {
        console.error('Failed to send message:', response);
        
        setMessages(prev => prev.filter(msg => msg._id !== tempId));
      }
    });
    
    setNewMessage('');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const removeDuplicateMessages = (messages: Message[]): Message[] => {
    
    const messageMap = new Map<string, Message>();

    messages.forEach(message => {
      
      if (!message._id.startsWith('temp_')) {
        
        if (!messageMap.has(message._id)) {
          messageMap.set(message._id, message);
        }
      }
    });

    messages.forEach(message => {
      if (message._id.startsWith('temp_')) {
        
        const hasRealMessage = Array.from(messageMap.values()).some(msg => 
          msg.senderId === message.senderId && 
          msg.message === message.message && 
          Math.abs(new Date(msg.createdAt).getTime() - new Date(message.createdAt).getTime()) < 5000
        );
        
        if (!hasRealMessage) {
          messageMap.set(message._id, message);
        }
      }
    });

    const uniqueMessages = Array.from(messageMap.values());

    return uniqueMessages.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };
  
  return (
    <div className="admin-chat-container">
      <div className="admin-chat-sidebar">
        <div className="admin-chat-sidebar-header">
          <h2>Conversations</h2>
        </div>
        <div className="admin-chat-users">
          {users.length === 0 ? (
            <div className="admin-chat-no-users">No active conversations</div>
          ) : (
            users.map((user) => (
              <div 
                key={user.userId}
                className={`admin-chat-user ${selectedUser?.userId === user.userId ? 'selected' : ''}`}
                onClick={() => handleSelectUser(user)}
              >
                <div className="admin-chat-user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="admin-chat-user-info">
                  <div className="admin-chat-user-name">{user.name}</div>
                  <div className="admin-chat-user-last-message">{user.lastMessage}</div>
                </div>
                <div className="admin-chat-user-meta">
                  <div className="admin-chat-user-time">{formatLastMessageTime(user.lastMessageTime)}</div>
                  {user.unreadCount > 0 && (
                    <div className="admin-chat-user-unread">{user.unreadCount}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="admin-chat-main">
        {selectedUser ? (
          <>
            <div className="admin-chat-header">
              <div className="admin-chat-header-user">
                <div className="admin-chat-header-avatar">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="admin-chat-header-info">
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                </div>
              </div>
              <div className="admin-chat-header-actions">
                
              </div>
            </div>
            
            <div className="admin-chat-messages">
              {messages.length === 0 ? (
                <div className="admin-chat-no-messages">
                  <p>No messages yet. Start the conversation!</p>
                  <div className="debug-info" style={{fontSize: '10px', color: '#888', textAlign: 'left', overflowWrap: 'break-word'}}>
                    <p><strong>Debug Info:</strong></p>
                    <p>MessagesCount: {messages.length}</p>
                    <p>SelectedUser: {selectedUser?.userId}</p>
                    <p>Admin ID: {userId}</p>
                    <p>Socket Connected: {isConnected ? 'Yes' : 'No'}</p>
                    <button 
                      onClick={() => {
                        if (selectedUser) {
                          console.log('Manual refresh for:', selectedUser.userId);
                          
                          socket?.emit('getConversation', { userId: selectedUser.userId }, (response: any) => {
                            console.log('Manual refresh response:', response);
                            if (response.status === 'success' && Array.isArray(response.data)) {
                              
                              setMessages(response.data);

                              setPreloadedConversations(prev => ({
                                ...prev,
                                [selectedUser.userId]: response.data
                              }));
                              
                              console.log('Manually refreshed. New message count:', response.data.length);

                              response.data.forEach((msg: any, idx: number) => {
                                console.log(`Refreshed msg ${idx}: ${msg.message} | From: ${msg.senderId} to: ${msg.receiverId || 'ADMIN'}`);
                              });
                            }
                          });
                        }
                      }}
                      style={{marginTop: '10px', padding: '3px 8px', fontSize: '11px'}}
                    >
                      Refresh Conversation
                    </button>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  
                  console.log(`Rendering message: ${msg.message}, from: ${msg.senderId}, to: ${msg.receiverId || 'ADMIN'}`);
                  
                  return (
                    <div
                      key={msg._id}
                      className={`admin-chat-message ${
                        msg.senderRole === 'admin' ? 'sent' : 'received'
                      }`}
                    >
                      <div className="admin-chat-message-content">
                        <p>{msg.message}</p>
                        <span className="admin-chat-message-time">{formatTimestamp(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form className="admin-chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={!isConnected}
              />
              <button type="submit" disabled={!isConnected || newMessage.trim() === ''}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </>
        ) : (
          <div className="admin-chat-select-prompt">
            <div>
              <i className="fas fa-comments admin-chat-large-icon"></i>
              <h2>Select a conversation</h2>
              <p>Choose a customer from the list to start chatting</p>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="admin-chat-connection-status">
            <p>Connecting to chat server...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPanel;
