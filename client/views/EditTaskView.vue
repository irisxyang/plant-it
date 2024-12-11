<script setup lang="ts">
import EditTaskForm from "@/components/Task/EditTaskForm.vue";
import router from "@/router";
import { useTaskStore } from "@/stores/task";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";

const { currentTask } = storeToRefs(useTaskStore());

const deleteTask = async () => {
  try {
    await fetchy(`/api/tasks/${currentTask.value}`, "DELETE");
  } catch {
    console.log("Failed to delete task");
    return;
  }

  void router.push({ name: "ProjectPage" });
};
</script>

<template>
  <main v-if="currentTask !== ''" class="column">
    <h1>Edit Task</h1>
    <EditTaskForm />
    <div class="main-button" @click="deleteTask">Delete Task</div>
  </main>
</template>

<style scoped>
.create-task-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0.5em;
}

form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
