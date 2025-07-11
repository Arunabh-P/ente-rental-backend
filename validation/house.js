import Joi from "joi";
import {
  facingDirection,
  furnishCategory,
  houseCategory,
  rooms,
} from "../constants/house.js";

export const createHouseValidation = Joi.object({
  title: Joi.string().min(3).max(80).required().messages({
    "string.min": "Title must be at least 3 characters long.",
    "string.max": "Title must have max 30 characters.",
    "any.required": "Title is required.",
    "string.empty": "Title is required.",
    "string.base": "Title must be a string.",
  }),

  description: Joi.string().min(10).max(1000).required().messages({
    "string.base": "Description must be a string.",
    "string.empty": "Description is required.",
    "string.min": "Description must be at least 10 characters long.",
    "string.max": "Description must have max 1000 characters.",
    "any.required": "Description is required.",
  }),

  location: Joi.string().min(2).max(50).required().messages({
    "string.base": "Location must be a string.",
    "string.empty": "Location is required.",
    "any.required": "Location is required.",
    "string.min": "Location must be at least 2 characters long.",
    "string.max": "Location must have max 50 characters.",
  }),

  price: Joi.number().positive().required().messages({
    "number.base": "Price must be a number.",
    "number.positive": "Price must be a positive number.",
    "any.required": "Price is required.",
  }),

  available: Joi.boolean().default(true).messages({
    "boolean.base": "Available must be true or false.",
  }),

  images: Joi.array()
    .items(
      Joi.string().uri().messages({
        "string.uri": "Each image must be a valid URL.",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Images must be an array of URLs.",
      "array.min": "At least one image is required.",
      "any.required": "Images are required.",
    }),

  propertyType: Joi.string()
    .valid(...houseCategory)
    .required()
    .messages({
      "any.only": "Invalid property type.",
      "any.required": "Property type is required.",
      "string.base": "Property type must be a string.",
      "string.empty": "Property type is required.",
    }),

  furnishing: Joi.string()
    .valid(...furnishCategory)
    .required()
    .messages({
      "any.only": "Invalid furnishing type.",
      "any.required": "Furnishing is required.",
      "string.base": "Furnishing must be a string.",
      "string.empty": "Furnishing is required.",
    }),

  facing: Joi.string()
    .valid(...facingDirection)
    .allow(null)
    .messages({
      "any.only": "Invalid facing direction.",
      "string.base": "Facing must be a string.",
    }),

  bachelorsAllowed: Joi.boolean().default(true).messages({
    "boolean.base": "BachelorsAllowed must be true or false.",
  }),

  carParking: Joi.boolean().default(true).messages({
    "boolean.base": "CarParking must be true or false.",
  }),

  carParkingCount: Joi.number()
    .min(0)
    .when("carParking", {
      is: true,
      then: Joi.required(),
      otherwise: Joi.optional().allow(null),
    })
    .messages({
      "number.base": "Car parking count must be a number.",
      "number.min": "Car parking count cannot be negative.",
      "any.required": "Car parking count is required when car parking is enabled.",
    }),

  builtUpAreaSqFt: Joi.number().positive().required().messages({
    "number.base": "Built-up area must be a number.",
    "number.positive": "Built-up area must be a positive number.",
    "any.required": "Built-up area is required.",
  }),

  carpetAreaSqFt: Joi.number().positive().optional().messages({
    "number.base": "Carpet area must be a number.",
    "number.positive": "Carpet area must be a positive number.",
  }),

  totalFloors: Joi.number().min(1).optional().messages({
    "number.base": "Total floors must be a number.",
    "number.min": "There must be at least 1 floor.",
  }),

  floorNumber: Joi.number().min(0).optional().messages({
    "number.base": "Floor number must be a number.",
    "number.min": "Floor number must be zero or more.",
  }),

  ageOfProperty: Joi.number().min(0).optional().messages({
    "number.base": "Age must be a number.",
    "number.min": "Age must be zero or more.",
  }),

  bedrooms: Joi.string()
    .valid(...rooms)
    .required()
    .messages({
      "any.only": "Invalid bedroom count.",
      "any.required": "Bedroom count is required.",
      "string.base": "Bedrooms must be a string.",
      "string.empty": "Bedroom count is required.",
    }),

  bathrooms: Joi.string()
    .valid(...rooms)
    .required()
    .messages({
      "any.only": "Invalid bathroom count.",
      "any.required": "Bathrooms count is required.",
      "string.base": "Bathrooms must be a string.",
      "string.empty": "Bathrooms count is required.",
    }),
});
