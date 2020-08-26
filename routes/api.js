const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Cloth = require('../models/Cloth');
const Banner = require('../models/Banner');
const Branch = require('../models/Branch');
const Notifications = require('../models/Notifications');
const Registration = require('../models/Registration');
const Reservation = require('../models/Reservation');
const ReservationArchived = require('../models/ReservationArchived');
const { ensureAuthenticated, forwardAuthenticated } = require('./middleware/auth');
const { verifyToken, verifyTokenAdmin  } = require('./middleware/verifyToken');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport(
  {
    service: 'gmail',
    auth: {
      user: 'staraszafa.lubawa@gmail.com',
      pass: 'APOllo11'
    }
  }
);


let codeVerificationEmail = (code, email, FirstName) => {
  return {
    from: 'staraszafa.lubawa@gmail.com',
    to: email,
    subject: 'Twój kod do rejestracji na StaraSzafa.info',
    text: ("Witaj " + FirstName + "! Użyj poniższego kodu w drugim kroku rejestracji:\n" + code + "\n\n\nStara Szafa\nEwa Witt\nRynek 11\n14-260 Lubawa\n"),
    html: ('<div style="background-color: #9af9dc; padding: 30px;"><h3 style="text-align: left;"><span lang="PL" style="mso-ansi-language: PL;"><span style="font-weight: normal;">Witaj ' + FirstName + '! Użyj poniższego kodu w drugim kroku rejestracji:</span></span></h3><h2 style="text-align: left;"><b><span lang="PL" style="font-size: 26pt; line-height: 107%; mso-ansi-language: PL;">' + code + '</span></b></h2><p class="MsoNormal"><b><span lang="PL" style="font-size: 26pt; line-height: 107%; mso-ansi-language: PL;"><br /></span></b></p><h3 style="text-align: left;"><div class="separator" style="clear: left; float: left; margin-bottom: 1em; margin-right: 1em; text-align: center;"><img border="0" data-original-height="137" data-original-width="89" height="138" src="https://i.ibb.co/PC5cwr2/Logo.png" width="89" />&nbsp; &nbsp;</div></h3><p style="text-align: left;"><font size="3" style="font-weight: normal;"><br /></font></p><p style="text-align: left;"><font size="3" style="font-weight: normal;">Stara Szafa<br /></font><font size="3" style="font-weight: normal;">Ewa Witt<br /></font><font size="3" style="font-weight: normal;">Rynek 11<br /></font><font size="3" style="font-weight: normal;">14-260 Lubawa</font></p></div>'),
  }
}

let paswordRemindEmail = (code, email, FirstName) => {
  return {
    from: 'staraszafa.lubawa@gmail.com',
    to: email,
    subject: 'Odzyskiwanie hasła na StaraSzafa.info',
    text: ("Witaj " + FirstName + "! Ten kod będzie Ci potrzebny w procesie odzyskiwania hasła:\n" + code + "\n\n\nStara Szafa\nEwa Witt\nRynek 11\n14-260 Lubawa\n"),
    html: ('<div style="background-color: #9af9dc; padding: 30px;"><h3 style="text-align: left;"><span lang="PL" style="mso-ansi-language: PL;"><span style="font-weight: normal;">Witaj ' + FirstName + '! Ten kod będzie Ci potrzebny w procesie odzyskiwania hasła:</span></span></h3><h2 style="text-align: left;"><b><span lang="PL" style="font-size: 26pt; line-height: 107%; mso-ansi-language: PL;">' + code + '</span></b></h2><p class="MsoNormal"><b><span lang="PL" style="font-size: 26pt; line-height: 107%; mso-ansi-language: PL;"><br /></span></b></p><h3 style="text-align: left;"><div class="separator" style="clear: left; float: left; margin-bottom: 1em; margin-right: 1em; text-align: center;"><img border="0" data-original-height="137" data-original-width="89" height="138" src="https://i.ibb.co/PC5cwr2/Logo.png" width="89" />&nbsp; &nbsp;</div></h3><p style="text-align: left;"><font size="3" style="font-weight: normal;"><br /></font></p><p style="text-align: left;"><font size="3" style="font-weight: normal;">Stara Szafa<br /></font><font size="3" style="font-weight: normal;">Ewa Witt<br /></font><font size="3" style="font-weight: normal;">Rynek 11<br /></font><font size="3" style="font-weight: normal;">14-260 Lubawa</font></p></div>'),
  }
}

router.post('/getReservations', verifyToken, async (req, res) => {


  await Reservation.find({reserver: req.authData.user._id},async function (err, c) {

    await ReservationArchived.find({reserver: req.authData.user._id},async function (err, b) {
      var resActive=c.map(cc=>{return(cc.cloth)});
      var resArchived=b.map(bb=>{return(bb.cloth)});
      await Cloth.find({_id: { $in : resActive.concat(resArchived) }},async function (err, cloths) {
        var branchIds=cloths.map(cl=>{return(cl.shopId)})
        await Branch.find({_id: { $in : branchIds }},async function (err, shops) {
          res.json({success: true, reservations: c, reservationsArchived: b, cloths, shops, user: {
            FirstName:req.authData.user.FirstName,
            email:req.authData.user.email,
            name:req.authData.user.name,
            date:req.authData.user.date,
            limit:req.authData.user.limit,
          }});
        }).catch(err=>{console.log(err);res.json({success: false});})
    }).catch(err=>{console.log(err);res.json({success: false});})
  }).catch(err=>{console.log(err);res.json({success: false});})
}).catch(err=>{console.log(err);res.json({success: false});})
 
});

router.post('/getReservation', verifyToken, async (req, res) => {

  var data = JSON.parse(req.body);
  var reservation = await Reservation.findOne({ _id: data._id, reserver: req.authData.user._id}).catch((err) => { res.json({success: false}); console.log(err); });
  if(reservation==null)
  reservation = await ReservationArchived.findOne({$or:[{_id: data._id, reserver: req.authData.user._id},{oldId: data._id, reserver: req.authData.user._id}] }).catch((err) => { res.json({success: false}); console.log(err); });
  if(reservation==null)res.json({success: false});
  const cloth = await Cloth.findOne({ _id: reservation.cloth }).catch((err) => { res.json({success: false}); console.log(err); });
  if(cloth==null)res.json({success: false});
  address="";
  await Branch.find({},async function (err, br) {
    br.map(b=>{
      if(b._id==cloth.shopId)
      address=b.address;
      res.json({success: true,reservation,cloth,address, surname: req.authData.user.name});
    })
  }).catch((err) => { res.json({success: false}); console.log(err); });
  
});

router.post('/getNotifications', verifyToken, async (req, res) => {
  
  await Notifications.find({userId:req.authData.user._id},async function (err, nt) {
    var cp = nt;
    res.json({array:cp});
    //mark all as read
    nt.map(n=>{
      if(n.read==false){
        n.read=true;
        n.save().catch(err => console.log(err));
      }
      

    })
}) 
});

router.post('/reserve', verifyToken, async (req, res) => {
  var data = JSON.parse(req.body);
  const cloth = await Cloth.findOne({ _id: data.clothId }).catch((err) => { console.log(err); });
  if(cloth!=null){
    if(cloth.status==2){
      await Reservation.find({reserver: req.authData.user._id},async function (err, c) {
        if(c.length<req.authData.user.limit){

        let date_ob = new Date();
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let hours = date_ob.getHours();
        let minutes = ("0" + date_ob.getMinutes()).slice(-2);
        let seconds = ("0" + date_ob.getSeconds()).slice(-2);

        var d1 = new Date();
        var d = d1.getDay();
        var howManyDays=3;//this value might be adjusted in the future
        if(d==4||d==5||d==6)howManyDays++;
        d1.setDate(d1.getDate() + howManyDays);
        let dateD1 = ("0" + d1.getDate()).slice(-2);
        let monthD1 = ("0" + (d1.getMonth() + 1)).slice(-2);
        let yearD1 = d1.getFullYear();


          const reser = new Reservation({
            status: "1",
            cloth: cloth._id,
            reserver: req.authData.user._id,
            reservee: "",
            lastEventDate: (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds),
            ExpiryDate: (yearD1 + "-" + monthD1 + "-" + dateD1),
            shopId:cloth.shopId,
          });

          await reser.save().catch(err => console.log(err));
          cloth.status="3";
          const newRes = await Reservation.findOne({ cloth: cloth._id }).catch((err) => { console.log(err); });
          cloth.reservationId=newRes._id;
          await cloth.save().catch(err => console.log(err));

          var primary =""
      cloth.photos.map((photo, m)=>{
        if(photo.primary){
          var o=photo.file.length;
          primary=photo.file.slice(0,o-4)+"_sm.jpg";
        }
      });

         const n = new Notifications({
          read: false,
          userId: req.authData.user._id,
          text: "Wysłano prośbę o rezerwację!",
          photo: primary,
          date: (year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds),
          reservationId:newRes._id,
        })
        n.save().catch(err => console.log(err));

          res.json({success:"1"})

        }
        else
        res.json({success:"0"})
        
       
        

      });




    }
    else
  res.json({success:"0"})

  }
  else
  res.json({success:"0"})
  
});

router.post('/reservationquerry', async (req, res) => {
  var address="";
  var ValidTill="";
  var d1 = new Date();
                var d = d1.getDay();
                var howManyDays=3;//this value might be adjusted in the future
                if(d==4||d==5||d==6)howManyDays++;
                d1.setDate(d1.getDate() + howManyDays);
                var month = "stycznia";
                switch(d1.getMonth()+1){
                    case(1):{month="stycznia";break;}
                    case(2):{month="lutego";break;}
                    case(3):{month="marca";break;}
                    case(4):{month="kwietnia";break;}
                    case(5):{month="maja";break;}
                    case(6):{month="czerwca";break;}
                    case(7):{month="lipca";break;}
                    case(8):{month="sierpnia";break;}
                    case(9):{month="września";break;}
                    case(10):{month="października";break;}
                    case(11):{month="listopada";break;}
                    case(12):{month="grudnia";break;}
                }
                ValidTill = (d1.getDate()+" "+month+" "+d1.getFullYear());

  var data = JSON.parse(req.body);
  var you=false;
  const cloth = await Cloth.findOne({ _id: data._id }).catch((err) => { console.log(err); });
      if(cloth.status==2){
        await Branch.find({},async function (err, br) {
          br.map(b=>{
            if(b._id==cloth.shopId)
            address=b.address;
          })
        });
        //checking the user's relation to cloth
        const bearerHeader = req.headers['token'];
        
        if (typeof bearerHeader !== 'undefined') {
          // console.log("wtf");
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        
        jwt.verify(bearerToken, 'secretkey', async (err, authData) => {
          
          if(!err){
            
            await Reservation.find({reserver: authData.user._id},async function (err, c) {
              
              if(c.length<authData.user.limit){

                var surname = authData.user.name;

                
                //var d1 = new Date();
                

                res.json({response:1, ValidTill, address, surname, id:cloth._id});
              }
              
              else
              res.json({response:2});
              

            });
          }
          else//noname
          res.json({response:4,ValidTill, address, id:data._id});
          
          
        });
        
        }
      }
      else
      res.json({response:3});
  

  
});

router.post('/cloth', async (req, res) => {
  var data = JSON.parse(req.body);
  var you=false;
  const cloth = await Cloth.findOne({ _id: data._id }).catch((err) => { res.json({success: false}); console.log(err); });
  
      if(cloth.status==1||cloth.status==2||cloth.status==3||cloth.status==4){
        
        //checking the user's relation to cloth
        const bearerHeader = req.headers['token'];
        console.log(-1)
        if (typeof bearerHeader !== 'undefined') {
    
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
    
        console.log(0)
        jwt.verify(bearerToken, 'secretkey', async (err, authData) => {
          console.log(1)
          if(!err){
            console.log(2)
            const r = await Reservation.findOne({ _id: cloth.reservationId}).catch((err) => { console.log(err); });
            if(r!=null)
            {
              console.log(3)
              if(r.reserver==authData.user._id)
              you=true;
              console.log(you)
            }
            res.json({...cloth._doc,you:you, success: true});
          }
          else{
            res.json({...cloth._doc,you:you, success: true});
          }
        });
        }else
        res.json({...cloth._doc,you:you, success: true});
      }
      else
      res.json({...cloth._doc,you:you, success: false});

  
});

router.post('/clothes', async (req, res) => {
  var data = JSON.parse(req.body);
  await Cloth.find({shopId:data._id, status:"2"},async function (err, c) {

  

    var processed=c.map((element, l)=>{
      var primary =""
      element.photos.map((photo, m)=>{
        if(photo.primary){
          var o=photo.file.length;
          primary=photo.file.slice(0,o-4)+"_sm.jpg";
        }
      });
      return({
        tags:element.tags,
        price:element.price,
        photo:primary,
        name:element.name,
        _id:element._id,
        status:element.status,
        size: element.size});

    });
    res.json({onSale:processed});


})

  
});

router.post('/login', (req, res) => {

  var data = JSON.parse(req.body);


  User.findOne({
    email: data.email
  }).exec(function (err, user) {

    if (err || typeof user === 'undefined' || user == null) res.sendStatus(403);
    else {
      bcrypt.compare(data.password, user.password, (err, isMatch) => {
        if (err) res.sendStatus(500);
        if (isMatch) {

          jwt.sign({ user }, 'secretkey', { expiresIn: '1 day' }, (err, token) => {

            if (err) res.sendStatus(500);
            if(user.AdminStatus){ res.json({ token: token, username: data.email, status:2 }) }
            else res.json({ token: token, username: data.email, status: 1 });

          });
        }
        else { res.sendStatus(403); }
      });
    }
  });
});

router.post('/status', async (req, res) => {

  //read the current  banner
  var banner;
  var branch;
  var notifications;
  await Banner.find({},async function (err, b) {
    banner=b.map((e,i)=>{return({destinationTag:e.destinationTag,firstLine:e.firstLine,SecondLine:e.SecondLine})})
    
    //read available branches
    await Branch.find({},async function (err, br) {
      branch=br.map((e,i)=>{return({address:e.address,shortName:e.shortName, _id: e._id})})

      const bearerHeader = req.headers['token'];

      if (typeof bearerHeader !== 'undefined') {
    
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
    
        jwt.verify(bearerToken, 'secretkey', async (err, authData) => {
          
          if (err) { res.json({ 
            status: 0, 
            email: "guest",
            banner: banner,
            branch: branch, }) }
          else {

            //1 or 2 - so we check the notifications
            await Notifications.find({userId:authData.user._id},async function (err, nt) {
              var counter=0
              nt.map(n=>{
                if(!n.read)counter++;
              })
              

              if(authData.user.AdminStatus){ 

                var reqCount=0;
                var reservedCount=0;
                var historyCount=0;
                await Admin.findOne({ userId: authData.user._id }).exec(async function (err, admin) {
                  await Reservation.find({shopId: admin.BranchId },async function (err, rA) {
                    await ReservationArchived.find({shopId: admin.BranchId },async function (err, rR) {
                      rA.concat(rR).map(a=>{
                        if(a.status==1)reqCount++;
                        else if(a.status==2)reservedCount++;
                        else historyCount++;
                      });
                      res.json({ 
                        adminCounts:{reqCount,reservedCount,historyCount},
                        status: 2, 
                        email: authData.user.email,
                        banner: banner,
                        branch: branch,
                        notifications: counter,
                        }) 
                    }).catch(err=>{console.log(err);res.json({success: false});})
                }).catch(err=>{console.log(err);res.json({success: false});})
                })


                
                }
              else { res.json({ 
                status: 1, 
                email: authData.user.email,
                banner: banner,
                branch: branch,
                notifications: counter,}) }
            })
            
            


          }
        });
      } else {
        
        { res.json({ 
          status: 0,
          email: "guest",
          banner: banner,
          branch: branch, }) }
      }



    });
  });




});

router.post('/register', async (req, res) => {


  var data = JSON.parse(req.body);


  //email validation
  const sameEmail = await User.findOne({ email: data.email }).catch((err) => { console.log(err); });
  if (typeof sameEmail === 'undefined' || sameEmail == null) {

    //delete previous codes
    await Registration.findOne({ email: data.email }).exec(function (err, c) {

      if (err) {
        console.log(err);
        res.sendStatus(404);
      }
      else if (c != null)
        c.deleteOne().catch((err) => { console.log(err) });
    });

    //generating code
    var code = Math.round(Math.random() * 1000000);

    //creating entry in db
    const newRegistration = new Registration({
      FirstName: data.FirstName,
      LastName: data.name,
      email: data.email,
      code: code,
    });
    //const res = Registration.deleteMany({email:data.email},()=>{});
    newRegistration.save().catch(err => console.log(err));

    //sending an email
    transporter.sendMail(codeVerificationEmail(code, data.email, data.FirstName), function (err, data) {
      if (err)
        console.log(err)
      else {
        console.log("Sent!");
        res.json({ emailOk: true, emailSent: true });
      }
    })

  }
  else { res.json({ emailOk: false, emailSent: false }) }

});

router.post('/createaccount', async (req, res) => {

  const newUser = new User({
    AdminStatus: false,
    PasswordRemindCode: "814377",
    FirstName: "",
    name: "",
    email: "",
    password: "",
  });

  var data = JSON.parse(req.body);
  await Registration.findOne({ email: data.email }).exec(function (err, c) {

    if (err) {
      console.log(err);
      res.json({ success: false, error: 1 });//didn't go through the phase 1 of registration process
    }
    else {
      newUser.name = c.LastName;
      newUser.FirstName = c.FirstName;
      newUser.email = c.email;

      if (data.code == c.code) {

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(data.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => {
                jwt.sign({ user }, 'secretkey', { expiresIn: '2 days' }, (err, token) => {

                  if (err) res.sendStatus(500);
                  else res.json({ success: true, error: 0, token: token, username: data.email, status: "logged-in" });//OK

                });

                // res.json({success: true, error: 0 });
              })
              .catch(err => console.log(err));
          });
        });



      }
      else {
        res.json({ success: false, error: 2 });//code didn't match
      }
    }

  });


});

router.post('/remindpassword', async (req, res) => {


  var data = JSON.parse(req.body);
  await User.findOne({ email: data.email }).exec(function (err, c) {

    if (err) {
      console.log(err);
      res.json({ success: false });//account doesn't exist
    }
    else if (c != null && typeof c != undefined) {


      //generating code
      var code = Math.round(Math.random() * 1000000);

      //saving code
      c.PasswordRemindCode = code;
      c.save().catch(err => console.log(err));


      transporter.sendMail(paswordRemindEmail(code, data.email, c.FirstName), function (err, data) {
        if (err) {
          console.log(err);
          res.json({ success: false });
        }
        else {
          console.log("Sent!");
          res.json({ success: true });
        }
      });
    }
    else {
      res.json({ success: false });
    }

  });
});

router.post('/newpassword', async (req, res) => {


  var data = JSON.parse(req.body);
  await User.findOne({ email: data.email }).exec(function (err, c) {

    if (err) {
      console.log(err);
      res.json({ success: false, username: "", token: "" });//account doesn't exist
    }
    else if (c != null && typeof c != undefined) {

      if(data.code==c.PasswordRemindCode){

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(data.newPassword, salt, (err, hash) => {
            if (err) throw err;
            c.password = hash;
            c.save()
              .then(user => {
                jwt.sign({ user }, 'secretkey', { expiresIn: '2 days' }, (err, token) => {

                  if (err) res.sendStatus(500);
                  else  res.json({ success: true, username: c.email, token: token });//OK

                });

                // res.json({success: true, error: 0 });
              })
              .catch(err => console.log(err));
          });
        });

      }
      else{
        res.json({ success: false, username: "", token: "" });//codes dont match
      }
    }

  });
});



// FORMAT OF TOKEN
// Authorization: Bearer <access_token>



module.exports = router;