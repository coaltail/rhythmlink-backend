import { User } from "./user";
import { Group } from "./group";
import sequelize from "@config/database";
import { Model, DataTypes } from 'sequelize';

export class GroupMembers extends Model {
  public groupId!: number;
  public userId!: number;
  public role!: string;
}

GroupMembers.init(
  {
    groupId: {
      type: DataTypes.INTEGER,
      references: {
        model: Group,
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('OWNER', 'MEMBER'),
      allowNull: false,
      defaultValue: 'MEMBER',
    },
  },
  {
    sequelize,
    tableName: 'group_members',
    timestamps: false,
  }
);


User.belongsToMany(Group, { through: GroupMembers, foreignKey: "userId", as: "groups" });
Group.belongsToMany(User, { through: GroupMembers, foreignKey: "groupId", as: "members" });

Group.belongsTo(User, { foreignKey: "ownerId", as: "owner", constraints: true });
User.hasMany(Group, { foreignKey: "ownerId", as: "ownedGroups" });
