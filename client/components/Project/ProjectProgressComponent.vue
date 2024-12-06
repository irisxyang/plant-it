<script setup lang="ts">
// TODO: not complete
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const loaded = ref(false);
let tasks = ref<Record<string, any>[]>([]);
let progress = ref<number>();
const props = defineProps(["project"]);

async function getTasks() {
  try {
    // const projectId = await fetchy(`api/projects`, `GET`, { query: { name: props.project } });
    tasks.value = await fetchy(`api/project/tasks`, "GET", { query: { project: props.project._id } });
    progress.value = (tasks.value.filter((task) => task.completion).length / tasks.value.length) * 100;
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  await getTasks();
  loaded.value = true;
});
</script>

<template>
  <div class="w-full max-w-md mx-auto p-4" v-if="loaded && tasks.length !== 0">
    <div class="bg-gray-200 rounded-full h-6 mb-4">
      <div class="bg-blue-600 h-6 rounded-full transition-all duration-500 ease-in-out" :style="{ width: `${progress}%` }">
        <div class="text-white text-center text-sm leading-6">{{ progress }}%</div>
      </div>
    </div>
  </div>
</template>
