import { useEffect, useState } from "react";
import welcomeImg from "../../assets/Images/ALYV.webp";
import { useLanguage } from "../../providers/LanguageProvider";
import { motion } from "framer-motion";

export const Welcomepage = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { translations } = useLanguage();

  useEffect(() => {
    const img = new Image();
    img.src = welcomeImg;
    img.onload = () => setImageLoaded(true);
  }, []);

  return (
    <section className="text-white flex sm:flex-col lg:flex-row items-center justify-around sm:px-4 lg:px-8 py-3 rounded-lg gap-10 lg:gap-40 select-none">
       <motion.div
        className="flex flex-col items-start sm:w-full lg:w-max"
        initial={{ opacity: 0, y: 50 }} // Başlangıç animasyonu (opacity sıfır ve aşağıda başlıyor)
        animate={{ opacity: 1, y: 0 }} // Animasyon hedefi (opacity 1 ve y konumu normale döner)
        transition={{ duration: 0.7 }} // Animasyon süresi
      >
      <div className="flex flex-col items-start sm:w-full lg:w-max">
        <h1 className="sm:text-3xl lg:text-5xl font-semibold mb-2">
          {translations.name}
        </h1>
        <p className="sm:text-xs lg:text-xl mb-2 text-[#64ffda] sm:w-50 lg:w-96">
          {translations.title}
        </p>
      </div>
      </motion.div>
      {imageLoaded ? (
        <img
          className="sm:w-[60%] md:w-[50%] lg:w-[25%] rounded-lg shadow-lg"
          src={welcomeImg}
          alt="Ali Aliyev"
        />
      ) : (
        <div className="sm:w-[80%] w-[50%] lg:w-[30%] rounded-lg shadow-lg bg-gray-200 animate-pulse"></div>
      )}
    </section>
  );
};
