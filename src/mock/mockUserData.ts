import { Instrument, MusicGenre, User } from "@models/user";

export const generateRandomUser = async () => {
    const genres = [
        MusicGenre.ROCK,
        MusicGenre.JAZZ,
        MusicGenre.CLASSICAL,
        MusicGenre.POP,
        MusicGenre.HIPHOP,
        MusicGenre.ELECTRONIC,
        MusicGenre.BLUES,
        MusicGenre.COUNTRY,
        MusicGenre.REGGAE,
        MusicGenre.METAL
    ];

    const instruments = [
        Instrument.GUITAR,
        Instrument.PIANO,
        Instrument.DRUMS,
        Instrument.VIOLIN,
        Instrument.BASS,
        Instrument.SAXOPHONE,
        Instrument.FLUTE,
        Instrument.CELLO,
        Instrument.TRUMPET,
        Instrument.VOCALS
    ];

    const randomGenres = [
        genres[Math.floor(Math.random() * genres.length)],
        genres[Math.floor(Math.random() * genres.length)],
    ];

    const randomInstrument = instruments[Math.floor(Math.random() * instruments.length)];

    const randomUser = {
        username: "user_" + Math.random().toString(36).substr(2, 9),
        email: "user_" + Math.random().toString(36).substr(2, 5) + "@example.com",
        password: "password12345",
        address: "123 Random St, Random City, 12345",
        mainInstrument: randomInstrument,
        genresOfInterest: randomGenres,
    };

    const user = await User.create(randomUser);
    return user;
}