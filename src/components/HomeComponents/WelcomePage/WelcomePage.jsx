import welcomeImg from "../../../assets/Images/ALYV.webp";
import styles from "./WelcomePage.module.css";

export const WelcomePage = () => {



  return (
    <section className={styles.welcomePage}>
      <div className={styles.welcomeText}>
        <h1 className={styles.welcomeHeader}>Əliyev Əli</h1>
        <p className={styles.welcomeParagraph}>
          Qrafik / UI dizayner &amp; Front-end veb &ldquo;developer&rdquo;;
        </p><br />
        <a href="/articles" className={styles.welcomeParagraphA}>
          Məqalələrə keçid etmək üçün <span>klikləyin</span>
        </a>
      </div>
      <div className={styles.welcomeContainer}>
        <img className={styles.alyvImg} src={welcomeImg} alt="Ali Aliyev" />
      </div>
    </section>
  );
};
