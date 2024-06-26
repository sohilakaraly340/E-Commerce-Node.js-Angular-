const asyncHandler = require("express-async-handler");
const productModel = require("../models/product.model");
const categoryModule = require("../models/category.model");
const Product = require("../models/product.model");

const Rating = require("../models/rating.model");
const { validateAddProduct } = require("../validation/product.validator");

const getAllProducts = asyncHandler(async (req, res) => {
  const productList = await productModel.find();
  res.status(200).json({ results: productList.length, data: productList });
});

const getProductById = asyncHandler(async (req, res) => {
  let prdId = req.params.id;
  const products = await productModel.find();

  const hamada = await productModel
    .findById({ _id: prdId })
    .populate("categories");

  x = await Product.findById(prdId);

  z = await Rating.findOne({ prdId });

  if (z !== null) {
    const Updates = await productModel.updateOne(
      { _id: prdId },
      { $set: { rating: z.ratingsAvg } }
    );
  }

  res.status(200).json({ results: hamada.length, data: hamada });
});

const addNewProduct = asyncHandler(async (req, res) => {
  const { error } = validateAddProduct(req.body);
  if (error) {
    res.status(400).send({ message: error });
    return;
  }

  const category = await categoryModule.findById(req.body.categories);
  if (!category) return res.status(400).send("invalid category");

  const {
    name_en,
    name_ar,
    description_en,
    description_ar,
    categories,
    brand_en,
    brand_ar,
    price,
    countInStock,
    rating,
    numReviews,
    isFeatured,
    images,
  } = req.body;
  const imageUrl = req.imageUrl;

  const newProduct = await productModel.create({
    name_en,
    name_ar,
    description_en,
    description_ar,
    categories,
    brand_en,
    brand_ar,
    price,
    countInStock,
    rating,
    numReviews,
    isFeatured,
    images: imageUrl,
  });
  res.status(201).json({ data: newProduct });
});

const updateProduct = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const {
    name_en,
    name_ar,
    description_en,
    description_ar,
    categories,
    brand_en,
    brand_ar,
    price,
    countInStock,
    rating,
    numReviews,
    isFeatured,
    images,
  } = req.body;
  const imageUrl = req.imageUrl;

  const Updates = await productModel.updateOne({ _id: id }, {
    name_en,
    name_ar,
    description_en,
    description_ar,
    categories,
    brand_en,
    brand_ar,
    price,
    countInStock,
    rating,
    numReviews,
    isFeatured,
    images: imageUrl
  });
  res.send(Updates);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productModel.findOne({ _id: id });
  if (!product) {
    res.status(404).send(`there is no product with id ${req.params.id}`);
    return;
  }
  await productModel.deleteOne({ _id: id });
  res.send(product);
});

const topRating = asyncHandler(async (req, res) => {
  const topProducts = await productModel.find().sort({ rating: -1 }).limit(3);
  if (!topProducts || topProducts.length === 0) {
    return res.status(404).send(`There are no products.`);
  }
  res.send(topProducts);
});

module.exports = {
  getAllProducts,
  getProductById,
  addNewProduct,
  updateProduct,
  deleteProduct,
  topRating,
};
