// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD740LAvIQ7wyAIeZ9KBvmVDTCktNAH2cI",
  authDomain: "sistema-jogos-educacionais.firebaseapp.com",
  projectId: "sistema-jogos-educacionais",
  storageBucket: "sistema-jogos-educacionais.firebasestorage.app",
  messagingSenderId: "573955548769",
  appId: "1:573955548769:web:79c62404a35f88c3482c20",
  measurementId: "G-QW3GGDQCBH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);