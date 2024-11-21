<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <div class="bg">
    <header>
      <nav>
        <div class="title">
          <img src="@/assets/images/logo.svg" />
          <RouterLink :to="{ name: 'Home' }">
            <h1>PlantIt</h1>
          </RouterLink>
        </div>
        <ul>
          <li>
            <RouterLink :to="{ name: 'Home' }" :class="{ 'nav-link': true, selected: currentRouteName == 'Home' }"> Home </RouterLink>
          </li>
          <li v-if="isLoggedIn">
            <RouterLink :to="{ name: 'Settings' }" :class="{ 'nav-link': true, selected: currentRouteName == 'Settings' }"> Settings </RouterLink>
          </li>
          <li v-else>
            <RouterLink :to="{ name: 'Login' }" :class="{ 'nav-link': true, selected: currentRouteName == 'Login' }"> Login </RouterLink>
          </li>
        </ul>
      </nav>
      <article v-if="toast !== null" class="toast" :class="toast.style">
        <p>{{ toast.message }}</p>
      </article>
    </header>
    <RouterView />
    <footer>Created by Bouncing Beavers | 2024</footer>
  </div>
</template>

<style scoped>
@import "./assets/toast.css";

.bg {
  background-color: var(--base-bg);
}

nav {
  padding: 0.5em 2em;
  background-color: var(--main-accent);
  display: flex;
  align-items: center;
}

footer {
  padding: 3em 4em;
  background-color: var(--main-accent);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1em;
}

h1 {
  color: white;
  font-size: 1.75em;
  margin: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

img {
  height: 2em;
}

a {
  font-size: large;
  color: var(--base-bg);
  font-weight: 400;
  text-decoration: none;
}

ul {
  list-style-type: none;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-direction: row;
  gap: 1em;
}

.nav-link {
  font-size: 1.2em;
}

.selected {
  color: white;
}
</style>
