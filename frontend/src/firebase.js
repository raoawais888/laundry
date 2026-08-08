// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPsk1VjKk7Ou7gm5VvZ7SoZ58SYoEANnw",
  authDomain: "doorlaundry-8dab3.firebaseapp.com",
  projectId: "doorlaundry-8dab3",
  storageBucket: "doorlaundry-8dab3.firebasestorage.app",
  messagingSenderId: "738731016625",
  appId: "1:738731016625:web:eb034ab877d4113fb23d90",
  measurementId: "G-5PR9LR8WPJ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;