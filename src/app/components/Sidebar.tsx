import Link from "next/link";
import Image from "next/image";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  return (
    <div className={styles.sidebar}>

      <div className={styles.logo}>
        <Image
          src="/icons/MainLogo.svg"
          alt="Logo"
          width={40}
          height={40}
        />
      </div>

      <nav className={styles.nav}>

        <Link href="/home">
          <div className={styles.navItem}>
            <Image
              src="/icons/Homeicon.svg"
              alt="Home"
              width={24}
              height={24}
              className={styles.icon}
            />
            <span className={styles.tooltip}>Home</span>
          </div>
        </Link>

        <Link href="/notifications">
          <div className={styles.navItem}>
            <Image
              src="/icons/NotificationIcon.svg"
              alt="Notifications"
              width={24}
              height={24}
              className={styles.icon}
            />
            <span className={styles.tooltip}>Notifications</span>
          </div>
        </Link>

        <Link href="/wishlist">
          <div className={styles.navItem}>
            <Image
              src="/icons/wishlistIcon.svg"
              alt="Wishlist"
              width={24}
              height={24}
              className={styles.icon}
            />
            <span className={styles.tooltip}>Wishlist</span>
          </div>
        </Link>

        <Link href="/profile">
          <div className={styles.navItem}>
            <Image
              src="/icons/UserIcon.svg"
              alt="Profile"
              width={24}
              height={24}
              className={styles.icon}
            />
            <span className={styles.tooltip}>Profile</span>
          </div>
        </Link>

        <Link href="/discover">
          <div className={styles.navItem}>
            <Image
              src="/icons/discoverIcon.svg"
              alt="Discover"
              width={24}
              height={24}
              className={styles.icon}
            />
            <span className={styles.tooltip}>Discover</span>
          </div>
        </Link>

        <Link href="/createPosts">
          <div className={styles.navItem}>
            <Image
              src="/icons/createIcon.svg"
              alt="Create"
              width={24}
              height={24}
              className={styles.icon}
            />
            <span className={styles.tooltip}>Create Post</span>
          </div>
        </Link>

        <Link href="/signup">
          <div className={styles.navItem}>
            <Image
              src="/icons/Homeicon.svg"
              alt="Sign Up"
              width={24}
              height={24}
              className={styles.icon}
            />
            <span className={styles.tooltip}>Sign Up</span>
          </div>
        </Link>

      </nav>

    </div>
  );
}