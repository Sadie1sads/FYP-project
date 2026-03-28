'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import styles from "./page.module.css";

type Stats = {
    totalUsers: number
    totalPosts: number
    verifiedUsers: number
    unverifiedUsers: number
    recentUsers: {
        _id: string
        username: string
        email: string
        createdAt: string
        isVerified: boolean
    }[]
}

type TrendingLocation = {
    location: string
    count: number
}

export default function AdminDashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const [trending, setTrending] = useState<TrendingLocation[]>([])

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const meRes = await axios.get('/api/users/me')
                if (!meRes.data.user.isAdmin) {
                    router.replace('/home')
                    return
                }


                const [statsRes, trendingRes] = await Promise.all([
                    axios.get('/api/admin/stats'),
                    axios.get('/api/Posts/trending?limit=5'), 
                ])

                if (active) {
                    setStats(statsRes.data.stats)
                    setTrending(trendingRes.data.trending)
                }
            } catch {
                if (active) router.replace('/login')
            } finally {
                if (active) setLoading(false)
            }
        })()
        return () => { active = false }
    }, [router])

    if (loading) return <main className={styles.main}><p>Loading...</p></main>
    if (!stats) return null

    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Admin Dashboard</h1>

            {/* Stat cards */}
            <div className={styles.cards}>
                <div className={styles.card}>
                    <p className={styles.cardNumber}>{stats.totalUsers}</p>
                    <p className={styles.cardLabel}>Total Users</p>
                </div>
                <div className={styles.card}>
                    <p className={styles.cardNumber}>{stats.totalPosts}</p>
                    <p className={styles.cardLabel}>Total Posts</p>
                </div>
                <div className={styles.card}>
                    <p className={styles.cardNumber}>{stats.verifiedUsers}</p>
                    <p className={styles.cardLabel}>Verified Users</p>
                </div>
                <div className={styles.card}>
                    <p className={styles.cardNumber}>{stats.unverifiedUsers}</p>
                    <p className={styles.cardLabel}>Unverified</p>
                </div>
            </div>

            {/* Navigation */}
            <div className={styles.navCards}>
                <Link href="/admin/manageUsers" className={styles.navCard}>
                    Manage Users
                </Link>
                <Link href="/admin/packages" className={styles.navCard}>
                    Travel Packages
                </Link>
            </div>

            <div className={styles.panels}>
                {/* Trending locations from trending API */}
                <div className={styles.panel}>
                    <h2 className={styles.panelTitle}>📍 Trending Locations</h2>
                    {trending.length === 0 ? (
                        <p className={styles.empty}>No data yet</p>
                    ) : (
                        trending.map((loc, i) => (
                            <div key={loc.location} className={styles.locationItem}>
                                <span className={styles.locationRank}>#{i + 1}</span>
                                <span className={styles.locationName}>{loc.location}</span>
                                <span className={styles.locationCount}>{loc.count} posts</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Recent signups */}
                <div className={styles.panel}>
                    <h2 className={styles.panelTitle}>Recent Signups</h2>
                    {stats.recentUsers.map((u) => (
                        <div key={u._id} className={styles.recentUser}>
                            <div>
                                <p className={styles.recentUsername}>@{u.username}</p>
                                <p className={styles.recentEmail}>{u.email}</p>
                            </div>
                            <span className={u.isVerified ? styles.verified : styles.unverified}>
                                {u.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    )
}