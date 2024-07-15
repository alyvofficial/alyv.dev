import styles from "./Navbar.module.css";

export const Navbar = () => {
  return (
    <nav>
      <ul className={styles.navbarUL}>
        <a href="/articles" className={styles.navbarLink}>
          <li className={styles.navbarLI}>Articles</li>
        </a>
        <a href="/about" className={styles.navbarLink}>
          <li className={styles.navbarLI}>About</li>
        </a>
        <a href="/contact" className={styles.navbarLink}>
          <li className={styles.navbarLI}>Contact</li>
        </a>
      </ul>
    </nav>
  );
};
