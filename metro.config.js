// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Tell Metro to treat `.lottie` files as assets:
config.resolver.assetExts.push('lottie');

module.exports = config;