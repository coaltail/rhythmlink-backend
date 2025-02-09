import { MusicGenre } from "@models/user";
import { Group } from "@models/group";
import { GroupRequest } from "@models/groupRequest";

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

export interface GroupGetRequest {
  id: number;
}

export interface GroupGetResponse {
  name: string;
  mainImageUrl: string;
  genres: MusicGenre[];
}

export interface GroupJoinRequest {
  id: number;
}

export interface GroupJoinResponse {
  user_id: number;
  group_id: number;
  sentAt: Date;
  status: string;
}

export interface GroupGetByUserRequest {
  id: number;
}

export interface GroupGetRequestsRequest {
  id: number;
}

export interface GroupUpdateRequestResponse {
  group_id?: number;
  user_id?: number;
  role?: string;
}
