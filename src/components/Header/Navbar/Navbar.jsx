import { useState } from "react";
import styles from "./Navbar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav>
      {!isOpen ? (
        <FontAwesomeIcon icon={faBars} onClick={toggleMenu} className={styles.menuIcon} />
      ) : (
        <FontAwesomeIcon icon={faTimes} onClick={toggleMenu} className={styles.menuIconX} />
      )}
      <div className={`${styles.ulHolder} ${isOpen ? styles.open : ''}`}>
      <ul className={styles.navbarUL}>
        <a href="/articles" className={styles.navbarLink}>
          <li className={styles.navbarLI}>Məqalələr</li>
        </a>
        <a href="/articles" className={styles.navbarLink}>
          <li className={styles.navbarLI}>Portfolio</li>
        </a>
        <a href="/contact" className={styles.navbarLink}>
          <li className={styles.navbarLI}>Əlaqə</li>
        </a>
      </ul>
      </div>

    </nav>
  );
};
