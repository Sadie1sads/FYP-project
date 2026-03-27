'use client';
import React, { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import styles from "./login.module.css"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState({ email: "", password: "" })
  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [loading, setLoading] = useState(false)

  const onLogin = async () => {
    try {
      setLoading(true)
      const response = await axios.post("/api/users/login", user, { timeout: 15000 })
      if (response.data?.user?.isAdmin) {
        router.push("/admin")
      } else {
        router.push("/home")
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data
        const message =
          typeof data === "object" && data !== null && "message" in data
            ? String((data as { message?: unknown }).message ?? "")
            : undefined
        toast.error(message || (status ? `Error: ${status}` : "Login failed"))
      } else {
        toast.error("Login failed")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !buttonDisabled && !loading) onLogin()
  }

  useEffect(() => {
    setButtonDisabled(user.email.length === 0 || user.password.length === 0)
  }, [user])

  return (
    <div className={styles.page}>

      <div className={styles.logo}>VOYAGE VERSE</div>

      <div className={styles.card}>

        <div className={styles.imagePanel}>
          <img src="/login.jpg" alt="Packed car ready for adventure" className={styles.image} />
        </div>

        <div className={styles.formPanel}>
          <h1 className={styles.title}>WELCOME TO VOYAGE VERSE</h1>

          <input
            id="email"
            type="email"
            value={user.email}
            onChange={(e) => setUser({ ...user, email: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Email"
            className={styles.input}
          />

          <input
            id="password"
            type="password"
            value={user.password}
            onChange={(e) => setUser({ ...user, password: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            className={styles.input}
          />

          <div className={styles.actions}>
            <button
              onClick={onLogin}
              disabled={buttonDisabled || loading}
              className={styles.loginButton}
            >
              {loading ? "Processing..." : "Login"}
            </button>

            <p className={styles.signupText}>
              Don&apos;t have an account?{" "}
              <Link href="/signup" className={styles.signupLink}>Sign Up</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}