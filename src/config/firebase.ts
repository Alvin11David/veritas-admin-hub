// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUK60Asm7pgjm0F1P2Lm11gHxJRgZya0g",
  authDomain: "institution-portal.firebaseapp.com",
  projectId: "institution-portal",
  storageBucket: "institution-portal.firebasestorage.app",
  messagingSenderId: "401202457232",
  appId: "1:401202457232:web:e20b2bcb51bcb1b6764615",
  measurementId: "G-HPVGQ393WD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : undefined;

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

const useFirestoreEmulator =
  import.meta.env.VITE_USE_FIRESTORE_EMULATOR === "true";
const firestoreEmulatorHost =
  import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || "localhost";
const firestoreEmulatorPort = Number(
  import.meta.env.VITE_FIRESTORE_EMULATOR_PORT || "8080",
);

if (useFirestoreEmulator) {
  try {
    connectFirestoreEmulator(db, firestoreEmulatorHost, firestoreEmulatorPort);
  } catch {
    // Ignore emulator re-connection errors during hot reload.
  }
}

export default app;
