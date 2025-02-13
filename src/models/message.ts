import { Model, DataTypes, ForeignKey } from "sequelize";
import sequelize from "@config/database";
import { Thread } from "./thread";
import { User } from "./user";
import { Group } from "./group";

export class Message extends Model {
    declare id: number;
    declare threadId: ForeignKey<Thread["id"]>;
    declare senderUserId: ForeignKey<User["id"]> | null;
    declare senderGroupId: ForeignKey<Group["id"]> | null;
    declare content: string;
    declare createdAt: Date;

    declare senderUser?: User;
    declare senderGroup?: Group;
}

Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        threadId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Thread, key: "id" },
        },
        senderUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: User, key: "id" },
        },
        senderGroupId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: Group, key: "id" },
        },
        content: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        tableName: "messages",
        timestamps: true,
    }
);

Message.belongsTo(User, { foreignKey: "senderUserId", as: "senderUser" });
Message.belongsTo(Group, { foreignKey: "senderGroupId", as: "senderGroup" });

export default Message;
