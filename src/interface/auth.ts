import { Instrument, MusicGenre } from "@models/user";
import { Request } from "express";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    expiry: string;
}

export interface TokenClaims {
    userId: number;
    username: string;
    address: string;
    mainInstrument: Instrument;
    genresOfInterest: MusicGenre[];
    createdAt: Date;
    updatedAt: Date;
    mainImageUrl?: string;
}

export interface IRequestUser extends Request {
    user: TokenClaims
}