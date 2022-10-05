// Models
const { Cart } = require("./cart.model");
const { Category } = require("./category.model");
const { Order } = require("./order.model");
const { Product } = require("./product.model");
const { ProductImgs } = require("./productImg.model");
const { ProductsInCart } = require("./productsInCart.model");
const { User } = require("./user.model");

const initModels = () => {
  // User Relations

  //  User 1 <--->  M Orders
  User.hasMany(Order, { foreignKey: "userId" });
  Order.belongsTo(User);

  // User 1 <---> M Products
  User.hasMany(Product, { foreignKey: "userId" });
  Product.belongsTo(User);

  // User 1 <---> 1 Cart
  User.hasOne(Cart, { foreignKey: "userId" });
  Cart.belongsTo(User);

  // Products Relations

  //  Product 1 <---> M Imgs
  Product.hasMany(ProductImgs, { foreignKey: "productId" });
  ProductImgs.belongsTo(Product);

  // Product 1 <---> 1 ProductInCart
  Product.hasOne(ProductsInCart, { foreignKey: "productId" });
  ProductsInCart.belongsTo(Product);

  // Category Relations

  // Category 1 <---> 1 Product
  Category.hasOne(Product, { foreignKey: "categoryId" });
  Product.belongsTo(Category);

  // Cart Relations

  // Cart 1 <---> M ProductsInCart
  Cart.hasMany(ProductsInCart, { foreignKey: "cartId" });
  ProductsInCart.belongsTo(Cart);

  // Order Relations

  // Order 1 <---> 1 Cart
  Cart.hasOne(Order, { foreignKey: "cartId" });
  Order.belongsTo(Cart);
};

module.exports = { initModels };
