'use client';
import React, { useState } from "react"
import axios from "axios"
import {toast} from "react-hot-toast"
import { useRouter } from "next/navigation"
import styles from "./signup.module.css"
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter()

  const [user, setUser] = useState({
    email: "",
    password: "",
    confirmpassword: "",
    username: ""
  })

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const passwordMissmatch =
    user.confirmpassword.length > 0 &&
    user.password !== user.confirmpassword

  const buttonDisabled =
    !user.email ||
    !user.username ||
    !user.password ||
    !user.confirmpassword ||
    passwordMissmatch

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

  return (
    <div className={styles.page}>

      <div className={styles.logo}>VOYAGE VERSE</div>

      <div className={styles.card}>

        <div className={styles.imagePanel}>
          <img src="/login.jpg" alt="Packed car ready for adventure" className={styles.image} />
        </div>

        <div className={styles.formPanel}>
          <h1 className={styles.title}>JOIN VOYAGE VERSE</h1>

          <input
            id="username"
            value={user.username}
            onChange={(e) => setUser({...user, username: e.target.value})}
            placeholder="Username"
            type="text"
            className={styles.input}
          />

          <input
            id="email"
            value={user.email}
            onChange={(e) => setUser({...user, email: e.target.value})}
            placeholder="Email"
            type="email"
            className={styles.input}
          />

          <div className={styles.showHide}>
          <input
            id="password"
            value={user.password}
            onChange={(e) => setUser({...user, password: e.target.value})}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            className={styles.input}
          />
          <button type="button" className={styles.eyeButton}
          onClick={() => setShowPassword(!showPassword)}>
            {showPassword? "Hide": "Show"}
          </button>
          </div>

         <div className={styles.showHide}>
          <input
            id="confirmpassword"
            value={user.confirmpassword}
            onChange={(e) => setUser({...user, confirmpassword: e.target.value})}
            placeholder="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            className={`${styles.input} ${passwordMissmatch ? styles.PassMissmatch : ""}`}
          />
          <button
          type="button"
          className={styles.eyeButton}
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
          {showConfirmPassword ? "Hide" : "Show"}
        </button>
          </div>
          {passwordMissmatch && ( 
            <p className={styles.errorMsg}> Passwords do not match</p>
          )}

          <div className={styles.actions}>
            <button
              onClick={onSignup}
              disabled={buttonDisabled || loading}
              className={styles.signupButton}
            >
              {buttonDisabled ? "Sign Up" : loading ? "Processing..." : "Sign Up"}
            </button>

            <p className={styles.loginText}>
              Already have an account?{" "}
              <Link href="/login" className={styles.loginLink}>Login</Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}