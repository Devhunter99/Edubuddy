
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBMu097SDixo0zMjzJ9ST3IezRp3wUAuCc",
    authDomain: "edubuddy-qkp8k.firebaseapp.com",
    projectId: "edubuddy-qkp8k",
    storageBucket: "edubuddy-qkp8k.appspot.com",
    messagingSenderId: "305840929357",
    appId: "1:305840929357:web:7d89e14734a6da116bba04",
};

let app: FirebaseApp;
let auth: ReturnType<typeof getAuth>;
let firestore: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);

    // UNCOMMENT THE FOLLOWING LINES TO USE THE LOCAL EMULATORS
    // NOTE: Make sure you have the emulators running!
    // try {
    //   connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    //   connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
    //   connectStorageEmulator(storage, "127.0.0.1", 9199);
    //   console.log("Connected to Firebase Emulators");
    // } catch (e) {
    //   console.error("Error connecting to Firebase Emulators:", e);
    // }
    
} else {
    app = getApp();
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
}

const getAppInstance = () => app;
const getAuthInstance = () => auth;
const getDb = () => firestore;
const getStorageInstance = () => storage;


export { getAppInstance, getAuthInstance, getStorageInstance, getDb };
