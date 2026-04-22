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

        <Link href="/admin/packages">
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
      </nav>

    </div>
  );
}