'use client'

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import axios from "axios"
import Sidebar from "../components/Sidebar"
import PostSummaryCard from "../components/PostSummaryCard"
import styles from "./discover.module.css"

type TrendingLocation = {
  location: string
  count: number
  latitude: number
  longitude: number
  posts: {
    _id: string
    title: string
    description: string
    location: { name: string }
    tags?: string[]
    images?: string[]
    likes?: string[]
    comments?: { user: { username: string }; text: string }[]
    createdBy: { username: string; _id?: string }
    createdAt: string
  }[]
}

type TravelPackage = {
  _id: string
  location: string
  description: string
  startDate: string
  endDate: string
  price: number
  joinedUsers: { userId: string; fullName: string; address: string; city: string; contactNumber: string }[]
}

// Leaflet must be loaded dynamically because it breaks on server side rendering
const Map = dynamic(() => import("../components/DiscoverMap"), { ssr: false })

export default function DiscoverPage() {
  const [trending, setTrending] = useState<TrendingLocation[]>([])
  const [selected, setSelected] = useState<TrendingLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [packages, setPackages] = useState<TravelPackage[]>([])  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [joining, setJoining] = useState<string | null>(null)    
  const [joined, setJoined] = useState<string[]>([])
  const [joiningPkg, setJoiningPkg] = useState<string | null>(null) // which pkg form is open
  const [joinForm, setJoinForm] = useState({ fullName: '', address: '', city: '', contactNumber: '' })      
  const [allPosts, setAllPosts] = useState<TrendingLocation['posts']>([])
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set())


  const fetchTrending = useCallback(async () => {
    try {
      const res = await axios.get("/api/Posts/trending?limit=10")
      setTrending(res.data.trending || [])
    } catch {
      setTrending([])
    } finally {
      setLoading(false)
    }
  }, [])

const fetchPackages = useCallback(async () => {
    try {
      const res = await axios.get("/api/packages")
      const pkgs = res.data.packages || []
      setPackages(pkgs)

      if (currentUserId) {
            const alreadyJoined = pkgs
              .filter((pkg: TravelPackage) =>
                pkg.joinedUsers.some((u: any) =>
                  u.userId?.toString() === currentUserId || u === currentUserId
                )
              )
              .map((pkg: TravelPackage) => pkg._id)
            setJoined(alreadyJoined)
          }
    } catch {
      setPackages([])
    }
  }, [currentUserId])

  const fetchCurrentUser = useCallback(async () => {
  try {
    const res = await axios.get("/api/users/me", { withCredentials: true })
    setCurrentUserId(res.data.user._id || res.data.user.id)  
  } catch {
    setCurrentUserId(null)
  }
  }, [])

  const fetchAllPosts = useCallback(async () => {     
    try {
      const res = await axios.get('/api/Posts/feed')
      setAllPosts(res.data.posts || [])
    } catch {
      setAllPosts([])
    }
  }, [])

  const fetchWishlist = useCallback(async () => {
  try {
    const res = await axios.get("/api/wishlist", { withCredentials: true })
    const ids = (res.data.wishlist?.posts ?? []).map((id: string) => String(id))
    setSavedPostIds(new Set(ids))
  } catch {
    setSavedPostIds(new Set())
  }
}, [])

useEffect(() => {
  const init = async () => {
    await fetchCurrentUser()  
    fetchTrending()
    fetchAllPosts()
    fetchWishlist()
  }
  init()
}, [fetchTrending, fetchAllPosts, fetchWishlist, fetchCurrentUser])

useEffect(() => {
  if (currentUserId !== null) {  
    fetchPackages()
  }
}, [currentUserId, fetchPackages])


  const joinPackage = async (packageId: string) => {
  setJoining(packageId)
  try {
    await axios.post(`/api/packages/${packageId}/join`, joinForm, { withCredentials: true })
    setJoined((prev) => [...prev, packageId])
    setJoiningPkg(null)
    setJoinForm({ fullName: '', address: '', city: '', contactNumber: '' })
  } catch {
    alert('Could not join. You may have already joined.')
  } finally {
    setJoining(null)
  }
}

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
              <Map locations={trending} selected={selected} onSelect={setSelected} />
            </div>
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

        {selected && (
          <section className={styles.selectedPosts}>
            <h2>Posts in {selected.location}</h2>
            <div className={styles.postsGrid}>
              {selected.posts.map((post) => (
                <a key={post._id} href={`/post/${post._id}`} className={styles.postCard}>
                  {post.images?.[0] && <img src={post.images[0]} alt={post.title} />}
                  <p>{post.title}</p>
                  <span>❤️ {post.likes?.length ?? 0}</span>
                </a>
              ))}
            </div>
          </section>
        )}
        {packages.length > 0 && (
          <section className={styles.packagesSection}>
            <h2>Travel Packages</h2>
            <div className={styles.packagesList}>
              {packages.map((pkg) => (
                <div key={pkg._id} className={styles.packageCard}>
                  <div className={styles.packageInfo}>
                    <p className={styles.packageName}>📍 {pkg.location}</p>
                    <p className={styles.packageDescription}>{pkg.description}</p>
                    <p className={styles.packageMeta}>
                      {new Date(pkg.startDate).toLocaleDateString()} →{' '}
                      {new Date(pkg.endDate).toLocaleDateString()} · ${pkg.price}
                    </p>
                    <p className={styles.packageJoined}>
                     {pkg.joinedUsers.length} joined
                    </p>
                  </div>
                  <div>
                    {joiningPkg === pkg._id ? (
                      <div className={styles.joinForm}>
                        <input
                          className={styles.joinInput}
                          placeholder="Full Name"
                          value={joinForm.fullName}
                          onChange={(e) => setJoinForm({ ...joinForm, fullName: e.target.value })}
                        />
                        <input
                          className={styles.joinInput}
                          placeholder="Address"
                          value={joinForm.address}
                          onChange={(e) => setJoinForm({ ...joinForm, address: e.target.value })}
                        />
                        <input
                          className={styles.joinInput}
                          placeholder="City"
                          value={joinForm.city}
                          onChange={(e) => setJoinForm({ ...joinForm, city: e.target.value })}
                        />
                        <input
                          className={styles.joinInput}
                          placeholder="Contact Number"
                          value={joinForm.contactNumber}
                          onChange={(e) => setJoinForm({ ...joinForm, contactNumber: e.target.value })}
                        />
                        <div className={styles.joinFormActions}>
                          <button
                            onClick={() => joinPackage(pkg._id)}
                            disabled={joining === pkg._id}
                            className={styles.joinButton}
                          >
                            {joining === pkg._id ? 'Joining...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setJoiningPkg(null)}
                            className={styles.cancelJoinButton}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setJoiningPkg(pkg._id)}
                        disabled={joined.includes(pkg._id)}
                        className={`${styles.joinButton} ${joined.includes(pkg._id) ? styles.joinedButton : ''}`}
                      >
                        {joined.includes(pkg._id) ? 'Joined' : 'Join'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        <section className={styles.allPosts}>
          <h2>All Posts</h2>
          {allPosts.length === 0 ? (
            <p>No posts yet.</p>
          ) : (
            <div className={styles.allPostsGrid}>
              {allPosts.map((post) => (
                <PostSummaryCard
                  key={post._id}
                  post={post}
                  savedPostIds={savedPostIds}
                  onUpdate={fetchAllPosts}
                  onSavedChange={fetchWishlist}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}