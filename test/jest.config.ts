const path = require('path');
const tsconfig = require('./tsconfig.json');
const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
    globals: {
        ENV: 'local'
    },
    moduleDirectories: ['node_modules', 'src'],
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/', '<rootDir>/test/', '<rootDir>/common/test/'],
    setupFilesAfterEnv: [path.join(__dirname, '/tests-setup.js')],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
        '\\.(css|less|scss|sass)$': 'jest-transform-css'
    },
    moduleNameMapper: {
        '^.+\\.svg$': path.join(__dirname, '/src/__mocks__/svgr.ts'),
        '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
        '@common/api/overrides': path.join(__dirname, '/src/__mocks__/overrides.ts'),
        '@common/hooks/context': path.join(__dirname, '/src/hooks/context'),
        ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
            prefix: path.resolve(__dirname, tsconfig.compilerOptions.baseUrl)
        })
    }
};