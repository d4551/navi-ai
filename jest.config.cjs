module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'vue'],
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(t|j)sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/src/.*/__tests__/.*(spec|test)\\.(ts)$',
    '/src/.*\\.spec\\.(ts|js)$',
  ],
  collectCoverageFrom: ['src/**/*.{js,ts,vue}', '!src/**/*.d.ts'],
}
