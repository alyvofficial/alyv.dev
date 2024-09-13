import welcomeImg from "../../../assets/Images/ALYV.webp";
import styles from "./WelcomePage.module.css";
import { NavLink } from "react-router-dom";

export const WelcomePage = () => {
  return (
    <section className={styles.welcomePage}>
      <div className={styles.welcomeText}>
        <h1 className={styles.welcomeHeader}>Əliyev Əli</h1>
        <p className={styles.welcomeParagraph}>
          Graphic / UI designer &amp; Front-end web developer
        </p><br />
        <NavLink to="/articles" className={styles.welcomeParagraphA}>
          Məqalələrə keçid etmək üçün <span>klikləyin</span>
        </NavLink>
      </div>
      <div className={styles.welcomeContainer}>
        <img className={styles.alyvImg} src={welcomeImg} alt="Ali Aliyev" />
      </div>
    </section>
  );
};
