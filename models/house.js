import mongoose, { Schema } from "mongoose";
import { furnishCategory, houseCategory } from "../constants/house.js";

const houseSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    images: [String],
    propertyType: {
        type: String,
        enum: houseCategory,
        required: true
    },
    Furnishing: {
        type: String,
        enum: furnishCategory,
        default: 'no'
    },
    BachelorsAllowed: { type: Boolean, default: true },
    CarParking: {  type: Boolean, default: true},
    Bedrooms: { type: Number, required: true },
    Bathrooms: { type: Number, required: true },
}, { timestamps: true })
export default mongoose.model('House', houseSchema)