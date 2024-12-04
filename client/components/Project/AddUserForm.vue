<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const member = ref("");

const { currentProject } = useProjectStore();

const addMember = async (member: string) => {
  const id = currentProject;
  // convert member username to id
  let memberId;
  // get member id from username
  try {
    const memberObject = await fetchy(`/api/users/${member}`, "GET");
    if (!memberObject) {
      return "User with that username does not exist";
    }
    memberId = memberObject._id;
  } catch (_) {
    return;
  }
  try {
    await fetchy("/api/project/members", "POST", {
      body: { id, member: memberId },
    });
  } catch (_) {
    return;
  }
};
</script>

<template>
  <form class="create-task-form default-border" @submit.prevent="addMember(member)">
    <input id="Member Username:" v-model="member" type="text" placeholder="Member Username" required />
    <button type="submit" class="small-button">Add Member</button>
  </form>
</template>

<style scoped>
.create-task-form {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0.5em;
  margin-bottom: 0;
}

form {
  background-color: var(--base-bg);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
