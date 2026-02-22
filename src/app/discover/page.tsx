'use client'

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import styles from "./discover.module.css"


type Post = {
  _id: string
  title: string
  images?: string[]
  likes?: string[]
}

type TrendingLocation = {
  location: string
  count: number
  latitude: number
  longitude: number
  posts: Post[]
}

// Leaflet must be loaded dynamically because it breaks on server side rendering
const Map = dynamic(() => import("../components/DiscoverMap"), { ssr: false })

export default function DiscoverPage() {
  const [trending, setTrending] = useState<TrendingLocation[]>([])
  const [selected, setSelected] = useState<TrendingLocation | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTrending = useCallback(async () => {
    try {
      const res = await axios.get("/api/Posts/trending?limit=10")
      console.log("trending data:", res.data.trending)
      setTrending(res.data.trending || [])
    } catch {
      setTrending([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTrending() }, [fetchTrending])

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.heading}>Discover Trending Locations</h1>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className={styles.content}>
            
            <div className={styles.mapWrapper}>
              <Map
                locations={trending}
                selected={selected}
                onSelect={setSelected}
              />
            </div>

            {/* Sidebar list of trending locations */}
            <div className={styles.locationList}>
              {trending.map((item) => (
                <div
                  key={item.location}
                  className={`${styles.locationCard} ${selected?.location === item.location ? styles.active : ""}`}
                  onClick={() => setSelected(item)}
                >
                  <h3>📍 {item.location}</h3>
                  <p>{item.count} posts</p>
                  {item.posts[0]?.images?.[0] && (
                    <img src={item.posts[0].images[0]} alt={item.location} className={styles.thumb} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      

        {/* Show posts for selected location */}
        {selected && (
          <section className={styles.selectedPosts}>
            <h2>Posts in {selected.location}</h2>
            <div className={styles.postsGrid}>
              {selected.posts.map((post) => (
                <a key={post._id} href={`/post/${post._id}`} className={styles.postCard}>
                  {post.images?.[0] && (
                    <img src={post.images[0]} alt={post.title} />
                  )}
                  <p>{post.title}</p>
                  <span>❤️ {post.likes?.length ?? 0}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}