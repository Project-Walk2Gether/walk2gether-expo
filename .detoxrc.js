/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: "jest",
      config: "e2e/jest.config.js",
    },
    jest: {
      setupTimeout: 180000, // Increased for Firebase authentication to complete
    },
  },
  behavior: {
    init: {
      exposeGlobals: true,
    },
    cleanup: {
      shutdownDevice: true,
    },
  },
  artifacts: {
    plugins: {
      log: "all",
      screenshot: {
        takeOn: ["failure"],
        shouldTakeAutomaticSnapshots: true,
        takeWhen: {
          testStart: true,
          testFailure: true,
          testDone: true,
        },
      },
      instrumentation: {
        takeOn: ["failure"],
      },
    },
    rootDir: "./e2e/artifacts",
  },
  apps: {
    "ios.sim.debug": {
      type: "ios.app",
      binaryPath: "ios/build/Build/Products/Debug-iphonesimulator/Walk2Gether.app",
      build:
        "xcodebuild -workspace ios/Walk2Gether.xcworkspace -scheme Walk2Gether -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build",
      launchArgs: {
        // These are the args that tell Expo to load the app directly, not the developer menu
        EX_UPDATES_LAUNCH_WAIT_MS: "0",
        EX_DEV_LAUNCHER_ENABLED: "0",
        EX_DEV_MENU_ENABLED: "0",
      },
    },
    "ios.sim.release": {
      type: "ios.app",
      binaryPath:
        "ios/build/Build/Products/Release-iphonesimulator/Walk2Gether.app",
      build:
        "xcodebuild -workspace ios/Walk2Gether.xcworkspace -scheme Walk2Gether -configuration Release -sdk iphonesimulator -derivedDataPath ios/build",
      launchArgs: {
        EX_UPDATES_LAUNCH_WAIT_MS: "0",
        EX_DEV_LAUNCHER_ENABLED: "0",
        EX_DEV_MENU_ENABLED: "0",
      },
    },
    "android.emu.debug": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/debug/app-debug.apk",
      build:
        "cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug",
      reversePorts: [8081],
    },
    "android.emu.release": {
      type: "android.apk",
      binaryPath: "android/app/build/outputs/apk/release/app-release.apk",
      build:
        "cd android && ./gradlew assembleRelease assembleAndroidTest -DtestBuildType=release",
    },
  },
  devices: {
    simulator: {
      type: "ios.simulator",
      device: {
        type: "iPhone 13",
      },
    },
    emulator: {
      type: "android.emulator",
      device: {
        avdName: "Pixel_3a_API_30_x86",
      },
    },
  },
  configurations: {
    "ios.sim.debug": {
      device: "simulator",
      app: "ios.sim.debug",
    },
    "ios.sim.release": {
      device: "simulator",
      app: "ios.sim.release",
    },
    "android.emu.debug": {
      device: "emulator",
      app: "android.emu.debug",
    },
    "android.emu.release": {
      device: "emulator",
      app: "android.emu.release",
    },
  },
};
