<script setup lang="ts">
  import { useRouter } from "vue-router";

  const router = useRouter();

  const routeList = router.getRoutes();
</script>

<template>
  <div>
    <ul>
      <a v-for="route in routeList" :key="route.path" :href="route.path">
        {{ route.path }}
      </a>
    </ul>
  </div>
</template>
