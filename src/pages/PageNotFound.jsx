import { NavLink } from "react-router-dom";
import { useLanguage } from "../providers/LanguageProvider";

export const PageNotFound = () => {
  const { translations } = useLanguage();
  return (
    <section className="bg-white dark:bg-gray-900 h-screen flex items-center justify-center">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-white">
            404
          </h1>
          <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
            {translations.somethingMissing}
          </p>
          <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
           {translations.backtoHome}
          </p>
          <NavLink
            to="/"
            className="inline-flex text-white bg-primary-600 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:focus:ring-primary-900 my-4"
          >
            {translations.backtoHomeButton}
          </NavLink>
        </div>
      </div>
    </section>
  );
};
