/* eslint-disable */
import type { Config } from 'jest';

const config: Config = {
  displayName: 'jest',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
    // '\\.[jt]sx?$': ['babel-jest', { presets: ['@nrwl/react/babel'] }],
    '^.+\\.[tj]sx?$': '<rootDir>/mfTransformer.js',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/jest',
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
};

export default config;
