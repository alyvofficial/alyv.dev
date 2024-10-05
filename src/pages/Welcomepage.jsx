import { useEffect, useState } from "react";
import welcomeImg from "../assets/Images/ALYV.webp";
import { NavLink } from "react-router-dom"

export const Welcomepage = () => {
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
      const img = new Image();
      img.src = welcomeImg;
      img.onload = () => setImageLoaded(true);
    }, []);

    return (
      <div className="text-white flex sm:flex-col lg:flex-row items-center justify-center p-5 rounded-lg gap-10 lg:gap-40 select-none">
        <div className="flex flex-col items-start text-left">
          <h1 className="sm:text-4xl lg:text-5xl font-semibold mb-2 ">Əliyev Əli</h1>
          <p className="sm:text-sm lg:text-xl mb-2 text-[#64ffda]">
            Qrafik / UI dizayner &amp; Front-end veb developer
          </p>
          <NavLink to="/articles" className="hover:text-gray-200 transition duration-300 underline sm:text-sm lg:text-xl">
            Məqalələrə bax
          </NavLink>
        </div>
        {imageLoaded ? (
          <img className="sm:w-[80%] w-[50%] lg:w-[30%] rounded-lg shadow-lg" src={welcomeImg} alt="Ali Aliyev" />
        ) : (
          <div className="sm:w-[80%] w-[50%] lg:w-[30%] rounded-lg shadow-lg bg-gray-200 animate-pulse"></div>
        )}
      </div>
    );
}
