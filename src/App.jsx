import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./providers/FirebaseProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { Home } from "./pages/Home";
import { Header } from "./components/Header/Header";
import { Articles } from "./pages/Articles";
import { AddArticleForm } from "./pages/AddArticleForm";
import { Footer } from "./components/Footer/Footer";
import { About } from "./pages/About";
import { Portfolio } from "./pages/Portfolio";
function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <BrowserRouter>
        <Header/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/add-article" element={<AddArticleForm />} /> 
            <Route path="/about" element={<About />} /> 
            <Route path="/portfolio" element={<Portfolio />} /> 
          </Routes>
          <Footer/>
        </BrowserRouter>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;
