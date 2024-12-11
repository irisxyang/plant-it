<script setup lang="ts">
import EditProjectForm from "@/components/Project/EditProjectForm.vue";
import { useProjectStore } from "@/stores/project";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername } = storeToRefs(useUserStore());
const { currentProject } = storeToRefs(useProjectStore());
const { logoutUser, deleteUser } = useUserStore();
</script>

<template>
  <main class="column">
    <h1>Edit Project {{ currentUsername }}</h1>
    <EditProjectForm />
  </main>
</template>
