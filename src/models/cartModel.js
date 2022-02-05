const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const cartSchema = new mongoose.Schema({

    userId: {
       type: ObjectId, 
       ref:'myUser'
    },

  items: [{
    productId: {
        type: ObjectId, 
        ref:'myProduct',
        required: "ProductId Required"
    },

    quantity: {
       type: Number,
       required: "Quantity Required"
    }
  }],
  totalPrice: {
    type: Number, 
   required: "TotalPrice Required"
  },

  totalItems: { 
      type: Number, 
     required: "TotalItems Required"
 },
  

}, {timestamps:true})

module.exports = mongoose.model('myCart',cartSchema)

