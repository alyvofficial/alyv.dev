import { WelcomePage } from "../components/HomeComponents/WelcomePage/WelcomePage";
import styles from "./Home.module.css";

export const Home = () => {
  
  return (
    <main className={styles.main}>
      <WelcomePage />
    </main>
  );
};
