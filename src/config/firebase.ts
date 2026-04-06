// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-xugaUp-q-ckorpS9STvSqukTVXeB3TA",
  authDomain: "universityportal2026.firebaseapp.com",
  projectId: "universityportal2026",
  storageBucket: "universityportal2026.firebasestorage.app",
  messagingSenderId: "464773454654",
  appId: "1:464773454654:web:c3507664d238461bebaa6f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
