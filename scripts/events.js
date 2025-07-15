import { initializeApp } from './firebase/firebase-app.js';

const firebaseConfig = {
  apiKey: "AIzaSyDTMt7UZzgjWD87LS_9dpfAa7-Y2g2-N-E",
  authDomain: "daggerquest-a791b.firebaseapp.com",
  databaseURL: "https://daggerquest-a791b-default-rtdb.firebaseio.com",
  projectId: "daggerquest-a791b",
  storageBucket: "daggerquest-a791b.firebasestorage.app",
  messagingSenderId: "101978886912",
  appId: "1:101978886912:web:684bc49b0bc1788fff19e5"
};
const firebase = initializeApp(firebaseConfig);