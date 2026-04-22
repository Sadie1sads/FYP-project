import Link from "next/link";
import LandingHeader from "../components/landingHeader";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <>
      <LandingHeader />

      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1>VoyageVerse is a Travel experience sharing Platform</h1>
          <p>
            Inspire others, discover new places, keep track of your favorite destinations <br />and travel with us joining travel packages to trending locations
          </p>
          <Link href="/signup" className={styles.getStartedBtn}>
          Get Started
          </Link>
        </div>
      </section>
    </>
  );
}