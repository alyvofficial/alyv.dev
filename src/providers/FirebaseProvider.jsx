// FirebaseProvider.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getDatabase, connectDatabaseEmulator } from "firebase/database";

export const FirebaseContext = createContext({});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_REACT_APP_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_REACT_APP_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_REACT_APP_FIREBASE_MEASUREMENT_ID,
};


const FirebaseProvider = (props) => {
  // eslint-disable-next-line react/prop-types
  const children = props.children;

  const [firebaseInitializing, setFirebaseInitializing] = useState(true);
  const [usingEmulators, setUsingEmulators] = useState(false);
  const [emulatorsConfig, setEmulatorsConfig] = useState(false);

  const myApp = initializeApp(firebaseConfig);
  const myAuth = getAuth(myApp);
  const myFS = getFirestore(myApp);
  const myStorage = getStorage(myApp);
  const myFuncs = getFunctions(myApp);
  const myDB = getDatabase(myApp);

  useEffect(() => {
    const shouldUseEmulator = false; // or true :)

    if (shouldUseEmulator) {
      let mapEmulators = {};

      // Firebase Firestore Emulator
      let FS_HOST = "localhost";
      let FS_PORT = 5002;
      if (FS_HOST && FS_PORT) {
        connectFirestoreEmulator(myFS, FS_HOST, FS_PORT);
        console.log(`firestore().useEmulator(${FS_HOST}, ${FS_PORT})`);
        mapEmulators.FS_HOST = FS_HOST;
        mapEmulators.FS_PORT = FS_PORT;
      }

      // Firebase Auth Emulator
      let AUTH_HOST = "localhost";
      let AUTH_PORT = 9099; // or whatever you set the port to in firebase.json
      if (AUTH_HOST && AUTH_PORT) {
        let AUTH_URL = `http://${AUTH_HOST}:${AUTH_PORT}`;
        console.log(
          `connectAuthEmulator(${AUTH_URL}, {disableWarnings: true})`
        );
        //    warns you not to use any real credentials -- we don't need that noise :)
        connectAuthEmulator(myAuth, AUTH_URL, { disableWarnings: true });

        mapEmulators.AUTH_HOST = AUTH_HOST;
        mapEmulators.AUTH_PORT = AUTH_PORT;
        mapEmulators.AUTH_URL = AUTH_URL;
      }

      // Firebase Storage Emulator
      let STORAGE_HOST = "localhost";
      let STORAGE_PORT = 5004; // or whatever you have it set to in firebase.json
      if (STORAGE_HOST && STORAGE_PORT) {
        console.log(`connectStorageEmulator(${STORAGE_HOST}, ${STORAGE_PORT})`);
        connectStorageEmulator(myStorage, STORAGE_HOST, STORAGE_PORT);

        mapEmulators.STORAGE_HOST = STORAGE_HOST;
        mapEmulators.STORAGE_PORT = STORAGE_PORT;
      }

      // Firebase Database Emulator
      let DB_HOST = "localhost";
      let DB_PORT = 9000; // or whatever you have it set to in firebase.json
      if (DB_HOST && DB_PORT) {
        console.log(`connectDatabaseEmulator(${DB_HOST}, ${DB_PORT})`);
        connectDatabaseEmulator(myDB, DB_HOST, DB_PORT);

        mapEmulators.DB_HOST = DB_HOST;
        mapEmulators.DB_PORT = DB_PORT;
      }

      setUsingEmulators(true);
      setEmulatorsConfig(mapEmulators);

      console.log(
        "FIREBASE STARTUP: using Firebase emulator:",
        JSON.stringify(mapEmulators, null, 2)
      );
    }

    setFirebaseInitializing(false);
  }, [myAuth, myFS, myStorage, myDB]); 

  if (firebaseInitializing) {
    return <h1>Loading</h1>;
  }

  const theValues = {
    emulatorsConfig,
    myApp,
    myAuth,
    myFS,
    myStorage,
    usingEmulators,
    myFuncs,
    myDB,
  };

  return (
    <FirebaseContext.Provider value={theValues}>
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * A hook that returns the FirebaseContext's values.
 *
 * @returns {Object} - an object with the following properties:
 * - `emulatorsConfig` {object} - configuration for the emulators if `usingEmulators` is true
 * - `myApp` {object} - the Firebase app instance
 * - `myAuth` {object} - the Auth instance
 * - `myFS` {object} - the Firestore instance
 * - `myStorage` {object} - the Cloud Storage instance
 * - `usingEmulators` {boolean} - true if using emulators, false otherwise
 * - `myDB` {object} - the Realtime Database instance
 */
const useFirebaseContext = () => {
  // get the context
  const context = useContext(FirebaseContext);

  // if `undefined`, throw an error
  if (context === undefined) {
    throw new Error("useFirebaseContext was used outside of its Provider");
  }

  return context;
};

// eslint-disable-next-line react-refresh/only-export-components
export { FirebaseProvider, useFirebaseContext };