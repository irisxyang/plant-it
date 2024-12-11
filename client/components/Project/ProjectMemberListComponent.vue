<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";

const props = defineProps<{
  members: string[];
  isUserCreator: boolean;
}>();
const emit = defineEmits<{
  (e: "refreshMembers"): void;
}>();
const { currentProject } = storeToRefs(useProjectStore());

const deleteUser = async (member: string) => {
  const query: Record<string, string> = { id: currentProject.value, memberuser: member };

  try {
    await fetchy("api/project/members", "DELETE", { query });
  } catch {
    return;
  }

  emit("refreshMembers");
};
</script>

<template>
  <section class="project-list">
    <div class="members-list" v-for="(member, index) in props.members" :key="index">
      <div class="member-component default-border">{{ member }}</div>
      <button @click="deleteUser(member)" class="small-button delete-user" v-if="props.isUserCreator">Remove</button>
    </div>
  </section>
</template>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.members-list {
  display: flex;
  flex-direction: row;
  margin: 0.5em;
  width: 100%;
}

.member-component {
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 0.5em 1em;
  margin: 0.5em;
  margin-top: 0;
  font-size: 1.1em;
  flex-grow: 3;
}

.small-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--secondary-accent);
  border: 2px solid #000000;
  height: 2.5em;
  padding: 0 1.5em;
  border-radius: 4px;
  font-size: 1em;
  transition: 0.2s;
  color: black;
  flex-grow: 1;
}

.small-button:hover {
  background-color: #8fbf83;
}
</style>
