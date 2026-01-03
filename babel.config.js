module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@assets': './src/assets',
          '@images': './src/assets/images',
          '@fonts': './src/assets/fonts',
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@context': './src/context',
          '@navigation': './src/navigation',
          '@constants': './src/constants',
          '@utils': './src/utils',
          '@services': './src/services',
          '@types': './src/types',
          '@app-types': './src/types',
        }
      },
    ],
  ],
};
