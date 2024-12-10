<script setup lang="ts">
import { useProjectStore } from "@/stores/project";

const props = defineProps(["project", "rewards"]);

const { updateCurrentProject } = useProjectStore();

async function updateStoreProject() {
  await updateCurrentProject(props.project._id);
}
</script>

<template>
  <div>
    <h3>{{ props.project?.name }}</h3>
    <RouterLink :to="{ name: 'ProjectPage' }" @click="updateStoreProject" class="box">
      <div v-for="reward in rewards" :key="reward._id" class="reward">
        <!-- <h3>{{ reward.name }}</h3> -->
        <img :src="`/images/rewards/${reward.icon}`" :alt="reward.icon" />
      </div>
    </RouterLink>
  </div>
</template>

<style scoped>
h3 {
  padding: 0;
  margin-bottom: 0.2em;
}

.box {
  background-color: var(--main-accent);
  padding: 1em;
  border: 7px solid #61321f;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: 0.5em;
  margin-bottom: 1em;
}

.reward img {
  width: 40px;
  height: 40px;
}
</style>
