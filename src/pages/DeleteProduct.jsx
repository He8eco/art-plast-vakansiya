import React, { useState, useEffect } from "react";
import { db } from "../index.js";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ListEditing from "../components/listEditing/listEditing.jsx";

const DeleteProduct = () => {
  const [productName, setProductName] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, "product"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const productsList = [];
        querySnapshot.forEach((doc) => {
          productsList.push({ id: doc.id, ...doc.data() });
        });
        setProducts(productsList);
      });
      return () => unsubscribe();
    };
    fetchProducts();
  }, []);

  const handleProductSearch = (input) => {
    setProductName(input);

    if (input === "") {
      setFilteredProducts([]);
    } else {
      const lowerInput = input.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerInput) ||
          product.companyName?.toLowerCase().includes(lowerInput)
      );
      setFilteredProducts(filtered);
    }
  };

  const handleProductSelect = (product) => {
    setProductName(`${product.companyName} ${product.name}`);
    setSelectedProduct(product);
    setFilteredProducts([]);
  };

  const handleDeleteProduct = async () => {
    if (selectedProduct) {
      try {
        await deleteDoc(doc(db, "product", selectedProduct.id));
        setProductName("");
        setFilteredProducts([]);
        setSelectedProduct(null);
        alert("Товар успешно удален");
      } catch (error) {
        console.error("Ошибка при удалении товара: ", error);
      }
    }
  };

  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Удаление товара</p>
        <div className="list-editing">
          <input
            className="z"
            type="text"
            placeholder="Название товара или компании"
            value={productName}
            onChange={(e) => handleProductSearch(e.target.value)}
          />
          {filteredProducts.length > 0 && (
            <ul className="product-list">
              {filteredProducts.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="product-list-item"
                >
                  {product.companyName} {product.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          className="button-editing"
          onClick={handleDeleteProduct}
          disabled={!selectedProduct}
        >
          Удалить товар
        </button>
      </div>
    </div>
  );
};

export default DeleteProduct;

