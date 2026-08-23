const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Same contact-field validation Order used to do inline - manual checks,
// same style used throughout the project.
const validateContactFields = (data) => {
  const { customerName, customerPhone, customerAddress } = data;
  if (!customerName || !String(customerName).trim()) return "Customer name is required";
  if (!customerPhone || !String(customerPhone).trim()) return "Customer phone is required";
  if (!customerAddress || !String(customerAddress).trim()) return "Customer address is required";
  return null;
};

// Resolves what's being checked out, depending on who's asking:
// - Logged-in: reads the user's stored Cart, ignores any client-submitted
//   items entirely - the cart is the source of truth for a known customer.
// - Guest: has no server-side cart, so must submit items directly. Format
//   and basic shape are validated here; existence/status/stock are checked
//   later, inside the transaction, where it actually matters.
const resolveCheckoutItems = async (req) => {
  if (req.user) {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return { error: "Your cart is empty" };
    }
    return {
      items: cart.items.map((item) => ({
        productId: item.product.toString(),
        quantity: item.quantity,
      })),
    };
  }

  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Cart is empty" };
  }

  for (const item of items) {
    if (!item.productId || !isValidObjectId(item.productId)) {
      return { error: "Each item must reference a valid product" };
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return { error: "Each item must have a positive whole number quantity" };
    }
  }

  return { items: items.map((i) => ({ productId: i.productId, quantity: Number(i.quantity) })) };
};

// @desc   Create an order - the only order-creation endpoint. Works for both
//         guest and logged-in customers via optionalAuth.
// @route  POST /api/checkout
exports.checkout = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const contactError = validateContactFields(req.body);
    if (contactError) {
      return res.status(400).json({ success: false, message: contactError });
    }

    const { items: rawItems, error: itemsError } = await resolveCheckoutItems(req);
    if (itemsError) {
      return res.status(400).json({ success: false, message: itemsError });
    }

    const { customerName, customerPhone, customerAddress, paymentMethod } = req.body;
    let createdOrder;

    await session.withTransaction(async () => {
      const orderItems = [];
      let totalAmount = 0;

      for (const { productId, quantity } of rawItems) {
        const product = await Product.findById(productId).session(session);
        

        if (!product) {
          throw Object.assign(
            new Error("One of the items in your order is no longer available"),
            { status: 400 }
          );
        }
        if (product.status !== "active") {
          throw Object.assign(new Error(`"${product.name}" is no longer available`), { status: 400 });
        }

        // Atomic check-and-decrement: the filter's stockQuantity condition
        // and the $inc happen as one operation, so two simultaneous
        // checkouts for the last unit can't both succeed.
        const updatedProduct = await Product.findOneAndUpdate(
          { _id: productId, stockQuantity: { $gte: quantity } },
          { $inc: { stockQuantity: -quantity } },
          { new: true, session }
        );

        if (!updatedProduct) {
          throw Object.assign(new Error(`Insufficient stock for "${product.name}"`), { status: 409 });
        }

        orderItems.push({
          productId: product._id,
          name: product.name,
          quantity,
          price: product.price, // server-resolved, never trusted from the client
        });

        totalAmount += product.price * quantity;
      }

      const order = new Order({
        user: req.user ? req.user._id : undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        items: orderItems,
        totalAmount,
        paymentMethod,
        status: "Pending",
        paymentStatus: "Unpaid",
      });

      await order.save({ session });
      createdOrder = order;

      // Clear the logged-in user's cart now that the order is placed.
      // Guests have nothing server-side to clear - their frontend clears
      // localStorage after a successful response.
      if (req.user) {
        await Cart.findOneAndUpdate(
          { user: req.user._id },
          { $set: { items: [] } },
          { session }
        );
      }
    });

    res.status(201).json({ success: true, data: createdOrder });
  } catch (error) {
    // Errors thrown inside the transaction carry a `status` - anything else
    // is a genuine unexpected failure, handled by the global error handler.
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  } finally {
    session.endSession();
  }
};
