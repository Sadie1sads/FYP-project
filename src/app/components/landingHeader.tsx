import styles from "./landingHeader.module.css";

export default function LandingHeader() {
  return (
    <header className={styles.mainHeader}>
      <div className={styles.headerContainer}>

        <div className={styles.logo}>
        <img
          src="/icons/LandingLogo.svg"
          alt="Logo"
          width={40}
          height={40}
        />
      </div>
        <div className={styles.logo}>
          VoyageVerse
        </div>

        <div className={styles.rightGroup}>
          <a href="/signup" className={styles.navSignup}>Sign Up</a>
          <a href="/login" className={styles.navLogin}>Login</a>
        </div>

      </div>
    </header>
  );
}