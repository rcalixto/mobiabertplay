import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import HomePage from "./pages/HomePage";
import RadioDetailPage from "./pages/RadioDetailPage";
import AdminPage from "./pages/AdminPage";
import FavoritesPage from "./pages/FavoritesPage";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";

function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <Router>
          <div className="App min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/radio/:id" element={<RadioDetailPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/favoritos" element={<FavoritesPage />} />
              </Routes>
            </main>
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </div>
        </Router>
      </FavoritesProvider>
    </AuthProvider>
  );
}

export default App;