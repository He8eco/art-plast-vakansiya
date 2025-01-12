import {
  Route,
  Routes,
} from "../../node_modules/react-router-dom/dist/index";
import "../styles/app.scss";
import "../styles/responsive.scss";
import React from "react";
import About from "../pages/About";
import SectionManagement from "../pages/EditingSection";
import CategoryManagement from "../pages/CategoryManagement";
import Offers from "../pages/Offers";
import AddProduct from "../pages/AddProduct";
import EditProduct from "../pages/EditProduct";
import ProductsByCategory from "../pages/ProductsByCategory";
import ProductDetails from "../pages/ProductDetails";
import DeleteProduct from "../pages/DeleteProduct";
import ManagePromotions from "../pages/ManagePromotions";
import TemplateSpecifications from "../pages/TemplateSpecifications";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../ProtectedRoute";
import FavoritesPage from "../pages/FavoritePage";
import Logout from "../pages/Logout";

export default function AppRoutes() {
  return (
    <div className="main">
      <Routes>
        <Route path="/" element={<About />} />
        <Route path="/about" element={<About />} />
        <Route path="/productsByCategory" element={<ProductsByCategory />} />
        <Route path="/favoritesPage" element={<FavoritesPage />} />
        <Route
          path="/sectionManagement"
          element={
            <ProtectedRoute>
              <SectionManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/offers"
          element={
            <ProtectedRoute>
              <Offers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/addProduct"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editProduct"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deleteProduct"
          element={
            <ProtectedRoute>
              <DeleteProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categoryManagement"
          element={
            <ProtectedRoute>
              <CategoryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/managePromotions"
          element={
            <ProtectedRoute>
              <ManagePromotions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templateSpecifications"
          element={
            <ProtectedRoute>
              <TemplateSpecifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />
        <Route path="/loginPage" element={<LoginPage />} />
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
  );
}
