import React from "react";
import ListEditing from "../components/listEditing/listEditing";
import CategoryDeletion from "./CategoryManagementComponents/CategoryDeletion";
import CreateCategoryManagement from "./CategoryManagementComponents/CreateCategoryManagement";
import EditingCategoryManagement from "./CategoryManagementComponents/EditingCategoryManagement";

const CategoryManagement = () => {
  return (
    <div className="flex">
      <ListEditing></ListEditing>
      <div>
        <CreateCategoryManagement></CreateCategoryManagement>
        <EditingCategoryManagement></EditingCategoryManagement>
        <CategoryDeletion></CategoryDeletion>
      </div>
    </div>
  );
};

export default CategoryManagement;
