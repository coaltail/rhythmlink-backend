import BlobService from "@common/blobService";
import sequelize from "sequelize";
import {
  GroupUpdateRequestResponse,
  GroupCreateResponse,
  GroupGetResponse,
  GroupJoinResponse
} from "@interface/group";
import { Group } from "@models/group";
import { MusicGenre } from "@models/user";
import logger from "@utils/logger";
import { GroupRequest } from "@models/groupRequest";
import { GroupMembers } from "@models/groupMembers";

export const createNewGroup = async (
  ownerId: number,
  name: string,
  genres: Array<MusicGenre>,
  mainImage: Express.Multer.File
): Promise<GroupCreateResponse> => {
  try {
    const blobService = BlobService.getInstance();
    const blobName = `groups/${Date.now()}-${mainImage.originalname}`;
    const mainImageUrl = await blobService.uploadBlob(
      blobName,
      mainImage.buffer
    );

    const newGroup = await Group.create({
      name,
      ownerId: ownerId,
      genres: genres,
      mainImageUrl
    });

    const groupResponse: GroupCreateResponse = {
      id: newGroup.id,
      name: newGroup.name,
      ownerId: newGroup.ownerId,
      mainImageUrl: newGroup.mainImageUrl,
      genres: newGroup.genres,
      createdAt: newGroup.createdAt,
      updatedAt: newGroup.updatedAt
    };

    await GroupMembers.create({
      groupId: newGroup.id,
      userId: newGroup.ownerId,
      role: "OWNER"
    });

    return groupResponse;
  } catch (error: unknown) {
    logger.error("Error occured during creation of new group.");
    throw error;
  }
};

export const getGroup = async (id: number): Promise<GroupGetResponse> => {
  try {
    const group = await Group.findOne({ where: { id } });

    if (!group) {
      throw new Error(`Group with id ${id} not found.`);
    }

    const groupData: GroupGetResponse = {
      name: group.name,
      mainImageUrl: group.mainImageUrl,
      genres: group.genres
    };

    return groupData;
  } catch (error: unknown) {
    logger.error("Error occured during retrieving of group.");
    throw error;
  }
};

export const getGroupsByUser = async (id: number) => {
  try {
    const groupMembers = await GroupMembers.findAll({
      where: { userId: id }
    });

    if (!groupMembers || groupMembers.length === 0) {
      throw new Error(`User with ID ${id} isn't part of any groups.`);
    }

    const userGroups: Group[] = [];

    for (const member of groupMembers) {
      const group = await Group.findOne({
        where: { id: member.groupId }
      });

      if (group) {
        userGroups.push(group);
      }
    }

    return userGroups;
  } catch (error: unknown) {
    logger.error("Error occurred during retrieving of user groups.");
    throw error;
  }
};

export const getGroupRequests = async (id: number, ownerId: number) => {
  try {
    const owner = await Group.findOne({
      where: {
        ownerId: ownerId,
        id: id
      }
    });

    if (!owner) {
      throw new Error(
        `User with id ${ownerId} is not the owner of group with id ${id}`
      );
    }

    const groupRequests = await GroupRequest.findAll({
      where: { group_id: id }
    });

    if (groupRequests.length === 0) {
      throw new Error(`No requests found for group with ID ${id}.`);
    }

    return groupRequests;
  } catch (error: unknown) {
    logger.error("Error occured during retrieving of groups requests.");
    throw error;
  }
};

export const searchGroup = async (
  pageSize: string = "20",
  pageNumber: string = "1",
  name?: string,
  genres?: string[]
) => {
  try {
    const limit = parseInt(pageSize);
    const offset = (parseInt(pageNumber) - 1) * limit;

    const where: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any

    if (name) {
      where.name = {
        [sequelize.Op.like]: `%${name}%`
      };
    }
    if (genres && genres.length > 0) {
      const cleanedGenres = genres.map((genre: string) =>
        genre.replace("", "")
      );
      console.log("genres: ", cleanedGenres);
      logger.info("cleaned genres: ", cleanedGenres);
      where.genres = {
        [sequelize.Op.in]: cleanedGenres
      };
    }

    const groups = await Group.findAll({
      where,
      limit,
      offset
    });

    return groups;
  } catch (err) {
    logger.error("Error occurred during group search:", err);
    throw err;
  }
};

export const joinGroup = async (group_id: number, user_id: number) => {
  try {
    const request = await GroupRequest.findOne({
      where: {
        group_id: group_id,
        user_id: user_id
      }
    });

    if (request) {
      throw new Error(
        `Request for user ${user_id} in group ${group_id} already exists`
      );
    }

    const owner = await Group.findOne({
      where: {
        ownerId: user_id,
        id: group_id
      }
    });

    if (owner) {
      throw new Error(
        `User with id ${user_id} is the owner of group with id ${group_id}`
      );
    }

    const newRequest = await GroupRequest.create({
      group_id,
      user_id,
      status: "Received"
    });

    const joinResponse: GroupJoinResponse = {
      user_id: newRequest.user_id,
      group_id: newRequest.group_id,
      sentAt: newRequest.sentAt,
      status: newRequest.status
    };

    return joinResponse;
  } catch (error: unknown) {
    logger.error("Error occured during joining group.");
    throw error;
  }
};

export const acceptJoinRequest = async (
  group_id: number,
  user_id: number,
  owner_id: number
): Promise<GroupUpdateRequestResponse> => {
  try {
    const owner = await Group.findOne({
      where: {
        ownerId: owner_id,
        id: group_id
      }
    });

    if (!owner) {
      throw new Error(`This is not the owner of group with id ${group_id}`);
    }

    const request = await GroupRequest.findOne({
      where: {
        group_id: group_id,
        user_id: user_id
      }
    });

    if (!request) {
      throw new Error(
        `No join request found for user ${user_id} in group ${group_id}`
      );
    }

    await GroupRequest.update(
      { status: "Accepted" },
      {
        where: {
          group_id: group_id,
          user_id: user_id
        }
      }
    );

    const newGroupMember = await GroupMembers.create({
      groupId: group_id,
      userId: user_id,
      role: "MEMBER"
    });

    const updateRequestResponse: GroupUpdateRequestResponse = {
      group_id: newGroupMember.groupId,
      user_id: newGroupMember.userId,
      role: newGroupMember.role
    };

    return updateRequestResponse;
  } catch (error: unknown) {
    logger.error("Error occurred during accepting request: ", error);
    throw error;
  }
};

export const denyJoinRequest = async (
  group_id: number,
  user_id: number,
  owner_id: number
): Promise<void> => {
  try {
    const owner = await Group.findOne({
      where: {
        ownerId: owner_id,
        id: group_id
      }
    });

    if (!owner) {
      throw new Error(`This is not the owner of group with id ${group_id}`);
    }

    const request = await GroupRequest.findOne({
      where: {
        group_id: group_id,
        user_id: user_id
      }
    });

    if (!request) {
      throw new Error(
        `No join request found for user ${user_id} in group ${group_id}`
      );
    }

    await GroupRequest.update(
      { status: "Denied" },
      {
        where: {
          group_id: group_id,
          user_id: user_id
        }
      }
    );
  } catch (error: unknown) {
    logger.error("Error occurred during denying request: ", error);
    throw error;
  }
};

export const getRecommendations = async (userId: number) => {
  try {
    const response = await fetch(`http://recommendation-service:5000/recommend/${userId}`, {
      headers: {
        "Accept": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    logger.warn("Fetching recommendations failed");
    throw error;
  }
};