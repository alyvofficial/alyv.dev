
export const Footer = () => {
  return (
    <footer className="bg-black text-white py-3 w-full  flex justify-between items-center px-5">
      <div className="text-xs text-center m-auto">
        &copy; {new Date().getFullYear()} ALYV Dev. All rights reserved.
      </div>
    </footer>
  );
};