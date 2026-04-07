'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import styles from './manageUsers.module.css'

type User = {
    _id: string
    username: string
    email: string
    isVerified: boolean
    isAdmin: boolean
    createdAt: string
    postCount: number
}

export default function ManageUsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const meRes = await axios.get('/api/users/me')
                if (!meRes.data.user.isAdmin) { router.replace('/home'); return }

                const res = await axios.get('/api/admin/users')
                if (active) setUsers(res.data.users)
            } catch {
                router.replace('/login')
            } finally {
                if (active) setLoading(false)
            }
        })()
        return () => { active = false }
    }, [router])

    const deleteUser = async (userId: string, username: string) => {
        if (!confirm(`Delete @${username}? This will also delete all their posts.`)) return
        try {
            await axios.delete('/api/admin/users', { data: { userId } })
            setUsers((prev) => prev.filter((u) => u._id !== userId))
        } catch {
            alert('Failed to delete user')
        }
    }


    if (loading) return <main className={styles.main}><p>Loading...</p></main>

    return (
        <main className={styles.main}>
            <div className={styles.pageHeader}>
                <Link href="/admin" className={styles.back}> ↩︎ Back</Link>
                <h1 className={styles.title}>Manage Users ({users.length})</h1>
            </div>


            <div className={styles.tableWrap}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Posts</th>
                            <th>Verified</th>
                            <th>Role</th>
                            <th>Joined</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td>@{u.username}</td>
                                <td>{u.email}</td>
                                <td>{u.postCount ?? 0}</td>
                                <td>
                                    <span className={u.isVerified ? styles.verified : styles.unverified}>
                                        {u.isVerified ? 'Verified' : 'Unverified'}
                                    </span>
                                </td>
                                <td>
                                    <span className={u.isAdmin ? styles.adminBadge : ''}>
                                        {u.isAdmin ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td>
                                    {!u.isAdmin && (
                                        <button
                                            onClick={() => deleteUser(u._id, u.username)}
                                            className={styles.deleteBtn}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}