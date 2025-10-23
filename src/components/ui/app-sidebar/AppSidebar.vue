<script setup lang="ts">
import NavMain from "@/components/ui/app-sidebar/NavMain.vue";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-vue-next";
import { HTMLAttributes } from "vue";

// import { SidebarProps } from '@/components/ui/sidebar'

const props = withDefaults(
  defineProps<{
    side?: "left" | "right";
    variant?: "sidebar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
    class?: HTMLAttributes["class"];
   data: {
    teams: Array<{
      name: string;
      logo: string;
      plan: string;
    }>;
    navMain: Array<{
      title: string;
      url: string;
      icon?: LucideIcon;
      isActive?: boolean; 
      permissionName?:string;
      items?: Array<{
        title: string;
        url: string;
      }>;
    }>;
    users: Array<{
      name: string;
      url: string;
      icon: LucideIcon;
    }>;
    user?: {
      name: string;
      email: string;
      avatar: string;
    };
  };
  }>(),
  {
    collapsible: "icon",
  }
);

</script>

<template>
  <Sidebar v-bind="props" class="relative group/collapsible  ">

    <SidebarContent class="group-data-[state=open]/collapsible:pl-[26px] pt-[10px]">
      <NavMain :items="props.data.navMain" />
      <!-- <NavProjects :projects="props.data.users" /> -->
    </SidebarContent>
    <SidebarFooter class="relative">
      <img
        src="/logo/footer-icon.svg"
        class="w-[110px] absolute z-50 bottom-0 right-0"
      />
      <!-- <NavUser :user="data.user" /> -->
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
