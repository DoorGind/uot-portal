import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_bK0KY5nuS_fwNGHm_xzOFBLUZ3bMspw",
  authDomain: "tezgam-7625c.firebaseapp.com",
  projectId: "tezgam-7625c",
  storageBucket: "tezgam-7625c.appspot.com",
  messagingSenderId: "486092126040",
  appId: "1:486092126040:web:fba1f399a8db35d9c6972d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);