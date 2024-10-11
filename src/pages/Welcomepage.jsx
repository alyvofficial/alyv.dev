import { useEffect, useState } from "react";
import welcomeImg from "../assets/Images/ALYV.webp";
import { NavLink } from "react-router-dom"
import { useLanguage } from "../providers/LanguageProvider";

export const Welcomepage = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const { translations } = useLanguage();

    useEffect(() => {
      const img = new Image();
      img.src = welcomeImg;
      img.onload = () => setImageLoaded(true);
    }, []);

    return (
      <div className="text-white flex sm:flex-col lg:flex-row items-center justify-center p-5 rounded-lg gap-10 lg:gap-40 select-none">
        <div className="flex flex-col items-start text-left sm:w-60 md:w-96 lg:w-64">
          <h1 className="sm:text-4xl lg:text-5xl font-semibold mb-2 ">{translations.name}</h1>
          <p className="sm:text-sm lg:text-xl mb-2 text-[#64ffda]">
          {translations.title}
          </p>
          <NavLink to="/articles" className="hover:text-gray-200 transition duration-300 underline sm:text-sm lg:text-xl">
          {translations.viewArticles}
          </NavLink>
        </div>
       
        {imageLoaded ? (
          <img className="sm:w-[80%] md:w-[50%] lg:w-[25%] rounded-lg shadow-lg" src={welcomeImg} alt="Ali Aliyev" />
        ) : (
          <div className="sm:w-[80%] w-[50%] lg:w-[30%] rounded-lg shadow-lg bg-gray-200 animate-pulse"></div>
        )}
        
      </div>
    );
}
