const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({


    title: { 
         type: String, 
         required: "Title is Required",
         unique: true 
        },

    description: { 
        type: String, 
        required: "Description is Required"
    },
    price: { 
        type: Number, 
    required: "price is Required", 
    },

    currencyId: { 
        type: String, 
        required: "CurrencyId is Required" 
     },

    currencyFormat: { 
        type: String, 
        required: "CurrencyFormat is Required"
    },

    isFreeShipping: { 
        type: Boolean,
         default: false
     },
    productImage: { 
        type: String 
    },

    style: { type: String},

    availableSizes: {
        type: [String],
        enum:["S", "XS", "M", "X", "L", "XXL", "XL"]
        },

    installments: { type: Number },

    deletedAt: {type: Date, default:null},

    isDeleted: { 
        type: Boolean, 
        default: false 
    },
   
      
}, {timestamps:true})

module.exports = mongoose.model('myProduct',productSchema)