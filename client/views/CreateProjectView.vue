<script setup lang="ts">
import CreateProjectForm from "@/components/Project/CreateProjectForm.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();
</script>

<template>
  <main class="column">
    <h1>Start a New Project, {{ currentUsername }}</h1>

    <CreateProjectForm />
  </main>
</template>
