import { Model, DataTypes, BelongsToManyAddAssociationMixin } from "sequelize";
import sequelize from "@config/database";
import { User, MusicGenre } from "./user";


export class Group extends Model {
    public id!: number;
    public name!: string;
    public ownerId!: number;
    public genres!: MusicGenre[];
    public createdAt!: Date;
    public updatedAt!: Date;
    public mainImageUrl!: string;

    public addMember!: BelongsToManyAddAssociationMixin<User, number>;
}

Group.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ownerId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        mainImageUrl: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        genres: {
            type: DataTypes.JSON,
            allowNull: false,
            validate: {
                isGenresValid(value: unknown) {
                    if (!Array.isArray(value) || !value.every(v => Object.values(MusicGenre).includes(v))) {
                        throw new Error("Invalid genres");
                    }
                }
            }
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "groups",
        timestamps: true,
    }
);
