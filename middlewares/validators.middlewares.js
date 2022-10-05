const { body, validationResult } = require("express-validator");

// const {} = require("body-parse")

// Utils
const { AppError } = require("../utils/appError.util");

const checkValidations = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // [{ ..., msg }] -> [msg, msg, ...] -> 'msg. msg. msg. msg'
    const errorMessages = errors.array().map((err) => err.msg);

    const message = errorMessages.join(". ");

    return next(new AppError(message, 400));
  }

  next();
};

const checkValidationsProduct = (req, res, next) => {
  const errors = validationResult(req);

  // console.log(errors);

  if (!errors.isEmpty()) {
    // [{ ..., msg }] -> [msg, msg, ...] -> 'msg. msg. msg. msg'
    const errorMessages = errors.array().map((err) => err.msg);

    const message = errorMessages.join(". ");

    return next(new AppError(message, 400));
  }

  next();
};

const createUserValidators = [
  body("username")
    .isString()
    .withMessage("username must be a string")
    .notEmpty()
    .withMessage("username cannot be empty")
    .isLength({ min: 3 })
    .withMessage("username must be at least 3 characters"),
  body("email").isEmail().withMessage("Must provide a valid email"),
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password cannot be empty")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  checkValidations,
];

const createNewProductValidator = [
  body("title")
    .isString()
    .withMessage("title must be a string")
    .notEmpty()
    .withMessage("title cannot be empty")
    .isLength({ min: 5 })
    .withMessage("title must be at least 5 characters"),
  body("description")
    .isString()
    .withMessage("description must be a string")
    .notEmpty()
    .withMessage("description cannot be empty")
    .isLength({ min: 10 })
    .withMessage("description must be at least 8 characters"),
  body("price")
    .isNumeric()
    .withMessage("price must be a number")
    .notEmpty()
    .withMessage("price cannot be empty")
    .isLength({ min: 1 })
    .withMessage("price must be at least 1 digit"),
  body("categoryId")
    .isNumeric()
    .withMessage("categoryId must be a number")
    .notEmpty()
    .withMessage("categoryId cannot be empty")
    .isLength({ min: 1 })
    .withMessage("categoryId must be at least 1 digit"),
  body("quantity")
    .isNumeric()
    .withMessage("quantity must be a number")
    .notEmpty()
    .withMessage("quantity cannot be empty")
    .isLength({ min: 1 })
    .withMessage("quantity must be at least 1 digit"),

  checkValidationsProduct,
];

const updateProductValidator = [
  body("title")
    .isString()
    .withMessage("title must be a string")
    .notEmpty()
    .withMessage("title cannot be empty")
    .isLength({ min: 3 })
    .withMessage("title must be at least 3 characters"),
  body("description")
    .isString()
    .withMessage("description must be a string")
    .notEmpty()
    .withMessage("description cannot be empty")
    .isLength({ min: 8 })
    .withMessage("description must be at least 8 characters"),
  body("price")
    .isNumeric()
    .withMessage("price must be a number")
    .notEmpty()
    .withMessage("price cannot be empty")
    .isLength({ min: 1 })
    .withMessage("price must be at least 1 digit"),
  body("quantity")
    .isNumeric()
    .withMessage("quantity must be a number")
    .notEmpty()
    .withMessage("quantity cannot be empty")
    .isLength({ min: 1 })
    .withMessage("quantity must be at least 1 digit"),

  checkValidations,
];

module.exports = {
  createUserValidators,
  createNewProductValidator,
  updateProductValidator,
};
