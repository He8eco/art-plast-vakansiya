import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./styles/app.css";
import "./styles/responsive.css";
import React from "react";
import Header from "./components/header/header";
import Footer from "./components/footer/footer";
import About from "./pages/About";
import SectionManagement from "./pages/EditingSection";
import CategoryManagement from "./pages/CategoryManagement";
import Offers from "./pages/Offers";
import AddProduct from "./pages/AddProduct";
import EditProduct from "./pages/EditProduct";
import ProductsByCategory from "./pages/ProductsByCategory";
import ProductDetails from "./pages/ProductDetails";
import DeleteProduct from "./pages/DeleteProduct";
import ManagePromotions from "./pages/ManagePromotions";
import TemplateSpecifications from "./pages/TemplateSpecifications";
import { AuthProvider } from "./AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import FavoritesPage from "./pages/FavoritePage";

export default function App() {
  return (
    <div className="page">
      <AuthProvider>
        <BrowserRouter>
          <Header />

          <div className="main">
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/about" element={<About />} />
              <Route
                path="/productsByCategory"
                element={<ProductsByCategory />}
              />
              <Route path="/favoritesPage" element={<FavoritesPage />} />
              <Route
                path="/sectionManagement"
                element={<SectionManagement />}
              />
              <Route path="/offers" element={<Offers />} />
              <Route path="/addProduct" element={<AddProduct />} />
              <Route path="/editProduct" element={<EditProduct />} />
              <Route path="/deleteProduct" element={<DeleteProduct />} />
              <Route
                path="/categoryManagement"
                element={<CategoryManagement />}
              />
              <Route path="/managePromotions" element={<ManagePromotions />} />
              <Route
                path="/templateSpecifications"
                element={<TemplateSpecifications />}
              />
              <Route
                path="/:sectionName/:categoryName"
                element={<ProductsByCategory />}
              />
              <Route
                path="/:sectionName/:categoryName/:productId"
                element={<ProductDetails />}
              />
            </Routes>
          </div>
          <Footer />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
