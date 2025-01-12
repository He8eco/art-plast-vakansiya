import React from "react";
import ListEditing from "../components/listEditing/listEditing";
import LogoutButton from "../components/UI/LogoutButton";

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
