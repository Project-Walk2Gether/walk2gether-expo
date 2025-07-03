import { NativeModules } from 'react-native';

/**
 * Detects if the app is running in a Detox E2E test environment
 * 
 * This checks for the presence of global.__DETOX__ which is set during E2E tests
 * or for the detoxE2E launch argument
 */
export const isDetoxTest = (): boolean => {
  if (typeof global !== 'undefined') {
    return Boolean(
      // Check for the global flag
      (global as any).__DETOX__ || 
      // Check for dev mode + detoxE2E launch arg
      ((global as any).__DEV__ && 
        NativeModules?.RNDeviceInfo?.getConstants?.()?.detoxE2E === 'true')
    );
  }
  return false;
};

// Set the global flag if we detect the detoxE2E launch arg
if (typeof global !== 'undefined') {
  (global as any).__DETOX__ = !!(global as any).__DETOX__ || 
    ((global as any).__DEV__ && 
      NativeModules?.RNDeviceInfo?.getConstants?.()?.detoxE2E === 'true');
}
