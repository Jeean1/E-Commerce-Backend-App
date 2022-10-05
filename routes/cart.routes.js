const express = require("express");

// Controllers
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  login,
} = require("../controllers/users.controller");

// Middlewares
const { userExists } = require("../middlewares/users.middlewares");
const {
  protectSession,
  protectUsersAccount,
  protectAdmin,
} = require("../middlewares/auth.middlewares");
const {
  createUserValidators,
} = require("../middlewares/validators.middlewares");
const {
  addProductInCart,
  PurchaseProductsInCart,
  deleteProductInCart,
  UpdateProductQuantityInCart,
  getUserCart,
} = require("../controllers/cart.controller");

const cartRouter = express.Router();

// Protecting below endpoints
cartRouter.use(protectSession);

cartRouter.get("/", getUserCart);

cartRouter.post("/add-product", addProductInCart);

cartRouter.post("/purchase", PurchaseProductsInCart); // Create a Order With Status Purchased.

cartRouter.patch("/update-cart", UpdateProductQuantityInCart);

cartRouter.delete("/:productId", deleteProductInCart);

module.exports = { cartRouter };
