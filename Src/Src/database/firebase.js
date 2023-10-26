/*import * as firebase from 'firebase/app';
import 'firebase/database';*/
import * as firebase from 'firebase/app';
import * as firestore from 'firebase/firestore';
import 'firebase/storage';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import dotenv from 'dotenv';

dotenv.config();


// Reemplace la siguiente configuración con la configuración de su proyecto Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const fiapp = firebase.initializeApp(firebaseConfig);
export const storage = getStorage(fiapp);
export const fs = firestore.getFirestore(fiapp);
