<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import ProjectComponent from "./ProjectComponent.vue";

const loaded = ref(false);
let projects = ref<Array<Record<string, string>>>([]);
const { currentUsername } = storeToRefs(useUserStore());

async function getProjects() {
  const fetchedProjects = await fetchy("api/user/projects", "GET");
  projects.value = fetchedProjects;
}

onBeforeMount(async () => {
  await getProjects();
  loaded.value = true;
});
</script>

<template>
  <section class="project-list" v-if="loaded && projects.length !== 0">
    My Projects:
    <article v-for="project in projects" :key="project._id">
      <ProjectComponent :project="project" />
    </article>
  </section>
  <p v-else-if="loaded">No Projects.</p>
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
