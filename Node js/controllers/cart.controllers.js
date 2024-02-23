// const Cart = require("../models/cart.model");
const cartService = require("../models/cart.model");

const getCart = async (req, res) => {
  try {
    // const user = await User.findOne({ email }).populate("product_id");
    // const cart_obj = await cartService.find().populate("product_id");
    const user = req.query.user;
    const userCart =await cartService.findOne({user}).populate('items.product_id').populate('user')
    res.json(userCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { user, product_id, quantity } = req.body;
   
    let cart = await cartService.findOne({ user });

    if (!cart) {
      cart = await cartService.create({ user, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.product_id.equals(product_id));
    if (existingItemIndex !== -1) {
     
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product_id, quantity });
    }
    await cartService.updateOne({ user }, cart);

    res.status(201).send("Product added to the cart successfully.");
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const updateCartItem = async (req, res) => {
  try {
    const {product_id}=req.params;
    const { quantity } = req.body;
    const user = req.query.user;
    const userCart = await cartService.findOne({ user: user }).populate('items.product_id').populate('user');
    
    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    
    const cartItem = userCart.items.find(item => item.product_id.equals(product_id));
    
    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    cartItem.quantity = quantity;

    await userCart.save();


    res.json(userCart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;
    const user = req.query.user;
    const userCart = await cartService.findOne({ user: user }).populate('items.product_id').populate('user');

    if (!userCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const index = userCart.items.findIndex(item => item.product_id.equals(product_id));

    if (index === -1) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const removedCartItem = userCart.items.splice(index, 1)[0];
    await userCart.save();

    res.json(removedCartItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const clearCart = async (req, res) => {
  try {
    const user = req.query.user; 
    await cartService.deleteMany({ user: user }); 
    res.json({ message: `All shopping carts for user ${user} cleared successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};