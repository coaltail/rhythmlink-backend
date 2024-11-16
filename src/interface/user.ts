import { Instrument, MusicGenre } from "@models/user";
import { Request } from "express";

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
    address: string;
    mainInstrument: Instrument;
    genresOfInterest: MusicGenre[];
}

export interface RegisterResponse {
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
}

export interface IRequestUser extends Request {
    user: TokenClaims
}