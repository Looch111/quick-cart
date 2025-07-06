import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCLejMhKOe7Er5wYP6rUzAYImhsDXGicro",
  authDomain: "telegram-61148.firebaseapp.com",
  projectId: "telegram-61148",
  storageBucket: "telegram-61148.firebasestorage.app",
  messagingSenderId: "816250998320",
  appId: "1:816250998320:web:992535a5c0c016e4dd67f5"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
