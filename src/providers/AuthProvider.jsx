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
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getFirestore,
} from "firebase/firestore";
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

  // useQuery to fetch user data only when user is available
  const fetchUserData = async (userId) => {
    const userDocRef = doc(myFS, PROFILE_COLLECTION, userId);
    const docSnap = await getDoc(userDocRef);
    return docSnap.data();
  };

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery(["user", user?.uid], () => fetchUserData(user?.uid), {
    enabled: !!user && !queryClient.getQueryData(["user", user?.uid]), // Trigger only if user is available and no cached data
    staleTime: Infinity, // Verileri süresiz olarak önbellekte tut
    refetchOnMount: false, // Bileşen mount edildiğinde yeniden getirme
    refetchOnWindowFocus: false, // Pencere odağa geldiğinde yeniden getirme
    refetchOnReconnect: false, // Bağlantı yeniden kurulduğunda yeniden getirme
    cacheTime: Infinity, // Verileri süresiz olarak önbellekte tut
  });

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
      const unsubscribe = onAuthStateChanged(myAuth, async (user) => {
        if (!user) {
          document.title = "ALYV Dev";
          setUser(null);
          setAuthLoading(false);
          return;
        }

        setUser(user);
        document.title = `${user.email} - ALYV Dev`;

        const cachedUserData = queryClient.getQueryData(["user", user.uid]);

        if (!cachedUserData) {
          // Only if the user data is not already in the cache, write to Firestore
          const displayName = user.displayName || "NoName";
          const nameParts = displayName.split(" ");
          const name = nameParts[0];
          const surname = nameParts.length > 1 ? nameParts[1] : "";

          const newUserDoc = {
            Name: name,
            Surname: surname,
            email: user.email,
            photoUrl: user.photoURL || "",
            creationTime: new Date(user.metadata.creationTime).toLocaleString(
              "en-US",
              { timeZone: "Asia/Baku" }
            ),
            lastSignInTime: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Baku",
            }),
          };

          await setDoc(doc(myFS, PROFILE_COLLECTION, user.uid), newUserDoc);
          queryClient.setQueryData(["user", user.uid], newUserDoc); // Cache the user data
        } else {
          // Update only the lastSignInTime if user data exists
          const updatedUserData = {
            ...cachedUserData,
            lastSignInTime: new Date().toLocaleString("en-US", {
              timeZone: "Asia/Baku",
            }),
          };

          await updateDoc(doc(myFS, PROFILE_COLLECTION, user.uid), {
            lastSignInTime: updatedUserData.lastSignInTime,
          });
          queryClient.setQueryData(["user", user.uid], updatedUserData); // Update cached data
        }

        setAuthLoading(false);
      });

      return () => unsubscribe();
    }
  }, [myAuth, queryClient, myFS]); // Removed userData dependency to avoid unnecessary calls

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
    userData,
    userLoading,
    userError,
    firestore,
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
