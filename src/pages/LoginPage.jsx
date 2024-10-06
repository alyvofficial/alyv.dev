import { FaGoogle, FaGithub } from "react-icons/fa";
import { useAuthContext } from "../providers/AuthProvider";
import { Navigate } from "react-router-dom";

export const LoginPage = () => {
    const { googleSignIn, githubSignIn, userData } = useAuthContext();
    
if (userData) {
    return <Navigate to="/articles" />;
}

  return (
    <div className="flex items-center justify-center h-[90vh] bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="mt-6 flex items-center justify-between">
          <span className="border-b sm:w-1/5 lg:w-1/4"></span>
          <span className="text-xs text-center text-gray-500 uppercase">Giriş etmək üçün</span>
          <span className="border-b sm:w-1/5 lg:w-1/4"></span>
        </div>
        <div className="mt-6 flex justify-center gap-4 flex-col">
          <button
            onClick={googleSignIn}
            aria-label="Sign in with Google"
            className="flex items-center justify-center gap-3 p-2 bg-blue-500 hover:bg-blue-700 text-white rounded-full transition duration-300"
          >
            <FaGoogle size={20}/>
            Sign in with Google
          </button>
          <button
            onClick={githubSignIn}
            aria-label="Sign in with GitHub"
            className="flex items-center justify-center gap-3 p-2 bg-gray-800 hover:bg-gray-950 text-white rounded-full transition duration-300"
          >
            <FaGithub size={20}/>
            Sign in with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};