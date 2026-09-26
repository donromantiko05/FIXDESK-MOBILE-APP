import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // THE firebaseConfig FROM FIREBASE CONSOLE HERE
   apiKey: "AIzaSyBHulAm2EZnlQFdu-odfCGNbqshiJl4MLs",
  authDomain: "fix-desk-work-place.firebaseapp.com",
  projectId: "fix-desk-work-place",
  storageBucket: "fix-desk-work-place.firebasestorage.app",
  messagingSenderId: "229303051382",
  appId: "1:229303051382:web:2fb299a420234533ce6b57",
  measurementId: "G-QPNG81KYM3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);