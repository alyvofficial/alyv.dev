import styles from "./ServicesPage.module.css";

export const ServicesPage = () => {
  return (
    <section className={styles.servicesPage}>
      <div className={styles.serviceContainers}>
        <div className={styles.serviceTitleContainer}>Website development</div>
        <div className={styles.serviceParagraphContainer}>
          <p className={styles.servicesParagraph}>✓HTML, CSS, JavaScript</p>
          <br />
          <p className={styles.servicesParagraph}>✓React JS</p>
          <br />
          <p className={styles.servicesParagraph}>✓SEO</p>
          <br />
          <p className={styles.servicesParagraph}>✓Firebase database</p>
          <br />
          <p className={styles.servicesParagraph}>✓Landing page</p>
          <br />
          <p className={styles.servicesParagraph}>✓Multiple pages (up to 7)</p>
          <br />
          <p className={styles.servicesParagraph}>✓Responsive design</p>
          <br />
          <p className={styles.servicesParagraph}>✓Authentication</p>
          <br />
          <p className={styles.servicesParagraph}>✓Domain & Hosting (a year)</p>
          <br />
          <div className={styles.line}></div>
          <p className={styles.noticeText}>
            For more information, feel free to contact me. Pricing can vary
            between 300-990 AZN depending on your needs.
          </p>
          <a href="https://wa.me/+994502047722" className={styles.contactLink}>
            <button className={styles.servicesBtn}>Contact</button>
          </a>
        </div>
      </div>

      <div className={styles.serviceContainers}>
        <div className={`${styles.serviceTitleContainer} ${styles.second}`}>Graphic design</div>
        <div className={styles.serviceParagraphContainer}>
          <p className={styles.servicesParagraph}>✓Logo design</p>
          <br />
          <p className={styles.servicesParagraph}>✓Banner, poster design</p>
          <br />
          <p className={styles.servicesParagraph}>✓Motion design</p>
          <br />
          <p className={styles.servicesParagraph}>✓3D design with Blender</p>
          <br />
          <p className={styles.servicesParagraph}>✓Brand identity design</p>
          <br />
          <p className={styles.servicesParagraph}>✓Flyer and brochure design</p>
          <br />
          <p className={styles.servicesParagraph}>✓Social media graphics</p>
          <br />
          <p className={styles.servicesParagraph}>
            ✓Photo editing and retouching
          </p>
          <br />
          <p className={styles.servicesParagraph}>✓Packaging design</p>
          <br />
          <div className={styles.line}></div>
          <p className={styles.noticeText}>
            For more information, feel free to contact me. Pricing can vary
            between 10-70 AZN depending on your needs.
          </p>
          <a href="https://wa.me/+994502047722" className={styles.contactLink}>
            <button className={styles.servicesBtn}>Contact</button>
          </a>
        </div>
      </div>

      <div className={styles.serviceContainers}>
        <div className={`${styles.serviceTitleContainer} ${styles.third}`}>UX / UI design and SMM</div>
        <div className={styles.serviceParagraphContainer}>
          <p className={styles.servicesParagraph}>✓Wireframing and Prototyping</p>
          <br />
          <p className={styles.servicesParagraph}>✓User Interface Design</p>
          <br />
          <p className={styles.servicesParagraph}>✓Usability Testing</p>
          <br />
          <p className={styles.servicesParagraph}>✓Information Architecture</p>
          <br />
          <p className={styles.servicesParagraph}>✓Visual Design</p>
          <br />
          <p className={styles.servicesParagraph}>✓Social Media Strategy</p>
          <br />
          <p className={styles.servicesParagraph}>✓Content Creation</p>
          <br />
          <p className={styles.servicesParagraph}>✓Community Management</p>
          <br />
          <p className={styles.servicesParagraph}>✓Analytics and Reporting</p>
          <br />
          <div className={styles.line}></div>
          <p className={styles.noticeText}>
            For more information, feel free to contact me. Pricing can vary
            between 50-150 AZN depending on your needs.
          </p>
          <a href="https://wa.me/+994502047722" className={styles.contactLink}>
            <button className={styles.servicesBtn}>Contact</button>
          </a>
        </div>
      </div>
    </section>
  );
};
