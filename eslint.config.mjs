import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'packages/**',
      'reference/**',
      'tsconfig.tsbuildinfo',
    ],
  },
  ...nextVitals,
  prettier,
];

export default config;
