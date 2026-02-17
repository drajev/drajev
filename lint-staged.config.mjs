/**
 * @type {import('lint-staged')}
 */
const config = {
  '*.ts': ['pnpm lint', 'pnpm format'],
  '*.{json,css,scss,md}': ['pnpm format'],
  '.env.sample': ['pnpm gen:env:docs && git add env-vars.md'],
};

export default config;
