import { defineStore } from "pinia";
import { ref } from "vue";

/**
 * use when switching to project page
 * or edit project page
 */
export const useProjectStore = defineStore(
  "project",
  () => {
    const currentProject = ref("");

    const hasProject = ref(false);

    const updateCurrentProject = async (proj: string) => {
      // proj is the project ID
      currentProject.value = proj;
      hasProject.value = true;
    };

    const resetProjectStore = () => {
      currentProject.value = "";
      hasProject.value = false;
    };

    return {
      currentProject,
      hasProject,
      updateCurrentProject,
      resetProjectStore,
    };
  },
  { persist: true },
);
