const { Cart } = require("../models/cart.model");
const { Order } = require("../models/order.model");
const { Product } = require("../models/product.model");
const { ProductsInCart } = require("../models/productsInCart.model");
const { AppError } = require("../utils/appError.util");
const { catchAsync } = require("../utils/catchAsync.util");
const { Op } = require("sequelize");

const getUserCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;

  const userCart = await Cart.findOne({
    where: { userId: sessionUser.id },
    include: { model: ProductsInCart },
  });

  res.status(200).json({
    status: "success",
    message: { userCart },
  });
});

const addProductInCart = catchAsync(async (req, res, next) => {
  const { sessionUser } = req;
  const { productId, quantity } = req.body;
  //Averiguar sí tengo un carrito activo con el ID de SessionUser.
  const cartExist = await Cart.findOne({
    where: { userId: sessionUser.id, status: "active" },
  });

  //Sí el producto ingresado excede la cantidad existente :
  //Obtener el producto main
  const productMain = await Product.findOne({ where: { id: productId } });
  //Comparar Quantity del body con el Quantity del Product Main
  if (quantity > productMain.quantity) {
    //Sí Quantity del body supera al Quantity del Product Main enviar error.
    return next(new AppError(`Only avalible ${productMain.quantity}`, 400));
  }

  //Sí no tiene un carrito activo, crearle uno con el producto añadido.
  if (!cartExist) {
    const cartCreated = await Cart.create({
      userId: sessionUser.id,
    });
    //new product
    const newProductInCart = await ProductsInCart.create({
      cartId: cartCreated.id,
      productId,
      quantity,
    });

    return res.status(200).json({
      status: "success",
      data: { newProductInCart },
    });
  }
  //Sí tiene carrito activo:
  //Validar sí el producto existe en el carrito con status activo.
  const productExist = await ProductsInCart.findOne({
    where: {
      productId,
      [Op.or]: [{ status: "active" }, { status: "removed" }],
      cartId: cartExist.id,
    },
  });

  //Sí el carrito existe pero el producto no existe
  if (!productExist) {
    const newProductInCart = await ProductsInCart.create({
      cartId: cartExist.id,
      productId,
      quantity,
    });

    return res.status(200).json({
      status: "success",
      data: { newProductInCart },
    });
  }

  //Sí el proudcto está en el carrito, mandamos error qué el producto ya existe.
  else if (productExist.status === "active") {
    return next(new AppError("Product is already exist in cart", 400));
  }
  //Sí el producto está con un status removed, actualizar el status active con su cantidad.
  else if (productExist) {
    const productUpdateResult = await productExist.update({
      cartId: cartExist.id,
      quantity,
      status: "active",
    });

    return res.status(200).json({
      status: "success",
      data: { productUpdateResult },
    });
  }
});

const PurchaseProductsInCart = catchAsync(async (req, res, next) => {
  //Buscar el carrito con status Activo y validar usuario.
  //Obtener todos los productos qué tengo en el carrito con status activo "Include"

  const { sessionUser } = req;

  const shoppingCart = await Cart.findOne({
    where: { status: "active", userId: sessionUser.id },
    include: [{ model: ProductsInCart, include: [{ model: Product }] }],
  });
  // Sí no existe un carrito con estatus active, mando error.
  if (!shoppingCart) {
    return next(new AppError("ShoppingCart not found"));
  }

  //Sí existe carrito hacer lo siguiente:

  //Sacar el valor total de todos los productos
  // Consigo el valor total de cada un producto
  const totalPriceProduct = shoppingCart.productInCarts.map((productInCart) => {
    return productInCart.product.price * productInCart.quantity;
  });
  // Sumo todo el array para conseguir el valor total del ShoppingCart
  const totalPriceOfAllProducts = totalPriceProduct.reduce(
    (acc, price) => acc + price
  );
  //Modificar la cantidad existente del producto base:
  //Realizo la operación para obtener la cantidad existente después de la compra.
  shoppingCart.productInCarts.forEach(async (productInCart) => {
    const newQuantity = productInCart.product.quantity - productInCart.quantity;

    //Busco el producto Principal
    const productMain = await Product.findOne({
      where: productInCart.product.id,
    });
    //Actualizo la nueva cantidad
    await productMain.update({ quantity: newQuantity });
  });

  //Actualizar status del carrito tanto cómo productos a Purchased

  //Recorrer uno a uno los productos del carrito
  const productStatusPurchased = shoppingCart.productInCarts.map(
    async (productInCart) => {
      const productInCartActive = await ProductsInCart.findOne({
        where: { id: productInCart.id, status: "active" },
      });

      //A cada producto cambiarle el status a Purchased

      if (productInCartActive) {
        await productInCartActive.update({ status: "purchased" });
      }
    }
  );
  await Promise.all(productStatusPurchased);

  //ShoppingCart status active  --> purchased
  await shoppingCart.update({ status: "purchased" });

  //Crear la orden con el valor total, los status purchased.

  const newOrder = await Order.create({
    userId: sessionUser.id,
    cartId: shoppingCart.id,
    totalPrice: totalPriceOfAllProducts,
  });

  res.status(200).json({
    status: "success",
    data: { newOrder },
  });
});

const UpdateProductQuantityInCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const { sessionUser } = req;

  //validar la existencia del carrito
  const cartExist = await Cart.findOne({ where: { userId: sessionUser.id } });

  //Sí no existe el carrito con tal producto, mando error
  if (!cartExist) {
    return next(new AppError("product in shopping cart not found"));
  }

  //Sí la cantidad ingresada excede a la cantidad existente:

  //Obtener el producto main
  const productMain = await Product.findOne({ where: { id: productId } });

  //Validar sí el producto ingresado existe en el carrito
  const productInCartActive = await ProductsInCart.findOne({
    where: {
      productId,
      [Op.or]: [{ status: "active" }, { status: "removed" }],
      cartId: cartExist.id,
    },
  });
  if (!productInCartActive) {
    return next(new AppError("product in cart not found", 404));
  }

  //Comparar Quantity del body con el Quantity del Product Main
  if (quantity > productMain.quantity) {
    //Sí Quantity del body supera al Quantity del Product Main enviar error.
    return next(new AppError(`Only avalible ${productMain.quantity}`, 400));
  }
  //Sí ingresa cantidad 0 a un productInCart, actualizar status a Removed:
  else if (quantity === 0) {
    await productInCartActive.update({ quantity, status: "removed" });
  }
  //Sí vuelven a ingresar el producto, actualizar el status Active y su cantidad.
  else if (productInCartActive.status === "removed") {
    await productInCartActive.update({ quantity, status: "active" });
  }

  await productInCartActive.update({ quantity });

  res.status(200).json({
    status: "success",
    data: { productInCartActive },
  });
});

const deleteProductInCart = catchAsync(async (req, res, next) => {
  const { productId } = req.params;

  const productInCart = await ProductsInCart.findOne({
    where: { productId, status: "active" },
  });

  if (!productInCart) {
    return next(new AppError("Product is already removed", 400));
  }

  await productInCart.update({ status: "removed", quantity: 0 });

  res.status(200).json({
    status: "success",
    message: "product in cart removed",
  });
});

module.exports = {
  addProductInCart,
  PurchaseProductsInCart,
  UpdateProductQuantityInCart,
  deleteProductInCart,
  getUserCart,
};
