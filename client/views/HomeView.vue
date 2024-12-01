<script setup lang="ts">
import AddUserForm from "@/components/Project/AddUserForm.vue";
import CreateProjectForm from "@/components/Project/CreateProjectForm.vue";
import ProjectListComponent from "@/components/Project/ProjectListComponent.vue";
import CreateTaskForm from "@/components/Task/CreateTaskForm.vue";
import TaskListComponent from "@/components/Task/TaskListComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

const { isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Home</h1>
    <section>
      <h1 v-if="!isLoggedIn">Please login to start!</h1>
    </section>
    <div v-if="isLoggedIn" class="container">
      <div class="tasks">
        <TaskListComponent userHome="true" />
      </div>
      <div class="gardens">
        <h2>My Gardens</h2>
      </div>
    </div>
    <div v-if="isLoggedIn">
      <CreateProjectForm />
      <AddUserForm />
      <ProjectListComponent />
      <CreateTaskForm />
    </div>
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}

.container {
  display: flex;
  width: 90%;
  margin: 0 auto;
  gap: 1em;
}

.tasks,
.gardens {
  display: flex;
  flex-direction: column;
}

.tasks {
  flex-grow: 4;
}

.gardens {
  flex-grow: 3;
}

.gardens h2 {
  text-align: center;
}
</style>
