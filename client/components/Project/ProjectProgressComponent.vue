<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["project"]);

const loaded = ref(false);
let tasks = ref<Record<string, any>[]>([]);
let progress = ref<number>(0);

async function getTasks() {
  let tasksData;

  try {
    tasksData = await fetchy(`api/project/tasks`, "GET", { query: { project: props.project._id } });
  } catch (_) {
    return;
  }

  tasks.value = tasksData;
  progress.value = Math.trunc((tasks.value.filter((task) => task.completion).length / tasks.value.length) * 100);
}

onBeforeMount(async () => {
  await getTasks();
  loaded.value = true;
});
</script>

<template>
  <div class="row">
    <div class="percentage">{{ progress }}%</div>
    <div v-if="loaded && tasks.length !== 0" class="progress-bar-container">
      <div class="full-bar"></div>
      <div class="progress-bar" :style="{ width: `${progress}%` }"></div>
    </div>
  </div>
</template>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.progress-bar-container {
  width: 100%;
  height: 20px;
  position: relative;
}

.full-bar {
  height: 100%;
  width: 100%;
  background-color: var(--secondary-accent);
  border-radius: 10px;
  position: absolute;
  top: 0;
  left: 0;
}

.progress-bar {
  height: 100%;
  background-color: var(--main-accent);
  border-radius: 10px;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
