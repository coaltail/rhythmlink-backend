import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import bcrypt from "bcrypt";

export enum MusicGenre {
  ROCK = "Rock",
  JAZZ = "Jazz",
  CLASSICAL = "Classical",
  POP = "Pop",
  HIPHOP = "Hip-Hop",
  ELECTRONIC = "Electronic",
  BLUES = "Blues",
  COUNTRY = "Country",
  REGGAE = "Reggae",
  METAL = "Metal",
}

export enum Instrument {
  GUITAR = "Guitar",
  PIANO = "Piano",
  DRUMS = "Drums",
  VIOLIN = "Violin",
  BASS = "Bass",
  SAXOPHONE = "Saxophone",
  FLUTE = "Flute",
  CELLO = "Cello",
  TRUMPET = "Trumpet",
  VOCALS = "Vocals",
}
export class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 15);
});

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mainInstrument: {
      type: DataTypes.ENUM(...Object.values(Instrument)),
      allowNull: false,
    },
    genresOfInterest: {
      type: DataTypes.ARRAY(DataTypes.ENUM(...Object.values(MusicGenre))),
      allowNull: false,
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
    tableName: "users",
    timestamps: true,
  }
);

