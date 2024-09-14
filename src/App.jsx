import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirebaseProvider } from "./providers/FirebaseProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { Home } from "./pages/Home";
import { Header } from "./components/Header/Header";
import { Articles } from "./pages/Articles";
function App() {
  return (
    <FirebaseProvider>
      <AuthProvider>
        <BrowserRouter>
        <Header/>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/articles" element={<Articles />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </FirebaseProvider>
  );
}

export default App;
