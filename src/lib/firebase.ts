import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBMu097SDixo0zMjzJ9ST3IezRp3wUAuCc",
    authDomain: "edubuddy-qkp8k.firebaseapp.com",
    projectId: "edubuddy-qkp8k",
    storageBucket: "edubuddy-qkp8k.appspot.com",
    messagingSenderId: "305840929357",
    appId: "1:305840929357:web:7d89e14734a6da116bba04",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const getDb = () => getFirestore(app);
const getAuthInstance = () => getAuth(app);
const getAppInstance = () => app;
const getStorageInstance = () => getStorage(app);

export { getAppInstance, getAuthInstance, getStorageInstance, getDb };
