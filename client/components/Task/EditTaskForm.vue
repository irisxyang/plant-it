<script setup lang="ts">
import router from "@/router";
import { useTaskStore } from "@/stores/task";
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const loaded = ref(false);
const { currentTask } = storeToRefs(useTaskStore());
const { currentUsername } = storeToRefs(useUserStore());
const task = ref<Record<string, any>>({});

const projectMembers = ref<string[]>([]);

const getTaskInfo = async () => {
  let fetchedTask: Record<string, any>;
  let deadline: Date | false;

  try {
    fetchedTask = await fetchy(`/api/tasks/${currentTask.value}`, "GET");
    deadline = await fetchy(`/api/project/task/${currentTask.value}/deadline`, "GET");
  } catch (_) {
    return;
  }

  if (deadline) {
    fetchedTask.deadline = new Date(deadline).toISOString().slice(0, 10);
  }
  task.value = fetchedTask;
};

const getProjectMembers = async (id: string) => {
  const query: Record<string, string> = { id };
  try {
    const members = await fetchy("/api/project/members", "GET", { query });
    projectMembers.value = members;
  } catch {
    return;
  }
};

const editTask = async () => {
  const taskQuery: Record<string, string> = {
    title: task.value.title,
    notes: task.value.notes,
    assignee: task.value.assignee,
    date: task.value.deadline,
  };
  const deadlineQuery: Record<string, string> = { date: task.value.deadline };

  try {
    await fetchy(`/api/tasks/${currentTask.value}`, "PATCH", { body: taskQuery });
    await fetchy(`/api/project/task/${currentTask.value}/deadline`, "PATCH", { body: deadlineQuery });
  } catch {
    return;
  }

  void router.push({ name: "ProjectPage" });
};

onBeforeMount(async () => {
  await getTaskInfo();
  await getProjectMembers(task.value.project);
  loaded.value = true;
});
</script>

<template>
  <form class="create-task-form default-border wide-form" @submit.prevent="editTask()">
    <div class="row">
      <label for="title">Task title:</label>
      <input id="title" v-model="task.title" type="text" placeholder="Edit task title!" required />
    </div>
    <div class="row">
      <label for="notes">Task notes:</label>
      <input id="notes" v-model="task.notes" type="text" placeholder="Add any extra notes!" required />
    </div>
    <div class="row">
      <label for="assignee">Assign to:</label>
      <select id="assignee" v-model="task.assignee" required>
        <option value="" disabled selected>Select a user to assign to</option>
        <option v-for="member in projectMembers" :key="member" :value="member">{{ member }}</option>
      </select>
    </div>
    <div class="row">
      <label for="deadline">Deadline:</label>
      <input id="deadline" v-model="task.deadline" type="date" required />
    </div>
    <button type="submit" class="main-button">Edit Task</button>
  </form>
</template>

<style scoped>
.wide-form {
  width: 400px;
}

.row {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
}
</style>
