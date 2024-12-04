<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const { currentProject } = useProjectStore();
const projectName = ref("");
const projectCreatorId = ref("");
const projectCreator = ref("");
const loaded = ref(false);

const projectMembers = ref<Array<Record<string, string>>>([]);

const getProject = async () => {
  const query: Record<string, string> = { id: currentProject };
  let proj;
  try {
    proj = await fetchy("/api/projects", "GET", { query });
  } catch {
    return;
  }
  projectName.value = proj.name;
  projectCreatorId.value = proj.creator;
};

const getProjectMembers = async () => {
  // get project members here
  const query: Record<string, string> = { id: currentProject };
  let members;
  try {
    members = await fetchy("/api/project/members", "GET", { query });
  } catch {
    return;
  }
  projectMembers.value = members;
};

const getProjectCreator = async (creatorId: string) => {
  //   let query: Record<string, string> = { id: creatorId };
  let creator;
  try {
    creator = await fetchy(`/api/users/username/${creatorId}`, "GET");
  } catch (_) {
    return "Project Creator Not Found";
  }
  projectCreator.value = creator;
};

onBeforeMount(async () => {
  await getProject();
  await getProjectCreator(projectCreatorId.value);
  await getProjectMembers();
  loaded.value = true;
});
</script>
<template>
  Project Page
  <div>Project Name: {{ projectName }}</div>
  <div>ProjectCreator: {{ projectCreator }}</div>
  <div>ProjectMembers: {{ projectMembers }}</div>
</template>
