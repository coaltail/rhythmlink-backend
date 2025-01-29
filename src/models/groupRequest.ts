import { Model, DataTypes } from "sequelize";
import sequelize from "@config/database";
import { User } from "./user";
import { Group } from "./group";

export class GroupRequest extends Model {
  public user_id!: number;
  public group_id!: number;
  public sentAt!: Date;
  public status!: string;
}

GroupRequest.init(
  {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: User,
        key: "id"
      },
      onDelete: "CASCADE"
    },
    group_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: Group,
        key: "id"
      },
      onDelete: "CASCADE"
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Not sent",
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: "group_request",
    timestamps: true
  }
);
