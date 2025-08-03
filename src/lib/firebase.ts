
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBMu097SDixo0zMjzJ9ST3IezRp3wUAuCc",
    authDomain: "edubuddy-qkp8k.firebaseapp.com",
    projectId: "edubuddy-qkp8k",
    storageBucket: "edubuddy-qkp8k.appspot.com",
    messagingSenderId: "305840929357",
    appId: "1:305840929357:web:7d89e14734a6da116bba04",
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const storage = getStorage(app);

export { app, auth, storage };
