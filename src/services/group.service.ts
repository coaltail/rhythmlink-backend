import BlobService from "@common/blobService";
import sequelize from 'sequelize'
import { GroupCreateResponse, GroupGetResponse } from "@interface/group";
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

export const getGroup = async (id: number): Promise<GroupGetResponse> => {
    try {

        const group = await Group.findOne({where: {id} });

        if (!group){
            throw new Error(`Group with id ${id} not found.`);
        }

        const groupData: GroupGetResponse = {
            name: group.name,
            mainImageUrl: group.mainImageUrl,
            genres: group.genres,
        };

        return groupData;

    } catch (error: unknown) {
        logger.error("Error occured during retrieving of group.")
        throw error;
    }
}

export const searchGroup = async (pageSize: string = "20", pageNumber: string = "1", name?: string, genres?: string[]) => {
    try {
        const limit = parseInt(pageSize);
        const offset = (parseInt(pageNumber) - 1) * limit;

        const where: any = {};

        if (name) {
            where.name = {
                [sequelize.Op.like]: `%${name}%`,
            };
        }
        if (genres && genres.length > 0) {
            const cleanedGenres = genres.map((genre: string) => genre.replace('', ''));
            console.log("genres: ", cleanedGenres)
            logger.info("cleaned genres: ", cleanedGenres);
            where.genres = {
                [sequelize.Op.in]: cleanedGenres,
            };
        }

        const groups = await Group.findAll({
            where,
            limit,
            offset,
        });

        return groups;
    } catch (err) {
        logger.error("Error occurred during group search:", err);
        throw err;
    }
};

