import Joi from "joi";
import { furnishCategory, houseCategory } from "../constants/house.js";

export const createHouseValidation = Joi.object({
    title: Joi.string().min(3).max(50).required().messages({
        'string.min': 'Title must be at least 3 characters long.',
        'string.max': 'Title must have max 30 characters.',
        'any.required': 'Title is required.',
        'string.empty': 'Title is required.',
        'string.base': 'Title must be a string.',
    }),
    description: Joi.string()
        .min(10).max(250)
        .required()
        .messages({
            'string.base': 'Description must be a string.',
            'string.empty': 'Description is required.',
            'string.min': 'Description must be at least 10 characters long.',
            'string.max': 'Title must have max 250 characters.',
            'any.required': 'Description is required.',
        }),
    location: Joi.string()
        .required()
        .min(2).max(50)
        .messages({
            'string.base': 'Location must be a string.',
            'string.empty': 'Location is required.',
            'any.required': 'Location is required.',
            'string.min': 'Description must be at least 2 characters long.',
            'string.max': 'Title must have max 50 characters.',
        }),
    price: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Price must be a number.',
            'number.positive': 'Price must be a positive number.',
            'any.required': 'Price is required.',
        }),
    available: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'Available must be true or false.',
        }),
    images: Joi.array()
        .items(Joi.string().uri().messages({
            'string.uri': 'Each image must be a valid URL.',
        }))
        .messages({
            'array.base': 'Images must be an array of URLs.',
        }),
    propertyType: Joi.string()
        .valid(...houseCategory)
        .required()
        .messages({
            'any.only': 'Property type must be one of 1RK, 1BHK, 2BHK, 3BHK, 4BHK, or Studio.',
            'any.required': 'Property type is required.',
        }),
    Furnishing: Joi.string()
        .valid(...furnishCategory)
        .default('no')
        .messages({
            'any.only': 'Furnishing must be one of full, semi, or no.',
        }),
    BachelorsAllowed: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'BachelorsAllowed must be true or false.',
        }),
    CarParking: Joi.boolean()
        .default(true)
        .messages({
            'boolean.base': 'CarParking must be true or false.',
        }),
    Bedrooms: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Bedrooms must be a number.',
            'number.positive': 'Bedrooms must be a positive number.',
            'any.required': 'Bedrooms count is required.',
        }),

    Bathrooms: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'Bathrooms must be a number.',
            'number.positive': 'Bathrooms must be a positive number.',
            'any.required': 'Bathrooms count is required.',
        }),
})