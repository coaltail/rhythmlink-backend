import { Model, DataTypes } from "sequelize";
import sequelize from "@config/database";
import bcrypt from "bcryptjs";

export enum MusicGenre {
  ROCK = "ROCK",
  JAZZ = "JAZZ",
  CLASSICAL = "CLASSICAL",
  POP = "POP",
  HIPHOP = "HIPHOP",
  ELECTRONIC = "ELECTRONIC",
  BLUES = "BLUES",
  COUNTRY = "COUNTRY",
  REGGAE = "REGGAE",
  METAL = "METAL",
}

export enum Instrument {
  GUITAR = "GUITAR",
  PIANO = "PIANO",
  DRUMS = "DRUMS",
  VIOLIN = "VIOLIN",
  BASS = "BASS",
  SAXOPHONE = "SAXOPHONE",
  FLUTE = "FLUTE",
  CELLO = "CELLO",
  TRUMPET = "TRUMPET",
  VOCALS = "VOCALS",
}

export class User extends Model {
  public id!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public address!: string;
  public mainInstrument!: Instrument;
  public genresOfInterest!: MusicGenre[];  // This should be handled as a JSON or a string column in MySQL
  public createdAt!: Date;
  public updatedAt!: Date;
}

const instruments = Object.values(Instrument);

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
      validate: {
        len: {
          args: [10, 45],
          msg: "Password must be at least 10 characters long.",
        }
      }
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mainInstrument: {
      type: DataTypes.ENUM(...instruments),
      allowNull: false,
    },
    genresOfInterest: {
      type: DataTypes.JSON,
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
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 15);
        }
      },
    },
  }
);
