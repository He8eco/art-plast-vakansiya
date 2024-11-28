import React from "react";
import ListEditing from "../components/listEditing/listEditing.jsx";
import LogoutButton from "../components/UI/LogoutButton.jsx";

const Logout = () => {
  return (
    <div className="flex">
      <ListEditing />
      <div className="editing">
        <p className="title top">Выход из аккаунта</p>
        <LogoutButton />
      </div>
    </div>
  );
};

export default Logout;
