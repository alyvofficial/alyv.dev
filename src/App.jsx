import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./providers/FirebaseProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { Home } from "./pages/Home";
import { Header } from "./components/Header/Header";
import { Articles } from "./pages/Articles";
import { AddArticleForm } from "./pages/AddArticleForm";
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
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;
