const { db } = require("../util/admin");
const firebaseConfig = require("../util/config");
const firebase = require("firebase");

firebase.initializeApp(firebaseConfig);

const { validateSignupData , validateLoginData } = require('../util/validators');

exports.signup = (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
  };

  const { valid, errors } = validateSignupData(newUser)

  if (!valid) return response.status(400).json(errors);
  
  let token, userId;
  db.doc(`/users/${newUser.email}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return response
          .status(400)
          .json({ email: "This email already registerd" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      // return the authentication token
      return data.user.getIdToken();
    })
    .then((idToken) => {
      token = idToken;
      const userCredentials = {
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId,
      };
      return db.doc(`/users/${newUser.email}`).set(userCredentials);
      // we used token instead of key value pairs, since the key and value are same.
      //return response.status(201).json({ token });
    })
    .then(() => {
      return response.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return response.status(400).json({ email: "Email is already in use" });
      } else {
        return response.status(500).json({ error: err.code });
      }
    });
};

exports.login = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  const { valid, errors } = validateLoginData(user)

  if (!valid) return response.status(400).json(errors);

  
  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      return response.json({ token });
    })
    .catch((err) => {
      console.log(err);
      if (err.code === "auth/wrong-password" || err.code ==="auth/user-not-found") {
        response.status(403).json({ general: "Wrong credentials.. Please try again" });
      } else {
        return response.status(500).json({ error: err.code });
      }
    });
}


