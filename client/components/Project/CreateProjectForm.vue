<script setup lang="ts">
import router from "@/router";
import { useProjectStore } from "@/stores/project";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
// const emit = defineEmits(["refreshProjects"]);
const { updateCurrentProject } = useProjectStore();

const createProject = async (name: string) => {
  let project;
  try {
    project = await fetchy("/api/projects", "POST", {
      body: { name },
    });
  } catch (_) {
    return;
  }

  await updateCurrentProject(project.project._id);
  void router.push({ name: "ProjectPage" });
};
</script>

<template>
  <form class="create-project-form" @submit.prevent="createProject(name)">
    <h2>Start a New Project!</h2>
    <input id="content" v-model="name" type="text" placeholder="Add a project name!" required />
    <button type="submit" class="main-button">Create Project</button>
  </form>
</template>

<style scoped>
.create-project-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 0;
  padding-bottom: 2em;
  margin: 0;
  width: 400px;
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
