<script setup lang="ts">
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-vue-next'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import { useRouter, useRoute } from 'vue-router'

 defineProps<{
  user: {
    name: string
    email: string
    avatar: string
  }
}>()

const { isMobile } = useSidebar()
const router = useRouter()
const route = useRoute()

const navigateTo = (path: string) => {
  router.push(path)
}

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const handleLogout = () => {
  console.log('Perform logout logic here')
  // Example: await authStore.logout()
  // router.push('/login')
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ user.name }}</span>
              <span class="truncate text-xs">{{ user.email }}</span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width] min-w-56 rounded-lg"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :src="user.avatar" :alt="user.name" />
                <AvatarFallback class="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.name }}</span>
                <span class="truncate text-xs">{{ user.email }}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem @click="navigateTo('/upgrade')">
              <Sparkles class="mr-2 h-4 w-4" />
              Upgrade to Pro
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem
              @click="navigateTo('/account')"
              :class="isActive('/account') ? 'bg-sidebar-foreground text-black font-semibold rounded-md' : ''"
            >
              <BadgeCheck class="mr-2 h-4 w-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="navigateTo('/billing')"
              :class="isActive('/billing') ? 'bg-sidebar-foreground text-black font-semibold rounded-md' : ''"
            >
              <CreditCard class="mr-2 h-4 w-4" />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem
              @click="navigateTo('/notifications')"
              :class="isActive('/notifications') ? 'bg-sidebar-foreground text-black font-semibold rounded-md' : ''"
            >
              <Bell class="mr-2 h-4 w-4" />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem @click="handleLogout">
            <LogOut class="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
