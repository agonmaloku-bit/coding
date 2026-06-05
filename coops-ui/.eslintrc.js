module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-useless-template-attributes': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off'
  }
}
