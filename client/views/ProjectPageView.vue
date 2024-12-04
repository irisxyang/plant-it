<script setup lang="ts">
import TaskListComponent from "@/components/Task/TaskListComponent.vue";
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
  console.log("currently viewing project:", currentProject);
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
  //   console.log("this is the current project page for:", currentProject);
  await getProjectCreator(projectCreatorId.value);
  await getProjectMembers();
  loaded.value = true;
});
</script>
<template>
  <main>
    <h1>{{ projectName }}</h1>
    <div v-if="projectMembers.length == 1">only one member, add more!</div>
    <!-- <span>
      <RouterLink :to="{ name: 'CreateProject' }" type="submit" class="main-button">Edit Project</RouterLink>
      <RouterLink :to="{ name: 'CreateProject' }" type="submit" class="main-button">Add Member</RouterLink>
    </span> -->
    <div>ProjectCreator: {{ projectCreator }}</div>
    <div>ProjectMembers: {{ projectMembers }}</div>
    <TaskListComponent :project-id="currentProject" />
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.project-full-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1em;
  margin: 0.5em;
}

.project-name {
  font-size: 1.5em;
}

.project-creator {
  font-size: 1em;
}
</style>
