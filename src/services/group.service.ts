import BlobService from "@common/blobService";
import { GroupCreateResponse } from "@interface/group";
import { Group } from "@models/group";
import { MusicGenre } from "@models/user";
import logger from "@utils/logger";
export const createNewGroup = async (ownerId: number, name: string, genres: Array<MusicGenre>, mainImage: Express.Multer.File): Promise<GroupCreateResponse> => {
    try {
        const blobService = BlobService.getInstance();
        const blobName = `groups/${Date.now()}-${mainImage.originalname}`;
        const mainImageUrl = await blobService.uploadBlob(blobName, mainImage.buffer);

        const newGroup = await Group.create({
            name,
            ownerId: ownerId,
            genres: genres,
            mainImageUrl,
        });

        const groupResponse: GroupCreateResponse = {
            id: newGroup.id,
            name: newGroup.name,
            ownerId: newGroup.ownerId,
            mainImageUrl: newGroup.mainImageUrl,
            genres: newGroup.genres,
            createdAt: newGroup.createdAt,
            updatedAt: newGroup.updatedAt,
        };

        return groupResponse;
    } catch (error: unknown) {
        logger.error("Error occured during creation of new group.")
        throw error;
    }

}