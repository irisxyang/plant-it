<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["project"]);
const rewards = ref<Array<Record<string, string>>>([]);

const { updateCurrentProject } = useProjectStore();

async function updateStoreProject() {
  await updateCurrentProject(props.project._id);
}

async function getUserProjectRewards() {
  const query: Record<string, string> = { project: props.project._id };
  let fetchedRewards;

  try {
    fetchedRewards = await fetchy(`/api/rewards`, "GET", { query });
  } catch (_) {
    return;
  }

  rewards.value = fetchedRewards;
}

onBeforeMount(async () => {
  await getUserProjectRewards();
});
</script>

<template>
  <div>
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
  margin-bottom: 1em;
}

.reward img {
  width: 40px;
  height: 40px;
}
</style>
