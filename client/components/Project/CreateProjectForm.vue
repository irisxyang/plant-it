<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const name = ref("");
// const emit = defineEmits(["refreshProjects"]);

const createProject = async (name: string) => {
  try {
    await fetchy("/api/projects", "POST", {
      body: { name },
    });
  } catch (_) {
    return;
  }

  // TODO: update store with current projectID
  // (indicate which project we're looking at)
  // and then navigate to add user form
  // void router.push({ name: "AddUser" });
};
</script>

<template>
  <form class="create-project-form default-border" @submit.prevent="createProject(name)">
    <label for="content">Create a new project!</label>
    <input id="content" v-model="name" type="text" placeholder="Add a project name!" required />
    <button type="submit" class="pure-button-primary pure-button">Create Project</button>
  </form>
</template>

<style scoped>
.create-project-form {
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
