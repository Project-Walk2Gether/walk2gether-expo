import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import * as Updates from "expo-updates";

const BACKGROUND_TASK_NAME = "task-run-expo-update";

TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
  const update = await Updates.checkForUpdateAsync();
  if (update.isAvailable) {
    await Updates.fetchUpdateAsync();

    // You may not want to reload the app while it is backgrounded, this
    // will impact the user experience if your app state isn't saved
    // and restored.
    await Updates.reloadAsync();
  }
});

async function registerTask() {
  const isRegistered = TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
  if (!isRegistered) {
    await BackgroundTask.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 60 * 12, // Try to repeat every 12 hours while backgrounded
    });
  }
}

registerTask();
