import { 
  syncRoundRotationTask, 
  unregisterRoundRotationTask, 
  isRoundRotationTaskRegistered, 
  getRoundRotationTaskStatus 
} from '@/background/roundRotationTask';

/**
 * Debug utilities for background round rotation tasks
 * These functions can be called from the console or debug screens
 */

export const backgroundTaskDebug = {
  /**
   * Get current status of the round rotation task
   */
  async getStatus() {
    const status = await getRoundRotationTaskStatus();
    console.log('Round Rotation Task Status:', status);
    return status;
  },

  /**
   * Check if the task is registered
   */
  async isRegistered() {
    const registered = await isRoundRotationTaskRegistered();
    console.log('Round Rotation Task Registered:', registered);
    return registered;
  },

  /**
   * Manually sync the round rotation task for a walk
   */
  async syncTask(walkId: string) {
    console.log('Manually syncing round rotation task for walk:', walkId);
    try {
      await syncRoundRotationTask(walkId);
      console.log('Round rotation task synced successfully');
    } catch (error) {
      console.error('Failed to sync round rotation task:', error);
    }
  },

  /**
   * Manually unregister the round rotation task
   */
  async unregisterTask() {
    console.log('Manually unregistering round rotation task');
    try {
      await unregisterRoundRotationTask();
      console.log('Round rotation task unregistered successfully');
    } catch (error) {
      console.error('Failed to unregister round rotation task:', error);
    }
  },

  /**
   * Get comprehensive debug info
   */
  async getDebugInfo() {
    const info = {
      registered: await isRoundRotationTaskRegistered(),
      status: await getRoundRotationTaskStatus(),
      timestamp: new Date().toISOString(),
    };
    console.log('Background Task Debug Info:', info);
    return info;
  }
};

// Make it available globally for debugging
if (__DEV__) {
  (global as any).backgroundTaskDebug = backgroundTaskDebug;
}
