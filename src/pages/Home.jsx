import welcomeImg from "../assets/Images/ALYV.webp";
import { NavLink } from "react-router-dom";

export const Home = () => {
  return (
    <main className=" bg-black flex items-center justify-center sm:flex-col">
      <div className="text-white flex flex-col items-center justify-center p-5 rounded-lg">
        <h1 className="text-4xl font-semibold mb-2 text-center">Əliyev Əli</h1>
        <p className="text-xl text-center">
          Graphic / UI designer &amp; Front-end web developer
        </p><br />
        <NavLink to="/articles" className="text-xl text-center text-white">
          Məqalələrə keçid etmək üçün <span className="font-semibold text-[#5476ff]">klikləyin</span>
        </NavLink>
      </div>
      <div className="h-full w-1/2 sm:w-[90%] flex items-end justify-center rounded-lg">
        <img className="h-[90%]" src={welcomeImg} alt="Ali Aliyev" />
      </div>
    </main>
  );
};