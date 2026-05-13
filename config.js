// CalmTube configuration
// The Google OAuth Client ID and Firebase config are safe to be public —
// they only work from authorized domains, and Firestore is locked to
// authenticated users via security rules.

const CONFIG = {
  GOOGLE_CLIENT_ID: "1062331234884-p9ql2mlv8m0ufhuhl126tt73j2s4uosp.apps.googleusercontent.com",
  WATCH_TIMER_SECONDS: 1800,
  PARENT_CODE: "1234",
  FIREBASE: {
    apiKey:            "AIzaSyD0RLiZtmOZFlVaKDuCxpXsNkZa738sYRQ",
    authDomain:        "calmtube-bcf25.firebaseapp.com",
    projectId:         "calmtube-bcf25",
    storageBucket:     "calmtube-bcf25.firebasestorage.app",
    messagingSenderId: "1018979401657",
    appId:             "1:1018979401657:web:72a976f146c90b71224068",
    measurementId:     "G-SK5V4B5G58",
  },
};
