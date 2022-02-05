const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController')
const productController = require('../controllers/productController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const middlewares = require('../middlewares/appMiddleware')


router.post('/register', userController.registerUser)
router.post('/login', userController.Login)

router.get('/user/:userId/profile', middlewares.auth, userController.getUserData)
router.put('/user/:userId/profile', middlewares.auth,userController.updateUserData)

router.post('/products', productController.addProduct)
router.get('/products', productController.getProduct)
router.get('/products/:productId', productController.getProductById)
router.put('/products/:productId', productController.updateProduct)
router.delete('/products/:productId', productController.deleteproductByID)

router.post('/users/:userId/cart', middlewares.auth, cartController.createCart)
router.put('/users/:userId/cart', middlewares.auth, cartController.updateCart)
router.get('/users/:userId/cart', middlewares.auth, cartController.getCart)
router.delete('/users/:userId/cart', middlewares.auth, cartController.deleteCart)

router.post('/users/:userId/orders',middlewares.auth, orderController.createOrder)
router.put('/users/:userId/orders',middlewares.auth, orderController.updateOrder)




module.exports = router