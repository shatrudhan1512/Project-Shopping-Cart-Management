const mongoose = require ('mongoose')

const isValid = function (value) {
    if (typeof value === "undefined" || value === null || value === Number) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
  };

const isAvailableSizes = function (availableSize) {
    return ["S", "XS","M","X", "L","XXL", "XL"].indexOf(availableSize) !== -1;
  };

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};

const isValidPassword = function (value) {
    if (typeof value === "string" && value.trim().length >= 8 && value.trim().length <= 15) return true;
    return false;
  };

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0;
  };
function financial(x) {
    return Number.parseFloat(x).toFixed(2);
  }


module.exports = {isValid, isAvailableSizes, isValidPassword, isValidRequestBody, isValidObjectId , financial}
