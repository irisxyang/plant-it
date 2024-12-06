<script setup lang="ts">
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
const project = ref<Record<string, string>>();
const projectName = ref("");
const projectCreatorId = ref("");
const projectCreator = ref("");
const loaded = ref(false);

const isUserCreator = ref("");

const projectMembers = ref<Array<Record<string, string>>>([]);

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

  // if creator is current user, then set isUserCreator to ture
  if (creator == currentUsername) {
    isUserCreator.value = "true";
  }
};

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

const getProjectCreator = async () => {
  //   let query: Record<string, string> = { id: creatorId };
  let creator;
  try {
    creator = await fetchy(`/api/users/username/${project.value?.creator}`, "GET");
  } catch (_) {
    return "Project Creator Not Found";
  }
  projectCreator.value = creator;
};

onBeforeMount(async () => {
  await getProject();
  //   console.log("this is the current project page for:", currentProject);
  await getProjectCreator();
  await getProjectMembers();
  loaded.value = true;
});
</script>
<template>
  <main>
    <h1>{{ projectName }}</h1>
    <div>project garden here!!!</div>
    <div>is user creator? {{ isUserCreator }}</div>
    <div class="project-creator">Project Creator: {{ projectCreator }}</div>
    <div>project garden here!!!</div>

    <!-- <span>
      <RouterLink :to="{ name: 'CreateProject' }" type="submit" class="main-button">Edit Project</RouterLink>
      <RouterLink :to="{ name: 'CreateProject' }" type="submit" class="main-button">Add Member</RouterLink>
    </span> -->

    <span class="project-body">
      <div class="project-body-container">
        <CreateTaskForm v-if="isUserCreator" />
        <TaskListComponent :project-id="currentProject" :is-creator="isUserCreator" />
      </div>
      <div class="project-body-container">
        <AddUserForm v-if="isUserCreator" />
        <h2>Members</h2>
        <ProjectMemberListComponent :is-user-creator="isUserCreator" />
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
