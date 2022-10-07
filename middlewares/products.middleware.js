// Models
const { Product } = require("../models/product.model");

// Utils
const { catchAsync } = require("../utils/catchAsync.util");
const { AppError } = require("../utils/appError.util");
const { ProductImgs } = require("../models/productImg.model");

const productExists = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findOne({
    where: { id },
    include: { model: ProductImgs },
  });

  if (!product) {
    return next(new AppError("Product id not found", 404));
  }

  req.product = product;
  next();
});

module.exports = {
  productExists,
};
