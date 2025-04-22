// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAqevW0ku7ziiBTmSV60zAXd0fk-IIYVi4",
    authDomain: "pedilo-ya-c877f.firebaseapp.com",
    projectId: "pedilo-ya-c877f",
    storageBucket: "pedilo-ya-c877f.firebasestorage.app",
    messagingSenderId: "468844130455",
    appId: "1:468844130455:web:ed3ebc1069fe57a6df79d2",
    measurementId: "G-2ESY6E5H2M"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
