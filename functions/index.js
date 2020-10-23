/**
 * @author [Sanjith]
 * @email [sanjith.das@gmail.com]
 * @create date 2020-10-16 23:17:51
 * @modify date 2020-10-21 18:44:12
 * @desc [description]
 */

const cors = require("cors");

const functions = require("firebase-functions");

const app = require("express")();

app.use(cors());

const checkAuth = require("./util/auth_user");

const {
  getAllRooms,
  createSingeRoom,
  uploadRoomImage,
} = require("./handlers/rooms");

const { signup, login } = require("./handlers/users");
const { request, response } = require("express");

/**
 * fetch user from the firebase db
 *
 */

app.get("/users", (request, response) => {
  db.collection("users")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let users = [];
      data.forEach((doc) => {
        users.push({
          userId: doc.id,
          // name: doc.data().name,
          email: doc.data().email,
          password: doc.data().password,
          created_at: doc.data().created_at,
          updated_at: doc.data.updated_at,
        });
      });
      return response.json(users);
    })
    .catch((err) => console.error(err));
});

/**
 * Middleware block checking all the routes before its doing the operation,
 * checking the user is a valid one.
 *
 * app.post('/scream', FBAuth, (req,res) =>{
 * })
 * authorise the user
 * @param {} request
 * @param {*} response
 * @param {*} next
 */

// http://ssss.com/api/
// exports.api = functions.region('australia-south-east').htttps.onRequest(app) // check the correct area in the firebase

//validate data

//Sign up route

app.post("/signup", signup);

// login route

app.post("/login", login);

// create room

app.post("/room", checkAuth, createSingeRoom);

// list all the rooms

app.get("/rooms", getAllRooms);

// upload images for the room

app.post("/room/image", checkAuth, uploadRoomImage);

exports.api = functions.https.onRequest(app);
