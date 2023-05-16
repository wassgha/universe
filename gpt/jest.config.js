/* eslint-disable */
module.exports = {
  displayName: 'gpt',
  preset: '../jest.preset.js',
  testTimeout: 98273927,
  // globals: {
  //   'ts-jest': {
  //     tsconfig: '<rootDir>/tsconfig.spec.json',
  //   },
  // },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../coverage/packages/gpt',
};
