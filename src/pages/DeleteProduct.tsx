import React, { useState, useEffect } from "react";
import { db } from "../index";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ListEditing from "../components/listEditing/listEditing";

// Интерфейс для типа продукта
interface Product {
  id: string;
  name: string;
  companyName?: string;
}

const DeleteProduct: React.FC = () => {
  const [productName, setProductName] = useState<string>("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, "product"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const productsList: Product[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">), // Приведение типов
        }));
        setProducts(productsList);
      });
      return () => unsubscribe();
    };
    fetchProducts();
  }, []);

  const handleProductSearch = (input: string) => {
    setProductName(input);

    if (input.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const lowerInput = input.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerInput) ||
        product.companyName?.toLowerCase().includes(lowerInput)
    );
    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product: Product) => {
    setProductName(`${product.companyName || ""} ${product.name}`);
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
    } else {
      alert("Выберите товар для удаления!");
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
                  {product.companyName || "Без компании"} {product.name}
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
