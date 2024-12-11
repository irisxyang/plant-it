<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";
import ProjectComponent from "./ProjectComponent.vue";

const loaded = ref(false);
let projects = ref<Array<Record<string, string>>>([]);

async function getProjects() {
  try {
    const fetchedProjects = await fetchy("api/projects", "GET");
    projects.value = fetchedProjects;
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  await getProjects();
  loaded.value = true;
});
</script>

<template>
  <section class="project-list" v-if="loaded && projects.length !== 0">
    <article v-for="project in projects" :key="project._id">
      <ProjectComponent @refreshProjects="getProjects" :project="project" />
    </article>
  </section>
  <p v-else-if="loaded">You are not currently a member of any projects.</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
