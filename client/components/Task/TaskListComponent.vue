<script setup lang="ts">
import router from "@/router";
import { useProjectStore } from "@/stores/project";
import { useTaskStore } from "@/stores/task";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { defineEmits, onBeforeMount, ref } from "vue";

const loaded = ref(false);
// set to a value if we are on the user home
// (i.e. only fetch user tasks)
// else we fetch the project's tasks
const props = defineProps(["projectId", "projectMembers", "isCreator"]);
const emit = defineEmits(["refreshRewards"]);
const tasks = ref<Record<string, any>[]>([]);
const lengthtasks = ref(0);
const { updateCurrentTask } = useTaskStore();

const { currentUsername } = useUserStore();
const { currentProject } = useProjectStore();

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

async function toggleTaskCompletion(task: Record<string, any>) {
  try {
    await fetchy(`api/project/task/${task._id}/${task.completion ? "incomplete" : "complete"}`, "POST");
    await getTasks();
    emit("refreshRewards");
  } catch (_) {
    return;
  }
}

async function editTask(task: string) {
  await updateCurrentTask(task);
  void router.push({ name: "EditTask" });
}

async function assignTask(taskId: string, member: string) {
  try {
    await fetchy(`api/project/task/${taskId}/assignees`, "POST", { body: { assignee: member } });
    await getTasks();
  } catch (_) {
    return;
  }
}

async function unassignTask(taskId: string) {
  try {
    await fetchy(`api/project/task/${taskId}/assignees`, "DELETE");
    await getTasks();
  } catch (_) {
    return;
  }
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

          <td v-if="isCreator && !task.completion">
            <span v-if="task.assignee"> {{ task.assignee }}</span>
            <select v-else :value="task.assignee" @change="assignTask(task._id, ($event.target as HTMLSelectElement).selectedOptions[0].value)">
              <option value="">Unassigned</option>
              <option v-for="member in projectMembers" :key="member" :value="member">{{ member }}</option>
            </select>
          </td>
          <td v-else>{{ task.assignee ? task.assignee : "Unassigned" }}</td>
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
