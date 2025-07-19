import mongoose, { Schema } from 'mongoose';
import {
  facingDirection,
  furnishCategory,
  houseCategory,
  rooms,
} from '../constants/house.js';

const houseSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    images: [String],
    propertyType: {
      type: String,
      enum: houseCategory,
      required: true,
    },
    furnishing: {
      type: String,
      enum: furnishCategory,
      default: 'no',
    },
    bachelorsAllowed: { type: Boolean, default: true },
    carParking: { type: Boolean, default: true },
    bedrooms: { type: String, required: true, enum: rooms },
    bathrooms: { type: String, required: true, enum: rooms },
    carParkingCount: {
      type: Number,
      default: null,
      min: 0,
    },
    builtUpAreaSqFt: {
      type: Number,
      required: true,
      min: 100,
    },
    carpetAreaSqFt: {
      type: Number,
      min: 50,
      default: null,
    },
    totalFloors: {
      type: Number,
      default: null,
      min: 1,
    },
    floorNumber: {
      type: Number,
      default: null,
      min: 0,
    },
    ageOfProperty: {
      type: Number,
      default: null,
      min: 0,
    },
    facing: {
      type: String,
      default: null,
      enum: facingDirection,
    },
    slug: { type: String, unique: true, index: true, required: true },
  },
  { timestamps: true }
);
export default mongoose.model('House', houseSchema);
