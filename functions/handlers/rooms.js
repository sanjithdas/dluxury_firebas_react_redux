/**
 * @author [Sanjith]
 * @email [sanjith.das@gmail.com]
 * @create date 2020-11-02 16:58:07
 * @modify date 2020-11-03 12:29:20
 * @desc [Room CRUD]
 */
const { db, admin } = require("../util/admin");
//const firebase = require("firebase");

const bucket = admin.storage().bucket();

//console.log(bucket);

//const { firebaseConfig } = require('firebase-functions');
const firebaseConfig = require("../util/config");

// Listing all rooms
exports.getAllRooms = (request, response) => {
  db.collection("rooms")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let rooms = [];
      data.forEach((doc) => {
        rooms.push({
          userId: doc.id,
          roomno: doc.data().roomno,
          roomType: doc.data().roomType,
          roomRate: doc.data().roomRate,
          imageUrl: doc.data().imageUrl,
          description: doc.data().description,
          createdAt: doc.data().created_at,
          updatedAt: doc.data.updated_at,
          roomId: doc.data().roomId,
        });
      });
      return response.json(rooms);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

/**
 * get single room details
 * @param {*} request
 * @param {*} response
 */

// show single room based on the roomno
exports.getRoom = (request, response) => {
  console.log(request.params.roomno);
  const roomno = request.params.roomno;
  db.collection("rooms")
    .orderBy("createdAt", "desc")
    .where("roomno", "==", +request.params.roomno)
    .get()
    .then((data) => {
      let rooms = [];
      data.forEach((doc) => {
        rooms.push({
          userId: doc.id,
          roomno: doc.data().roomno,
          roomType: doc.data().roomType,
          roomRate: doc.data().roomRate,
          occupants: doc.data().occupants,
          imageUrl: doc.data().imageUrl,
          bedType: doc.data().bedType,
          description: doc.data().description,
          createdAt: doc.data().created_at,
          updatedAt: doc.data.updated_at,
        });
      });
      return response.json(rooms);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

/**
 * get all the room of a  users
 * @param {*} request
 * @param {*} response
 */
// Fetch all the rooms belongs to a particular user
exports.getMyRooms = (request, response) => {
  console.log("request.params.userId");
  const userId = request.params.userId;
  db.collection("rooms")
    .orderBy("createdAt", "desc")
    .where("userId", "==", request.params.userId)
    .get()
    .then((data) => {
      let rooms = [];
      data.forEach((doc) => {
        //  console.log(doc);
        rooms.push({
          userId: doc.id,
          roomno: doc.data().roomno,
          roomType: doc.data().roomType,
          roomRate: doc.data().roomRate,
          occupants: doc.data().occupants,
          imageUrl: doc.data().imageUrl,
          bedType: doc.data().bedType,
          description: doc.data().description,
          createdAt: doc.data().created_at,
          updatedAt: doc.data.updated_at,
        });
      });
      return response.json(rooms);
    })
    .catch((err) => {
      console.error(err);
      response.status(500).json({ error: err.code });
    });
};

// Update Room

exports.updateMyRoom = (request, response) => {
  const roomImage = "home2.jpg";
  console.log(request.body.userId + " Update Room " + request.params.roomno);
  const updRoom = {
    roomno: Number(request.body.roomno),
    description: request.body.description,
    roomType: request.body.roomType,
    roomRate: Number(request.body.roomRate),
    occupants: Number(request.body.occupants),
    bedType: request.body.bedType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${roomImage}?alt=media`,
  };
  const roomDocument = db
    .doc(`/rooms/${request.body.userId}`)
    .update(updRoom)
    .then((doc) => {
      console.log(`room  updated successfully`);
      response.status(200).json({ message: "Room updated successfully" });
    })
    .catch((err) => {
      response.status(500).json({ error: `Error ${err}` });
    });
};
// delete my room

exports.deleteMyRoom = (request, response) => {
  console.log(request.body.userId + " Update Room " + request.params.userId);
  const roomDocument = db
    .doc(`/rooms/${request.params.userId}`)
    .delete()
    .then((doc) => {
      response.status(200).json({ message: "Room deleted successfully" });
      console.log(`room ${doc} deleted successfully`);
    })
    .catch((err) => {
      response.status(500).json({ error: `Error ${err}` });
    });
};

// Upload room Image
exports.createSingeRoom = (request, response) => {
  const roomImage = "home2.jpg";
  //exports.createUser = functions.https.onRequest((request, response) => {
  if (request.method !== "POST") {
    return response.status(400).json({ error: "Method not allowed" });
  }
  const newRoom = {
    roomno: Number(request.body.roomno),
    description: request.body.description,
    userId: request.user.uid,
    roomType: request.body.roomType,
    roomRate: Number(request.body.roomRate),
    occupants: Number(request.body.occupants),
    bedType: request.body.bedType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${roomImage}?alt=media`,
  };
  db.collection("rooms")
    .add(newRoom)
    .then((doc) => {
      const resRoom = newRoom;
      resRoom.roomId = doc.id;
      console.log(resRoom.roomId);
      response.json(resRoom);
    })
    .catch((err) => {
      console.log(err);
      response.status(500).json({ error: "something went wrong" });
    });
  //});
};

// upload image for room

exports.uploadRoomImage = (request, response) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");

  const busboy = new BusBoy({ headers: request.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    // console.log(fieldname);
    // console.log(filename);
    // console.log(mimetype);

    const imageExtension = filename.split(".")[filename.split(".").length - 1];
    //3433432342.png
    imageFileName = `${Math.round(
      Math.random() * 1000000000
    )}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);

    imageToBeUploaded = { filepath, mimetype };

    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on("finish", () => {
    console.log(imageToBeUploaded);
    bucket
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype,
          },
        },
      })
      .then((doc) => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return db
          .doc(`/rooms/niO0vG9CntNUxA6b5aL9`)
          .update({ imageUrl: imageUrl });
      })
      .then(() => {
        return response.json({ message: "Image uploaded successfully " });
      })
      .catch((err) => {
        // console.error(err);
        return response.status(500).json({ error: err });
      });
  });
  busboy.end(request.rawBody);
  /*
  const roomImage = 'no-image.png'

  */
};
