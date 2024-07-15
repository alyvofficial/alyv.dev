import AliAliyev from "../../../assets/Images/AliAliyev.webp";
import PDF from "../../../assets/Files/CV.English.pdf";
import styles from "./AboutPage.module.css";
export const AboutPage = () => {
  return (
    <section id="aboutPage" className={styles.aboutPage}>
    <div className={styles.aboutContainer}>
      <div className={styles.aboutTextSection}>
        <img
          className={styles.AliAliyevImage}
          src={AliAliyev}
          alt="Ali Aliyev"
        />
        <div className={styles.textOnly}>
          <div className={styles.textHolder}>
            <p className={styles.aboutParagraph}>
              Hi there! I&apos;m <u>Ali Aliyev</u>. I&apos;m a web developer
              and a graphic, UI/UX designer. I am the founder of ALYV Dev
              and ALYV Design to help people with website services and
              design work like logos, posters, and more.
            </p>
            <p className={styles.aboutParagraph}>
              With over 4 years of experience in graphic design and UI, and
              1.5 years in web development, I have honed my skills to
              deliver high-quality, professional work that meets and exceeds
              client expectations. My goal is to help businesses and
              individuals bring their visions to life through innovative and
              creative solutions.
            </p>
            <p className={styles.aboutParagraph}>
              If you are interested in learning more about my background,
              please feel free to download my CV by clicking the button
              below or click the ABOUT in the header.
            </p>
          </div>

          <a className={styles.pdfDownloader} href={PDF} download>
            <button className={styles.aboutBtn}>Download</button>
          </a>
        </div>
      </div>
    </div>
  </section>
  )
}
