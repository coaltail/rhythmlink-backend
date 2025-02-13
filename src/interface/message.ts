import { User } from "@models/user";
import { Group } from "@models/group";

export type MessageResponse = {
    id: number;
    threadId: number;
    content: string;
    senderType: "USER" | "GROUP";
    sender: User | Group;
    sentBy: User | Group;
    sentAt: Date;
};

export interface ThreadResponse {
    id: number;
    participant: User | Group;
    lastMessage?: string;
    updatedAt: Date;
    unreadCount?: number;
}

export interface GroupThreadResponse extends ThreadResponse {
    participant: User;
    groupId: number;
}

export interface UserThreadResponse extends ThreadResponse {
    participant: Group;
    userId: number;
}

export interface MessageRequest {
    content: string;
    sendAsGroup?: boolean;
}

export interface ThreadWithMessagesResponse {
    thread: {
        id: number;
        created_at: Date;
    };
    messages: MessageResponse[];
    participants: {
        user: User;
        group: Group;
    };
}