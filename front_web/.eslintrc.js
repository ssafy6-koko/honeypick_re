const createConfig = require('@titicaca/eslint-config-triple/create-config');

const wd = process.cwd().split('/').slice(-1)[0];

const { extends: extendConfigs, overrides } = createConfig({
  type: 'frontend',
  project: `.${wd === 'honeypick_re' ? '/front_web' : ''}/tsconfig.json`,
});

module.exports = {
  extends: [
    ...extendConfigs,
    // 확장할 규칙 이름...
  ],
  overrides: [
    ...overrides,
    // 특정 파일 대상 규칙...
  ],
  rules: {
    'no-console': 'off',
  },
};
