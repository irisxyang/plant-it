<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

// const { updateCurrentlyViewingProject } = useProjectStore();

// async function updateCurrentProject(project: Record<string, string>) {
//     await updateCurrentlyViewingProject(project);
// }

const emit = defineEmits(["refreshProjects"]);

const loaded = ref(false);
const props = defineProps(["project"]);
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const projectName = ref(props.project.name);
const projectCreator = ref("");

const projectMembers = ref<Array<Record<string, string>>>([]);

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

const deleteProject = async () => {
  try {
    await fetchy(`/api/projects/${props.project._id}`, "DELETE");
  } catch {
    return;
  }
  emit("refreshProjects");
};

const getProjectMembers = async () => {
  // get project members here
  const query: Record<string, string> = { id: props.project._id };
  let members;
  try {
    members = await fetchy("/api/project/members", "GET", { query });
  } catch {
    return;
  }
  projectMembers.value = members;
};

onBeforeMount(async () => {
  await getProjectCreator(props.project.creator);
  await getProjectMembers();
  loaded.value = true;
});
</script>

<template>
  <div v-if="loaded" class="project-full-container default-border">
    <p class="project-name">{{ projectName }}</p>
    <p class="project-creator">Creator: {{ projectCreator }}</p>
    <p class="project-creator">Project Id: {{ props.project._id }}</p>
    <p>Members: {{ projectMembers }}</p>
    <div class="project-buttons" v-if="projectCreator == currentUsername">
      <button class="main-button" @click="deleteProject">Delete Project</button>
    </div>
  </div>
</template>

<style scoped>
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
