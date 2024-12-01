<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const loaded = ref(false);
// set to a value if we are on the user home
// (i.e. only fetch user tasks)
// else we fetch the project's tasks
const props = defineProps(["userHome", "projectPage"]);
const { currentUsername } = storeToRefs(useUserStore());
const tasks = ref<Array<Record<string, any>>>([]);
const lengthtasks = ref(0);

async function getTasks() {
  let fetchedTasks;
  if (props.userHome) {
    try {
      fetchedTasks = await fetchy("api/user/tasks", "GET");
    } catch (_) {
      return "User tasks not retrieved.";
    }
  } else {
    const query: Record<string, any> = { project: props.projectPage };
    try {
      fetchedTasks = await fetchy("api/project/tasks", "GET", { query });
    } catch (_) {
      return "Project tasks not retrieved.";
    }
  }
  tasks.value = fetchedTasks;
  lengthtasks.value = fetchedTasks.length;
}

onBeforeMount(async () => {
  await getTasks();
  loaded.value = true;
});
</script>

<template>
  <section class="task-list" v-if="loaded && tasks.length !== 0">
    <h2>My Tasks</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 5%">Done?</th>
          <th style="width: 20%">Due Date</th>
          <th style="width: 10%">Task</th>
          <th style="width: 45%">Notes</th>
          <th style="width: 20%">Project</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task._id" :style="{ 'background-color': task.completion ? 'lightgreen' : '' }">
          <td style="text-align: center">
            <span v-if="task.completion">☑</span>
          </td>
          <td>{{ new Date(task.dueDate).toLocaleString() }}</td>
          <td>{{ task.title }}</td>
          <td>{{ task.notes }}</td>
          <td>{{ task.projectName }}</td>
        </tr>
      </tbody>
    </table>
    <!-- <article v-for="task in tasks" :key="task._id">
      <TaskComponent :task="task" />
    </article> -->
  </section>
  <p v-else-if="loaded">No Tasks.</p>
  <p v-else>Loading...</p>
</template>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

table {
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 6px;
}
</style>
