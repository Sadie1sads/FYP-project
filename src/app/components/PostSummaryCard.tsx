'use client'

import Link from "next/link"
import { useState } from "react"
import axios from "axios"
import styles from "../home/home.module.css"

type Comment = {
  _id?: string
  user: { username: string }
  text: string
}

type Post = {
  _id: string
  title: string
  description: string
  location: { name: string }
  tags?: string[]
  images?: string[]
  likes?: string[]
  comments?: Comment[]
  createdBy: { username: string; _id?: string }
  createdAt: string
}

export default function PostSummaryCard({
  post,
  savedPostIds,
  onUpdate,
  onSavedChange,
}: {
  post: Post
  savedPostIds: Set<string>
  onUpdate: () => void
  onSavedChange: () => void
}) {
  const [loading, setLoading] = useState(false)
  const isSaved = savedPostIds.has(post._id)
  const likeCount = post.likes?.length ?? 0
  const imageUrl = post.images?.[0]

  const stopNav = (e: React.MouseEvent) => e.stopPropagation()

  const handleLike = async (e: React.MouseEvent) => {
    stopNav(e)
    if (loading) return
    setLoading(true)
    try {
      await axios.post(`/api/Posts/${post._id}/like`, {}, { withCredentials: true })
      onUpdate()
    } catch {}
    finally { setLoading(false) }
  }

  const handleSavePost = async (e: React.MouseEvent) => {
    stopNav(e)
    if (loading) return
    setLoading(true)
    try {
      if (isSaved) {
        await axios.delete(`/api/wishlist/post?postId=${post._id}`, { withCredentials: true })
      } else {
        await axios.post("/api/wishlist/post", { postId: post._id }, { withCredentials: true })
      }
      onSavedChange()
    } catch {}
    finally { setLoading(false) }
  }

  const handleSaveLocation = async (e: React.MouseEvent) => {
    stopNav(e)
    if (loading || !post.location?.name) return
    setLoading(true)
    try {
      await axios.post("/api/wishlist/location", { name: post.location.name }, { withCredentials: true })
      onSavedChange()
    } catch {}
    finally { setLoading(false) }
  }

  return (
    <Link href={`/post/${post._id}`} className={styles.summaryCard}>
      <div className={styles.summaryImage}>
        {imageUrl ? (
          <img src={imageUrl} alt={post.title} />
        ) : (
          <div className={styles.imagePlaceholder}>📷</div>
        )}
      </div>
      <div className={styles.summaryContent}>
        <h3>{post.title}</h3>
        <p className={styles.summaryLocation}>📍 {post.location?.name}</p>
        {post.tags && post.tags.length > 0 && (
          <div className={styles.summaryTags}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}
        <div className={styles.summaryActions} onClick={stopNav}>
          <button type="button" onClick={handleLike} disabled={loading} className={styles.likeBtn}>
            🩷 {likeCount}
          </button>
          <button type="button" onClick={handleSavePost} disabled={loading} className={styles.saveBtn}>
            {isSaved ? "✓ Saved" : "Save post"}
          </button>
          <button type="button" onClick={handleSaveLocation} disabled={loading} className={styles.saveBtn}>
            📍 Save location
          </button>
        </div>
      </div>
    </Link>
  )
}