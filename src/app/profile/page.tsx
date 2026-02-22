'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Sidebar from "../components/Sidebar"
import axios from "axios"
import styles from "./profile.module.css"

type Post = {
  _id: string
  title: string
  description: string
  location: { name: string }
  tags?: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; username: string; email?: string } | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await axios.get("/api/users/me", { withCredentials: true })
        const userId = (meRes.data.user as { id: string }).id
        const profileRes = await axios.get(`/api/users/${userId}/profile`)
        setUser({ ...profileRes.data.user, email: meRes.data.user.email })
        setPosts(profileRes.data.posts || [])
      } catch {
        setError("Not logged in")
        router.replace("/login")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleLogout = async () => {
    try {
      await axios.get("/api/users/logout", { withCredentials: true })
      router.replace("/login")
    } catch {
      router.replace("/login")
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return
    try {
      await axios.delete(`/api/Posts/${postId}`, { withCredentials: true })
      setPosts((p) => p.filter((x) => x._id !== postId))
    } catch {
      // show error
    }
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}><p>Loading...</p></main>
      </div>
    )
  }

  if (error || !user) return null

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>My Profile</h1>
          <p className={styles.username}>@{user.username}</p>
          {user.email && <p className={styles.email}>{user.email}</p>}
          <div className={styles.actions}>
            <Link href="/createPosts" className={styles.createBtn}>Create Post</Link>
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>

        <section className={styles.posts}>
          <h2>My Posts</h2>
          {posts.length === 0 ? (
            <p className={styles.empty}>No posts yet. <Link href="/createPosts">Create one</Link></p>
          ) : (
            <div className={styles.postList}>
              {posts.map((post) => (
                <article key={post._id} className={styles.postCard}>
                  <h3>{post.title}</h3>
                  <p className={styles.location}>📍 {post.location?.name}</p>
                  <p className={styles.description}>{post.description}</p>
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post._id)}
                    className={styles.deleteBtn}
                  >
                    Delete
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
