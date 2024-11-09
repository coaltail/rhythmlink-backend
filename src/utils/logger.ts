// src/utils/logger.ts

import { createLogger, format, transports } from 'winston';
import path from 'path';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    const env = process.env.NODE_ENV || 'dev';
    return env === 'dev' ? 'debug' : 'info';
};

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf((info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

const loggerTransports = [
    new transports.Console({
        format: format.combine(
            format.colorize(),
            logFormat
        ),
    }),
    new transports.File({
        filename: path.join(__dirname, '../../logs/error.log'),
        level: 'error',
        format: logFormat,
    }),
    new transports.File({
        filename: path.join(__dirname, '../../logs/combined.log'),
        format: logFormat,
    }),
];

// Create logger instance
const logger = createLogger({
    level: level(),
    levels,
    format: logFormat,
    transports: loggerTransports,
});

export default logger;
