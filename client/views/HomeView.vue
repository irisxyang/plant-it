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
    projectResults = await fetchy(`/api/user/projects`, "GET");
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
  //TODO: should reset or not?
  // await resetProject();
  // await resetTask();
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
    <section>
      <h2 v-if="!isLoggedIn">Please login to start!</h2>
    </section>
    <div v-if="isLoggedIn" class="container">
      <div class="tasks">
        <TaskListComponent projectId="" isCreator="" :tasks="tasks" @refreshTasks="getTasks" @refreshRewards="getProjectRewards" />
      </div>
      <div class="gardens">
        <h2>My Gardens</h2>
        <!-- TODO: separate into different projects, currently displaying all user rewards -->
        <div v-for="(project, index) in projects" :key="project._id">
          <GardenComponent :project="project" :rewards="projectRewards[index] || []" />
          <!-- <div v-for="reward in rewards" :key="reward._id" class="reward">
            <h3>{{ reward.name }}</h3>
            <img :src="`/images/rewards/${reward.icon}`" :alt="reward.icon" />
          </div> -->
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
