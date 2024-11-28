<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const title = ref("");
const notes = ref("");
const project = ref("");
const links = ref<Array<string>>([]);
const assignee = ref("");
// const emit = defineEmits(["refreshProjects"]);

const createTask = async (title: string, notes: string, project: string, links: string[], assignee: string) => {
  try {
    await fetchy("/api/project/tasks", "POST", {
      body: { title, notes, project, links, assignee },
    });
  } catch (_) {
    return;
  }
};
</script>

<template>
  <form class="create-task-form default-border" @submit.prevent="createTask(title, notes, project, links, assignee)">
    <label for="content">Create a new task for a project (temp frontend placeholder)</label>
    you can only add tasks if you are the creator of a project. <br /><br />for initial testing purposes, add your username to the "Assign to:" field in order to see tasks displayed below (since on
    home page, will only show YOUR tasks)
    <input id="Title:" v-model="title" type="text" placeholder="Add a task title!" required />
    <input id="Notes:" v-model="notes" type="text" placeholder="Add any extra notes!" required />
    <input id="Project Id:" v-model="project" type="text" placeholder="add project id (temp frontend placeholder)" required />
    <input id="Assign to:" v-model="assignee" type="text" placeholder="put one username down (temp frontend placeholder)" />
    <button type="submit" class="pure-button-primary pure-button">Create Task</button>
  </form>
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
