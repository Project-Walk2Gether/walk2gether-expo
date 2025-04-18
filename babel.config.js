// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // if you’re using expo-router, keep this:
      'expo-router/babel',
      // then your alias mapping:
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            // ONLY map imports that start with "@/..."
            '@/': './',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json']
        },
      ],
    ],
  };
};