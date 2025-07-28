module.exports = {
    extends: ['electron', '@electron-toolkit/eslint-config-ts', 'prettier'],
    rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
    },
};
