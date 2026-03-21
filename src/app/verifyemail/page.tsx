'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function VerifyEmailPage() {
    const [token, setToken] = useState("")
    const [message, setMessage] = useState("Verifying...")

    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get('token')
        if (urlToken) setToken(urlToken)
    }, [])

    useEffect(() => {
        if (token) {
            axios.post('/api/users/verifyemail', { token })
                .then(() => setMessage("Email verified!"))
                .catch(() => setMessage("Invalid or expired link"))
        }
    }, [token])

    return <div style={{ padding: '2rem' }}><h2>{message}</h2></div>
}