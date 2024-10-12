import { About } from "./About";
import { Footer } from "../../components/Footer/Footer";
import { Welcomepage } from "./Welcomepage";

export const Home = () => {
  return (
    <main className="w-full bg-black flex items-center justify-center flex-col min-h-screen">
      <Welcomepage />
      <About />
      <Footer />
    </main>
  );
};
