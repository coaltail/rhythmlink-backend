import { Instrument, MusicGenre } from "@models/user";
import { body, query } from "express-validator"

export const validateLoginRequest = [
    body('email')
        .isEmail().withMessage('Please provide a valid email address.')
        .notEmpty().withMessage('Email is required.'),

    body('password')
        .isLength({ min: 10 }).withMessage('Password must be at least 10 characters long.')
        .notEmpty().withMessage('Password is required.')
];

const isValidEnumValue = (value: string, enumObject: object): boolean => {
    return Object.values(enumObject).includes(value);
};

const areValidEnumValues = (values: string[], enumObject: object): boolean => {
    return values.every(value => isValidEnumValue(value, enumObject));
};

export const validateRegisterRequest = [
    body('email')
        .isEmail().withMessage('Please provide a valid email address.')
        .notEmpty().withMessage('Email is required.'),

    body('username')
        .isLength({ min: 6 }).withMessage('Username must be at least 6 characters long.')
        .notEmpty().withMessage('Username is required.'),

    body('password')
        .isLength({ min: 10 }).withMessage('Password must be at least 10 characters long.')
        .notEmpty().withMessage('Password is required.'),

    body('address')
        .isLength({ min: 10 }).withMessage('Address must be at least 10 characters long.')
        .notEmpty().withMessage('Address is required.'),

    body('mainInstrument')
        .notEmpty().withMessage('Main instrument is required.')
        .custom(value => isValidEnumValue(value, Instrument))
        .withMessage('Invalid main instrument. Must be one of the predefined values.'),
        
    body('genresOfInterest')
        .isArray().withMessage('Please provide genres of interest in the form of an array.')
        .notEmpty().withMessage('Genres of interest are required.')
        .custom(values => areValidEnumValues(values, MusicGenre))
        .withMessage('Invalid genre. Must be one of the predefined values.'),
];

export const validateEditProfileRequest = [
    body('username')
        .isLength({ min: 6 }).withMessage('Username must be at least 6 characters long.')
        .optional(),

    body('password')
        .isLength({ min: 10 }).withMessage('Password must be at least 10 characters long.')
        .optional(),

    body('address')
        .isLength({ min: 10 }).withMessage('Address must be at least 10 characters long.')
        .optional(),

    body('mainInstrument')
        .custom(value => isValidEnumValue(value, Instrument))
        .withMessage('Invalid main instrument. Must be one of the predefined values.')
        .optional(),
        
    body('genresOfInterest')
        .isArray().withMessage('Please provide genres of interest in the form of an array.')
        .custom(values => areValidEnumValues(values, MusicGenre))
        .withMessage('Invalid genre. Must be one of the predefined values.')
        .optional()
];
