import { Model, DataTypes } from "sequelize";
import sequelize from "@config/database";
import { User } from "./user";

export class UserImage extends Model {
    public id!: number;
    public userId!: number;
    public imageUrl!: string;
    public createdAt!: Date;
}

UserImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
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
        tableName: "user_images",
        timestamps: true,
        updatedAt: false,
    }
);

// Associations
User.hasMany(UserImage, { foreignKey: "userId", as: "images" });
UserImage.belongsTo(User, { foreignKey: "userId", as: "user" });