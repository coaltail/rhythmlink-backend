import { Model, DataTypes, ForeignKey, CreationOptional } from "sequelize";
import sequelize from "@config/database";
import { User } from "./user";
import { Group } from "./group";
import Message from "./message";

export class Thread extends Model {
    declare id: number;
    declare userId: ForeignKey<User["id"]>;
    declare groupId: ForeignKey<Group["id"]>;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;

    declare user?: User;
    declare group?: Group;
    declare messages?: Message[];
}

Thread.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: User, key: "id" },
        },
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: Group, key: "id" },
        },
        createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
        sequelize,
        tableName: "threads",
        timestamps: true,
        indexes: [{ unique: true, fields: ["userId", "groupId"] }],
    }
);
Thread.hasMany(Message, { foreignKey: "threadId", as: "messages" });
Thread.belongsTo(User, { foreignKey: "userId", as: "user" });
Thread.belongsTo(Group, { foreignKey: "groupId", as: "group" });

export default Thread;
