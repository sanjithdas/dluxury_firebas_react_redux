const { admin, db } = require("./admin");

module.exports = (request, response, next) => {
  let idToken;
  if (
    request.headers.authorization &&
    request.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = request.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("no token found");
    return response.status(403).json({ error: "Unauthorized" });
  }
  // once the token is issued we need to verify its from our application or not
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      request.user = decodedToken;
      //     console.log(decodedToken);
      console.log(request.user.email);
      return db
        .collection("users")
        .where("email", "==", request.user.email)
        .limit(1)
        .get();
    })
    .then((data) => {
      request.user.email = data.docs[0].data().email;
      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token", err);
      response.status(403).json(err);
    });
};
