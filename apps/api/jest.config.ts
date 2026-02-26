import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@conform-plus/shared$': '<rootDir>/../../packages/shared/src',
    '^(\\.{1,2}/.*)\\.[jt]s$': '$1',
  },
};

export default config;
