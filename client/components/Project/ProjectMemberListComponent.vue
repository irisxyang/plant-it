<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const props = defineProps(["isUserCreator"]);
const loaded = ref(false);
const { currentProject } = storeToRefs(useProjectStore());
let projectMembers = ref<Array<Record<string, string>>>([]);
const { currentUsername } = storeToRefs(useUserStore());
// const member = ref("");

const getProjectMembers = async () => {
  // get project members here
  const query: Record<string, string> = { id: currentProject.value };
  let members;
  try {
    members = await fetchy("/api/project/members", "GET", { query });
  } catch {
    return;
  }
  projectMembers.value = members;
};

const deleteUser = async (member: Record<string, string>) => {
  const memberString = Object.values(member).join("");
  const query: Record<string, string> = { id: currentProject.value, memberuser: memberString };

  try {
    await fetchy("api/project/members", "DELETE", { query });
  } catch {
    return;
  }
};

onBeforeMount(async () => {
  await getProjectMembers();
  loaded.value = true;
});
</script>

<template>
  <div class="project-list">
    <section v-if="loaded && projectMembers.length !== 0">
      <div class="members-list" v-for="member in projectMembers" :key="member._id">
        <div class="member-component default-border">{{ member }}</div>
        <!-- <ProjectComponent @refreshProjects="getProjects" :project="project" /> -->
        <button @click="deleteUser(member)" class="small-button delete-user" v-if="isUserCreator">Remove</button>
      </div>
    </section>
    <p v-else-if="loaded">You are not currently a member of any projects.</p>
    <p v-else>Loading...</p>
  </div>
</template>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.member-component {
  display: flex;
  flex-direction: column;
  align-items: left;
  padding: 0.5em 1em;
  margin: 0.5em;
  margin-top: 0;
  width: 75%;
  font-size: 1.1em;
}

.members-list {
  display: flex;
  flex-direction: row;
  margin: 0.5em;
}

.small-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--secondary-accent);
  border: 2px solid #000000;
  width: max-content;
  height: 2.5em;
  padding: 0 1.5em;
  border-radius: 4px;
  font-size: 1em;
  transition: 0.2s;
  color: black;
}

.small-button:hover {
  background-color: #8fbf83;
}
</style>
