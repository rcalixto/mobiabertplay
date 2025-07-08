import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import HomePage from "./pages/HomePage";
import RadioDetailPage from "./pages/RadioDetailPage";
import AdminPage from "./pages/AdminPage";
import FavoritesPage from "./pages/FavoritesPage";
import CustomizationPage from "./pages/CustomizationPage";
import Header from "./components/Header";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { CustomizationProvider } from "./contexts/CustomizationContext";

function App() {
  return (
    <AuthProvider>
      <CustomizationProvider>
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
                  <Route path="/customization" element={<CustomizationPage />} />
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
      </CustomizationProvider>
    </AuthProvider>
  );
}

export default App;