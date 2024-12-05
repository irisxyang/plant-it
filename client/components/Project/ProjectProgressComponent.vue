<script setup lang = "ts">

//TODO: not complete
import { fetchy } from "@/utils/fetchy";
import { ref } from "vue";

const loaded = ref(false);
let tasks = ref();
let progress = ref<double>();
const props = defineProps(['project']);

async function getTasks() {
  try {
    const fetchedTasks = await fetchy(`api/project/tasks`, "GET", {project: props.project});
    tasks.value = fetchedTasks;
    let numComp = 0;
    for (task in tasks.value) {
        if (task.completion) {
        numComp++;
        }
    }
    progress.value = (numComp / tasks.value.length)*100;
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
  <section class="project-progress" v-if="loaded && tasks.length !== 0">
    <div class="w-full max-w-md mx-auto p-4">
    <div class="bg-gray-200 rounded-full h-6 mb-4">
      <div 
        class="bg-blue-600 h-6 rounded-full transition-all duration-500 ease-in-out" 
        :style="{ width: `${progress}%` }"
      >
        <div class="text-white text-center text-sm leading-6">
          {{ progress }}%
        </div>
      </div>
    </div>
  </section>
</template>
