import { AboutPage } from "../components/HomeComponents/AboutPage/AboutPage";
import { ServicesPage } from "../components/HomeComponents/ServicesPage/ServicesPage";
import { WelcomePage } from "../components/HomeComponents/WelcomePage/WelcomePage";
import styles from "./Home.module.css";

export const Home = () => {
  
  return (
    <main className={styles.main}>
      <WelcomePage />
      <AboutPage />
      <ServicesPage />

    </main>
  );
};
