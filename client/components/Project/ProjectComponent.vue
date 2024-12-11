<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import ProjectProgressComponent from "./ProjectProgressComponent.vue";

// const { updateCurrentlyViewingProject } = useProjectStore();

// async function updateCurrentProject(project: Record<string, string>) {
//     await updateCurrentlyViewingProject(project);
// }

const emit = defineEmits(["refreshProjects"]);
const { updateCurrentProject } = useProjectStore();

const loaded = ref(false);
const props = defineProps(["project"]);
const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const projectName = ref(props.project.name);
const projectCreator = ref("");

const projectMembers = ref<Array<Record<string, string>>>([]);

async function updateStoreProject() {
  await updateCurrentProject(props.project._id);
}

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
  <RouterLink :to="{ name: 'ProjectPage' }" @click="updateStoreProject" v-if="loaded" class="container default-border">
    <div class="info">
      <div>
        <div class="project-name">{{ projectName }}</div>
        <p class="project-creator">Creator: {{ projectCreator }}</p>
      </div>
      <div class="row">
        <div class="project-buttons" v-if="projectCreator == currentUsername">
          <button class="small-button" @click="deleteProject">Delete Project</button>
        </div>
      </div>
    </div>
    <ProjectProgressComponent :project="project" />
  </RouterLink>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 1em;
  gap: 0.5em;
  width: 400px;
}

.info {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-name {
  font-size: 1.5em;
  margin: 0;
}

.project-creator {
  font-size: 1em;
  margin: 0;
}

.row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1em;
}
</style>
