import { Schema, model } from "mongoose";

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      barangId: { type: Schema.Types.ObjectId, ref: "Barang", required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: {type: String, default: ""}
    },
  ],
}, { timestamps: true });

const Cart = model("Cart", cartSchema, "Cart");
export default Cart;
