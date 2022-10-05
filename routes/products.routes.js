const express = require("express");

// Controllers
const {
  getAllProductsActives,
  getCategoriesActive,
  getProductByID,
  createNewCategory,
  createNewProduct,
  updateProduct,
  updateCategory,
  deleteProduct,
} = require("../controllers/products.controller");

// Middlewares
const { protectSession } = require("../middlewares/auth.middlewares");
const { productExists } = require("../middlewares/products.middleware");
const {
  createNewProductValidator,
  updateProductValidator,
} = require("../middlewares/validators.middlewares");
const { upload } = require("../utils/multer.util");

const productsRouter = express.Router();

productsRouter.get("/", getAllProductsActives);

productsRouter.get("/categories", getCategoriesActive);

productsRouter.get("/:id", productExists, getProductByID);

// Protecting below endpoints
productsRouter.use(protectSession);

productsRouter.post(
  "/",
  upload.array("productImg", 5),
  createNewProductValidator,
  createNewProduct
);

productsRouter.post("/categories", createNewCategory);

productsRouter.patch(
  "/:id",
  productExists,
  updateProductValidator,
  updateProduct
);

productsRouter.patch("/categories/:id", updateCategory);

productsRouter.delete("/:id", productExists, deleteProduct);

module.exports = { productsRouter };
