const jwt = require("jsonwebtoken")

const auth = async function (req, res, next) {
    try {
        let tempToken = req.headers['authorization'];
        if (!tempToken) {
            return res.status(400).send({ status: false, message: 'You are not logged in, Please login to proceed your request' })
        }
        let tmpToken = tempToken.split(" ")
        let finalToken = tmpToken[1]
        if (!finalToken) {
            return res.status(400).send({ status: false, message: 'You are not logged in, Please login to proceed your request' })
        }
        let decodedToken = jwt.verify(finalToken, "Exodus")
        if (decodedToken) {
            req.userId = decodedToken.userId
            next();
        } else {
            return res.status(400).send({ status: false, message: 'Oops...token is not valid' })
        }
    } catch (error) {
        return res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.auth = auth