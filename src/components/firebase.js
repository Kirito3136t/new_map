import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";


function StartFirebase() {
  const firebaseConfig = {
    apiKey: "AIzaSyClD24jAQXvgDQxixAbOz_LtW2ImncXZaE",
    authDomain: "major-cd14e.firebaseapp.com",
    databaseURL: "https://major-cd14e-default-rtdb.firebaseio.com",
    projectId: "major-cd14e",
    storageBucket: "major-cd14e.appspot.com",
    messagingSenderId: "36281014314",
    appId: "1:36281014314:web:1133d1e3c9ae2b28b40b53",
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);

  return { app, auth, database };
}

export default StartFirebase;
