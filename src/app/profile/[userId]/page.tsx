'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Sidebar from "../../components/Sidebar"
import axios from "axios"
import styles from "../profile.module.css" 
import PrivateChat from "../../components/PrivateChat"

type Post = {
  _id: string
  title: string
  description: string
  location: { name: string }
  tags?: string[]
}

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; username: string } | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)

  // New state
  const [chatOpen, setChatOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch the profile being viewed
        const res = await axios.get(`/api/users/${userId}/profile`)
        setUser(res.data.user)
        setPosts(res.data.posts || [])

        
        // fetch who is currently logged in so we know currentUserId and currentUsername for the chat
        const meRes = await axios.get('/api/users/me', { withCredentials: true })
        setCurrentUser({
          id: meRes.data.user.id,
          username: meRes.data.user.username,
        })
      } catch {
        setError("User not found")
      } finally {
        setLoading(false)
      }
    }
    if (userId) load()
  }, [userId])

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}><p>Loading...</p></main>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <p>{error || "User not found"}</p>
          <Link href="/">Back to Home</Link>
        </main>
      </div>
    )
  }

  // to not show "Message" button on our own profile
  const isOwnProfile = currentUser?.id === userId

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>{user.username}&apos;s Profile</h1>
          <p className={styles.username}>@{user.username}</p>

          {/* Message button to show while viewing other's profile*/}
          {currentUser && !isOwnProfile && (
            <button
              onClick={() => setChatOpen(true)}
              style={{
                marginTop: 12,
                padding: '10px 24px',
                background: '#002651',
                color: '#fff',
                border: 'none',
                borderRadius: 24,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Message @{user.username}
            </button>
          )}
        </div>

        <section className={styles.posts}>
          <h2>Posts</h2>
          {posts.length === 0 ? (
            <p className={styles.empty}>No posts yet.</p>
          ) : (
            <div className={styles.postList}>
              {posts.map((post) => (
                <article key={post._id} className={styles.postCard}>
                  <h3>{post.title}</h3>
                  <p className={styles.location}>📍 {post.location?.name}</p>
                  <p className={styles.description}>{post.description}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Chat modal*/}
      {chatOpen && currentUser && (
        <PrivateChat
          currentUserId={currentUser.id}
          currentUsername={currentUser.username}
          otherUserId={userId}
          otherUsername={user.username}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  )
}