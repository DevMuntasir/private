<script setup lang="ts">
import {
  type LucideIcon
} from "lucide-vue-next";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { useRoute, useRouter } from "vue-router";

defineProps<{
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}>();


const router = useRouter();
const route = useRoute();

const navigateTo = (path: string) => {
  router.push(path);
};

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + "/");
};
</script>

<template>
  <SidebarGroup class="group-data-[collapsible=icon]:hidden">
    <SidebarGroupLabel>Users</SidebarGroupLabel>
    <SidebarMenu>
      <SidebarMenuItem v-for="item in projects" :key="item.name">
        <SidebarMenuButton as-child>
          <div
            @click="navigateTo(item.url)"
            :class="
              isActive(item.url)
                ? 'bg-sidebar-foreground text-black font-semibold rounded-sm cursor-pointer'
                : 'cursor-pointer'
            "
          >
            <component :is="item.icon" />
            <span>{{ item.name }}</span>
          </div>
        </SidebarMenuButton>
        <!-- <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <SidebarMenuAction show-on-hover>
              <MoreHorizontal />
              <span class="sr-only">More</span>
            </SidebarMenuAction>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            class="w-48 rounded-lg"
            :side="isMobile ? 'bottom' : 'right'"
            :align="isMobile ? 'end' : 'start'"
          >
            <DropdownMenuItem>
              <Folder class="text-muted-foreground" />
              <span>View Project</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Forward class="text-muted-foreground" />
              <span>Share Project</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Trash2 class="text-muted-foreground" />
              <span>Delete Project</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> -->
      </SidebarMenuItem>
    </SidebarMenu>
  </SidebarGroup>
</template>
