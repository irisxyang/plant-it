<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps<{
  members: string[];
}>();
const emit = defineEmits<{ (e: "refreshTasks"): void }>();

const { currentProject } = storeToRefs(useProjectStore());

const title = ref("");
const notes = ref("");
const deadline = ref("");
const assignee = ref("");
const links = ref<string[]>([]);

const createTask = async () => {
  try {
    await fetchy("/api/tasks", "POST", {
      body: { title: title.value, notes: notes.value, project: currentProject.value, links: links.value, assignee: assignee.value, deadline: deadline.value },
    });
  } catch (_) {
    return;
  }

  emit("refreshTasks");
  title.value = "";
  notes.value = "";
  assignee.value = "";
  deadline.value = "";
  links.value = [];
};
</script>

<template>
  <form class="create-task-form default-border" @submit.prevent="createTask()">
    <h2>Add a New Task:</h2>
    <span class="inputs">
      <div class="input-col">
        <span class="input-item">
          <label for="Title:">Title:</label>
          <input id="Title:" v-model="title" type="text" placeholder="Add a task title!" required
        /></span>
        <span class="input-item">
          <label for="deadline">Deadline:</label>
          <input id="deadline" v-model="deadline" type="date" required />
        </span>
      </div>
      <div class="input-col">
        <span class="input-item">
          <label for="Notes:">Notes:</label>
          <input id="Notes:" v-model="notes" type="text" placeholder="Add any extra notes!" required />
        </span>
        <span class="input-item">
          <label for="Assign to:">Assignee:</label>
          <select style="margin-left: 0.5em" id="Assign to:" v-model="assignee" required>
            <option value="" disabled selected>Select a user to assign to</option>
            <option v-for="member in props.members" :key="member" :value="member">{{ member }}</option>
          </select>
        </span>
      </div>
    </span>
    <button type="submit" class="main-button" style="margin-top: 0">Create Task</button>
  </form>
</template>

<style scoped>
.create-task-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0.5em;
  width: 90%;
}

h2 {
  margin: 0;
  margin-top: 0.25em;
  padding-bottom: 0;
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

input {
  margin: 0.5em;
}

.input-col {
  display: flex;
  flex-direction: column;
  padding: 1em;
  padding-top: 0.1;
  padding-bottom: 0.1;
}

.inputs {
  display: flex;
  flex-direction: row;
  padding-bottom: 0;
  margin-bottom: 0;
}

.input-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
</style>
