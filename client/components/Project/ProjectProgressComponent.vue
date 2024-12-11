<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  tasks: Record<string, any>[];
}>();

const progress = computed(() => {
  if (props.tasks.length === 0) {
    return 0;
  }
  const numCompleted = props.tasks.filter((task) => task.completion).length;
  return Math.floor((numCompleted / props.tasks.length) * 100);
});
</script>

<template>
  <div class="row">
    <div class="percentage">{{ progress }}%</div>
    <div class="progress-bar-container">
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
  width: 100%;
  gap: 0.5em;
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
