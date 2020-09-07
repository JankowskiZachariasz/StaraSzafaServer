require("dotenv").config();
const Cloth = require('./models/Cloth');
const mongoose = require('mongoose');

function main(){
    connectToDB()
    .then(uploadClothes(process.argv))
    .catch(err=>console.log(err));
    
}

function connectToDB(){
    return new Promise((resolve,reject)=>{
        const url = process.env.url;
        mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, (err) => { 
            
            if(err)reject("couldn't conect to db");
            else resolve("connected");
        
        });
    })
}

async function uploadClothes(c){
    
    
        await c.splice(0, 2);
        {
        await c.map(async(cc)=>{
            const data = JSON.parse(cc); 
            // console.log(data);
            const cloth = new Cloth({
            status:data.status,
            photos:data.photos,
            tags: data.tags,
            name: data.name,
            price: data.price,
            code: data.code,
            size: data.size,
            brand: data.brand,
            fabric: data.fabric,
            shopId: data.shopId,
            reservationId: "",
            dateAdded:data.dateAdded,
         });
        cloth.save(()=>{process.exit(1)})
        });
        
    }
    
}

main();