import React from "react";
import "./sectionCard.scss";

export default function SectionCard() {
  return (
    <div className="card">
      <img src={require("../../../img/Tachka.png")} />
      <p>Материалы для сада</p>
    </div>
  );
}
