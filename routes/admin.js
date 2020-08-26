const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Branch = require('../models/Branch');
const TagGroup = require('../models/TagGroup');
const Cloth = require('../models/Cloth');
const Admin = require('../models/Admin');
const Reservation = require('../models/Reservation');
const ReservationArchived = require('../models/ReservationArchived');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Notifications = require('../models/Notifications');
const { ensureAuthenticated, forwardAuthenticated } = require('./middleware/auth');
const { verifyToken, verifyTokenAdmin  } = require('./middleware/verifyToken');
const nodemailer = require('nodemailer');
const Jimp = require('jimp');

async function resize(images, width){
	await Promise.all(
		images.map(async imgPath => {
      var o=imgPath.length;
			const image = await Jimp.read("./public/"+imgPath);
      await image.resize(width, Jimp.AUTO);
      await image.rotate(90); 
			await image.writeAsync("./public/"+imgPath.slice(0,o-4)+"_sm.jpg");
		})
	);
};

router.get('/history',verifyTokenAdmin, async (req, res) => {
  await Admin.findOne({ userId: req.authData.user._id }).exec(async function (err, admin) {
  await ReservationArchived.find({shopId: admin.BranchId, status: {$in :["3","4","5","7","8"]}},async function (err, c) {
    var reservers=c.map(cc=>{return(cc.reserver)});
      var resActive=c.map(cc=>{return(cc.cloth)});
      await Cloth.find({_id: { $in : resActive }},async function (err, cloths) {
        await User.find({_id: { $in : reservers }},async function (err, users) {
          var usersFiltered = users.map(u=>{return({_id:u._id,FirstName:u.FirstName,name:u.name})})
          res.json({success: true, reservations: c, cloths,usersFiltered});
        }).catch(err=>{console.log(err);res.json({success: false});})
    }).catch(err=>{console.log(err);res.json({success: false});})
}).catch(err=>{console.log(err);res.json({success: false});})
})
})

router.post('/delete',verifyTokenAdmin, async (req, res) => {
  var data = JSON.parse(req.body);
  Cloth.deleteOne({ _id:data._id}, function(err) {if(err)console.log(err)})
  res.json({status:200});

})

router.post('/clientDidntBought',verifyTokenAdmin, async (req, res) => {
  var data = JSON.parse(req.body);
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let seconds = ("0" + date_ob.getSeconds()).slice(-2);
  var lastEventDate= (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
  
    var r = await Reservation.findOne({ _id:data._id}).catch((err) => { console.log(err); });
      const rA = new ReservationArchived({
        status: 7,
        cloth: r.cloth,
        reserver: r.reserver,
        reservee: req.authData.user._id,
        lastEventDate: lastEventDate,
        ExpiryDate: r.ExpiryDate,
        shopId: r.shopId,
        oldId: data._id,
      });
      rA.save().catch(err => console.log(err));
      


      const cloth = await Cloth.findOne({ _id: r.cloth }).catch((err) => { console.log(err); });
      cloth.status=4;
      var primary =""
      cloth.photos.map((photo, m)=>{
        if(photo.primary){
          var o=photo.file.length;
          primary=photo.file.slice(0,o-4)+"_sm.jpg";
        }
      });
      var u = await ReservationArchived.findOne({ oldId:data._id}).catch((err) => { console.log(err); });
      const n = new Notifications({
        read: false,
        userId: r.reserver,
        text: "Nie kupiłeś '"+cloth.name+"'.",
        photo: primary,
        date: lastEventDate,
        reservationId:u._id,
      })
      n.save().catch(err => console.log(err));
      Reservation.deleteOne({ _id:data._id}, function(err) {if(err)console.log(err)})
      cloth.save().catch(err => console.log(err));
      res.json({status:200});
    
 

})

router.get('/reserved',verifyTokenAdmin, async (req, res) => {
  await Admin.findOne({ userId: req.authData.user._id }).exec(async function (err, admin) {
  await Reservation.find({shopId: admin.BranchId, status: "2"},async function (err, c) {
    var reservers=c.map(cc=>{return(cc.reserver)});
      var resActive=c.map(cc=>{return(cc.cloth)});
      await Cloth.find({_id: { $in : resActive }},async function (err, cloths) {
        await User.find({_id: { $in : reservers }},async function (err, users) {
          var usersFiltered = users.map(u=>{return({_id:u._id,FirstName:u.FirstName,name:u.name})})
          res.json({success: true, reservations: c, cloths,usersFiltered});
        }).catch(err=>{console.log(err);res.json({success: false});})
    }).catch(err=>{console.log(err);res.json({success: false});})
}).catch(err=>{console.log(err);res.json({success: false});})
})
})

router.post('/clientBought',verifyTokenAdmin, async (req, res) => {
  var data = JSON.parse(req.body);
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let seconds = ("0" + date_ob.getSeconds()).slice(-2);
  var lastEventDate= (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
  
    var r = await Reservation.findOne({ _id:data._id}).catch((err) => { console.log(err); });
      const rA = new ReservationArchived({
        status: 3,
        cloth: r.cloth,
        reserver: r.reserver,
        reservee: req.authData.user._id,
        lastEventDate: lastEventDate,
        ExpiryDate: r.ExpiryDate,
        shopId: r.shopId,
        oldId: data._id,
      });
      rA.save().catch(err => console.log(err));
      


      const cloth = await Cloth.findOne({ _id: r.cloth }).catch((err) => { console.log(err); });
      cloth.status=4;
      var primary =""
      cloth.photos.map((photo, m)=>{
        if(photo.primary){
          var o=photo.file.length;
          primary=photo.file.slice(0,o-4)+"_sm.jpg";
        }
      });
      var u = await ReservationArchived.findOne({ oldId:data._id}).catch((err) => { console.log(err); });
      const n = new Notifications({
        read: false,
        userId: r.reserver,
        text: "Kupiłeś '"+cloth.name+"'!",
        photo: primary,
        date: lastEventDate,
        reservationId:u._id,
      })
      n.save().catch(err => console.log(err));
      Reservation.deleteOne({ _id:data._id}, function(err) {if(err)console.log(err)})
      cloth.save().catch(err => console.log(err));
      res.json({status:200});
    
 

})

router.post('/dismissReservation',verifyTokenAdmin, async (req, res) => {
  var data = JSON.parse(req.body);
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let seconds = ("0" + date_ob.getSeconds()).slice(-2);
  var lastEventDate= (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
  
    var r = await Reservation.findOne({ _id:data._id}).catch((err) => { console.log(err); });
      const rA = new ReservationArchived({
        status: 4,
        cloth: r.cloth,
        reserver: r.reserver,
        reservee: req.authData.user._id,
        lastEventDate: lastEventDate,
        ExpiryDate: r.ExpiryDate,
        shopId: r.shopId,
        oldId: data._id,
      });
      rA.save().catch(err => console.log(err));
      


      const cloth = await Cloth.findOne({ _id: r.cloth }).catch((err) => { console.log(err); });
      cloth.status=4;
      var primary =""
      cloth.photos.map((photo, m)=>{
        if(photo.primary){
          var o=photo.file.length;
          primary=photo.file.slice(0,o-4)+"_sm.jpg";
        }
      });
      var u = await ReservationArchived.findOne({ oldId:data._id}).catch((err) => { console.log(err); });
      const n = new Notifications({
        read: false,
        userId: r.reserver,
        text: "Rezerwacja anulowana!",
        photo: primary,
        date: lastEventDate,
        reservationId:u._id,
      })
      n.save().catch(err => console.log(err));
      Reservation.deleteOne({ _id:data._id}, function(err) {if(err)console.log(err)})
      cloth.save().catch(err => console.log(err));
      res.json({status:200});
    
 

})

router.post('/confirmRes',verifyTokenAdmin, async (req, res) => {
  var data = JSON.parse(req.body);
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = ("0" + date_ob.getMinutes()).slice(-2);
  let seconds = ("0" + date_ob.getSeconds()).slice(-2);
  
    await Reservation.findOne({ _id:data._id}).exec(async function (err, r) {
      r.reservee=req.authData.user._id;
      r.status=2;
      r.lastEventDate= (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
      await r.save().catch(err => {console.log(err);res.json({operationStatus: "error"});});
      const cloth = await Cloth.findOne({ _id: r.cloth }).catch((err) => { console.log(err); });
      var primary =""
      cloth.photos.map((photo, m)=>{
        if(photo.primary){
          var o=photo.file.length;
          primary=photo.file.slice(0,o-4)+"_sm.jpg";
        }
      });
      const n = new Notifications({
        read: false,
        userId: r.reserver,
        text: "Rezerwacja gotowa do odbioru!",
        photo: primary,
        date: (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds),
        reservationId:r._id,
      })
      n.save().catch(err => console.log(err));
      res.json({status:200});
    })
 

})

router.get('/requests',verifyTokenAdmin, async (req, res) => {
  await Admin.findOne({ userId: req.authData.user._id }).exec(async function (err, admin) {
  await Reservation.find({shopId: admin.BranchId, status: "1"},async function (err, c) {
    var reservers=c.map(cc=>{return(cc.reserver)});
      var resActive=c.map(cc=>{return(cc.cloth)});
      await Cloth.find({_id: { $in : resActive }},async function (err, cloths) {
        await User.find({_id: { $in : reservers }},async function (err, users) {
          var usersFiltered = users.map(u=>{return({_id:u._id,FirstName:u.FirstName,name:u.name})})
          res.json({success: true, reservations: c, cloths,usersFiltered});
        }).catch(err=>{console.log(err);res.json({success: false});})
    }).catch(err=>{console.log(err);res.json({success: false});})
}).catch(err=>{console.log(err);res.json({success: false});})
})
})

router.get('/tags',verifyTokenAdmin, async (req, res) => {
  TagGroup.find({},function (err, c) {
    res.json({tags:c});
  })
})

router.post('/delete',verifyTokenAdmin, async (req, res) => {
  var data = JSON.parse(req.body);
  Cloth.deleteOne({ _id:data._id}, function(err) {if(err)console.log(err)})
  res.json({status:200});

})

router.post('/publish',verifyTokenAdmin, async (req, res) => {
  var data = JSON.parse(req.body);
  await Cloth.findOne({ _id:data._id}).exec(async function (err, cloth) {
    cloth.status=2;
    await cloth.save().catch(err => {console.log(err);res.json({operationStatus: "error"});});
    res.json({status:200});
  })
  

})

router.get('/beingAdded',verifyTokenAdmin, async (req, res) => {
  await Admin.findOne({ userId: req.authData.user._id }).exec(async function (err, admin) {
    await Cloth.find({shopId:admin.BranchId,status:"1"},async function (err, c) {

  

      var processed=c.map((element, l)=>{
        var primary =""
        element.photos.map((photo, m)=>{
          if(photo.primary){
            primary=photo.file;
          }
        });
        return({photo:primary,name:element.name,code:element.code,_id:element._id,dateAdded:element.dateAdded});

      });
      res.json({beingAdded:processed});


  })
  

  })
  
})

router.get('/forSale',verifyTokenAdmin, async (req, res) => {
  await Admin.findOne({ userId: req.authData.user._id }).exec(async function (err, admin) {
    await Cloth.find({shopId:admin.BranchId,status:"2"},async function (err, c) {

  

      var processed=c.map((element, l)=>{
        var primary =""
        element.photos.map((photo, m)=>{
          if(photo.primary){
            primary=photo.file;
          }
        });
        return({photo:primary,name:element.name,code:element.code,_id:element._id,dateAdded:element.dateAdded});

      });
      res.json({beingAdded:processed});


  })
  

  })
  
})

router.post('/addcloth',verifyTokenAdmin, async (req, res) => {
    var data = JSON.parse(req.body);
    //adding tags thingy
    tags=[];
    await TagGroup.find({},function (err, c) {tags=c;})
    await data.tags.map(async (givenTagGroup,i)=>{//loop through all chosen Group tags

      await tags.map(async(find,j)=>{//loop through all existing tags to check against

        if(find.name==givenTagGroup.name){//we have a match
          //now we compare children
          await givenTagGroup.children.map(async(givenTag,k)=>{//we loop throgh chosen children
            
            var childIsThere=false;
            await find.children.map(async(foundTag,k)=>{//we loop through existing children
            
              if(foundTag==givenTag){childIsThere=true}
            })
            if(!childIsThere){
              //you have to add it now


              await TagGroup.findOne({ name: givenTagGroup.name }).exec(async function (err, forUpdate) {
                
                forUpdate.children.push(givenTag);
                await forUpdate.save().catch(err => {console.log(err);res.json({operationStatus: "error"});});

              });

            }


          })
        }
      })
      

    })

    //resolving shop based on admin
    
    await Admin.findOne({ userId: req.authData.user._id }).exec(async function (err, admin) {
      
      //resolving date
        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = date_ob.getMinutes();
        let seconds = date_ob.getSeconds();



      const cloth = new Cloth({//1-beingAdded, 2-forSale, 3-reserved, (it should never be '4')4-archieved
      status:"1",
       photos:data.photos,
       tags: data.tags,
       name: data.name,
       price: data.price,
       code: data.code,
       size: data.size,
       brand: data.brand,
       fabric: data.fabric,
       shopId: admin.BranchId,
       reservationId: "",
       dateAdded:(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds),
         });
   await cloth.save().catch(err => {console.log(err);res.json({operationStatus: "error"});});

   
   res.json({operationStatus:"complete"});
      
   data.photos.map((e)=>{
     if(e.primary)
    resize([e.file], 756);
   })
      
    });



  
})

router.get('/status',verifyTokenAdmin, async (req, res) => {


  // var tag1 = new TagGroup({
  //   name:"Męskie",
  //   children:["T-shirty","Spodnie","Koszule"],
  // });
  // tag1.save().catch(err => console.log(err));

  // var tag2 = new TagGroup({
  //   name:"Damskie",
  //   children:["T-shirty","Spódnice","Sukienki"],
  // });
  // tag2.save().catch(err => console.log(err));

  // var tag3 = new TagGroup({
  //   name:"Dziecięce",
  //   children:["T-shirty","Spodnie","Śpiochy"],
  // });
  // tag3.save().catch(err => console.log(err));

  // var tag4 = new TagGroup({
  //   name:"Tagi Specjalne",
  //   children:["Lato 2020: -30%","Lato 2020: -50%","Okazja!"],
  // });
  // tag4.save().catch(err => console.log(err));

   res.json({data:req.authData.user});
  
  
  });

module.exports = router;