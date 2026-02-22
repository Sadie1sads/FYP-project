'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Sidebar from "../../components/Sidebar"
import axios from "axios"
import styles from "./post.module.css"

type Post = {
  _id: string
  title: string
  description: string
  location: { name: string }
  tags?: string[]
  images?: string[]
  likes?: string[]
  comments?: { user: { username: string }; text: string }[]
  createdBy: { username: string; _id?: string }
}

export default function PostDetailPage() {
  const params = useParams()
  const postId = params.postId as string
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())
  const [commentText, setCommentText] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [postRes, wishRes] = await Promise.all([
          axios.get(`/api/Posts/${postId}`),
          axios.get("/api/wishlist", { withCredentials: true }).catch(() => ({ data: { wishlist: { posts: [] } } })),
        ])
        setPost(postRes.data.post)
        const ids = (wishRes.data.wishlist?.posts ?? []).map((id: string) => String(id))
        setSavedPostIds(new Set(ids))
      } catch {
        setPost(null)
      } finally {
        setLoading(false)
      }
    }
    if (postId) load()
  }, [postId])

  const isSaved = post ? savedPostIds.has(post._id) : false
  const likeCount = post?.likes?.length ?? 0
  const comments = post?.comments ?? []

  const refetch = async () => {
    if (!postId) return
    try {
      const res = await axios.get(`/api/Posts/${postId}`)
      setPost(res.data.post)
    } catch {
      /* ignore */
    }
  }

  const handleLike = async () => {
    if (!post || actionLoading) return
    setActionLoading(true)
    try {
      await axios.post(`/api/Posts/${post._id}/like`, {}, { withCredentials: true })
      refetch()
    } catch {
      /* not logged in */
    } finally {
      setActionLoading(false)
    }
  }

  const handleSavePost = async () => {
    if (!post || actionLoading) return
    setActionLoading(true)
    try {
      if (isSaved) {
        await axios.delete(`/api/wishlist/post?postId=${post._id}`, { withCredentials: true })
        setSavedPostIds((s) => {
          const next = new Set(s)
          next.delete(post._id)
          return next
        })
      } else {
        await axios.post("/api/wishlist/post", { postId: post._id }, { withCredentials: true })
        setSavedPostIds((s) => new Set(s).add(post._id))
      }
    } catch {
      /* not logged in */
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveLocation = async () => {
    if (!post?.location?.name || actionLoading) return
    setActionLoading(true)
    try {
      await axios.post("/api/wishlist/location", { name: post.location.name }, { withCredentials: true })
    } catch {
      /* not logged in */
    } finally {
      setActionLoading(false)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !commentText.trim() || actionLoading) return
    setActionLoading(true)
    try {
      await axios.post(
        `/api/Posts/${post._id}/comments`,
        { text: commentText },
        { withCredentials: true }
      )
      setCommentText("")
      refetch()
    } catch {
      /* not logged in */
    } finally {
      setActionLoading(false)
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

  if (!post) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <p>Post not found</p>
          <Link href="/">Back to Home</Link>
        </main>
      </div>
    )
  }

  const imageUrl = post.images?.[0]
  const parts = (post.description || "").split("\n\n")
  const shortDesc = parts[0] || ""
  const review = parts.length > 1 ? parts.slice(1).join("\n\n") : post.description

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          
          <div className={styles.imageSection}>
            {imageUrl ? (
              <img src={imageUrl} alt={post.title} className={styles.postImage} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>📷</span>
                <p>No image</p>
              </div>
            )}
          </div>

          
          <div className={styles.infoSection}>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.location}>📍 {post.location?.name}</p>
            {shortDesc && (
              <p className={styles.shortDesc}>{shortDesc}</p>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className={styles.tags}>
                {post.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
            )}
            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleLike}
                disabled={actionLoading}
                className={styles.actionBtn}
              >
                ❤️ {likeCount}
              </button>
              <button
                type="button"
                onClick={handleSavePost}
                disabled={actionLoading}
                className={styles.actionBtn}
              >
                {isSaved ? "✓ Saved" : " Save post"}
              </button>
              <button
                type="button"
                onClick={handleSaveLocation}
                disabled={actionLoading}
                className={styles.actionBtn}
              >
                📍 Save location
              </button>
            </div>
            <p className={styles.author}>
              by{" "}
              {post.createdBy?._id ? (
                <Link href={`/profile/${post.createdBy._id}`} className={styles.authorLink}>
                  {post.createdBy.username || "Anonymous"}
                </Link>
              ) : (
                post.createdBy?.username || "Anonymous"
              )}
            </p>
          </div>
        </div>

        {/* Review */}
        {review && (
          <section className={styles.reviewSection}>
            <h2>Review</h2>
            <p className={styles.review}>{review}</p>
          </section>
        )}

        {/* Comments */}
        <section className={styles.commentSection}>
          <h2>Comments ({comments.length})</h2>
          {comments.map((c, i) => (
            <div key={i} className={styles.comment}>
              <strong>{c.user?.username}:</strong> {c.text}
            </div>
          ))}
          <form onSubmit={handleComment} className={styles.commentForm}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className={styles.commentInput}
            />
            <button type="submit" disabled={actionLoading}>Post</button>
          </form>
        </section>
      </main>
    </div>
  )
}
