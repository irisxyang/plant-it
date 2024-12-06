<script setup lang="ts">
import router from "@/router";
import { useTaskStore } from "@/stores/task";
import { fetchy } from "@/utils/fetchy";
import { defineEmits, onBeforeMount, ref } from "vue";

const loaded = ref(false);
// set to a value if we are on the user home
// (i.e. only fetch user tasks)
// else we fetch the project's tasks
const props = defineProps(["projectId", "isCreator", "tasks"]);
const emit = defineEmits(["refreshRewards", "refreshTasks"]);
const { updateCurrentTask } = useTaskStore();

async function toggleTaskCompletion(task: Record<string, any>) {
  try {
    await fetchy(`api/project/task/${task._id}/${task.completion ? "incomplete" : "complete"}`, "POST");
    emit("refreshTasks");
    emit("refreshRewards");
  } catch (_) {
    return;
  }
}

async function editTask(task: string) {
  await updateCurrentTask(task);
  void router.push({ name: "EditTask" });
}

onBeforeMount(async () => {
  emit("refreshTasks");
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
            <input type="checkbox" :checked="task.completion" @click="toggleTaskCompletion(task)" />
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
    <h2>Project Tasks</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 5%"></th>
          <th style="width: 10%">Due Date</th>
          <th style="width: 20%">Task</th>
          <th style="width: 35%">Notes</th>
          <th style="width: 5%">Assigned To</th>
          <th style="width: 10%">Status</th>
          <!-- <th style="width: 15%">Link(s)</th> -->
          <th v-if="isCreator" style="width: 10%">Edit?</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="task in tasks" :key="task._id" :style="{ 'background-color': task.completion ? 'lightgreen' : '' }">
          <td class="center">
            <input type="checkbox" :checked="task.completion" @click="toggleTaskCompletion(task)" />
          </td>
          <td class="center">{{ task.deadline }}</td>
          <td>{{ task.title }}</td>
          <td>{{ task.notes }}</td>
          <td>{{ task.assignee ? task.assignee : "Unassigned" }}</td>
          <!-- TODO: add edit task functionality -->
          <td>
            <ul>
              <li v-for="link in task.links" :key="link">{{ link }}</li>
            </ul>
          </td>
          <!-- TODO add v-else: if not creator, then you can edit task notes but nothing else!-->
          <td v-if="isCreator"><button @click="editTask(task._id)" class="small-button">Edit Task</button></td>
          <!-- <td v-else><button @click="editTask" class="small-button">Edit Notes</button></td> -->
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
