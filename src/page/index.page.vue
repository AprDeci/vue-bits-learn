<script setup lang="ts">
  import { useRouter } from "vue-router";

  const router = useRouter();

  const routeList = router.getRoutes();
</script>

<template>
  <div>
    <ul>
      <li v-for="route in routeList" :key="route.path">
        <a :href="route.path">{{ route.path }}</a>
      </li>
    </ul>
  </div>
</template>
