import { Thread } from "@models/thread";
import { Message } from "@models/message";
import { GroupMembers } from "@models/groupMembers";
import { User } from "@models/user";
import { NotFoundError, ForbiddenError, UserNotFoundError } from "@common/errors";
import { MessageResponse, ThreadResponse } from "@interface/message";
import { Group } from "@models/group";

export const createGroupMessage = async (
    userId: number,
    groupId: number,
    content: string
): Promise<MessageResponse> => {
    const [thread] = await Thread.findOrCreate({
        where: { userId, groupId },
        defaults: { userId, groupId }
    });

    const message = await Message.create({
        threadId: thread.id,
        content,
        senderUserId: userId,
        sentByUserId: userId
    });

    const sender = await User.findByPk(userId);
    if (!sender) {
        throw new UserNotFoundError("Sender not found");
    }

    return {
        id: message.id,
        content: message.content,
        senderType: "USER",
        sender,
        sentBy: sender,
        sentAt: message.createdAt,
        threadId: thread.id
    };
};


export const createThreadReply = async (
    threadId: number,
    userId: number,
    content: string,
    sendAsGroup: boolean
): Promise<MessageResponse> => {
    const thread = await Thread.findByPk(threadId);
    if (!thread) throw new NotFoundError("Thread not found");

    let senderGroupId: number | null = null;
    let senderUserId: number | null = null;
    let sender: User | Group | null = null;

    if (sendAsGroup) {
        const membership = await GroupMembers.findOne({
            where: { groupId: thread.groupId, userId }
        });
        if (!membership) throw new ForbiddenError("Not a group member");

        senderGroupId = thread.groupId;
        sender = await Group.findByPk(thread.groupId);
        if (!sender) throw new Error("Group not found");
    } else {
        if (userId !== thread.userId) throw new ForbiddenError("Not thread participant");

        senderUserId = userId;
        sender = await User.findByPk(userId);
        if (!sender) throw new UserNotFoundError("User not found");
    }

    const message = await Message.create({
        threadId,
        content,
        senderUserId,
        senderGroupId,
        sentByUserId: userId
    });

    const sentBy = await User.findByPk(userId);
    if (!sentBy) throw new UserNotFoundError("Sender user not found");

    return {
        id: message.id,
        content: message.content,
        senderType: sendAsGroup ? "GROUP" : "USER",
        sender,
        sentBy,
        sentAt: message.createdAt,
        threadId: thread.id
    };
};

export const getUserThreads = async (userId: number): Promise<ThreadResponse[]> => {
    const threads = await Thread.findAll({
        where: { userId },
        include: [
            { model: Group, as: "group" },
            { model: User, as: "user" },
            {
                model: Message,
                as: "messages",
                order: [['createdAt', 'DESC']],
                limit: 1,
            }
        ],
    });

    return threads.map((thread) => {
        const lastMessage = thread.messages?.[0]?.content || null;
        const lastMessageTimestamp = thread.messages?.[0]?.createdAt || null;

        return {
            id: thread.id,
            group: thread.group || null,
            updatedAt: thread.updatedAt,
            participant: thread.user || null,
            lastMessage,
            lastMessageTimestamp,
        };
    });
};



export const getThreadMessages = async (
    threadId: number,
    userId: number
): Promise<MessageResponse[]> => {
    const thread = await Thread.findByPk(threadId);
    if (!thread) throw new NotFoundError("Thread not found");
    if (thread.userId !== userId) throw new ForbiddenError("Not thread participant");

    const messages = await Message.findAll({
        where: { threadId },
        include: [
            { model: User, as: "senderUser" },
            { model: Group, as: "senderGroup" }
        ],
        order: [["createdAt", "ASC"]]
    });

    return messages.map(message => ({
        id: message.id,
        threadId: message.threadId,
        content: message.content,
        senderType: message.senderUser ? "USER" : "GROUP",
        sender: message.senderUser || message.senderGroup,
        sentBy: message.senderUser || message.senderGroup,
        sentAt: message.createdAt
    }));
};



export const getGroupThreads = async (
    groupId: number,
    userId: number
): Promise<ThreadResponse[]> => {
    // Check if the user is a member of the group
    const membership = await GroupMembers.findOne({
        where: { groupId, userId }
    });
    if (!membership) throw new ForbiddenError("Not a group member");

    // Get the threads for the given group
    const threads = await Thread.findAll({
        where: { groupId },
        include: [
            {
                model: Message,
                limit: 1,
                order: [["createdAt", "DESC"]]
            },
            { model: User, as: "participant" }
        ]
    });

    return threads.map(thread => ({
        id: thread.id,
        user: thread.user,
        participant: thread.user,
        lastMessage: thread.messages[0]?.content,
        updatedAt: thread.updatedAt
    }));
};
