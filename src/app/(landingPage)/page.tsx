import Link from "next/link";
import LandingHeader from "../components/landingHeader";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>Welcome to Voyage Verse</h1>
          <h2>Discover & Share Amazing Places</h2>
          <p>
            Create posts, explore trending destinations,
            and get notified about your wishlist locations.
          </p>
          <Link href="/signup" className={styles.getStartedBtn}>
          Get Started
          </Link>
        </div>
      </section>
    </>
  );
}