module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            "expo-router/babel",         // MUST be first
            "nativewind/babel",
            "react-native-reanimated/plugin", // MUST be last
        ],
    };
};
