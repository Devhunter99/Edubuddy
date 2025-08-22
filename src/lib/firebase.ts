
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBMu097SDixo0zMjzJ9ST3IezRp3wUAuCc",
    authDomain: "rewisepanda-a5554.firebaseapp.com",
    projectId: "rewisepanda-a5554",
    storageBucket: "rewisepanda-a5554.appspot.com",
    messagingSenderId: "305840929357",
    appId: "1:305840929357:web:7d89e14734a6da116bba04",
};

let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const getAppInstance = () => {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
};

const getAuthInstance = () => {
    const auth = getAuth(getAppInstance());
    if (process.env.NODE_ENV !== 'production') {
        try {
            connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        } catch (e) {
            // Emulator may not be running, fall back to live service
            console.warn("Could not connect to auth emulator, using live service.", e);
        }
    }
    return auth;
};

const getDb = () => {
    const db = getFirestore(getAppInstance());
    if (process.env.NODE_ENV !== 'production') {
        try {
            connectFirestoreEmulator(db, "127.0.0.1", 8080);
        } catch (e) {
            // Emulator may not be running, fall back to live service
             console.warn("Could not connect to firestore emulator, using live service.", e);
        }
    }
    return db;
};

const getStorageInstance = () => {
    const storage = getStorage(getAppInstance());
    if (process.env.NODE_ENV !== 'production') {
       try {
            connectStorageEmulator(storage, "127.0.0.1", 9199);
        } catch (e) {
            // Emulator may not be running, fall back to live service
            console.warn("Could not connect to storage emulator, using live service.", e);
        }
    }
    return storage;
};

export { getAppInstance, getAuthInstance, getStorageInstance, getDb };
