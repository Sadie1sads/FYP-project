'use client'

import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import Link from 'next/link'
import Sidebar from "../components/Sidebar"
import { io, Socket } from 'socket.io-client'
import styles from './inbox.module.css'


type Notification = {
  _id: string
  message: string
  postId: { _id: string; title: string } | null
  locationName: string
  createdAt: string
}

type Conversation = {
  roomId: string
  otherUserId: string
  otherUsername: string
  latestMessage: string
  latestMessageTime: string | null
}

type Message = {
  _id: string
  senderId: string
  senderUsername: string
  text: string
  createdAt: string
}

type CurrentUser = {
  id: string
  username: string
}

let socket: Socket

export default function InboxPage() {
  const [tab, setTab] = useState<'notifications' | 'messages'>('notifications')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  // load initial data
  useEffect(() => {
    const load = async () => {
      try {
        const [meRes, notifRes, convoRes] = await Promise.all([
          axios.get('/api/users/me', { withCredentials: true }),
          axios.get('/api/notifications', { withCredentials: true }),
          axios.get('/api/conversations', { withCredentials: true }),
        ])
        setCurrentUser({ id: meRes.data.user.id, username: meRes.data.user.username })
        setNotifications(notifRes.data.notifications ?? [])
        setConversations(convoRes.data.conversations ?? [])
      } catch {
        // not logged in
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // socket connection
  useEffect(() => {
    if (!currentUser) return

    socket = io({ withCredentials: true })

    socket.on('connect', () => {
      setConnected(true)
    })

    // Real-time notification arrives
    socket.on('new-notification', (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev])
    })

    // Real-time message arrives
    socket.on('receive-message', (message: Message) => {
      setMessages((prev) => [...prev, message])
      // Also update the conversation preview in the list
      setConversations((prev) =>
        prev.map((c) =>
          c.roomId === [currentUser.id, message.senderId].sort().join('_') ||
          selectedConvo?.roomId === [currentUser.id, message.senderId].sort().join('_')
            ? { ...c, latestMessage: message.text, latestMessageTime: message.createdAt }
            : c
        )
      )
    })

    socket.on('message-history', (history: Message[]) => {
      setMessages(history)
    })

    socket.on('disconnect', () => setConnected(false))

    return () => { socket.disconnect() }
  }, [currentUser])

  //auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // open a conversation
  const openConversation = (convo: Conversation) => {
    setSelectedConvo(convo)
    setMessages([])
    setTab('messages')
    socket.emit('join-private-chat', convo.otherUserId)
  }

  // send message
  const sendMessage = () => {
    if (!input.trim() || !selectedConvo || !socket) return
    socket.emit('send-message', {
      otherUserId: selectedConvo.otherUserId,
      text: input,
    })
    setInput('')
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}><p>Loading...</p></main>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.container}>

          {/* LEFT PANEL */}
          <div className={styles.leftPanel}>
            <h2 className={styles.title}>Inbox</h2>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === 'notifications' ? styles.activeTab : ''}`}
                onClick={() => setTab('notifications')}
              >
                 Notifications
                {notifications.length > 0 && (
                  <span className={styles.badge}>{notifications.length}</span>
                )}
              </button>
              <button
                className={`${styles.tab} ${tab === 'messages' ? styles.activeTab : ''}`}
                onClick={() => setTab('messages')}
              >
                💬 Messages
                {conversations.length > 0 && (
                  <span className={styles.badge}>{conversations.length}</span>
                )}
              </button>
            </div>

            {/* Notifications Tab */}
            {tab === 'notifications' && (
              <div className={styles.list}>
                {notifications.length === 0 ? (
                  <p className={styles.empty}>
                    No notifications yet. Add locations to your wishlist to get notified when someone posts about them.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div key={n._id} className={styles.notifItem}>
                      <span className={styles.pin}>📍</span>
                      <div>
                        <p className={styles.notifMessage}>{n.message}</p>
                        {n.postId && (
                          <Link href={`/post/${n.postId._id}`} className={styles.postLink}>
                            View post →
                          </Link>
                        )}
                        <p className={styles.time}>
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Messages Tab */}
            {tab === 'messages' && (
              <div className={styles.list}>
                {conversations.length === 0 ? (
                  <p className={styles.empty}>
                    No messages yet. Visit someone's profile to start a conversation.
                  </p>
                ) : (
                  conversations.map((convo) => (
                    <div
                      key={convo.roomId}
                      onClick={() => openConversation(convo)}
                      className={`${styles.convoItem} ${
                        selectedConvo?.roomId === convo.roomId ? styles.activeConvo : ''
                      }`}
                    >
                      <div className={styles.avatar}>
                        {convo.otherUsername[0].toUpperCase()}
                      </div>
                      <div className={styles.convoInfo}>
                        <p className={styles.convoUsername}>@{convo.otherUsername}</p>
                        <p className={styles.convoPreview}>
                          {convo.latestMessage.length > 35
                            ? convo.latestMessage.slice(0, 35) + '...'
                            : convo.latestMessage}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* chat window */}
          <div className={styles.rightPanel}>
            {selectedConvo && currentUser ? (
              <>
                {/* Chat header */}
                <div className={styles.chatHeader}>
                  <span className={styles.chatWith}>@{selectedConvo.otherUsername}</span>
                  <span className={styles.connStatus}>
                    {connected ? '● online' : '● connecting...'}
                  </span>
                </div>

                {/* Messages */}
                <div className={styles.messageList}>
                  {messages.length === 0 && (
                    <p className={styles.empty}>Say hi to @{selectedConvo.otherUsername}!</p>
                  )}
                  {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id
                    return (
                      <div
                        key={msg._id}
                        style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '72%' }}
                      >
                        {!isMe && (
                          <p className={styles.senderName}>@{msg.senderUsername}</p>
                        )}
                        <div className={isMe ? styles.bubbleMe : styles.bubbleThem}>
                          {msg.text}
                        </div>
                        <p className={styles.msgTime} style={{ textAlign: isMe ? 'right' : 'left' }}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className={styles.inputArea}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder={`Message @${selectedConvo.otherUsername}...`}
                    className={styles.input}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!connected}
                    className={styles.sendBtn}
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.noChat}>
                <p> Select a conversation to start chatting</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}