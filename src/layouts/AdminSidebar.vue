<template>
  <AppSidebar :data="ADMIN_SIDEBAR"  />
  <SidebarInset class="bg-[#E0DCD6]/50 overflow-x-hidden">
    <slot></slot>
  </SidebarInset>
</template>

<script lang="ts" setup>
import AppSidebar from '@/components/ui/app-sidebar/AppSidebar.vue';
import SidebarInset from "@/components/ui/sidebar/SidebarInset.vue";
import { ADMIN_SIDEBAR } from '@/constant';

</script>
