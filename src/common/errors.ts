import { ValidationError } from "express-validator";
import { HttpStatusCode } from "./httpStatusCodes";

export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}


export class InvalidCredentialsError extends ApiError {
    constructor(message: string = 'Invalid credentials') {
        super(message, HttpStatusCode.UNATHORIZED);
    }
}

export class UserNotFoundError extends ApiError {
    constructor(message: string = 'User not found') {
        super(message, HttpStatusCode.NOT_FOUND);
    }
}

export class ApiValidationError extends ApiError {
    errors: ValidationError[];
    constructor(message: string = "A validation exception has occurred", errors: ValidationError[]) {
        super(message, HttpStatusCode.BAD_REQUEST);
        this.errors = errors;

    }
}

export class UserAlreadyExistsError extends ApiError {
    constructor(message: string = 'User already exists') {
        super(message, HttpStatusCode.BAD_REQUEST)
    }
}

export class ForbiddenError extends ApiError {
    constructor(message: string = 'Forbidden') {
        super(message, HttpStatusCode.FORBIDDEN)
    }
}

export class NotFoundError extends ApiError {
    constructor(message: string = 'Not found') {
        super(message, HttpStatusCode.NOT_FOUND)
    }
}