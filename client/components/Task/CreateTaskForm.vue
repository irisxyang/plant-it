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
    const filteredLinks = links.value.filter((link) => link !== "");
    await fetchy("/api/tasks", "POST", {
      body: { title: title.value, notes: notes.value, project: currentProject.value, links: filteredLinks, assignee: assignee.value, deadline: deadline.value },
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

const addLink = () => {
  links.value.push("");
};

const removeLink = (index: number) => {
  links.value.splice(index, 1);
};
</script>

<template>
  <form class="create-task-form default-border" @submit.prevent="createTask()">
    <h2>Add a New Task:</h2>
    <div class="input-item-container">
      <div class="input-item-column">
        <div class="input-item">
          <label for="Title:">Title:</label>
          <input id="Title:" v-model="title" type="text" placeholder="Add a task title!" required />
        </div>
        <div class="input-item">
          <label for="deadline">Deadline:</label>
          <input id="deadline" v-model="deadline" type="date" required />
        </div>
        <div class="input-item">
          <label for="Assign to:">Assignee:</label>
          <select id="Assign to:" v-model="assignee" required>
            <option value="" disabled selected>Select a user to assign to</option>
            <option v-for="member in props.members" :key="member" :value="member">{{ member }}</option>
          </select>
        </div>
      </div>
      <div class="input-item-column">
        <div class="input-item">
          <label for="Links:">Links:</label>
          <div class="link-container">
            <div v-for="(link, index) in links" :key="index" class="link-input">
              <input v-model="links[index]" type="text" placeholder="Add a link!" />
              <button type="button" class="small-button" @click="removeLink(index)">-</button>
            </div>
            <button type="button" class="small-button add-button" @click="addLink()">+</button>
          </div>
        </div>
        <div class="input-item">
          <label for="Notes:">Notes:</label>
          <textarea id="Notes:" v-model="notes" placeholder="Add any extra notes!" required />
        </div>
      </div>
    </div>
    <button type="submit" class="main-button" style="margin-top: 0">Create Task</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
  width: 100%;
  align-items: center;
}

h2 {
  margin: 0.25em 0 0 0;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}

.input-item-container {
  display: flex;
  flex-direction: row;
  gap: 2em;
}

.input-item-column {
  display: flex;
  flex-direction: column;
  gap: 0.5em;
}

.input-item > label {
  align-self: center;
}

.input-item > input,
.input-item > select,
.input-item > textarea {
  width: 100%;
}

.link-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
}

.link-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.add-button {
  margin: 0 auto;
  width: 80%;
}
</style>
