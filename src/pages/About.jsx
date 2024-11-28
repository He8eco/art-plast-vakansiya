import React, { useState, useEffect } from "react";
import Banner from "../components/banner/banner";
import OrderOf from "../components/orderOf/orderOf";
import Promotions from "../components/promotions/Promotions";
import SectionsList from "../components/listSections/listSections";
import CatalogComponent from "../components/CatalogComponent";

export default function About() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 967);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 967);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="App">
      <div className="main__banner">
        {!isMobile && <SectionsList />}
        <Banner />
      </div>
      <OrderOf />
      <Promotions />
    </div>
  );
}
