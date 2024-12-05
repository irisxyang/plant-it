<script setup lang="ts">
import CreateProjectForm from "@/components/Project/CreateProjectForm.vue";
import ProjectListComponent from "@/components/Project/ProjectListComponent.vue";
import CreateTaskForm from "@/components/Task/CreateTaskForm.vue";
import TaskListComponent from "@/components/Task/TaskListComponent.vue";
import { useProjectStore } from "@/stores/project";
import { useTaskStore } from "@/stores/task";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const { resetProjectStore } = useProjectStore();
const { resetTaskStore } = useTaskStore();

const rewards = ref<Array<Record<string, string>>>([]);

// resets store to hold no task
async function resetProject() {
  await resetProjectStore();
}

// resets store to hold no project
async function resetTask() {
  await resetTaskStore();
}

async function getUserRewards() {
  try {
    rewards.value = await fetchy("api/rewards", "GET");
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  //TODO: should reset or not?
  // await resetProject();
  // await resetTask();
  await getUserRewards();
});
</script>

<template>
  <main>
    <h1>Home</h1>
    <section>
      <h1 v-if="!isLoggedIn">Please login to start!</h1>
    </section>
    <div v-if="isLoggedIn" class="container">
      <div class="tasks">
        <TaskListComponent projectId="" @refreshRewards="getUserRewards" />
      </div>
      <div class="gardens">
        <h2>My Gardens</h2>
        <!-- TODO: separate into different projects, currently displaying all user rewards -->
        <div class="project">
          <div v-for="reward in rewards" :key="reward._id" class="reward">
            <h3>{{ reward.name }}</h3>
            <img :src="`/images/rewards/${reward.icon}`" :alt="reward.icon" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="isLoggedIn">
      <CreateProjectForm />
      <ProjectListComponent />
      <CreateTaskForm />
    </div>
  </main>
</template>

<style scoped>
h1 {
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

.project {
  display: flex;
  align-items: center;
  margin: 0.5em;
  height: 200px;
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
