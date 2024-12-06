<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["isUserCreator"]);
const loaded = ref(false);
const { currentProject } = storeToRefs(useProjectStore());
let projectMembers = ref<Array<Record<string, string>>>([]);
const { currentUsername } = storeToRefs(useUserStore());

const getProjectMembers = async () => {
  // get project members here
  const query: Record<string, string> = { id: currentProject.value };
  let members;
  try {
    members = await fetchy("/api/project/members", "GET", { query });
  } catch {
    return;
  }
  projectMembers.value = members;
};

onBeforeMount(async () => {
  await getProjectMembers();
  loaded.value = true;
});
</script>

<template>
  <div class="project-list">
    <section v-if="loaded && projectMembers.length !== 0">
      <div v-for="member in projectMembers" :key="member._id">
        <div class="member-component default-border">{{ member }}</div>
        <!-- <ProjectComponent @refreshProjects="getProjects" :project="project" /> -->
      </div>
    </section>
    <p v-else-if="loaded">You are not currently a member of any projects.</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.member-component {
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 0.5em 1em;
  margin: 0.5em;
  margin-top: 0;
  width: 75%;
  font-size: 1.1em;
}
</style>
