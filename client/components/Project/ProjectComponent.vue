<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import ProjectProgressComponent from "./ProjectProgressComponent.vue";

const props = defineProps(["project"]);
const emit = defineEmits(["refreshProjects"]);

const { currentUsername } = storeToRefs(useUserStore());
const { updateCurrentProject } = useProjectStore();

const loaded = ref(false);
const projectCreator = ref("");
const projectMembers = ref<Array<Record<string, string>>>([]);
const tasks = ref<Record<string, any>[]>([]);

async function updateStoreProject() {
  await updateCurrentProject(props.project._id);
}

const getProjectCreator = async (creatorId: string) => {
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
  const query: Record<string, string> = { id: props.project._id };
  let members;

  try {
    members = await fetchy("/api/project/members", "GET", { query });
  } catch {
    return;
  }

  projectMembers.value = members;
};

async function getTasks() {
  let tasksData;

  try {
    tasksData = await fetchy(`api/project/tasks`, "GET", { query: { project: props.project._id } });
  } catch (_) {
    return;
  }

  tasks.value = tasksData;
}

onBeforeMount(async () => {
  await getProjectCreator(props.project.creator);
  await getProjectMembers();
  await getTasks();
  loaded.value = true;
});
</script>

<template>
  <RouterLink :to="{ name: 'ProjectPage' }" @click="updateStoreProject" v-if="loaded" class="container default-border">
    <div class="info">
      <div>
        <div class="project-name">{{ props.project.name }}</div>
        <p class="project-creator">Creator: {{ projectCreator }}</p>
      </div>
      <div class="row">
        <div class="project-buttons" v-if="projectCreator == currentUsername">
          <button class="small-button" @click="deleteProject">Delete Project</button>
        </div>
      </div>
    </div>
    <ProjectProgressComponent :tasks="tasks" />
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
