<script setup lang="ts">
import {
  SidebarMenu,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { ref } from "vue";


const props = defineProps<{
  teams: {
    name: string;
    logo: string;
    plan: string;
  }[];
}>();

const activeTeam = ref(props.teams[0]);


</script>

<template>
  <SidebarMenu  class="z-[9999]">
    <SidebarMenuItem
      class="flex gap-3 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent  bg-sidebar-accent  w-full py-2 px-2 rounded-lg text-black "
    >
      <div
        class="flex aspect-square size-9 items-center justify-center z-50 rounded-lg group-data-[collapsible=icon]:duration-300 bg-black group-data-[collapsible=icon]:border-sidebar-accent group-data-[collapsible=icon]:border-[2px] "
      >
        <!-- <component :is="activeTeam.logo" class="size-4" /> -->
         <img class="w-[14px] " :src="teams[0].logo" alt="" >
      </div>
      <div class="grid flex-1 text-left text-sm leading-tight">
        <span class="truncate font-semibold">
          {{ activeTeam.name }}
        </span>
        <span class="truncate text-xs">{{ activeTeam.plan }}</span>
      </div>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
