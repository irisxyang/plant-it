<script setup lang="ts">
import CreateProjectForm from "@/components/Project/CreateProjectForm.vue";
import ProjectListComponent from "@/components/Project/ProjectListComponent.vue";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

let projects = ref<Array<Record<string, string>>>([]);
const loaded = ref(false);

async function getProjects() {
  let projectResults;

  try {
    projectResults = await fetchy(`/api/projects`, "GET");
  } catch (_) {
    return;
  }

  projects.value = projectResults;
}

onBeforeMount(async () => {
  await getProjects();
  loaded.value = true;
});
</script>

<template>
  <main>
    <h1 class="main-page-heading">Your Projects</h1>
    <!-- <RouterLink :to="{ name: 'CreateProject' }" type="submit" class="main-button">Start a New Project</RouterLink> -->
    <CreateProjectForm />

    <ProjectListComponent />
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
