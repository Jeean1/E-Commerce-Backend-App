// Models
const { Category } = require("../models/category.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { Product } = require("../models/product.model");
const { Order } = require("../models/order.model");
const { Cart } = require("../models/cart.model");
const { ProductsInCart } = require("../models/productsInCart.model");
const {
  uploadProductImgs,
  getProductImgsUrls,
  getAProductImgUrl,
} = require("../utils/firebase.util");
const {
  createNewProductValidator,
} = require("../middlewares/validators.middlewares");
const { ProductImgs } = require("../models/productImg.model");

const getAllProductsActives = catchAsync(async (req, res, next) => {
  const products = await Product.findAll({
    where: { status: "active" },
    include: { model: ProductImgs },
  });

  const productsWithImgs = await getProductImgsUrls(products);

  res.status(200).json({
    status: "success",
    data: { products: productsWithImgs },
  });
});

const getProductByID = catchAsync(async (req, res, next) => {
  const { product } = req;
  await getAProductImgUrl(product);

  res.status(200).json({
    status: "success",
    data: { product },
  });
});

const getCategoriesActive = catchAsync(async (req, res, next) => {
  const category = await Category.findAll();

  res.status(200).json({
    status: "success",
    data: { category },
  });
});

const createNewCategory = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const newCategory = await Category.create({ name });

  res.status(201).json({
    sattus: "success",
    data: { newCategory },
  });
});

const createNewProduct = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const { title, description, price, categoryId, quantity } = req.body;

  const newProduct = await Product.create({
    title,
    description,
    quantity: Number(quantity),
    price: Number(price),
    categoryId: Number(categoryId),
    userId: sessionUser.id,
  });

  uploadProductImgs(req.files, newProduct.id);

  // 201 -> Success and a resource has been created
  res.status(201).json({
    status: "success",
    data: { newProduct },
  });
});

const updateProduct = catchAsync(async (req, res, next) => {
  const { product, sessionUser } = req;
  const { title, description, price, quantity } = req.body;

  if (sessionUser.id !== product.userId) {
    return next(new AppError("You're not own this product", 400));
  }

  await product.update({
    title,
    description,
    price,
    quantity,
  });

  res.status(200).json({
    status: "success",
    data: { product },
  });
});

const updateCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const category = await Category.findOne({ id });
  console.log(category);

  if (!category) {
    return next(new AppError("Category ID not found", 404));
  }

  await category.update({ name });

  res.status(200).json({ category });
});

const deleteProduct = catchAsync(async (req, res, next) => {
  const { product } = req;

  await product.update({ status: "deleted" });

  res.status(200).json({
    status: "success",
    data: { product },
  });
});

module.exports = {
  getAllProductsActives,
  getProductByID,
  getCategoriesActive,
  createNewCategory,
  createNewProduct,
  updateProduct,
  updateCategory,
  deleteProduct,
};
