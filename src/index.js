import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyADjCL5CrhP0_BWysMtbP5kgDPB18xx93s",
  authDomain: "reactchat-57854.firebaseapp.com",
  projectId: "reactchat-57854",
  storageBucket: "reactchat-57854.appspot.com",
  messagingSenderId: "861258458667",
  appId: "1:861258458667:web:f0290abbe8e3120b1c6c6e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export const storage = getStorage();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
