const appConfig = require("./app.json").expo;

appConfig.android.config.googleMaps.apiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

module.exports = appConfig;
