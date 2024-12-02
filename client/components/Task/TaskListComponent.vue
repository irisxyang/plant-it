<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, ref } from "vue";

const loaded = ref(false);
// set to a value if we are on the user home
// (i.e. only fetch user tasks)
// else we fetch the project's tasks
const props = defineProps<{
  projectId: string;
}>();
const tasks = ref<Array<Record<string, any>>>([]);
const lengthtasks = ref(0);

async function getTasks() {
  let fetchedTasks;
  if (props.projectId === "") {
    try {
      fetchedTasks = await fetchy("api/user/tasks", "GET");
    } catch (_) {
      return "User tasks not retrieved.";
    }
  } else {
    const query: Record<string, string> = { project: props.projectId };
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
  <section class="task-list" v-if="loaded && props.projectId === ''">
    <h2>My Tasks</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 5%"></th>
          <th style="width: 10%">Due Date</th>
          <th style="width: 20%">Task</th>
          <th style="width: 45%">Notes</th>
          <th style="width: 20%">Project</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task._id" :style="{ 'background-color': task.completion ? 'lightgreen' : '' }">
          <td class="center">
            <input type="checkbox" :checked="task.completion" disabled />
          </td>
          <td class="center">{{ task.deadline }}</td>
          <td>{{ task.title }}</td>
          <td>{{ task.notes }}</td>
          <td>{{ task.projectName }}</td>
        </tr>
      </tbody>
    </table>
  </section>
  <section class="task-list" v-else-if="loaded">
    <h2>Tasks</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 5%"></th>
          <th style="width: 10%">Due Date</th>
          <th style="width: 20%">Task</th>
          <th style="width: 35%">Notes</th>
          <th style="width: 5%">Assigned To</th>
          <th style="width: 10%">Status</th>
          <th style="width: 15%">Link(s)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task._id" :style="{ 'background-color': task.completion ? 'lightgreen' : '' }">
          <td class="center">
            <input type="checkbox" :checked="task.completion" disabled />
          </td>
          <td class="center">{{ task.deadline }}</td>
          <td>{{ task.title }}</td>
          <td>{{ task.notes }}</td>
          <td class="center">{{ task.assignee }}</td>
          <td>{{ task.completion ? "Completed" : "Incomplete" }}</td>
          <td>
            <ul>
              <li v-for="link in task.links" :key="link">{{ link }}</li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
  <p v-else>Loading...</p>
</template>

<style scoped>
.task-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.center {
  text-align: center;
}
</style>
