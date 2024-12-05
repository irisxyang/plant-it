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
const task = ref<Record<string, string>>();
const taskProject = ref("");

const title = ref("");
const notes = ref("");
const links = ref<string[]>([]);
const assignee = ref("");
const deadline = ref("");

const projectMembers = ref<string[]>([]);

const getTaskInfo = async () => {
  const query = { task: currentTask.value };
  let fetchedTask;
  try {
    fetchedTask = await fetchy("/api/task", "GET", { query });
  } catch (_) {
    return;
  }
  task.value = fetchedTask;
  taskProject.value = fetchedTask.project;
  title.value = fetchedTask.title;
  notes.value = fetchedTask.notes;
  links.value = fetchedTask.links;
  deadline.value = fetchedTask.deadline;
  assignee.value = fetchedTask.assignee;
  console.log("get task info: task:", fetchedTask._id, " title: ", title.value, " notes: ", notes.value, " assignee: ", assignee.value);
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

const editTask = async (title: string, notes: string, assignee: string, deadline: string) => {
  console.log("edit task called");
  // TODO: figure out edit task :(
  // i created a new router path (ctrl-F for updateTask) that includes basically everything but:

  // i figured out that it is an issue with the deadline update--the other updates work fine
  // and are done in the updateTask. below is code to call this that when commented out does not run
  // :( unsure what the issue is, refer to TODOs in routes.ts and deadlining.ts ??

  const deadlineQuery: Record<string, string> = { date: deadline };
  try {
    //TODO: figure out whats wrong with the deadline please
    console.log("trying to update deadline?");
    await fetchy(`/api/project/task/${currentTask.value}/deadline`, "PATCH", { body: deadlineQuery });
    console.log("updated deadline");
  } catch {
    return;
  }

  const query: Record<string, string> = { title: title, notes: notes, assignee: assignee, date: deadline };
  try {
    await fetchy(`/api/project/tasks/${currentTask.value}`, "PATCH", { body: query });
  } catch {
    return;
  }

  //TODO figure out why this doesnt auto refresh bruh
  void router.push({ name: "ProjectPage" });
};

onBeforeMount(async () => {
  await getTaskInfo();
  await getProjectMembers(taskProject.value);
  loaded.value = true;
});
</script>

<template>
  <form class="create-task-form default-border" @submit.prevent="editTask(title, notes, assignee, deadline)">
    <input id="Title:" v-model="title" type="text" placeholder="Edit task title!" required />
    <input id="Notes:" v-model="notes" type="text" placeholder="Add any extra notes!" required />
    <select id="Assign to:" v-model="assignee" required>
      <option value="" disabled selected>Select a user to assign to</option>
      <option v-for="member in projectMembers" :key="member" :value="member">{{ member }}</option>
    </select>
    <label for="deadline">Deadline:</label>
    <input id="deadline" v-model="deadline" type="date" required />
    <button type="submit" class="main-button">Edit Task</button>
  </form>
</template>

<style scoped></style>
