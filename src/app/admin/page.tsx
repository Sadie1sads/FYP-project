"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type MeResponse = {
  user: {
    username: string;
    email: string;
    isAdmin: boolean;
    isVerified: boolean;
  };
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MeResponse["user"] | null>(null);

  useEffect(() => {
    let isComponentActive = true;

    (async () => {
      try {
        const response = await axios.get<MeResponse>("/api/users/me", {
          timeout: 10000,
        });

        if (!isComponentActive) return;

        if (!response.data.user.isAdmin) {
          // if a user who is not an admin logs in, redirect to home
          router.replace("/home");
          return;
        }

        setUser(response.data.user);
      } catch {
        if (!isComponentActive) return;
        // if invalid token or not logged in, redirect to login
        router.replace("/login");
      } finally {
        if (isComponentActive) setLoading(false);
      }
    })();

    return () => {
      isComponentActive = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main style={{ padding: "2rem" }}>
        <p>Checking admin access...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Admin Dashboard</h1>
    </main>
  );
}