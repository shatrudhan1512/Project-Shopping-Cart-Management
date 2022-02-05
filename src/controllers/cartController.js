const productModel = require("../models/productModel");
const validator = require("../validation/validator");
const cartModel = require("../models/cartModel");
const userModel = require("../models/userModel");

const createCart = async function (req, res) {
    try {
        let userId = req.params.userId;
        const productId = req.body.items[0].productId;
        let cartInfo = req.body;

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({status: false, message: "Please Provide a Valid UserId in Params"});
        }

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please Provide a Valid ProductId" });
        }
        if (cartInfo.items[0].quantity < 1) {
            return res.status(400).send({ status: false, message: "Minimum Product Quantity 1" });
        }

        if (!(req.userId == userId)) {
            return res.status(400).send({status: false, message: "You are not authorised to update Cart"});
        }

        let cartDetail = await cartModel.findOne({ userId: userId });

        if (!cartDetail) {
            
            let totalPrice = 0;
            let items = cartInfo.items;
            let totalItems = items.length;
            if (totalItems > 1) {
                return res.status(400).send({ status: false, message: "Please Add One Product at a Time" });
            }
            let productFound = await productModel.findOne({_id: cartInfo.items[0].productId, isDeleted: false});

            if (!productFound) {
                return res.status(400).send({status: false, message: "this Product not exist or may be Deleted"});
            }

            totalPrice = productFound.price * cartInfo.items[0].quantity;

            cartInfo.userId = userId;
            cartInfo.totalItems = totalItems;
            cartInfo.totalPrice = totalPrice;

            const cartCreate = await cartModel.create(cartInfo);
            return res.status(201).send({status: true, message: "Cart Successfully Created", data: cartCreate});
        } else {

            let totalItems = cartInfo.items.length;
            if (totalItems > 1) {
                return res.status(400).send({ status: false, message: "Please Add One Product at a Time" });
            }
            let obj = {};
            obj.flag = 0;
            let len = cartDetail.items.length;
            let prodId = cartInfo.items[0].productId;
            for (let i = 0; i < len; i++) {
                if (prodId == cartDetail.items[i].productId) {
                    let cartProduct = await productModel.findOne({_id: prodId, isDeleted: false });

                    if (!cartProduct) {
                        return res.status(400).send({status: false, message: "this Product not exist or may be Deleted"});
                    }

                    cartDetail.totalPrice =
                        Number(cartDetail.totalPrice) +
                        Number(cartProduct.price) * Number(cartInfo.items[0].quantity);

                    cartDetail.items[i].quantity =
                        Number(cartDetail.items[i].quantity) +
                        Number(cartInfo.items[0].quantity);

                    obj.flag = 1;
                    cartDetail.save();
                    break;
                }
            }
            if (obj.flag === 0) {
                let productDetails = await productModel.findOne({_id: cartInfo.items[0].productId , isDeleted: false});
                if (!productDetails) {
                    return res.status(400).send({status: false, message: "this Product not exist or may be Deleted"});
                }

                cartDetail.items.push(cartInfo.items[0]);
                cartDetail.totalItems++;
                
                cartDetail.totalPrice =
                    Number(cartDetail.totalPrice) +
                    Number(productDetails.price) * Number(cartInfo.items[0].quantity);
                cartDetail.save();
            }
            return res.status(200).send({ status: true, msg: "Successful", data: cartDetail });
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const updateCart = async (req, res) => {
    try {
        let userId = req.params.userId;
        let { cartId, productId, removeProduct } = req.body;

        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({status: false, message: "Please Provide a Valid UserId in Params"});
        }

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Please Provide a Valid Cart Id" });
        }
        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please Provide a Valid productId" });
        }

        if (!(req.userId == userId)) {
            return res.status(400).send({status: false, message: "You are not authorised to update Cart"});
        }
        let cartDetail = await cartModel.findOne({ _id: cartId });
        
        if (!cartDetail) {
            return res.status(400).send({ status: false, message: "This Cart id Does Not Exist" });
        }
        let len = cartDetail.items.length;
        for (let i = 0; i < len; i++) {
            if (productId == cartDetail.items[i].productId) {
                if (removeProduct >1) {
                    return res.status(400).send({status: false, message: "Please remove product 1 by 1"});
                }
                i
                    let cartProduct = await productModel.findOne({_id: productId, isDeleted: false});
                    cartDetail.totalPrice = Number(cartDetail.totalPrice) - Number(cartProduct.price);
                    cartDetail.items[i].quantity -= 1;

                    if (cartDetail.items[i].quantity == 0) {
                        cartDetail.items.splice(i, 1);
                        cartDetail.totalItems -= 1;
                    }
                    cartDetail.save();
                    break;
            } else if(i==len-1) {
                return res.status(400).send({status: false, message: "Product not exist"});
            }
            
        }
        return res.status(200).send({ status: true, message: "Success", data: cartDetail });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const getCart = async function (req, res) {
    try {
        const cartId = req.body.cartId;
        const userId = req.params.userId;

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Please Provide a Valid cartId" });
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please Provide a Valid UserId" });
        }
        if (req.userId != userId) {
            return res.status(401).send({ status: false, message: "unauthorised access" });
        }

        const cartFound = await cartModel.findOne({ _id: cartId });
        if (!cartFound) {
            return res.status(400).send({ status: false, message: "cart does not exist" });
        }

        return res.status(200).send({status: true, message: "successfully fetched Cart Details", data: cartFound });
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

const deleteCart = async function (req, res) {
    try {
        const userId = req.params.userId;
        const cartId = req.body.cartId;

        if (!validator.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Please Provide a Valid cartId" });
        }
        if (!validator.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please Provide a Valid UserId" });
        }

        const cartFound = await cartModel.findOne({ _id: cartId });
        if (!cartFound) {
            return res.status(400).send({ status: false, message: "Cart not found" });
        }

        const userFound = await userModel.findOne({ _id: userId });
        if (!userFound) {
            return res.status(400).send({ status: false, message: "User not found" });
        }
        if (req.userId != userId) {
            return res.status(401).send({ status: false, message: "unauthorised access" });
        }
        
        let length = cartFound.items.length;
        let newArr = cartFound.items.splice(length);

        cartFound.items = newArr;
        cartFound.totalItems = newArr.length;
        cartFound.totalPrice = 0;

        const cartData = await cartModel.findOneAndUpdate({ _id: cartId }, cartFound, { new: true });

        return res.status(200).send({status: true, message: "Cart deleted successfully", data: cartData});
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message });
    }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
