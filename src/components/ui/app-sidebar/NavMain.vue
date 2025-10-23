<!-- src/components/ui/sidebar/SidebarMenu.vue -->
<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from "@/components/ui/sidebar";
import { useRoleStore } from "@/store/common/role-permission-store";
import { ChevronRight, type LucideIcon } from "lucide-vue-next";
import { useRoute } from "vue-router";
import { computed } from "vue";

const props = defineProps<{
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    permissionName?: string;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}>();

const route = useRoute();
const roleStore = useRoleStore();

const isActive = (url: string) => {
  return route.path === url || route.path.startsWith(url + "/");
};

const isSubActive = (subItems?: { url: string }[]) => {
  if (!subItems) return false;
  return subItems.some((sub) => isActive(sub.url));
};

const filteredItems = computed(() =>
  props.items.map(item => ({
    ...item,
    hasAccess: item.permissionName
      ? roleStore.hasPermission(item.permissionName)
      : true,
  }))
);
</script>

<template>
  <SidebarGroup>
    <SidebarMenu>
      <template v-if="!roleStore.permissionLoaded">
        <SidebarMenuItem v-for="n in 5" :key="n">
          <SidebarMenuButton>
            <div class="h-6 bg-gray-800/50 rounded w-full animate-pulse"></div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </template>

      <template v-else>
        <Collapsible
          v-for="item in filteredItems"
          :key="item.title"
          as-child
          v-show="item.hasAccess"
          :default-open="isActive(item.url) || isSubActive(item.items)"
          class="group/collapsible py-1"
        >
          <SidebarMenuItem
            :class="isActive(item.url) ? 'text-[#E6B71D] rounded-[5px] ' : ''"
          >
            <CollapsibleTrigger
              as-child
              class="text-[17px] font-primary !font-normal"
            >
              <SidebarMenuButton :tooltip="item.title">
                <component :is="item.icon" v-if="item.icon" />
                <span>{{ item.title }}</span>
                <ChevronRight
                  v-if="item.items?.length"
                  class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <router-link
              v-if="!item.items?.length"
              :to="item.url"
              class="absolute inset-0 z-10"
            />

            <CollapsibleContent v-if="item.items?.length">
              <SidebarMenuSub>
                <SidebarMenuSubItem
                  v-for="subItem in item.items"
                  :key="subItem.title"
                  :class="isActive(subItem.url) ? 'bg-muted/30 rounded-lg' : ''"
                >
                  <SidebarMenuSubButton as-child>
                    <router-link :to="subItem.url" class="w-full block px-2 py-1">
                      {{ subItem.title }}
                    </router-link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </template>
    </SidebarMenu>
  </SidebarGroup>
</template>
