const Order = require("../models/Order");

// Shared validation for order creation - manual checks only, same approach
// used in the Auth and Product modules. No new dependency introduced.
const validateOrderInput = (data) => {
  const { customerName, customerPhone, customerAddress, items, totalAmount } = data;

  if (!customerName || !String(customerName).trim()) {
    return "Customer name is required";
  }
  if (!customerPhone || !String(customerPhone).trim()) {
    return "Customer phone is required";
  }
  if (!customerAddress || !String(customerAddress).trim()) {
    return "Customer address is required";
  }
  if (!Array.isArray(items) || items.length === 0) {
    return "Cart is empty";
  }

  for (const item of items) {
    if (!item.productId) {
      return "Each item must reference a product";
    }
    if (!item.name || !String(item.name).trim()) {
      return "Each item must have a name";
    }
    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return "Each item must have a positive whole number quantity";
    }
    const price = Number(item.price);
    if (isNaN(price) || price <= 0) {
      return "Each item must have a positive price";
    }
  }

  const numericTotal = Number(totalAmount);
  if (isNaN(numericTotal) || numericTotal <= 0) {
    return "Total amount must be a positive number";
  }

  return null;
};

// @desc   Create a new order
// @route  POST /api/orders
// Stays public/unauthenticated - guest checkout is a deliberate business
// requirement, not an oversight. See TECHNICAL_DEBT.md for the known
// limitation around trusting client-submitted prices/total for now.
exports.createOrder = async (req, res, next) => {
  try {
    const validationError = validateOrderInput(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const {
      orderId,
      customerName,
      customerPhone,
      customerAddress,
      items,
      totalAmount,
      paymentMethod,
    } = req.body;

    const order = new Order({
      orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items,
      totalAmount,
      paymentMethod,
      status: "Pending",
    });

    const saved = await order.save();
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};

// @desc   Get all orders
// @route  GET /api/orders
// Admin only - exposes customer name/phone/address for every order.
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc   Update an order's status
// @route  PATCH /api/orders/:id
// Admin only.
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const allowedStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
