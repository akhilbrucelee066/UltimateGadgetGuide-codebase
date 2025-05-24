import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  updateProfile,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteField,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyA_JU8uYe6-g0iQwNaWUa3mX3BPdHY3__Y",
  authDomain: "ultimategadgetguide.firebaseapp.com",
  projectId: "ultimategadgetguide",
  storageBucket: "ultimategadgetguide.appspot.com",
  messagingSenderId: "942048051149",
  appId: "1:942048051149:android:9e5e6517bb615c6b8e84",
};

let app;
let auth;
let db;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  db = getFirestore(app);
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

export const signUp = async (email, password, userName = null) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await setDoc(doc(db, "users", userCredential.user.uid), {
      userName,
      email,
    });
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const updatePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdatePassword(user, newPassword);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  } else {
    throw new Error("No user is currently logged in");
  }
};

export const addToPriceTrack = async (
  userId,
  productTitle,
  productOldPrice,
  productNewPrice,
  productUrl
) => {
  const db = getFirestore();
  const priceTrackRef = doc(db, "price_track", userId);

  await setDoc(
    priceTrackRef,
    {
      [productTitle]: {
        productTitle,
        productOldPrice,
        productNewPrice,
        productUrl,
        addedAt: serverTimestamp(),
      },
    },
    { merge: true }
  );
};

export const removeFromPriceTrack = async (userId, productId) => {
  const priceTrackRef = doc(db, "price_track", userId);

  await updateDoc(priceTrackRef, {
    [productId]: deleteField(),
  });
};

export const getTrackedProducts = async (userId) => {
  try {
    const priceTrackRef = doc(db, "price_track", userId);
    const docSnap = await getDoc(priceTrackRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
        productUrl:
          typeof data[key].productUrl === "string" ? data[key].productUrl : "",
      }));
    }
    return [];
  } catch (error) {
    console.error("Error getting tracked products:", error);
    throw error;
  }
};

export const checkIfProductTracked = async (userId, productTitle) => {
  const db = getFirestore();
  const priceTrackRef = doc(db, "price_track", userId);

  const docSnap = await getDoc(priceTrackRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return !!data[productTitle];
  }
  return false;
};

export const saveArticle = async (userId, article) => {
  try {
    const safeArticleId = article.id.replace(/[/\\.#$[\]]/g, "_");
    const articleRef = doc(db, "saved", `${userId}_${safeArticleId}`);

    await setDoc(articleRef, {
      userId,
      articleId: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      thumbnail: article.thumbnail,
      date: article.date,
      savedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error saving article:", error);
    return false;
  }
};

export const removeArticle = async (articleId) => {
  const user = getCurrentUser();
  if (!user) throw new Error("No user logged in");

  const articleRef = doc(db, "saved", articleId);
  await deleteDoc(articleRef);
};

export const getSavedArticles = async (userId) => {
  try {
    const q = query(collection(db, "saved"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export { auth, db };

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updates);

    if (auth.currentUser) {
      await updateProfile(auth.currentUser, updates);
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getUserProfileImage = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data().profileImageUrl || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile image:", error);
    return null;
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data();
    } else {
      console.log("No such user document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};
