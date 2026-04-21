'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Link from 'next/link'
import styles from './packages.module.css'
import toast from 'react-hot-toast'

type TrendingLocation = {
  location: string
  count: number
}

type JoinedUser = {
  _id: string
  userId: { _id: string; username: string; email: string }
  fullName: string
  address: string
  city: string
  contactNumber: string
}

type Package = {
  _id: string
  location: string
  description: string
  startDate: string
  endDate: string
  price: number
  joinedUsers: JoinedUser[]
}

export default function AdminPackagesPage() {
  const router = useRouter()
  const [trending, setTrending] = useState<TrendingLocation[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string>('')
  const [form, setForm] = useState({
    description: '', startDate: '', endDate: '', price: ''
  })
  const [creating, setCreating] = useState(false)
  const [expandedPkg, setExpandedPkg] = useState<string | null>(null)

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const meRes = await axios.get('/api/users/me')
        if (!meRes.data.user.isAdmin) { router.replace('/home'); return }
        const [trendRes, pkgRes] = await Promise.all([
          axios.get('/api/Posts/trending?limit=4'),
          axios.get('/api/admin/packages'),
        ])
        if (active) {
          setTrending(trendRes.data.trending || [])
          setPackages(pkgRes.data.packages || [])
        }
      } catch {
        router.replace('/login')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [router])

  const createPackage = async () => {
    if (!selected || !form.description || !form.startDate || !form.endDate || !form.price) {
      toast.error('Please fill all fields and select a location')
      return
    }
    setCreating(true)
    try {
      const res = await axios.post('/api/admin/packages', {
        location: selected,
        description: form.description,
        startDate: form.startDate,
        endDate: form.endDate,
        price: Number(form.price),
      })
      setPackages((prev) => [res.data.package, ...prev])
      setForm({ description: '', startDate: '', endDate: '', price: '' })
      setSelected('')
    } catch (error: any) {
        const msg =
          error?.response?.data?.error || 'Failed to create package'
        toast.error(msg)
      } finally {
      setCreating(false)
    }
  }

  const deletePackage = async (packageId: string) => {
    if (!confirm('Delete this package?')) return
    try {
      await axios.delete('/api/admin/packages', { data: { packageId } })
      setPackages((prev) => prev.filter((p) => p._id !== packageId))
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (loading) return <main className={styles.main}><p>Loading...</p></main>

  return (
    <main className={styles.main}>
      <div className={styles.pageHeader}>
        <Link href="/admin" className={styles.back}>↩︎ Back</Link>
        <h1 className={styles.title}>Travel Packages</h1>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Create New Package</h2>
        <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Select a trending location:</p>

        <div className={styles.locationTags}>
          {trending.map((loc) => (
            <button
              key={loc.location}
              onClick={() => setSelected(loc.location)}
              className={`${styles.locationTag} ${selected === loc.location ? styles.locationTagActive : ''}`}
            >
              📍 {loc.location} ({loc.count} posts)
            </button>
          ))}
        </div>

        <div className={styles.formFields}>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className={styles.input}
            style={{ resize: 'none' }}
          />
          <div className={styles.dateRow}>
            <div className={styles.dateField}>
              <label className={styles.dateLabel}>Start Date</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className={styles.input}
              />
            </div>
            <div className={styles.dateField}>
              <label className={styles.dateLabel}>End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>
          <input
            type="number"
            placeholder="Price ($)"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className={styles.input}
          />
          <button
            onClick={createPackage}
            disabled={creating}
            className={styles.createBtn}
          >
            {creating ? 'Creating...' : 'Create Package'}
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <h2 className={styles.panelTitle}>Existing Packages</h2>
        {packages.length === 0 ? (
          <p className={styles.empty}>No packages yet.</p>
        ) : (
          <div className={styles.packageList}>
            {packages.map((pkg) => (
              <div key={pkg._id} className={styles.packageCard}>
                <div className={styles.packageHeader}>
                  <div>
                    <p className={styles.packageLocation}>📍 {pkg.location}</p>
                    <p className={styles.packageDesc}>{pkg.description}</p>
                    <p className={styles.packageMeta}>
                      {new Date(pkg.startDate).toLocaleDateString()} →{' '}
                      {new Date(pkg.endDate).toLocaleDateString()} · ${pkg.price}
                    </p>
                  </div>
                  <div className={styles.packageActions}>
                    <button
                      onClick={() => setExpandedPkg(expandedPkg === pkg._id ? null : pkg._id)}
                      className={styles.joinedBtn}
                    >
                      {pkg.joinedUsers.length} joined
                    </button>
                    <button
                      onClick={() => deletePackage(pkg._id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {expandedPkg === pkg._id && (
                  <div className={styles.joinedList}>
                    {pkg.joinedUsers.map((u, index) => (
                      <div key={index} className={styles.joinedUser}>
                        <div>
                          <p style={{ fontWeight: 600, margin: '0 0 2px' }}>@{(u.userId as any)?.username}</p>
                          <p style={{ fontSize: 12, color: '#888', margin: '0 0 2px' }}>{(u.userId as any)?.email}</p>
                          <p style={{ fontSize: 14, color: '#2f3d5c', margin: '0 0 2px' }}>Full Name: <span style={{ fontSize: 12, color: '#778095' }}>{u.fullName}</span></p>
                          <p style={{ fontSize: 14, color: '#2f3d5c', margin: '0 0 2px' }}>Address: <span style={{ fontSize: 12, color: '#778095' }}>{u.address}, {u.city}</span></p>
                          <p style={{ fontSize: 14, color: '#2f3d5c', margin: 0 }}>Contact Number: <span style={{ fontSize: 12, color: '#778095' }}>{u.contactNumber}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}