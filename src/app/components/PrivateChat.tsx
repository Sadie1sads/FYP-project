// src/components/PrivateChat.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  _id: string;
  senderId: string;
  senderUsername: string;
  text: string;
  createdAt: string;
}

interface Props {
  currentUserId: string;       
  currentUsername: string;     
  otherUserId: string;         
  otherUsername: string;       
  onClose: () => void;     // to close the chat modal
}

let socket: Socket;

export default function PrivateChat({
  currentUserId,
  currentUsername,
  otherUserId,
  otherUsername,
  onClose,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket = io({
      withCredentials: true, // sends cookies with the connection
    });

    socket.on('connect', () => {
      setConnected(true);
      // Tell the server which user we want to chat with
      socket.emit('join-private-chat', otherUserId);
    });

    socket.on('connect_error', () => {
      setError('Could not connect. Are you logged in?');
    });

    // Receive old messages from MongoDB
    socket.on('message-history', (history: Message[]) => {
      setMessages(history);
    });

    // Receive new messages in real time
    socket.on('receive-message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [otherUserId]);

  // Auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    socket.emit('send-message', {
      otherUserId,
      text: input,
    });
    setInput('');
  };

  return (
    // Backdrop
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      {/* Chat window */}
      <div style={{
        background: '#fff', borderRadius: 12,
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column',
        height: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>

        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid #eee',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 600 }}>@{otherUsername}</div>
            <div style={{ fontSize: 12, color: connected ? 'green' : 'gray' }}>
              {connected ? 'Connected' : 'Connecting...'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none',
            fontSize: 20, cursor: 'pointer', color: '#666',
          }}>✕</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: 12, color: 'red', fontSize: 13 }}>{error}</div>
        )}

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: 16, display: 'flex',
          flexDirection: 'column', gap: 8,
        }}>
          {messages.length === 0 && connected && (
            <p style={{ color: '#999', textAlign: 'center', marginTop: 40 }}>
              No messages yet. Say hi to @{otherUsername}!
            </p>
          )}

          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg._id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                {!isMe && (
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>
                    @{msg.senderUsername}
                  </div>
                )}
                <div style={{
                  padding: '8px 14px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? '#0070f3' : '#f0f0f0',
                  color: isMe ? '#fff' : '#000',
                  fontSize: 14,
                  wordBreak: 'break-word',
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 10, color: '#bbb', marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #eee',
          display: 'flex', gap: 8,
        }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={`Message @${otherUsername}...`}
            style={{
              flex: 1, padding: '10px 14px',
              borderRadius: 24, border: '1px solid #ddd',
              outline: 'none', fontSize: 14,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!connected}
            style={{
              padding: '10px 18px', borderRadius: 24,
              background: connected ? '#0070f3' : '#ccc',
              color: '#fff', border: 'none',
              cursor: connected ? 'pointer' : 'not-allowed',
              fontWeight: 600,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}