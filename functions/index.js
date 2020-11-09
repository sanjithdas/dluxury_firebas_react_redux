/**
 * @author [Sanjith]
 * @email [sanjith.das@gmail.com]
 * @create date 2020-10-16 23:17:51
 * @modify date 2020-11-09 15:55:38
 * @desc [express init , all the routes defined here]
 */

const cors = require("cors");

const functions = require("firebase-functions");

const multer = require("multer");

var upload = multer({ dest: "/uploads" });

const app = require("express")();

const bodyParser = require("body-parser");

const fileUpload = require("express-fileupload");
//app.use(bodyParser.json());

app.use(fileUpload());

//app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

const checkAuth = require("./util/auth_user");

const {
  getAllRooms,
  createSingeRoom,
  uploadRoomImage,
  getRoom,
  getMyRooms,
  updateMyRoom,
  deleteMyRoom,
} = require("./handlers/rooms");

const { signup, login } = require("./handlers/users");
//const { request, response } = require("express");

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

//Sign up route

app.post("/signup", signup);

// login route

app.post("/login", login);

// create room

app.post("/room", upload.single("imageUrl"), checkAuth, createSingeRoom);

// list all the rooms

app.get("/rooms", getAllRooms);

// get all the rooms of a user

app.get("/myrooms/:userId", getMyRooms);

// update room with given id

app.put("/myroom/update/:roomno", updateMyRoom);

//get a room with room no

app.get("/room/:roomno", getRoom);

// Delete Room with room no

app.delete("/myroom/delete/:userId", deleteMyRoom);

// upload images for the room

app.post("/room/image/:userId", checkAuth, uploadRoomImage);

exports.api = functions.https.onRequest(app);
