import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./providers/FirebaseProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { Home } from "./pages/Home";
import { Header } from "./components/Header/Header";
import { Articles } from "./pages/Articles";
import { AddArticleForm } from "./pages/AddArticleForm";
import { Portfolio } from "./pages/Portfolio";
import { ArticlesDetails } from "./pages/ArticlesDetails";
import { LoginPage } from "./pages/LoginPage";
import { PageNotFound } from "./pages/PageNotFound";
import { LanguageProvider } from "./providers/LanguageProvider";
import { Shop } from "./pages/Shop";
function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
        <Header/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:id" element={<ArticlesDetails />} />
            <Route path="/add-article" element={<AddArticleForm />} /> 
            <Route path="/portfolio" element={<Portfolio />} /> 
            <Route path="/auth/login" element={<LoginPage />} /> 
            <Route path="/shop" element={<Shop />} /> 
            <Route path="*" element={<PageNotFound />} /> 

          </Routes>
        </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;
