<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const loaded = ref(false);
const props = defineProps(["task"]);
const taskTitle = ref(props.task.title);
const taskNotes = ref(props.task.notes);
const assignee = ref(props.task.assignee);
const projectName = ref("");

const getProjectName = async () => {
  let project;

  try {
    project = await fetchy(`/api/projects/${props.task.project}`, "GET");
  } catch (_) {
    return;
  }

  projectName.value = project.name;
};

onBeforeMount(async () => {
  await getProjectName();
  loaded.value = true;
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded" class="task-full-container default-border">
    <p class="task-title">{{ taskTitle }}</p>
    <p v-if="assignee" class="task-assignee">Assigned to: {{ assignee }}</p>
    <p v-else class="task-assignee">Unassigned</p>
    <p class="task-comment">Notes: {{ taskNotes }}</p>
    <p class="task-comment">Corresponding Project: {{ projectName }}</p>
  </div>
  <div v-else>Loading...</div>
</template>

<style scoped>
.task-full-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1em;
  margin: 0.5em;
}

.task-title {
  font-size: 1.5em;
}

.task-assignee {
  font-size: 1em;
}

.task-comment {
  font-size: 1em;
}
</style>
