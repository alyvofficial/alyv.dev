// AuthProvider.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import PropTypes from "prop-types";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
} from "firebase/auth";
import { doc, getDoc, setDoc, getFirestore, updateDoc } from "firebase/firestore";
import { useFirebaseContext } from "./FirebaseProvider";
import { useQuery, useQueryClient } from "react-query";

export const AuthContext = createContext({});

const PROFILE_COLLECTION = "users";

const AuthProvider = (props) => {
  const { myAuth, myFS } = useFirebaseContext();
  const firestore = getFirestore();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authErrorMessages, setAuthErrorMessages] = useState();
  const { children } = props;


  const fetchUserData = async (userId) => {
    const userDocRef = doc(myFS, PROFILE_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.data();
  };

  const { data: userData, isLoading: userLoading, error: userError } = useQuery(
    ["user", user?.uid],
    () => fetchUserData(user?.uid),
    {
      enabled: !!user,
      staleTime: Infinity,
      cacheTime: Infinity,
      // onSuccess: (data) => {
      //   if (data) {
      //     const updatedUserData = { ...data, lastSignInTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Baku" }) };
      //     queryClient.setQueryData(["user", user?.uid], updatedUserData);
      //     // updateDoc(doc(myFS, PROFILE_COLLECTION, user.uid), { lastSignInTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Baku" }) });
      //   }
      // }
    }
  );

  const logoutFunction = useCallback(async () => {
    try {
      setAuthLoading(true);
      await signOut(myAuth);
      console.log("Signed Out:", new Date());
      setUser(null);
      setAuthLoading(false);
      return true;
    } catch (ex) {
      console.error(ex);
      setAuthErrorMessages([ex.message]);
      return false;
    }
  }, [myAuth]);

  useEffect(() => {
    if (myAuth) {
      const unsubscribe = onAuthStateChanged(myAuth, (user) => {
        if (!user) {
          // ... (user yoksa işlemler)
          return;
        }

        setUser(user);
        document.title = `${user.email} - ALYV Dev`;

        if (!userData) { // userData yoksa Firestore'a yaz
          const displayName = user.displayName || "NoName";
          const nameParts = displayName.split(" ");
          const name = nameParts[0];
          const surname = nameParts.length > 1 ? nameParts[1] : "";
  
          setDoc(doc(myFS, PROFILE_COLLECTION, user.uid), {
            Name: name,
            Surname: surname,
            email: user.email,
            photoUrl: user.photoURL || "",
            creationTime: new Date(user.metadata.creationTime).toLocaleString("en-US", { timeZone: "Asia/Baku" }),
            lastSignInTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Baku" }),
          });
        } else { // userData varsa sadece lastSignInTime'ı güncelle
          const updatedUserData = { ...userData, lastSignInTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Baku" }) };
          queryClient.setQueryData(["user", user.uid], updatedUserData);
          updateDoc(doc(myFS, PROFILE_COLLECTION, user.uid), { lastSignInTime: new Date().toLocaleString("en-US", { timeZone: "Asia/Baku" }) });
  
        }
        setAuthLoading(false);
      });

      return unsubscribe;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAuth, userData]); // userData bağımlılığını ekledik

  const googleSignInFunction = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(myAuth, provider);
      const user = result.user;

      const userDocRef = doc(myFS, PROFILE_COLLECTION, user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        const displayName = user.displayName || "NoName";
        const nameParts = displayName.split(" ");
        const name = nameParts[0];
        const surname = nameParts.length > 1 ? nameParts[1] : "";

        const userDocData = {
          Name: name,
          Surname: surname,
          email: user.email,
          photoUrl: user.photoURL || "",
          creationTime: new Date(user.metadata.creationTime).toLocaleString(
            "en-US",
            { timeZone: "Asia/Baku" }
          ),
          lastSignInTime: new Date(user.metadata.lastSignInTime).toLocaleString(
            "en-US",
            { timeZone: "Asia/Baku" }
          ),
        };

        await setDoc(userDocRef, userDocData);
      }

      setUser(user);
      return true;
    } catch (ex) {
      console.error(`Google sign-in failed: ${ex.message}`);
      setAuthErrorMessages([ex.message]);
      return false;
    }
  };

  const githubSignInFunction = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(myAuth, provider);
      const user = result.user;

      const userDocRef = doc(myFS, PROFILE_COLLECTION, user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        const displayName = user.displayName || "NoName";
        const nameParts = displayName.split(" ");
        const name = nameParts[0];
        const surname = nameParts.length > 1 ? nameParts[1] : "";

        const userDocData = {
          Name: name,
          Surname: surname,
          email: user.email,
          photoUrl: user.photoURL || "",
          creationTime: new Date(user.metadata.creationTime).toLocaleString(
            "en-US",
            { timeZone: "Asia/Baku" }
          ),
          lastSignInTime: new Date(user.metadata.lastSignInTime).toLocaleString(
            "en-US",
            { timeZone: "Asia/Baku" }
          ),
        };

        await setDoc(userDocRef, userDocData);
      }

      setUser(user);
      return true;
    } catch (ex) {
      console.error(`GitHub sign-in failed: ${ex.message}`);
      setAuthErrorMessages([ex.message]);
      return false;
    }
  };

  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <svg
            className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  const theValues = {
    authErrorMessages,
    authLoading,
    user,
    logout: logoutFunction,
    googleSignIn: googleSignInFunction,
    githubSignIn: githubSignInFunction, // Add GitHub sign-in to the context
    firestore,
    userData,
    userLoading,
    userError,
  };

  return (
    <AuthContext.Provider value={theValues}>{children}</AuthContext.Provider>
  );
};
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuthContext was used outside of its Provider");
  }

  return context;
};


// eslint-disable-next-line react-refresh/only-export-components
export { AuthProvider, useAuthContext };
