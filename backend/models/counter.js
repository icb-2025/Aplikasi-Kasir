import { Schema, model } from "mongoose";

const counterSchema = new Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
}, { timestamps: true });

const Counter = model("Counter", counterSchema, "counters");
export default Counter;
