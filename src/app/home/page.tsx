'use client'

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Sidebar from "../components/Sidebar"
import styles from "./home.module.css"
import axios from "axios"

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

/** Summary card for Discover and Trending section */
function PostSummaryCard({
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
    } catch {
      /* not logged in */
    } finally {
      setLoading(false)
    }
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
    } catch {
      /* not logged in */
    } finally {
      setLoading(false)
    }
  }

  const handleSaveLocation = async (e: React.MouseEvent) => {
    stopNav(e)
    if (loading || !post.location?.name) return
    setLoading(true)
    try {
      await axios.post("/api/wishlist/location", { name: post.location.name }, { withCredentials: true })
      onSavedChange()
    } catch {
      /* not logged in */
    } finally {
      setLoading(false)
    }
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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await axios.get("/api/wishlist", { withCredentials: true })
      const ids = (res.data.wishlist?.posts ?? []).map((id: string) => String(id))
      setSavedPostIds(new Set(ids))
    } catch {
      setSavedPostIds(new Set())
    }
  }, [])

  const [trending, setTrending] = useState<{ location: string; count: number; posts: Post[] }[]>([])

  const fetchPosts = useCallback(async () => {
    try {
      const res = await axios.get("/api/Posts/feed")
      setPosts(res.data.posts || [])
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchTrending = useCallback(async () => {
    try {
      const res = await axios.get("/api/Posts/trending?limit=5")
      setTrending(res.data.trending || [])
    } catch {
      setTrending([])
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    fetchTrending()
  }, [fetchTrending])

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  return (
    <div className={styles.layout}>
      <Sidebar />

      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1>Welcome to Voyage Verse</h1>
            <h2>Discover & Share Amazing Places</h2>
            <p>
              Create posts, explore trending destinations,
              and get notified about your wishlist locations.
            </p>
            <Link href="/createPosts" className={styles.getStartedBtn}>
              CREATE A POST
            </Link>
          </div>
        </section>

        <section className={styles.discover}>
          <h2>Discover Other Travelers' Stories</h2>
          {loading ? (
            <p className={styles.loading}>Loading...</p>
          ) : posts.length === 0 ? (
            <p className={styles.empty}>No posts yet. Be the first to share!</p>
          ) : (
            <div className={styles.feedGrid}>
              {posts.map((post) => (
                <PostSummaryCard
                  key={post._id}
                  post={post}
                  onUpdate={fetchPosts}
                  savedPostIds={savedPostIds}
                  onSavedChange={fetchWishlist}
                />
              ))}
            </div>
          )}
        </section>

        <section className={styles.trending}>
          <h2>Trending places</h2>
          <p className={styles.trendingHint}>
            Locations with the most posts from our community
          </p>
          {trending.length === 0 ? (
            <p className={styles.empty}>No trending locations yet.</p>
          ) : (
            <div className={styles.trendingList}>
              {trending
            .filter((item) => item.count > 1)
            .map((item) => (
                <div key={item.location} className={styles.trendingBlock}>
                <h3 className={styles.trendingLocation}>
                    📍 {item.location} <span className={styles.postCount}>({item.count} posts)</span>
                </h3>
                <div className={styles.trendingPosts}>
                    {item.posts.map((post) => (
                    <PostSummaryCard
                        key={post._id}
                        post={post}
                        onUpdate={() => {
                        fetchPosts()
                        fetchTrending()
                        }}
                        savedPostIds={savedPostIds}
                        onSavedChange={fetchWishlist}
                    />
                    ))}
                </div>
                </div>
            ))}
            </div>
          )}
        </section>

        <section className={styles.banner}>
            <h3>Welcome to our website</h3>
            <button>About Us</button>
        </section>

        <section className={styles.bannerTwo}>
        </section>
      </main>
    </div>
  );
}