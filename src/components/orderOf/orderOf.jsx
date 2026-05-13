import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Link } from "react-router-dom";
import "./orderOf.css";

const OrderOf = () => {
  const [offers, setOffers] = useState([]);

  const fetchOffers = async () => {
    const { data, error } = await supabase
      .from("offers")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching offers:", error);
      return;
    }

    setOffers(data);
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  return (
    <div className="order-of">
      <p className="order-title">Рекомендуемые категории</p>

      <div className="widthSectionCard">
        {offers.map((offer) => (
          <Link
            to={`/categories/${offer.category_name}`}
            key={offer.id}
            className="card"
          >
            <img
              src={offer.image || ""}
              alt={offer.category_name}
            />
            <p className="category-name">{offer.category_name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OrderOf;