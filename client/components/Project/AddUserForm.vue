<script setup lang="ts">
import { useProjectStore } from "@/stores/project";
import { storeToRefs } from "pinia";
import { defineEmits, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const emit = defineEmits(["refreshMembers"]);

const member = ref("");

const { currentProject } = storeToRefs(useProjectStore());

const addMember = async (member: string) => {
  const id = currentProject.value;
  // convert member username to id
  let memberId;
  // get member id from username
  try {
    const memberObject = await fetchy(`/api/users/${member}`, "GET");
    if (!memberObject) {
      return "User with that username does not exist";
    }
    memberId = memberObject._id;
    await fetchy("/api/project/members", "POST", {
      body: { id, member: memberId },
    });
  } catch (_) {
    return;
  }

  emit("refreshMembers");
};
</script>

<template>
  <form class="create-task-form default-border" @submit.prevent="addMember(member)">
    <label for="Member Username:">Member Username:</label>
    <input id="Member Username:" v-model="member" type="text" placeholder="Ex: Alice" required />
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
