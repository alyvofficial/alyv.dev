import welcomeImg from "../assets/Images/ALYV.webp";
import { NavLink } from "react-router-dom";

export const Home = () => {
  return (
    <main className="w-full bg-black flex items-center justify-center sm:flex-col lg:flex-row">
      <div className="text-white flex flex-col items-center justify-center p-5 rounded-lg">
        <h1 className="text-4xl font-semibold mb-2 text-center">Əliyev Əli</h1>
        <p className="text-xl text-center">
          Graphic / UI designer &amp; Front-end web developer
        </p>
        <br />
        <NavLink to="/articles" className="text-xl text-center text-white">
          Məqalələrə keçid etmək üçün{" "}
          <span className="font-semibold text-[#5476ff]">klikləyin</span>
        </NavLink>
      </div>

      <img className="sm:w-[80%] w-[30%] lg:w-[30%] " src={welcomeImg} alt="Ali Aliyev" />
    </main>
  );
};
