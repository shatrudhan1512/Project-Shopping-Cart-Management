const validator = require('../validation/validator')
const productModel = require('../models/productModel')
const awsFunction = require('../controllers/awsControllers')


let addProduct = async function (req, res) {
    try {
        let reqBody = req.body

        let files = req.files

        if (!validator.isValidRequestBody(reqBody)) {
            res.status(400).send({ status: false, message: "request body is required" })
            return
        }

        let { title, description, price, currencyId, availableSizes } = reqBody

        if (!validator.isValid(title)) {
            res.status(400).send({ status: false, message: "enter valid title" })
            return
        }

        if (!validator.isValid(description)) {
            res.status(400).send({ status: false, message: "enter valid description" })
            return
        }

        if (!validator.isValid(price)) {
            res.status(400).send({ status: false, message: "price is required" })
            return
        }
        if (price <= 0) {
            return res.status(400).send({ status: false, message: `Price should be a valid number` })
        }
        if (!validator.isValid(currencyId)) {
            return res.status(400).send({ status: false, message: 'CurrencyId is required' })
        }

        if (!(currencyId == "INR")) {
            return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
        }
        if(!validator.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: 'availableSizes is required' })
        }
        if (availableSizes) {
            let array = availableSizes.split(",").map(x => x.trim())

            for (let i = 0; i < array.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                    return res.status(400).send({ status: false, message: `availableSizes should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(', ')}` })
                }
            }
                reqBody.availableSizes = array
        }
        let findTitle = await productModel.findOne({ title })
        if (findTitle) {
            return res.status(400).send({ status: false, message: "product with this title already exist it must be unique" })
            
        }

        if (files && files.length > 0) {
            let uploadedFileURL = await awsFunction.uploadFile(files[0])
            reqBody.productImage = uploadedFileURL

            let createProduct = await productModel.create(reqBody)

            return res.status(201).send({ status: true, message: `product ${title} created successfully`, data: createProduct })
            
        } else {
            return res.status(400).send({ status: false, message: "Please Provide Profile Images" })
            
        }
    } catch (error) {
        res.status(500).send({ seatus: false, message: error.message })
    }
}


const getProduct = async function (req, res) {
    try {
        const { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query
        if (size || name || priceGreaterThan || priceLessThan) {

            obj = {}
            if (size) {
                obj.availableSizes = size
            }
            if (name) {
                obj.title = { $regex: name }

            }
            if (priceGreaterThan) {
                if (priceGreaterThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceGreaterThan should be a valid number` })
                }
                obj.price = { $gt: priceGreaterThan }
            }
            if (priceLessThan) {
                if (priceLessThan <= 0) {
                    return res.status(400).send({ status: false, message: `priceLessThan should be a valid number` })
                }
                
                obj.price = { $lt: priceLessThan }
            }
            obj.isDeleted = false
            obj.deletedAt = null

            if(priceSort) {
                if (!((priceSort == 1) || (priceSort == -1))) {
                    return res.status(400).send({ status: false, message: `priceSort should be 1 or -1 ` })
                }
                const products = await productModel.find(obj).sort({ price: priceSort })
                if (!products || products.length == 0) {
                    res.status(400).send({ status: false, message: `product is not available right now.` })

                return res.status(200).send({ status: true, message: 'Product list', data: products })
            }
        }
            
            const getProductsList = await productModel.find(obj).sort({ price: 1 })

            if (!getProductsList || getProductsList.length == 0) {
                res.status(400).send({ status: false, message: `product is not available right now.` })
            } else {
                res.status(200).send({ status: true, message: 'Success', data: getProductsList })
            }
        } else {
            const getListOfProducts = await productModel.find({ isDeleted: false, deletedAt: null }).sort({ price: 1 })
            res.status(200).send({ status: true, message: 'Success', data: getListOfProducts })
        }
    } catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

//get product Delails by id 
const getProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validator.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: `${productId} is not valid Product id ` });
            
        }

        let findproduct = await productModel.findOne({ _id: productId, isDeleted: false, deletedAt: null })
        if (!findproduct) {
            return res.status(404).send({ status: false, message: `product is not available with this ${productId} id` })
            
        }
        res.status(200).send({ status: true, message: "Success", data: findproduct })
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}

//update product by id 
const updateProduct = async function (req, res) {
    try {

        let productId = req.params.productId;
        const requestBody = req.body;
        const productImage = req.files

        if (!validator.isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: 'No paramateres passed. product unmodified' })
        }
        if (!validator.isValidObjectId(productId)) {
            res.status(400).send({ status: false, message: `${productId} is not valid Product id ` });
            return;
        }

        let productDetails = await productModel.findOne({ _id: productId, isDeleted: false })


        if (!productDetails) {
            return res.status(404).send({ status: false, message: `productDetails not found with given ProductId or May be Deleted` })
        }
        // Extract params
        const { title, description, price, currencyId, isFreeShipping, style, availableSizes, installments } = requestBody;

        const updatedProductData = {}
        
        if (validator.isValid(title)) {
            
            const isTitleAlreadyUsed = await productModel.findOne({ title });

            if (isTitleAlreadyUsed) {
                return res.status(400).send({ status: false, message: `${title} title is already used` })
            }

            updatedProductData.title = title
        }

        if (validator.isValid(description)) {
            
            updatedProductData.description = description
        }

        if (validator.isValid(price)) {

            if (price<=0) {
                return res.status(400).send({ status: false, message: `Price should be a valid number` })
            }
            updatedProductData.price = price
        }

        if (validator.isValid(currencyId)) {

            if (!(currencyId == "INR")) {
                return res.status(400).send({ status: false, message: 'currencyId should be a INR' })
            }

            
            updatedProductData.currencyId = currencyId;

            updatedProductData.currencyFormat = currencySymbol(currencyId);
        }

        if (validator.isValid(isFreeShipping)) {

            if(!((isFreeShipping === "true")  || (isFreeShipping === "false"))){
                return res.status(400).send({ status: false, message: 'isFreeShipping should be a boolean value' })
            }

            updatedProductData.isFreeShipping = isFreeShipping;
        }

        if (productImage && productImage.length > 0) {
               
           
           let downloadUrl = await awsFunction.uploadFile(productImage[0]); 
            
            updatedProductData.productImage = downloadUrl
        }

        if (validator.isValid(style)) {

            updatedProductData.style = style;
        }

        if (availableSizes) {
            let array = availableSizes.split(",").map(x => x.trim())

            for (let i = 0; i < array.length; i++) {
                if (!(["S", "XS", "M", "X", "L", "XXL", "XL"].includes(array[i]))) {
                    return res.status(400).send({ status: false, message: `availableSizes should be among ${["S", "XS", "M", "X", "L", "XXL", "XL"].join(', ')}` })
                }
            }
                updatedProductData.availableSizes = array
            
        }

        if (validator.isValid(installments)) {
            updatedProductData.installments = installments;
        }

        const updatedProduct = await productModel.findOneAndUpdate({ _id: productId }, updatedProductData, { new: true })

        return res.status(200).send({ status: true, message: 'Success', data: updatedProduct });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//delete product by Id
const deleteproductByID = async (req, res) => {
    try {

        const params = req.params.productId;

        if (!validator.isValidObjectId(params)) {
            return res.status(400).send({ status: false, message: "Inavlid productID." })
        }

        const findproduct = await productModel.findById({ _id: params })

        if (!findproduct) {
            return res.status(404).send({ status: false, message: `No product found ` })
        }

        else if (findproduct.isDeleted == true) {
            return res.status(400).send({ status: false, message: `product has been already deleted.` })
        } else {
            const deleteData = await productModel.findOneAndUpdate({ _id: params }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true });
            return res.status(200).send({ status: true, message: "product deleted successfullly.", data: deleteData })
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: "Something went wrong", Error: err.message })
    }
}

module.exports = { addProduct, getProduct, getProductById, updateProduct, deleteproductByID } 