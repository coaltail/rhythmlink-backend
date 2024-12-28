import { MusicGenre } from "@models/user";

export interface GroupCreateRequest {
    name: string;                
    ownerId: number;             
    mainImageUrl: string;        
    genres: MusicGenre[];        
}


export interface GroupCreateResponse {
    id: number;
    name: string;
    ownerId: number;
    mainImageUrl: string;
    genres: MusicGenre[];
    createdAt: Date;
    updatedAt: Date;
}
