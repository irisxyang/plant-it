<script setup lang="ts">
import ProjectGardenComponent from "@/components/Garden/ProjectGardenComponent.vue";
import AddUserForm from "@/components/Project/AddUserForm.vue";
import ProjectMemberListComponent from "@/components/Project/ProjectMemberListComponent.vue";
import CreateTaskForm from "@/components/Task/CreateTaskForm.vue";
import TaskListComponent from "@/components/Task/TaskListComponent.vue";
import { useProjectStore } from "@/stores/project";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { currentUsername } = useUserStore();
const { currentProject } = storeToRefs(useProjectStore());

const loaded = ref(false);
const project = ref<Record<string, string>>();
const projectName = ref("");
const projectCreator = ref("");
const projectRewards = ref<Record<string, string>[]>([]);
const isUserCreator = ref(false);
const projectMembers = ref<string[]>([]);
const tasks = ref<Record<string, string>[]>([]);

const getProject = async () => {
  const query: Record<string, string> = { id: currentProject.value };
  let proj;
  try {
    proj = await fetchy("/api/projects", "GET", { query });
  } catch {
    return;
  }
  project.value = proj;
  projectName.value = proj.name;

  // get username for creator id
  let creator;
  try {
    creator = await fetchy(`/api/users/username/${proj.creator}`, "GET");
  } catch (_) {
    return "Project Creator Not Found";
  }

  isUserCreator.value = creator == currentUsername;
};

const getProjectMembers = async () => {
  const query: Record<string, string> = { id: currentProject.value };
  let members;

  try {
    members = await fetchy("/api/project/members", "GET", { query });
  } catch {
    return;
  }

  projectMembers.value = members;
};

const getProjectCreator = async () => {
  let creator;
  try {
    creator = await fetchy(`/api/users/username/${project.value?.creator}`, "GET");
  } catch (_) {
    return "Project Creator Not Found";
  }
  projectCreator.value = creator;
};

async function getTasks() {
  if (!project.value?._id) {
    return;
  }

  let fetchedTasks;
  const query: Record<string, string> = { project: project.value._id };

  try {
    fetchedTasks = await fetchy("api/project/tasks", "GET", { query });
  } catch (_) {
    return "Project tasks not retrieved.";
  }

  tasks.value = fetchedTasks;
}

async function getProjectRewards() {
  if (!project.value) {
    return;
  }
  const query: Record<string, string> = { project: project.value._id };
  let fetchedRewards;

  try {
    fetchedRewards = await fetchy(`/api/rewards`, "GET", { query });
  } catch (_) {
    return;
  }

  projectRewards.value = fetchedRewards;
}

onBeforeMount(async () => {
  await getProject();
  await getProjectCreator();
  await getProjectMembers();
  await getProjectRewards();
  await getTasks();
  loaded.value = true;
});
</script>
<template>
  <main>
    <h1>{{ projectName }}</h1>
    <ProjectGardenComponent :project="project" :rewards="projectRewards" />
    <div class="project-creator">Project Creator: {{ projectCreator }}</div>

    <!-- <span>
      <RouterLink :to="{ name: 'CreateProject' }" type="submit" class="main-button">Edit Project</RouterLink>
      <RouterLink :to="{ name: 'CreateProject' }" type="submit" class="main-button">Add Member</RouterLink>
    </span> -->

    <span class="project-body">
      <div class="project-body-container">
        <CreateTaskForm v-if="isUserCreator" :members="projectMembers" @refresh-tasks="getTasks" />
        <TaskListComponent :project-id="currentProject" :is-creator="isUserCreator" :tasks="tasks" @refresh-tasks="getTasks" @refresh-rewards="getProjectRewards" />
      </div>
      <div class="project-body-container">
        <AddUserForm v-if="isUserCreator" @refresh-members="getProjectMembers" />
        <h2>Members</h2>
        <ProjectMemberListComponent :members="projectMembers" :is-user-creator="isUserCreator" @refresh-members="getProjectMembers" />
      </div>
    </span>
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
  font-size: 1.25em;
  font-weight: 700;
}

.project-body {
  display: flex;
  flex-direction: row;
  align-items: top;
  justify-content: center;
}

.project-body-container {
  display: flex;
  flex-direction: column;
  margin: 1.5em;
  align-items: center;
}
</style>
