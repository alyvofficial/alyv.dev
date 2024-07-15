import { useState, useEffect, useRef } from "react";
import welcomeImg from "../../../assets/Images/ALYV.webp";
import styles from "./WelcomePage.module.css";

export const WelcomePage = () => {
  const [text, setText] = useState("");
  const timerId = useRef(null);

  useEffect(() => {
    const words = ["developer", "designer"];
    let currentWordIndex = 0;
    let currentLetterIndex = 0;
    let isAdding = true;

    const updateText = () => {
      setText(words[currentWordIndex].slice(0, currentLetterIndex));

      if (isAdding) {
        if (currentLetterIndex < words[currentWordIndex].length) {
          currentLetterIndex++;
        } else {
          isAdding = false;
          timerId.current = setTimeout(updateText, 2000);
          return;
        }
      } else {
        if (currentLetterIndex > 0) {
          currentLetterIndex--;
        } else {
          isAdding = true;
          currentWordIndex = (currentWordIndex + 1) % words.length;
        }
      }

      timerId.current = setTimeout(updateText, isAdding ? 100 : 100);
    };

    timerId.current = setTimeout(updateText, 100);

    return () => {
      clearTimeout(timerId.current);
    };
  }, []);

  return (
    <section className={styles.welcomePage}>
      <div className={styles.welcomeContainer}>
        <div className={styles.welcomeLeftContainer}>
          <h1>more than just a {text}</h1>
          <a href="/login">
            <button className={styles.welcomeBtn}>Get Started</button>
          </a>
        </div>
        <img className={styles.alyvImg} src={welcomeImg} alt="Ali Aliyev" />
      </div>
    </section>
  );
};
