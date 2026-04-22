'use client'

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import styles from "./showPosts.module.css"
import Link from "next/link"
import toast from "react-hot-toast"

type Post = {
  _id: string
  title: string
  images?: string[]
  likes?: string[]
}

export default function ShowPosts() {
  const [allPosts, setAllPosts] = useState<Post[]>([])

  const fetchAllPosts = useCallback(async () => {
    try {
      const res = await axios.get('/api/Posts/feed')
      setAllPosts(res.data.posts || [])
    } catch {
      setAllPosts([])
    }
  }, [])

  useEffect(() => {
    fetchAllPosts()
  }, [fetchAllPosts])

  const handleDelete = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    if (!confirm('Delete this post?')) return
    try {
      await axios.delete(`/api/Posts/${postId}`)
      setAllPosts(prev => prev.filter(p => p._id !== postId))
    } catch {
      toast.error('Failed to delete post.')
    }
  }

  return (
    <section className={styles.allPosts}>
      <Link href="/admin" className={styles.back}>↩︎ Back</Link>
      <h2>All Posts</h2>
      {allPosts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className={styles.allPostsGrid}>
          {allPosts.map((post) => (
            <div key={post._id} className={styles.postCard}>
              {post.images?.[0] && (
                <img src={post.images[0]} alt={post.title} />
              )}
              <p>{post.title}</p>
              <span>❤️ {post.likes?.length ?? 0}</span>
              <button onClick={(e) => handleDelete(post._id, e)} className={styles.deleteBtn}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}