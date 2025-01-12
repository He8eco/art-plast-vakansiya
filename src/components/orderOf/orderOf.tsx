import React, { useEffect, useState } from "react";
import { collection, query, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../../index";
import { Link } from "react-router-dom";
import "./orderOf.scss";
import { useAuth } from "../../hooks/useAuth";

interface Offer {
  id: string;
  categoryName: string;
  position: number;
}

interface Category {
  name: string;
  image: string;
}

const OrderOf = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOffers = () => {
      const q = query(collection(db, "offers"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const offersList: Offer[] = [];
        querySnapshot.forEach((doc) => {
          offersList.push({ id: doc.id, ...doc.data() } as Offer);
        });
        setOffers(offersList);
      });
      return () => unsubscribe();
    };

    const fetchCategories = async () => {
      const categoryCollection = collection(db, "categories");
      const categorySnapshot = await getDocs(categoryCollection);
      const categoriesMap: Record<string, string> = {};
      categorySnapshot.forEach((doc) => {
        const categoryData = doc.data() as Category;
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
            style={currentUser ? { height: "14rem" } : undefined}
          >
            <img
              src={categories[offer.categoryName] || ""}
              alt={offer.categoryName}
            />
            <p className="category-name">{offer.categoryName}</p>
            {currentUser && (
              <p className="position">Позиция: {offer.position}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrderOf;
