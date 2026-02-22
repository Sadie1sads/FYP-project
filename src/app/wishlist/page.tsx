'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "../components/Sidebar"
import axios from "axios"
import styles from "./wishlist.module.css"

export default function WishlistPage() {
  const [locations, setLocations] = useState<string[]>([])
  const [posts, setPosts] = useState<{ _id: string; title: string; location?: { name: string } }[]>([])
  const [loading, setLoading] = useState(true)

  const fetchWishlist = async () => {
    try {
      const res = await axios.get("/api/wishlist", { withCredentials: true })
      setLocations(res.data.wishlist?.locations ?? [])
      const ids = res.data.wishlist?.posts ?? []
      if (ids.length === 0) {
        setPosts([])
      } else {
        const postRes = await axios.get("/api/Posts/feed")
        const all = postRes.data.posts ?? []
        setPosts(all.filter((p: { _id: string }) => ids.includes(p._id)))
      }
    } catch {
      setLocations([])
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [])

  const removeLocation = async (name: string) => {
    try {
      await axios.delete(`/api/wishlist/location?name=${encodeURIComponent(name)}`, {
        withCredentials: true,
      })
      fetchWishlist()
    } catch {
      // ignore
    }
  }

  const removePost = async (postId: string) => {
    try {
      await axios.delete(`/api/wishlist/post?postId=${postId}`, { withCredentials: true })
      fetchWishlist()
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <h1>My Wishlist</h1>
        <p className={styles.hint}>You&apos;ll get notified when new posts are created for your saved locations.</p>

        <section>
          <h2>Saved locations</h2>
          {locations.length === 0 ? (
            <p className={styles.empty}>No saved locations yet. Save a location from a post!</p>
          ) : (
            <ul className={styles.list}>
              {locations.map((loc) => (
                <li key={loc} className={styles.item}>
                  📍 {loc}
                  <button type="button" onClick={() => removeLocation(loc)} className={styles.remove}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2>Saved posts</h2>
          {posts.length === 0 ? (
            <p className={styles.empty}>No saved posts yet.</p>
          ) : (
            <ul className={styles.list}>
              {posts.map((post) => (
                <li key={post._id} className={styles.item}>
                  <Link href="/">{post.title}</Link> {post.location?.name && `(📍 ${post.location.name})`}
                  <button type="button" onClick={() => removePost(post._id)} className={styles.remove}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}