'use client';
import React, { useEffect, useState } from "react"
import axios from "axios"
import {toast} from "react-hot-toast"
import { useRouter } from "next/navigation"
import styles from "./login.module.css";
import Link from "next/link";


export default function LoginPage() {
  const router = useRouter()
  const [user, setUser] = useState({
    email: "",
    password: "",
  })

  const [buttonDisabled, setButtonDisabled] = useState 
  (false)
  const [loading, setLoading] = useState(false)

  const onLogin = async() => {
    try{
      setLoading(true)
      const response = await axios.post("/api/users/login", user, { timeout: 15000 })
        if (response.data?.user?.isAdmin) {
            router.push("/admin")
        } else {  
            router.push("/home")
          }
    }
    catch (error: unknown){
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        const message =
          typeof data === "object" && data !== null && "message" in data
            ? String((data as { message?: unknown }).message ?? "")
            : undefined;
        toast.error(message || (status ? `Error: ${status}` : "Login failed"));
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=> {
    if (user.email.length > 0 && user.password.length>0){
      setButtonDisabled(false)
    } else {
      setButtonDisabled(true)
    } 
  }, [user])

  return (
    <div className={styles.LoginPage}>
      <h1>WELCOME TO VOYAGE VERSE</h1>
      <div className={styles.formBox}>
        <h1>{loading ? "Processing" : "Login"}</h1>
        <br />
        <label htmlFor="email">Email</label> 
        <input 
        className='email'
        id="email"
        value={user.email}
        onChange={(e)=> setUser({...user, email: e.target.value})}
        placeholder="email"
        type="text" />

        <label htmlFor="password">Passsword</label>
        <input 
        className='password'
        id="password"
        value={user.password}
        onChange={(e)=> setUser({...user, password: e.target.value})}
        placeholder="password"
        type="password" />

        <div className={styles.formContainer}>
          <button onClick={onLogin} disabled={buttonDisabled || loading } className={styles.loginButton}>
            {buttonDisabled ? "Please fill the form": loading ? "Processing..." : "login" }
          </button>
          <p className={styles.signupText}>
            Don't have an account?{" "}
          <Link href="/signup" className={styles.signupLink}>
          Sign up
          </Link>
          </p>
        </div>
      </div>
    </div>
  )
}