const express = require('express');
const db = require('quick.db');

const emailTable = new db.table("email");
const usernameTable = new db.table("username");
const userTable = new db.table("user");

const SHA256 = require("crypto-js").SHA256;

String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

const router= express.Router();

router.use((req,res,next)=>{
    if(req.body){
        const password = req.body.password;
        if(password)req.body.password = SHA256(password).toString();

        const email = req.body.email;
        if(email)req.body.email = email.replaceAll(".", "%dot%");

        const username = req.body.username;
        if(username)req.body.username = username.replaceAll(".", "%dot%");

        const parametr = req.body.parametr;
        if(parametr)req.body.parametr = parametr.replaceAll(".", "%dot%");
    }else{
        req.body={};
    }

    console.log(req.body)

    next();
});

const userExistAlready = async (email,username) => {
    const userData = await emailTable.get(email);
    if(userData)return {result:true,used:"email"};
    const usernameUsed = await usernameTable.get(username);
    if(usernameUsed)return {result:true,used:"username"};

    return {result:false,used:null};
};

const loginAccountCheck = async (parametr) => {
    const email = await emailTable.get(parametr);
    const username = await usernameTable.get(parametr);

    if(!email && !username)return {result:false};

    const data = await userTable.get(email || username);
    return {result:true,data:data};
};

const saveUserData = async (email,username,password,req) => {
    const uuid = uuidv4();
    await emailTable.set(email, uuid);
    await usernameTable.set(username, uuid);
    await userTable.set(uuid, {
        email: email,
        username: username,
        password: password,
        uuid: uuid
    });
    req.session.user = {email,username,password,uuid};
};

router.route('/')
    .get((req,res)=>{
        return res.send({error:true,message:"Wrong method of request used, POST required."});
    })
    .post((req,res)=>{
        if(!req.session.user)return res.send({error:false,message:"The user is not logged in.",bool:0});
        return res.send({error:false,message:"The user is logged in.",bool:1});
    });

router.route('/login')
    .get((req,res)=>{
        return res.send({error:true,message:"Wrong method of request used, POST required."});
    })
    .post(async (req,res)=>{
        if(req.session.user)return res.send({error:true,message:"User loged in already."});
        if(!req.body.parametr || !req.body.password)return res.send({error:true,message:"Missing parametrs."});
        
        const data = await loginAccountCheck(req.body.parametr);
        if(data.result == false)return res.send({error:true,message:"Account not found with this parametr."});
        console.log(data.data)
        if(data.data.password != req.body.password)return res.send({error:true,message:"Wrong password."});

        req.session.user = data.data;
        return res.send({error:false});
    });

router.route('/register')
    .get((req,res)=>{
        return res.send({error:true,message:"Wrong method of request used, POST required."});
    })
    .post(async (req,res)=>{
        if(!req.body.email || !req.body.password || !req.body.username)return res.send({error:true,message:"Parametrs missing."});

        const userExist = await userExistAlready(req.body.email, req.body.username);
        if(userExist.result == true){
            if(userExist.used == "username")return res.send({error:true,message:"Username already taken."});
            if(userExist.used == "email")return res.send({error:true,message:"Email already taken."});
            return res.send({error:true,message:"One of the parametrs already taken."});
        }

        await saveUserData(req.body.email, req.body.username, req.body.password, req);
        return res.send({error:false});
    });

router.route('/db')
    .get(async(req,res)=>{
        return res.send([userTable.all(), emailTable.all(), usernameTable.all()]);
    });

router.route('/session')
    .get(async(req,res)=>{
        return res.send(req.session);
    });

module.exports = router;
