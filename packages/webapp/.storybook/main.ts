import type { StorybookConfig } from '@storybook/react-vite';

const { mergeConfig } = require('vite');
const config: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx', '../../webapp-libs/**/src/**/*.stories.tsx'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-styling', 'storybook-dark-mode'],
  staticDirs: ['../public'],
  features: {
    storyStoreV7: false,
  },
  core: {},
  async viteFinal(config, options) {
    return mergeConfig(config, {});
  },
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.ts',
      },
    },
  },
  docs: {
    autodocs: true,
  },
  typescript: {
    reactDocgen: 'react-docgen',
  },
};
export default config;
