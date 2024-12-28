import { Model, DataTypes } from "sequelize";
import sequelize from "@config/database";
import { Group } from "./group";

export class GroupImage extends Model {
    public id!: number;
    public groupId!: number;
    public imageUrl!: string;
    public createdAt!: Date;
}

GroupImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Group,
                key: "id",
            },
            onDelete: "CASCADE",
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize,
        tableName: "group_images",
        timestamps: true,
        updatedAt: false,
    }
);

// Associations
Group.hasMany(GroupImage, { foreignKey: "groupId", as: "images" });
GroupImage.belongsTo(Group, { foreignKey: "groupId", as: "group" });
