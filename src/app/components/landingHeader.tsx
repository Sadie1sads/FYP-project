import styles from "./landingHeader.module.css";

export default function LandingHeader() {
  return (
    <header className={styles.mainHeader}>
      <div className={styles.headerContainer}>

        <div className={styles.logo}>
          VoyageVerse
        </div>

        <nav className={styles.centerNav}>
          <a href="/" className={styles.navItem}>About Us</a>
          {/* <a href="/home" className={styles.navItem}>Home</a>
          <a href="/createPosts" className={styles.navItem}>Create</a>
          <a href="/profile" className={styles.navItem}>Profile</a> */}
        </nav>

        <div className={styles.rightGroup}>
          <a href="/signup" className={styles.navSignup}>Sign Up</a>
          <a href="/login" className={styles.navLogin}>Login</a>
        </div>

      </div>
    </header>
  );
}