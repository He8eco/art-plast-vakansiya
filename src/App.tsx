import { BrowserRouter } from "../node_modules/react-router-dom/dist/index";
import "./styles/app.scss";
import "./styles/responsive.scss";
import React from "react";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <div className="page">
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <AppRoutes />
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
