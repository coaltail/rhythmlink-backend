import { body } from "express-validator"

export const validateLoginRequest = [
    body('email')
        .isEmail().withMessage('Please provide a valid email address.')
        .notEmpty().withMessage('Email is required.'),

    body('password')
        .isLength({ min: 10 }).withMessage('Password must be at least 10 characters long.')
        .notEmpty().withMessage('Password is required.')
];

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
        .notEmpty().withMessage('Address is required.'),

    body('mainInstrument')
        .notEmpty().withMessage('Main instrument is required.'),

    body('genresOfInterest')
        .isArray().withMessage('Please provide genres of interest in the form of an array.')
        .notEmpty().withMessage('Genres of interest are required.')
];
