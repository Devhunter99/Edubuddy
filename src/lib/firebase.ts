
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
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
const getAppInstance = (): FirebaseApp => {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

const getDb = () => getFirestore(getAppInstance());
const getAuthInstance = () => getAuth(getAppInstance());
const getStorageInstance = () => getStorage(getAppInstance());

export { getAppInstance, getAuthInstance, getStorageInstance, getDb };
