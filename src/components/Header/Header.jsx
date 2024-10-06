import { useRef } from "react";
import { NavLink } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { useAuthContext } from "../../providers/AuthProvider";
import { FaUserCircle } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";

export const Header = () => {
  const { userData, logout } = useAuthContext();
  const menuRef = useRef(null); // Ref for the menu container

  return (
    <header className="w-full flex flex-col items-center justify-between bg-black">
      <div className="flex items-center justify-between w-full px-5 py-2">
        <NavLink className="w-12" to={"/"}>
          <svg
            id="Layer_1"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 1000"
          >
            <path
              className="cls-2"
              fill="#ffffff"
              strokeWidth="0px"
              d="M157.66,489.73c-6.03,5.05-6.04,14.3.04,19.29,11.87,9.75,20.45,20.18,25.74,31.31,7.04,14.81,10.57,35.87,10.57,63.19v97.9c0,20.42,3.95,33.21,11.86,38.38,7.91,5.18,26.96,7.76,57.15,7.76h0c6.91,0,12.51,5.6,12.51,12.51v81.6c0,6.85-5.53,12.41-12.38,12.5-5.36.07-10.58.19-15.65.35l-49.01,2.56c-.39.02-.79.02-1.18,0l-30.03-1.27c-40.54-2.59-69.15-12.73-85.82-30.41-16.68-17.68-25.01-46.79-25.01-87.33v-116.01c0-22.43-3.38-38.96-10.14-49.6-5.49-8.64-14.16-14.81-26-18.53-5.24-1.64-8.71-6.63-8.71-12.12v-93.43c0-5.5,3.69-10.23,8.95-11.8,19.65-5.88,30.62-17.37,32.88-34.48l2.59-19.41c.28-3.16.43-5.03.43-5.61v-115.15c0-44.56,9.84-75.54,29.54-92.94,19.7-17.39,54.7-26.09,105.02-26.09l24.58.43,31.91,1.29,15.91.49c6.75.21,12.12,5.74,12.12,12.5v84.19c0,7.02-5.77,12.66-12.79,12.5l-6.19-.14c-26.46,0-43.49,2.8-51.1,8.41-7.63,5.61-11.43,18.19-11.43,37.74v95.31c0,27.89-3.23,48.67-9.71,62.32-4.95,10.47-13.83,21.06-26.64,31.77Z"
            />
            <path
              className="cls-1"
              fill="#ffffff"
              strokeWidth="0px"
              d="M538.17,553.48v166.91c-13.23,2.29-25.3,3.45-36.23,3.45-64.69,0-118.6-21.28-161.73-63.83-43.13-42.55-64.69-95.89-64.69-160.01s21.78-115.3,65.34-158.71c43.57-43.41,96.54-65.12,158.93-65.12,69.58,0,124.43,20.34,164.53,61.03,40.11,40.69,60.17,96.25,60.17,166.69v210.9h-161.3v-199.25c0-22.71-5.54-40.82-16.6-54.34-11.08-13.51-25.95-20.27-44.64-20.27-16.97,0-31.63,6.19-43.99,18.55-12.36,12.37-18.55,27.03-18.55,43.99,0,17.83,5.61,32.5,16.82,43.99,11.21,11.5,25.45,17.25,42.7,17.25,14.08,0,27.17-3.73,39.25-11.21Z"
            />
            <path
              className="cls-2"
              strokeWidth="0px"
              fill="#ffffff"
              d="M842.6,509.84c5.92-4.94,5.78-13.99-.23-18.83-11.91-9.6-20.51-19.98-25.81-31.13-7.05-14.8-10.57-35.86-10.57-63.18v-98.33c0-20.41-3.96-33.21-11.86-38.38-7.91-5.18-26.96-7.76-57.15-7.76h0c-6.84.24-12.51-5.24-12.51-12.08v-82.09c0-6.57,5.26-11.9,11.82-12.08,5.36-.14,10.62-.38,15.78-.71l49.46-2.56c.38-.02.76-.02,1.13,0l30.05,1.27c73.89,0,110.84,39.4,110.84,118.17v116.01c0,22.14,3.38,38.53,10.14,49.17,5.49,8.65,14.16,14.82,26,18.53,5.13,1.6,8.71,6.23,8.71,11.61v94.16c0,5.38-3.58,10.03-8.72,11.61-19.8,6.08-30.84,17.71-33.12,34.89l-2.16,18.98c-.58,3.45-.86,5.46-.86,6.04v115.15c0,44.56-9.85,75.54-29.54,92.94-19.7,17.4-54.71,26.1-105.02,26.1l-24.58-.43-32.35-1.29-15.89-.5c-6.53-.2-11.71-5.55-11.71-12.08v-85.03c0-6.78,5.58-12.24,12.37-12.09l6.61.15c26.45,0,43.48-2.88,51.1-8.63,7.62-5.75,11.43-18.26,11.43-37.52v-95.31c0-28.18,3.23-49.09,9.71-62.75,4.99-10.53,13.95-21.2,26.9-31.99Z"
            />
          </svg>
        </NavLink>
        <div ref={menuRef} className="">
          {" "}
          {!userData ? (
            <NavLink to="/auth/login" className="relative select-none">
              <FaUserCircle size={20} className="text-white" />
            </NavLink>
          ) : (
            <div className="flex items-center justify-between p-1.5 gap-2.5 rounded-lg">
              <div className="w-10 h-10">
                <img
                  className="rounded-full"
                  src={userData.photoUrl}
                  alt="Profile"
                />
              </div>
              <h4 className="text-sm font-bold text-white">
                {userData.Name} {userData.Surname}
              </h4>
              <MdLogout
                className="text-lg cursor-pointer text-white"
                onClick={logout}
              />
            </div>
          )}
        </div>
      </div>
      <div className="w-full px-5 mb-3">
        <ul className="w-full flex flex-wrap items-center gap-3 list-none m-0 text-sm">
          {!userData ? (
            <>
              <NavLink
                to="/articles"
                className="text-gray-500 hover:text-white"
              >
                <li className="list-none">Məqalələr</li>
              </NavLink>
              <NavLink
                to="/portfolio"
                className="text-gray-500 hover:text-white"
              >
                <li className="list-none">Portfolio</li>
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/articles"
                className="text-gray-500 hover:text-white"
              >
                <li className="list-none">Məqalələr</li>
              </NavLink>
              <NavLink
                to="/portfolio"
                className="text-gray-500 hover:text-white"
              >
                <li className="list-none">Portfolio</li>
              </NavLink>
              {userData && userData.email === "alyvdev@gmail.com" && (
                <>
                  <NavLink
                    to="/add-article"
                    className="text-gray-500 hover:text-white"
                  >
                    <li className="list-none"><FaCirclePlus /></li>
                  </NavLink>
                </>
              )}
            </>
          )}
        </ul>
      </div>
    </header>
  );
};
