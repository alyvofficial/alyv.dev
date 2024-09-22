import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";

export const Footer = () => {
  return (
    <footer className="bg-black text-white py-3">
      <div className="flex items-center gap-3 mx-5 sm:justify-center lg:justify-start">
        <a
          href="https://facebook.com/alyvdesign"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-white"
        >
          <FaFacebook size={20} />
        </a>
        <a
          href="https://instagram.com/alyv.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-white"
        >
          <FaInstagram size={20} />
        </a>
        <a
          href="https://linkedin.com/alyvofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-500 hover:text-white"
        >
          <FaLinkedin size={20} />
        </a>
      </div>
    </footer>
  );
};
