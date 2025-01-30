import { Instrument, MusicGenre } from "@models/user";

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

export interface GetUserResponse {
  username: string;
  address: string;
  mainInstrument: Instrument;
  genresOfInterest: MusicGenre[];
  mainImageUrl?: string;
  id: number;
}

export interface EditProfileRequest {
  username?: string;
  password?: string;
  address?: string;
  mainInstrument?: Instrument;
  genresOfInterest?: MusicGenre[];
}

export interface EditProfileResponse {
  token: string;
  expiry: string;
}
