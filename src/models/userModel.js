const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({

  fname: {
    type: String, 
    required: "First name is Required",
    trim: true
    },

  lname: {
    type: String, 
    required: "Last name is Required",
    trim: true
    },

  email: {
    type: String, 
    required: "Email is Required", 
    unique:true,
    trim:true,
    lowercase:true
  },

  profileImage: {
      type: String
    }, 

  phone: {
    type: String, 
    required: "Phone is Required", 
    unique:true,
    trim:true
    }, 

  password: {
    type: String, 
    required: "Password is Required"
    },


  address: {
    shipping: {
      street: {
        type: String, 
        required: "Street is Required"
        },
      city: {
        type: String, 
        required: "City is Required"
        },
      pincode: {
        type: Number,
        required: "Pincode is Required"
        }
    },
    billing: {
        street: {
        type: String, 
        required: "Street is Required"
      },
    city: {
        type: String, 
        required: "City is Required"
      },
      pincode: {
        type: Number, 
        required: "Pincode is Required"
      }
    }
  },
 
},{timestamps:true});

module.exports = mongoose.model('myUser',userSchema)