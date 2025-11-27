// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // เพิ่ม 2 บรรทัดนี้เท่านั้น!
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // 1. Mock CSS, SCSS, images ฯลฯ
    '^.+\\.(css|less|scss|sass|png|jpg|jpeg|gif|webp|svg)$': 'identity-obj-proxy',
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default config;