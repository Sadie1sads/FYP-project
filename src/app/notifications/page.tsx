'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "../components/Sidebar"
import axios from "axios"
import styles from "./notifications.module.css"

type Notification = {
  _id: string
  message: string
  postId: { _id: string; title: string; location?: { name: string } }
  locationName: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications", { withCredentials: true })
      setList(res.data.notifications ?? [])
    } catch {
      setList([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markRead = async (id: string) => {
    try {
      await axios.post(`/api/notifications/${id}/read`, {}, { withCredentials: true })
      fetchNotifications()
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
        <h1>Notifications</h1>
        <p className={styles.hint}>
          You get notified when someone creates a post about a location in your wishlist.
        </p>

        {list.length === 0 ? (
          <p className={styles.empty}>No notifications yet.</p>
        ) : (
          <ul className={styles.list}>
            {list.map((n) => (
              <li
                key={n._id}
                className={`${styles.item} ${n.read ? styles.read : ""}`}
              >
                <div>
                  <p className={styles.message}>{n.message}</p>
                  {n.postId && (
                    <Link href={`/post/${n.postId._id}`} className={styles.link}>
                      View post: {n.postId.title}
                    </Link>
                  )}
                </div>
                {!n.read && (
                  <button
                    type="button"
                    onClick={() => markRead(n._id)}
                    className={styles.markRead}
                  >
                    Mark read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
