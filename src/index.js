import ReactDOM from "react-dom/client";
import App from "./App";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAgmzMaAVieQKfFnus0O2cYi8Y6DhW3XF0",
  authDomain: "art-plast.firebaseapp.com",
  projectId: "art-plast",
  storageBucket: "art-plast.appspot.com",
  messagingSenderId: "645577513197",
  appId: "1:645577513197:web:78d5e2e7bb099bab5d94e4",
  measurementId: "G-BW5T65BWN0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore(app);
export const storage = getStorage();

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
