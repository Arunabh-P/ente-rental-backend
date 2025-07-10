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
    furnishing: {
        type: String,
        enum: furnishCategory,
        default: 'no'
    },
    bachelorsAllowed: { type: Boolean, default: true },
    carParking: { type: Boolean, default: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    slug: { type: String, unique: true, index: true },
}, { timestamps: true })
export default mongoose.model('House', houseSchema)