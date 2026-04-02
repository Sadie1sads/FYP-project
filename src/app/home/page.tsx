'use client'

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Sidebar from "../components/Sidebar"
import styles from "./home.module.css"
import axios from "axios"
import PostSummaryCard from "../components/PostSummaryCard"

type Post = {
  _id: string
  title: string
  description: string
  location: { name: string }
  tags?: string[]
  images?: string[]
  likes?: string[]
  comments?: { _id?: string; user: { username: string }; text: string }[]
  createdBy: { username: string; _id?: string }
  createdAt: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())
  const [trending, setTrending] = useState<{ location: string; count: number; posts: Post[] }[]>([])

  const fetchWishlist = useCallback(async () => {
    try {
      const res = await axios.get("/api/wishlist", { withCredentials: true })
      const ids = (res.data.wishlist?.posts ?? []).map((id: string) => String(id))
      setSavedPostIds(new Set(ids))
    } catch {
      setSavedPostIds(new Set())
    }
  }, [])

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
      const res = await axios.get("/api/Posts/trending?limit=3")
      setTrending(res.data.trending || [])
    } catch {
      setTrending([])
    }
  }, [])

  useEffect(() => { fetchPosts() }, [fetchPosts])
  useEffect(() => { fetchTrending() }, [fetchTrending])
  useEffect(() => { fetchWishlist() }, [fetchWishlist])

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
              {posts.slice(0, 3).map((post) => (
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
          {posts.length > 0 && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link href="/discover" className={styles.getStartedBtn}>
                Discover More
              </Link>
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
            <>
              <div className={styles.trendingList}>
                {trending
                  .filter((item) => item.count > 1)
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.location} className={styles.trendingBlock}>
                      <h3 className={styles.trendingLocation}>
                        📍 {item.location}{" "}
                        <span className={styles.postCount}>({item.count} posts)</span>
                      </h3>
                      <div className={styles.trendingPosts}>
                        {item.posts[0] && (
                          <PostSummaryCard
                            key={item.posts[0]._id}
                            post={item.posts[0]}
                            onUpdate={() => { fetchPosts(); fetchTrending() }}
                            savedPostIds={savedPostIds}
                            onSavedChange={fetchWishlist}
                          />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <Link href="/discover" className={styles.getStartedBtn}>
                  Explore Trending Location on Map
                </Link>
              </div>
            </>
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
  )
}