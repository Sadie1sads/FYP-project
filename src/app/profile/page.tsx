'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Sidebar from "../components/Sidebar"
import axios from "axios"
import styles from "./profile.module.css"
import toast from "react-hot-toast"

type Post = {
  _id: string
  title: string
  description: string
  location: { name: string }
  tags?: string[]
  images?: string[]
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; username: string; email?: string } | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editTags, setEditTags] = useState("")
  const [saving, setSaving] = useState(false)

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
  if (!confirm("Are you sure you want to logout?")) return
  try {
    await axios.get("/api/users/logout", { withCredentials: true })
    window.location.href = "/login"
  } catch {
    window.location.href = "/login"
  }
}

  const handleDeletePost = async (postId: string) => {
    if (!confirm("Delete this post?")) return
    try {
      await axios.delete(`/api/Posts/${postId}`, { withCredentials: true })
      setPosts((p) => p.filter((x) => x._id !== postId))
    } catch {}
  }

  const startEdit = (post: Post) => {
    setEditingId(post._id)
    setEditTitle(post.title)
    setEditDescription(post.description)
    setEditLocation(post.location?.name || "")
    setEditTags(post.tags?.join(", ") || "")
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleUpdate = async (postId: string) => {
    setSaving(true)
    try {
      await axios.put(`/api/Posts/${postId}`, {
        title: editTitle,
        description: editDescription,
        location: { name: editLocation },
        tags: editTags.split(",").map((t) => t.trim()).filter(Boolean),
      }, { withCredentials: true })

      setPosts((prev) => prev.map((p) =>
        p._id === postId
          ? { ...p, title: editTitle, description: editDescription, location: { name: editLocation }, tags: editTags.split(",").map((t) => t.trim()).filter(Boolean) }
          : p
      ))
      setEditingId(null)
    } catch {
      toast.error("Failed to update post.")
    } finally {
      setSaving(false)
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
            <button type="button" onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
          </div>
        </div>

        <section className={styles.posts}>
          <h2>My Posts ({posts.length})</h2>
          {posts.length === 0 ? (
            <p className={styles.empty}>No posts yet. <Link href="/createPosts">Create one</Link></p>
          ) : (
            <div className={styles.postList}>
              {posts.map((post) => (
                <article key={post._id} className={styles.postCard}>
                  {post.images?.[0] && (
                    <div className={styles.postImage}>
                      <img src={post.images[0]} alt={post.title} />
                    </div>
                  )}

                  {editingId === post._id ? (
                    <div className={styles.editForm}>
                      <input
                        className={styles.editInput}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                      />
                      <input
                        className={styles.editInput}
                        value={editLocation}
                        onChange={(e) => setEditLocation(e.target.value)}
                        placeholder="Location"
                      />
                      <textarea
                        className={styles.editTextarea}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Description"
                        rows={4}
                      />
                      <input
                        className={styles.editInput}
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="Tags (comma separated)"
                      />
                      <div className={styles.editActions}>
                        <button
                          className={styles.saveBtn}
                          onClick={() => handleUpdate(post._id)}
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                        <button className={styles.cancelBtn} onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (

                    <div className={styles.postContent}>
                      <div className={styles.postMeta}>
                        <h3>{post.title}</h3>
                        <p className={styles.location}>📍 {post.location?.name}</p>
                        {post.tags && post.tags.length > 0 && (
                          <div className={styles.tags}>
                            {post.tags.map((tag) => (
                              <span key={tag} className={styles.tag}>{tag}</span>
                            ))}
                          </div>
                        )}
                        <p className={styles.description}>{post.description}</p>
                      </div>
                      <div className={styles.cardActions}>
                        <button className={styles.editBtn} onClick={() => startEdit(post)}>
                          Edit
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDeletePost(post._id)}>
                          Delete
                        </button>
                        <Link href={`/post/${post._id}`} className={styles.viewBtn}>
                          View
                        </Link>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}