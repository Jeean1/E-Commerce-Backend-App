const dotenv = require("dotenv");

// Utils
const { AppError } = require("../utils/appError.util");

dotenv.config({ path: "./config.env" });

const sendErrorDev = (error, req, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    error,
    stack: error.stack,
  });
};

const sendErrorProd = (error, req, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message || "Something went wrong!",
    code: error.code,
  });
};

const tokenExpiredError = () => {
  return new AppError("Session expired", 403);
};

const tokenInvalidSignatureError = () => {
  return new AppError("Session invalid", 403);
};

const dbUniqueConstraintError = () => {
  return new AppError("The entered email has already been taken", 400);
};

const MulterImgLimit = () => {
  return new AppError("You can only upload 2 images", 400);
};

const notProductsInCar = () => {
  return new AppError("Products Not Found", 404);
};

const noTokenInReq = () => {
  return new AppError("Not session exist", 404);
};

const notOwner = () => {
  return new AppError("You're not owner on this data", 404);
};

const noQuantity = () => {
  return new AppError("no enougth quantity item", 404);
};

const productExistInCart = () => {
  new AppError("Product is already exist in cart", 400);
};

const shoppingCartNoExist = () => {
  new AppError("ShoppingCart not found", 404);
};

const productNoExistInCart = () => {
  new AppError("product in shopping cart not found", 404);
};

const productCartOrCarExist = () => {
  new AppError("product in cart not found", 404);
};

const productRemoved = () => {
  new AppError("Product is already removed", 400);
};

const erroVar6 = () => {};

const globalErrorHandler = (error, req, res, next) => {
  // Set default values for original error obj
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "fail";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(error, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let err = { ...error };

    //error specific quantity
    const compareWords = ["Only", "avalible"];
    const errorArray = error.message.split(" ");

    if (error.name === "TokenExpiredError") err = tokenExpiredError();
    else if (error.name === "JsonWebTokenError")
      err = tokenInvalidSignatureError();
    else if (error.name === "SequelizeUniqueConstraintError")
      err = dbUniqueConstraintError();
    else if (error.code === "LIMIT_UNEXPECTED_FILE") err = MulterImgLimit();
    else if (error.message === "Products Not Found") err = notProductsInCar();
    else if (error.message === "The token was invalid") err = noTokenInReq();
    else if (error.message === "You are not the owner of this account.")
      err = notOwner();
    else if (error.message === "Product id not found") err = notProductsInCar();
    else if (errorArray[1] === compareWords[1]) err = noQuantity();
    else if (error.message === "Product is already exist in cart")
      err = productExistInCart();
    else if (error.message === "ShoppingCart not found")
      err = shoppingCartNoExist();
    else if (error.message === "product in shopping cart not found")
      err = productNoExistInCart();
    else if (error.message === "product in cart not found")
      err = productCartOrCarExist();
    else if (error.message === "Product is already removed")
      err = productRemoved();

    sendErrorProd(err, req, res);
  }
};

module.exports = { globalErrorHandler };
