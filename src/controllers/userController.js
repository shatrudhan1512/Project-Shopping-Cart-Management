const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

const userModel = require('../models/userModel')
const awsFunction = require('../controllers/awsControllers')
const validator = require('../validation/validator');
const cartModel = require('../models/cartModel')

const validNumberRegex = /\d+/
const validIndianMobileRegex = /^[0]?[789]\d{9}$/


const registerUser = async (req, res) => {

    try {
        let data = req.body
        let files = req.files;
        const { fname, lname, email, phone, password, address } = data

        if (!validator.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters.. Please Provide User Details" })
        }

        if (!validator.isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please Provide First Name" })
        }

        if (!validator.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please Provide last Name" })
        }

        if (!validator.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please Provide Email" })
        }


        if (!validator.isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please Provide Phone" })
        }

        if (!validator.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please Provide Password " })
        }

        if (!validator.isValid(address)) {
            return res.status(400).send({ status: false, message: "Please Provide Address" })
        }

        if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim()))) {
            return res.status(400).send({ status: false, message: `Enter a valid email address` })
        }
        if(!validator.isValidPassword(password)){
            return res.status(400).send({status: false,message: "Password length should be between 8 & 15 "});
        }
        if (isNaN(Number(phone)) || !validNumberRegex.test(phone)) {
            return res.status(400).send({ status: false, message: String(phone) + ' should be a valid number' })
        }

        if (!validIndianMobileRegex.test(phone)) {
            return res.status(400).send({ status: false, message: String(phone) + ' should be a valid Indian mobile number' })
        }

        const isAlreadyUsed = await userModel.findOne({email,phone})
        if(isAlreadyUsed) {
            return res.status(400).send({ status: false, message: `Email or phone is Already used` })
        }

        if (files && files.length > 0) {

            let uploadedFileURL = await awsFunction.uploadFile(files[0]);
            data.profileImage = uploadedFileURL;

            // generate salt to hash password
            const salt = await bcrypt.genSalt(10);
            // now we set user password to hashed password
             data.password = await bcrypt.hash(data.password, salt);

            const savedData = await userModel.create(data);
            return res.status(201).send({ status: true, message: "Successfully Created", data: savedData });

        } else {
            return res.status(404).send({ status: false, message: "Select an Image File" })
        }

    }
    catch (err) {
        return res.status(500).send({ status: false, "message": err.message })
    }

}

const Login = async (req, res) => {
    try{
        const mEmail = req.body.email;
        const mPassword = req.body.password;

        if (!validator.isValidRequestBody(req.body)) {
            return res.status(400).send({ status: false, message: "Invalid request parameters.. Please Provide User Details" })
        }
        if (!validator.isValid(mEmail)) {
            return res.status(400).send({ status: false, message: "Please Provide Email id" })
        }

        if (!validator.isValid(mPassword)) {
            return res.status(400).send({ status: false, message: "Please Provide Password" })
        }

        let user = await userModel.findOne({email: mEmail})
    
        if(user) {

            const _id= user._id
            const name= user.fname
            const password= user.password

            const validPassword = await bcrypt.compare(mPassword, password)

            if(!validPassword){
                return res.status(400).send({status: false, message:" Invalid password"})
            }
            let payload = { userId: _id}
            const generatedToken = jwt.sign(payload, "Exodus", {expiresIn: '90m'})

            res.header('user-login', generatedToken)

            return res.status(200).send({status: true, message: name + ", You have  logged in successfully", userId: user._id, token: generatedToken})
        }else{
            return res.status(400).send({status:false,message: "Oops...Invalid Credentials"})
        }
    }
    catch(err){
        return res.status(500).send({ status: false, "message": err.message})
    }
}



const getUserData = async function (req, res) {
    
    try {
        const userId = req.params.userId
        

        if (!validator.isValidObjectId(userId)) {
            res.status(400).send({ status: false, msg: `Invalid userId` })
            return
        }


        let userDetail = await userModel.findOne({ _id: userId})
        if(!userDetail){
            res.status(400).send({status:false, message: `No user exist with this ${userId}`})
        }

        const userCart = await cartModel.findOne({userId: userId})
        if(userCart) userDetail.cartId = userCart._id

        res.status(200).send({ status: true, message: `Successlly fetched user details`, data: userDetail })
    } catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}


const updateUserData = async function (req, res) {
  
    try{
        const requestBody = req.body
        const files = req.files
        const userId = req.params.userId
        const { fname, lname, email, phone, password, address } = requestBody
        

        if(!validator.isValidObjectId(userId)){
            return res.status(400).send({ status: false, message: `Invalid UserId` })            
        }

        const userFound = await userModel.findOne({ _id: userId})
        if(!userFound){
            return res.status(400).send({ status: false, message: `No user exist` })            
        }

        if(req.userId != userId) {
            return res.status(400).send({ status: false, msg: `Unauthorised Access` })
        }
       

        let obj = {}
        if(requestBody || files ) {

          if(fname) {
            obj.fname =fname
          }

          if(lname) {
            obj.lname =lname
          }

          if(email) {
            if (!validEmailFormatRegex.test(email)) {
                return res.status(400).send({ status: false, message: email + " is not a valid email address" })
            }
            
            const isEmailAlreadyUsed = await userModel.findOne({ email: email });
            if (isEmailAlreadyUsed) {
                return res.status(400).send({ status: false, message: `${email} email address is already registered` })
            }

            obj.email =email
          }
          if(phone) {
            if (isNaN(Number(phone)) || !validNumberRegex.test(phone)) {
                return res.status(400).send({ status: false, message: `${phone} should be a valid number` })
            }
            
            if (!validIndianMobileRegex.test(phone)) {
                return res.status(400).send({ status: false, message: `${phone} should be a valid Indian mobile number` })
            }

            const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });

            if (isPhoneAlreadyUsed) {
                return res.status(400).send({ status: false, message: `${phone} phone number is already registered` })
            }
            obj.phone =phone
          }
          if(password) {
            if(!validator.isValidPassword(password)){
                return res.status(400).send({status: false, message: "Password lenght must be between 8 to 15 char long"});
            }

           const salt = await bcrypt.genSalt(10);
           const ePassword = await bcrypt.hash(password, salt);

            obj.password = ePassword 
          }

          if(files && files.length>0) {
            const imageUrl = await awsFunction.uploadFile(files[0])
            obj.profileImage =imageUrl
          }
          if(address){

            if(address.shipping){
  
              if(address.shipping.street){
                  
                  obj["address.shipping.street"] = address.shipping.street
              }
          
                if(address.shipping.city){
                
                  obj["address.shipping.city"]=address.shipping.city
              }
          
              if(address.shipping.pincode){
                
                  obj["address.shipping.pincode"] = address.shipping.pincode
              }
  
            }
  
            if(address.billing){
  
              if(address.billing.street){
  
                  obj["address.billing.street"] = address.billing.street
              }
              
              if(address.billing.city){
                
                  obj["address.billing.city"] = address.billing.city
              }
          
              if(address.billing.pincode){

                  obj["address.billing.pincode"] = address.billing.pincode
              }
  
            }
        }
            }
  
        const updatedData = await userModel.findOneAndUpdate({_id:userId}, obj,{new:true})

        return res.status(200).send({ status: true, message: `Successlly updated user details`, data: updatedData })
    }
  
    catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
  }



module.exports = { registerUser,Login, getUserData, updateUserData}