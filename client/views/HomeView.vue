<script setup lang="ts">
import AddUserForm from "@/components/Project/AddUserForm.vue";
import CreateProjectForm from "@/components/Project/CreateProjectForm.vue";
import ProjectListComponent from "@/components/Project/ProjectListComponent.vue";
import CreateTaskForm from "@/components/Task/CreateTaskForm.vue";
import TaskListComponent from "@/components/Task/TaskListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>User Home</h1>
    <section>
      <h1 v-if="isLoggedIn">Welcome {{ currentUsername }}!</h1>
      <h1 v-else>Please login to start!</h1>
    </section>
    <div v-if="isLoggedIn">
      <CreateProjectForm />
      <AddUserForm />
      <ProjectListComponent />
      <CreateTaskForm />
      <TaskListComponent userHome="true" />
    </div>
    <!-- <PostListComponent /> -->
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
