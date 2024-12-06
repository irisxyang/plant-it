<script setup lang="ts">
// TODO: get all projects for user
// for each user project, get completed tasks for that user
import { useProjectStore } from "@/stores/project";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

// const props = defineProps(["project"]);
const { currentProject } = storeToRefs(useProjectStore());
const rewards = ref<Array<Record<string, string>>>([]);

async function getProjectRewards() {
  //   const query: Record<string, string> = { project: props.project._id };
  let fetchedRewards;
  const projectId = currentProject.value;

  try {
    fetchedRewards = await fetchy(`/api/rewards/${projectId}`, "GET");
  } catch (_) {
    return;
  }
  rewards.value = fetchedRewards;
}

onBeforeMount(async () => {
  await getProjectRewards();
});
</script>
<template>
  <div class="box">
    <div v-for="reward in rewards" :key="reward._id" class="reward">
      <img :src="`/images/rewards/${reward.icon}`" :alt="reward.icon" />
    </div>
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
  margin-bottom: 1em;
  width: 60%;
}

.reward img {
  width: 40px;
  height: 40px;
}
</style>
