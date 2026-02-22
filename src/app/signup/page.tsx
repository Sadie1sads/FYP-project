'use client';
import React, { useEffect, useState } from "react"
import axios from "axios"
import {toast} from "react-hot-toast"
import { useRouter } from "next/navigation"
import styles from "./signup.module.css";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter()
  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmpassword: "",
    username: ""
  })

  const [buttonDisabled, setButtonDisabled] = useState 
  (false)
  const [loading, setLoading] = useState(false)

  const onSignup = async() => {
    try{
      setLoading(true)
      //Axios
      const response = await axios.post("/api/users/signup", user, { timeout: 15000 })
      
      //success response
      if (response.status === 201) {
        console.log("Signup success", response.data)
        toast.success("Signup successful! Redirecting to login...")
        router.push("/login")
      }
      else{
        //catch unexpected successful response
        console.log("Unexpected response", response)
        toast.error("Unexpected response from server")
      }
    } catch (error: unknown) {
      // Axios error handling (defensive: response shape can vary)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        const message =
          typeof data === "object" && data !== null && "message" in data
            ? String((data as { message?: unknown }).message ?? "")
            : undefined;

        if (error.response) {
          // Backend responded with an error status
          // Use warn so it doesn't show as a "Console Error" in devtools
          console.warn("Signup failed:", { status, data });

          const fallbackMessage =
            status === 400
              ? "Invalid signup details"
              : status
                ? `Error: ${status}`
                : "Signup failed";

          toast.error(message || fallbackMessage);
        } else if (error.request) {
          // Request made but no response
          console.error("No response from server", error.request);
          toast.error("No response from server. Try again later.");
        } else {
          // Something went wrong setting up request
          console.error("Request setup error:", error.message);
          toast.error(error.message || "Request setup error");
        }
      } else {
        // Non-Axios error
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> {
    if (user.email.length > 0 && user.password.length>0 && user.username.length > 0){
      setButtonDisabled(false)
    } else {
      setButtonDisabled(true)
    } 
  }, [user]);

  return (
    <div className={styles.SignupPage}>
      <h1>{loading ? "Processing" : "Signup"}</h1>
      <div className={styles.formBox}>
      <br />
      <label htmlFor="username">Username</label>
      <input 
      className='username'
      id="username"
      value={user.username}
      onChange={(e)=> setUser({...user, username: e.target.value})}
      placeholder="username"
      type="text" />

      <label htmlFor="email">Email</label>
      <input 
      className='email'
      id="email"
      value={user.email}
      onChange={(e)=> setUser({...user, email: e.target.value})}
      placeholder="email"
      type="text" />

      <label htmlFor="password">Password</label>
      <input 
      className='password'
      id="password"
      value={user.password}
      onChange={(e)=> setUser({...user, password: e.target.value})}
      placeholder="password"
      type="password" />

      <label htmlFor="confirmpassword">Confirm Password</label>
      <input 
      className='confirmpassword'
      id="confirmpassword"
      value={user.confirmpassword}
      onChange={(e)=> setUser({...user, confirmpassword: e.target.value})}
      placeholder="confirm password"
      type="password" />


      <button onClick={onSignup} disabled={buttonDisabled || loading } className={styles.signupButton}>
        {buttonDisabled ? "Please fill the form": loading ? "Processing..." : "Signup"}
      </button>
      <Link href="/login">
      <button className={styles.loginLink}>Login</button>
      </Link>
      </div>
    </div>
  );
}