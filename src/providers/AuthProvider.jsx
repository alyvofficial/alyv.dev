// AuthProvider.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import { useFirebaseContext } from "./FirebaseProvider";

export const AuthContext = createContext({});

const PROFILE_COLLECTION = "users";

const AuthProvider = (props) => {
  const { myAuth, myFS } = useFirebaseContext();
  const firestore = getFirestore();

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authErrorMessages, setAuthErrorMessages] = useState();
  // eslint-disable-next-line react/prop-types
  const { children } = props;
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
      let unsubscribe = onAuthStateChanged(myAuth, async (user) => {
        if (!user) {
          document.title = "ALYV Dev";
          setUser(null);
          setAuthLoading(false);
          return;
        }

        setUser(user);
        document.title = `${user.email} - ALYV Dev`;

        const userDocRef = doc(myFS, PROFILE_COLLECTION, user.uid);

        try {
          const docSnap = await getDoc(userDocRef);

          if (!docSnap.exists()) {
            // Kullanıcı adını ve soyadını ayırırken kontrol yapıyoruz
            const displayName = user.displayName || "NoName";
            const nameParts = displayName.split(" ");
            const name = nameParts[0]; // İlk parça ismi alır
            const surname = nameParts.length > 1 ? nameParts[1] : ""; // İkinci parça varsa soyadı alır, yoksa boş bırakır

            await setDoc(userDocRef, {
              Name: name,
              Surname: surname,
              email: user.email,
              photoUrl: user.photoURL || "",
              creationTime: new Date(user.metadata.creationTime).toLocaleString(
                "en-US",
                { timeZone: "Asia/Baku" }
              ),
              lastSignInTime: new Date(
                user.metadata.lastSignInTime
              ).toLocaleString("en-US", { timeZone: "Asia/Baku" }),
            });
          } else {
            // Son giriş zamanını günceller
            await setDoc(
              userDocRef,
              {
                lastSignInTime: new Date().toLocaleString("en-US", {
                  timeZone: "Asia/Baku",
                }),
              },
              { merge: true } // Bu sadece lastSignInTime alanını günceller
            );
          }

          setAuthLoading(false);
        } catch (error) {
          console.error("Error:", error);
          setAuthLoading(false);
        }
      });

      return unsubscribe;
    }
  }, [myAuth, myFS]);

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
        const surname = nameParts.length > 1 ? nameParts[1] : ""; // Soyadı yoksa boş bırakılır

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

  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        User loading...
      </div>
    );
  }

  const theValues = {
    authErrorMessages,
    authLoading,
    user,
    logout: logoutFunction,
    googleSignIn: googleSignInFunction,
    firestore,
  };

  return (
    <AuthContext.Provider value={theValues}>{children}</AuthContext.Provider>
  );
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
