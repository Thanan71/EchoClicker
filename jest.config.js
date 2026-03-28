/** @type {import('jest').Config} */
export default {
    testEnvironment: 'jsdom',

    testMatch: [
        '<rootDir>/tests/**/*.test.cjs',
        '<rootDir>/tests/**/*.spec.cjs',
        '<rootDir>/tests/**/*.test.js',
        '<rootDir>/tests/**/*.spec.js',
    ],

    setupFiles: ['<rootDir>/tests/helpers/setup.cjs'],
    setupFilesAfterEnv: ['<rootDir>/tests/helpers/reset.cjs'],

    moduleDirectories: ['node_modules', '<rootDir>/js'],

    collectCoverageFrom: [
        'js/**/*.js',
        '!js/**/*.test.js',
        '!js/**/*.test.cjs',
        '!js/**/__mocks__/**',
        '!node_modules/**',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],

    resetModules: true,
    clearMocks: true,
    restoreMocks: true,
};
