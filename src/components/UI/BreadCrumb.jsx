import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ categoryName, companyName }) => {

  return (
    <nav className="breadcrumb">
      <Link to="/">Главная</Link>
      {categoryName && (
        <>
          {" / "}
          <Link to={`/categories/${categoryName}`}>{categoryName}</Link>
        </>
      )}
      {companyName && (
        <>
          {" / "}
          <Link to={`/categories/${categoryName}?company=${companyName}`}>
            {companyName}
          </Link>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
