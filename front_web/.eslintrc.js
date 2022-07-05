const createConfig = require('@titicaca/eslint-config-triple/create-config');

const wd = process.cwd().split('/').slice(-1)[0];

module.exports = createConfig({
  type: 'frontend',
  project: `.${wd === 'honeypick_re' ? '/front_web' : ''}/tsconfig.json`,
});
