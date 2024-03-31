// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHDoO_Ew_geSdY67qhvFmBE_sVTD5Owdo",
  authDomain: "majorproject-b24c2.firebaseapp.com",
  databaseURL: "https://majorproject-b24c2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "majorproject-b24c2",
  storageBucket: "majorproject-b24c2.appspot.com",
  messagingSenderId: "242017917000",
  appId: "1:242017917000:web:52cf2d13de62cc8bafa07d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore();
