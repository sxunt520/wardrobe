import { defineConfig } from '@tarojs/cli';
import path from 'path';

export default defineConfig(async (merge) => {
  const baseConfig = {
    projectName: 'wardrobe-miniprogram',
    date: '2026-07-11',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    alias: {
      '@': path.resolve(__dirname, '..', 'src'),
    },
    plugins: ['@tarojs/plugin-platform-weapp'],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: 'webpack5',
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
        },
      },
    },
    h5: {},
  };

  if (process.env.NODE_ENV === 'production') {
    return merge({}, baseConfig, (await import('./prod')).default);
  }
  return merge({}, baseConfig, (await import('./dev')).default);
});
