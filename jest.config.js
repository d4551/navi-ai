module.exports = {
  testEnvironment: "jsdom",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx", "vue"],
  transform: {
    "^.+\\.vue$": "@vue/vue3-jest",
    "^.+\\.(t|j)sx?$": "babel-jest"
  },
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1"
  }
};