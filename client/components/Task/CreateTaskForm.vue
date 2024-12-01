<script setup lang="ts">
import { computed, onBeforeMount, ref, watch } from "vue";
import { fetchy } from "../../utils/fetchy";

const title = ref("");
const notes = ref("");
const selectedProject = ref("");
const links = ref<string[]>([]);
const assignee = ref("");

const projects = ref<Record<string, string>[]>([]);
const projectMembers = ref<string[]>([]);
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

const projectOptions = computed(() => {
  return projects.value.map((project) => ({
    label: project.name,
    value: project._id,
  }));
});

async function getProjects() {
  try {
    const fetchedProjects = await fetchy("api/user/projects", "GET");
    projects.value = fetchedProjects;
  } catch (_) {
    return;
  }
}

const getProjectMembers = async (id: string) => {
  const query: Record<string, string> = { id };
  try {
    const members = await fetchy("/api/project/members", "GET", { query });
    projectMembers.value = members;
  } catch {
    return;
  }
};

watch(selectedProject, () => {
  getProjectMembers(selectedProject.value);
});

onBeforeMount(getProjects);
</script>

<template>
  <form class="create-task-form default-border" @submit.prevent="createTask(title, notes, selectedProject, links, assignee)">
    <label for="content">Create a new task for a project (temp frontend placeholder)</label>
    you can only add tasks if you are the creator of a project. <br /><br />for initial testing purposes, add your username to the "Assign to:" field in order to see tasks displayed below (since on
    home page, will only show YOUR tasks)
    <input id="Title:" v-model="title" type="text" placeholder="Add a task title!" required />
    <input id="Notes:" v-model="notes" type="text" placeholder="Add any extra notes!" required />
    <select id="Project Id:" v-model="selectedProject" required @change="getProjectMembers(selectedProject)">
      <option value="" disabled selected>Select a project</option>
      <option v-for="project in projectOptions" :key="project.value" :value="project.value">{{ project.label }}</option>
    </select>
    <select id="Assign to:" v-model="assignee" required>
      <option value="" disabled selected>Select a user to assign to</option>
      <option v-for="member in projectMembers" :key="member" :value="member">{{ member }}</option>
    </select>
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
