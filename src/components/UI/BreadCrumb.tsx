import React from "react";
import { Link, useLocation } from "react-router-dom";

interface BreadcrumbProps {
  categoryName?: string;
  companyName?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  categoryName,
  companyName,
}) => {
  const location = useLocation();

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
