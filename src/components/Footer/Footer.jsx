import { FaInstagram, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-4">
          <a href="https://facebook.com/alyvdesign" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
            <FaFacebook size={20} />
          </a>
            <a href="https://instagram.com/alyv.dev" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
              <FaInstagram size={20} />
            </a>
            <a href="https://linkedin.com/alyvofficial" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
              <FaLinkedin size={20} />
            </a>
          </div>
          <div className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ALYV Dev. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <NavLink to="/articles" className="text-gray-500 hover:text-white">
              Məqalələr
            </NavLink>
            <NavLink to="/contact" className="text-gray-500 hover:text-white">
              Əlaqə
            </NavLink>
            <NavLink to="/portfolio" className="text-gray-500 hover:text-white">
              Portfolio
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  );
};