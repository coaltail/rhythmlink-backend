module.exports = {
  moduleNameMapper: {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@controllers/(.*)$": "<rootDir>/src/controllers/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@interface/(.*)$": "<rootDir>/src/interface/$1",
    "^@common/(.*)$": "<rootDir>/src/common/$1"
  },
  transform: {
    "^.+\\.ts?$": "ts-jest"
  },
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  };
  