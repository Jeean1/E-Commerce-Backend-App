// Import the functions you need from the SDKs you need
const { initializeApp } = require("firebase/app");

const {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} = require("firebase/storage");

const dotenv = require("dotenv");
const { ProductImgs } = require("../models/productImg.model");

dotenv.config({ path: "./config.env" });

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const fireBaseApp = initializeApp(firebaseConfig);

// Storage service
const storage = getStorage(fireBaseApp);

const uploadProductImgs = async (imgs, productId) => {
  //Map Async -> Array with Promises
  const productImgsPromises = imgs.map(async (img) => {
    //Create firebase Reference
    const [originalName, ext] = img.originalname.split(".");

    const filename = `products/${productId}/${originalName}-${Date.now()}.${ext}`;

    const imgRef = ref(storage, filename);

    //Upload Image to Firebase here

    const result = await uploadBytes(imgRef, img.buffer);

    await ProductImgs.create({
      imgUrl: result.metadata.fullPath,
      productId,
    });
  });

  await Promise.all(productImgsPromises);
};

// get a real Url Img
const getProductImgsUrls = async (products) => {
  // Loop through all the products to get each image of each product
  const productsWithImgsPromises = products.map(async (product) => {
    const productImgPromises = product.productImgs.map(async (productImg) => {
      const imgRef = ref(storage, productImg.imgUrl);
      const imgUrl = await getDownloadURL(imgRef);

      productImg.imgUrl = imgUrl;

      return productImg;
    });
    // Resolve imgs urls
    const productImgs = await Promise.all(productImgPromises);

    // Update old productstImgs array with new array
    product.productImg = productImgs;

    return product;
  });

  return await Promise.all(productsWithImgsPromises);
};

const getAProductImgUrl = async (product) => {
  const productImgPromises = product.productImgs.map(async (productImg) => {
    const imgRef = ref(storage, productImg.imgUrl);
    const imgUrl = await getDownloadURL(imgRef);

    productImg.imgUrl = imgUrl;
    return productImg;
  });

  return await Promise.all(productImgPromises);
};

module.exports = { uploadProductImgs, getProductImgsUrls, getAProductImgUrl };
