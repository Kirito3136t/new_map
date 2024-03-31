import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
  } from "firebase/auth";
  import StartFirebase from "./firebase";
  
  const userAuthContext = createContext();
  
  export function UserAuthContextProvider({ children }) {
    const [user, setUser] = useState({});
  
    function logIn(email, password) {
      return signInWithEmailAndPassword(StartFirebase, email, password);
    }
    function signUp(email, password) {
      return createUserWithEmailAndPassword(StartFirebase, email, password);
    }
    function logOut() {
      return signOut(StartFirebase);
    }
    function googleSignIn() {
      const googleAuthProvider = new GoogleAuthProvider();
      return signInWithPopup(StartFirebase, googleAuthProvider);
    }
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(StartFirebase, (currentuser) => {
        console.log("Auth", currentuser);
        setUser(currentuser);
      });
  
      return () => {
        unsubscribe();
      };
    }, []);
  
    return (
      <userAuthContext.Provider
        value={{ user, logIn, signUp, logOut, googleSignIn }}
      >
        {children}
      </userAuthContext.Provider>
    );
  }
  
  export function useUserAuth() {
    return useContext(userAuthContext);
  }