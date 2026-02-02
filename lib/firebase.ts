// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCbGgtl_7PI-rOS2JzaMG0bvk7c-GzeO1w",
    authDomain: "gen-lang-client-0785730442.firebaseapp.com",
    projectId: "gen-lang-client-0785730442",
    storageBucket: "gen-lang-client-0785730442.firebasestorage.app",
    messagingSenderId: "680556812087",
    appId: "1:680556812087:web:b39060298a4e848b2aecb2",
    measurementId: "G-03L68T301Q"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics only works in browser
let analytics;
if (typeof window !== 'undefined') {
    isSupported().then((yes) => {
        if (yes) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, analytics };
