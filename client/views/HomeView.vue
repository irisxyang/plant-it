<script setup lang="ts">
import GardenComponent from "@/components/Garden/GardenComponent.vue";
import TaskListComponent from "@/components/Task/TaskListComponent.vue";
import { useProjectStore } from "@/stores/project";
import { useTaskStore } from "@/stores/task";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref, watch } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const { resetProjectStore } = useProjectStore();
const { resetTaskStore } = useTaskStore();

const projects = ref<Array<Record<string, string>>>([]);
const tasks = ref<Array<Record<string, string>>>([]);

const projectRewards = ref<Array<Record<string, any>>>([]);

// resets store to hold no task
async function resetProject() {
  await resetProjectStore();
}

// resets store to hold no project
async function resetTask() {
  await resetTaskStore();
}

async function getProjects() {
  let projectResults: Array<Record<string, string>>;

  try {
    projectResults = await fetchy(`/api/projects`, "GET");
  } catch (_) {
    return;
  }

  projects.value = projectResults;
}

async function getProjectRewards() {
  projectRewards.value = await Promise.all(
    projects.value.map((project: any) => {
      const query: Record<string, string> = { project: project._id };
      return fetchy(`/api/rewards`, "GET", { query });
    }),
  );
}

async function getTasks() {
  let fetchedTasks;

  try {
    fetchedTasks = await fetchy("api/user/tasks", "GET");
  } catch (_) {
    return "User tasks not retrieved.";
  }

  tasks.value = fetchedTasks;
}

async function getData() {
  await getProjects();
  await getProjectRewards();
}

onBeforeMount(async () => {
  if (isLoggedIn.value) {
    await getData();
  }
});

watch(isLoggedIn, async (newVal) => {
  if (newVal) {
    await getData();
  }
});
</script>

<template>
  <main>
    <h1 class="main-page-heading">Home</h1>
    <section v-if="!isLoggedIn">
      <div style="margin: 3em"></div>
      <h2>Welcome to PlantIt: Project Management to Help You Flourish!</h2>
      <div class="description">
        PlantIt is for hobbyists or anyone that might want a hub to manage their personal projects.
        <br />
        Plan your next endeavor by starting a project: add members, assign tasks, and get rewarded with a little plant!
        <br />
        <span style="margin-top: 1em">
          <img :src="`/images/rewards/reward1.svg`" />
          <img :src="`/images/rewards/reward6.svg`" />
          <img :src="`/images/rewards/reward7.svg`" />
          <img :src="`/images/rewards/reward4.svg`" />
          <img :src="`/images/rewards/reward5.svg`" />
          <img :src="`/images/rewards/reward3.svg`" />
          <img :src="`/images/rewards/reward2.svg`" />
        </span>
        <br />
        <RouterLink class="main-button" :to="{ name: 'Settings' }">Log In or Register to Start!</RouterLink>
      </div>
      <div style="margin: 15em"></div>
    </section>
    <div v-if="isLoggedIn" class="container">
      <div class="tasks">
        <TaskListComponent projectId="" isCreator="" :tasks="tasks" @refreshTasks="getTasks" @refreshRewards="getProjectRewards" />
      </div>
      <div class="gardens">
        <h2>My Gardens</h2>
        <div class="description">
          Each task that you complete rewards you with a flower!
          <br />
          Below are all of your rewards for all of the projects you are a part of.
          <br />
          <br />
          Click a garden to navigate to the project page.
        </div>
        <div v-for="(project, index) in projects" :key="project._id">
          <GardenComponent :project="project" :rewards="projectRewards[index] || []" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

h2 {
  text-align: center;
}

.description {
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center;
  margin: 0 1em;
  margin-top: 0;
  padding-top: 0;
  font-size: 1.2em;
}

img {
  width: 60px;
  height: 60px;
}

.container {
  display: flex;
  width: 90%;
  margin: 0 auto;
  gap: 1em;
}

.tasks,
.gardens {
  display: flex;
  flex-direction: column;
}

.tasks {
  flex: 4;
}

.gardens {
  flex: 3;
}

.gardens h2 {
  text-align: center;
}

.reward {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.reward img {
  width: 100px;
  height: 100px;
}
</style>
