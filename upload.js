require("dotenv").config();
const Cloth = require('./models/Cloth');
const mongoose = require('mongoose');
const {request} = require('http');
const FormData = require('form-data');
const { createReadStream } = require('fs');
const cp = require("child_process");
const path = require("path");


async function main(){
    connectToDB()
    .then(getClothes)
    .then((c)=>iterateClothes(c))
    .then(c=>{console.log("Done!");})
    
} 

function connectToDB(){
return new Promise((resolve,reject)=>{
    const MONGO_USERNAME = process.env.MONGO_USERNAME;
    const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
    const MONGO_HOSTNAME = '127.0.0.1';
    const MONGO_PORT = '27017';
    const MONGO_DB = 'StaraSzafaLocal';
    const url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;
    mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => { 
        
        if(err)reject("couldn't conect to db");
        else resolve("connected");
    
    });
})
}
function getClothes(){
    return new Promise((resolve,reject)=>{
        Cloth.find({$or:[{status: "1"},{status: "2"}] },async function (err, c) {
            if(err)reject("could't pull clothes from the db")
            resolve(c);
        })
    })
}
async function iterateClothes(c){
    return new Promise(async(resolve,reject)=>{
        let cloths=[];
        await console.log("Getting an acces token")
        getToken().then(async(token)=>{
            console.log("SUCCESS: "+token);
            

            for(var i=0;i<c.length;i++){
                const cloth= c[i];
                console.log('Uploading clothes - '+(i+1)+"/"+c.length);
            let photos=[];
            await cloth.photos.map(p=>{
                if(p.primary)
                photos.push(p.file.slice(0,p.file.length-4)+"_sm.jpg"); 
                photos.push(p.file);
            });
            var newNames=[];
            await uploadPhotos(photos, token).then(arr=>{newNames=arr});
            {
            //adding the small photo
            
                console.log(photos);

            var newPhotos= cloth.photos.map((e)=>{
                
                //find a match
                var newNameForThisOne="";
                newNames.map(n=>{
                    if(n.slice(n.length-14,n.length)==e.file.slice(e.file.length-14,e.file.length))
                    newNameForThisOne=n;
                });
                return({
                    file:newNameForThisOne,
                    primary:e.primary,
                })
            });

            
            var forReturn={
                status:cloth.status,
                photos:newPhotos,
                tags:cloth.tags,
                name:cloth.name,
                price:cloth.price,
                code:cloth.code,
                size:cloth.size,
                brand:cloth.brand,
                fabric:cloth.fabric,
                shopId:cloth.shopId,
                reservationId:cloth.reservationId,
                dateAdded:cloth.dateAdded};
                //uploading to another DB
                var clothForChild = JSON.stringify(forReturn)
                cloths.push(clothForChild);
                var child = cp.fork("finalise.js",[clothForChild,], {cwd:"./"})
                child.on("exit", ()=>{
                    console.log("Cloth "+(i)+" Added!!");
                    })
                //time to delete old entry
                if(i+1==c.length)resolve(cloths);
                
            }
            }
        
        });
        
    })
}
async function getToken(){
    return new Promise((resolve,reject)=>{
        const req = request(
            {
                host: 'staraszafa.info',
                port: '80',
                path: '/api/login/',
                method: 'POST',
                headers: {"Content-Type": "application/json", Accept: "application/json"},
            },
            response => {
                
                const chunks = [];
                response.on('data', (chunk) => {
                  chunks.push(chunk);
                });
                response.on('end', () => {
                    
                  const result = Buffer.concat(chunks).toString();
                  const token = JSON.parse(result).token;
                  if(token==null)reject("couldn't get token");
                  else resolve(token);
            

                });
            }
            );
            
            req.write(JSON.stringify({
                password: "123456", 
                email: "jankowskizachariasz@gmail.com" 
            }));
            
            req.end();
    })
}
async function uploadPhotos(photos,token){
    return new Promise((resolve,reject)=>{
            
        const form = new FormData();
    
        photos.map(p=>{
            //console.log(createReadStream('./public/'+p));
            form.append('file', createReadStream('./public/'+p));
        });
        const req = request(
        {
            host: 'staraszafa.info',
            port: '80',
            path: '/uploadLocal',
            method: 'POST',

            headers: {authorization: ("b " + token),...form.getHeaders()}
        },
        response => {
            const chunks = [];
        response.on('data', (chunk) => {
            chunks.push(chunk);
          }),
          response.on('end', () => {
              
            const result = Buffer.concat(chunks).toString();
            const array = JSON.parse(result).array;
            resolve(array);
          });
        }
        );
        
        form.pipe(req);
    })
}



main();        
            

     
            
    

    
        
    
    
    //     const cloth = new Cloth({//1-beingAdded, 2-forSale, 3-reserved, (it should never be '4')4-archieved
    //     status:"1",
    //      photos:["1","2"],
    //      tags: ["1","2"],
    //      name: "nazwa",
    //      price: "cena",
    //      code: "kod",
    //      size: "rozmiar",
    //      brand: "marka",
    //      fabric: "tkanina",
    //      shopId: "id sklepu",
    //      reservationId: "",
    //      dateAdded: "13 czerwca 2019",
    //        });
    //    cloth.save().catch(err => {console.log(err);res.json({operationStatus: "error"});});
    
    