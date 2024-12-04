import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * use when switching to edit task page
 */
export const useTaskStore = defineStore(
  "task",
  () => {
    const currentTask = ref("");

    const hasTask = ref(false);

    const updateCurrentTask = async (task: string) => {
      // task is the project ID
      currentTask.value = task;
      hasTask.value = true;
    };

    const resetTaskStore = () => {
      currentTask.value = "";
      hasTask.value = false;
    };

    return {
      currentTask,
      hasTask,
      updateCurrentTask,
      resetTaskStore,
    };
  },
  { persist: true },
);
