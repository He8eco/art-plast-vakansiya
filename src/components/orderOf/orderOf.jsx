import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../index.js";
import { Link } from "react-router-dom";
import "./orderOf.css";

const OrderOf = () => {
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState({});

  useEffect(() => {
    const fetchOffers = () => {
      const q = query(collection(db, "offers"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const offersList = [];
        querySnapshot.forEach((doc) => {
          offersList.push({ id: doc.id, ...doc.data() });
        });
        setOffers(offersList);
      });
      return () => unsubscribe();
    };

    const fetchCategories = async () => {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      const categoriesMap = {};
      categorySnapshot.forEach((doc) => {
        const categoryData = doc.data();
        categoriesMap[categoryData.name] = categoryData.image;
      });
      setCategories(categoriesMap);
    };

    fetchOffers();
    fetchCategories();
  }, []);

  // Сортируем предложения по позиции
  const sortedOffers = [...offers].sort((a, b) => a.position - b.position);

  return (
    <div className="order-of">
      <p className="order-title">Рекомендуемые категории</p>

      <div className="widthSectionCard flex">
        {sortedOffers.map((offer) => (
          <Link
            to={`/categories/${offer.categoryName}`}
            key={offer.id}
            className="card"
          >
            <img
              src={categories[offer.categoryName] || ""}
              alt={offer.categoryName}
            />
            <p className="category-name">{offer.categoryName}</p>
            <p className="position">Позиция: {offer.position}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrderOf;
