require("dotenv").config();
const cron = require("node-cron");
const express = require('express');
const { verifyToken, verifyTokenAdmin } = require('./routes/middleware/verifyToken');
const app = express();
const router = express.Router();
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
var cors = require('cors');
app.use(cors());
var multer = require('multer')
const Branch = require('./models/Branch');
const TagGroup = require('./models/TagGroup');
const Cloth = require('./models/Cloth');
const Admin = require('./models/Admin');
const Reservation = require('./models/Reservation');
const ReservationArchived = require('./models/ReservationArchived');
const User = require('./models/User');
const Registration = require('./models/Registration');
const Notifications = require('./models/Notifications');

cron.schedule("30 17 * * *", async function() {
  console.log("Deleting notPickedUp reservations");

  await Reservation.find({status: "2"},async function (err, rr) {
    var forDeletion=[];
     rr.map( async(r)=>{
      var willhappen = new Date(r.ExpiryDate+ " " + "17:00:00");
      var today = new Date();
      var dif = new Date(willhappen.getTime()-today.getTime());
      if(dif.getTime()<0)
      {
        forDeletion.push(r._id);
        const rA = new ReservationArchived({
          status: 8,
          cloth: r.cloth,
          reserver: r.reserver,
          reservee: r.reservee,
          lastEventDate: r.ExpiryDate+ " " + "17:00:00",
          ExpiryDate: r.ExpiryDate,
          shopId: r.shopId,
          oldId: r._id,
        });
        rA.save().catch(err => console.log(err));
        var cloth = await Cloth.findOne({ _id: r.cloth }).catch((err) => { console.log(err); });
        cloth.status="1";
        cloth.save().catch(err => console.log(err));
      }
    
      
    })
    Reservation.deleteMany({_id:{$in: forDeletion}},function(err, result) {});
}).catch(err=>{console.log(err);})
console.log("done!");
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public')
  },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' +file.originalname )
    }
  })
  
  var upload = multer({ storage: storage }).array('file')
  

app.post('/upload',verifyTokenAdmin, function(req, res) {
    
    upload(req, res, function (err) {
     
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err)
          // A Multer error occurred when uploading.
        } else if (err) {
            return res.status(500).json(err)
          // An unknown error occurred when uploading.
        } 
        
        

        var dests=[];
        for(var x=0;x<req.files.length;x++){
          dests.push(req.files[x].filename)
        }
        

        return res.json({array: dests})
        // Everything went fine.
      })
});






const api = require('./routes/api');
const admin = require('./routes/admin');


const port = 8080;
const mongoose = require('mongoose');
//const mongoose = require('mongoose');
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
const MONGO_HOSTNAME = '127.0.0.1';
const MONGO_PORT = '27017';
const MONGO_DB = 'StaraSzafaLocal';
const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => { console.log('connected to db!') });


app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
require('./routes/middleware/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());



// Global variables
app.use(bodyParser.text({type:"*/*"}));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, token, authorization"
  );
  next();
});



//routes
app.use('/api', api);
app.use('/admin', admin);
app.get('*',function (req, res) {
  res.redirect('/');
});




app.listen(port, function () {
  console.log('Example app listening on port 8080!');
  // const n = new Notifications({
  //   read: false,
  //   userId: "q",
  //   text: "q",
  //   photo: "q",
  //   date: "q",
  // })
  // n.save().catch(err => console.log(err));

});

// const cp = require("child_process");
// const path = require("path");
// var child = cp.fork("upload.js",["witam","debilu"], {cwd:"./"})
// child.on("exit", ()=>{
//   console.log("Child terminated!");
// })