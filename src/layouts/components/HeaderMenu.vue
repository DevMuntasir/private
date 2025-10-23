<script setup>
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useUserStore } from '@/store/user-store'
import { useAuthStore } from '@/store/auth-store'
import { Loader2, LogOut, User } from 'lucide-vue-next'

const authStore = useAuthStore()
const store = useUserStore()
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Avatar class="border-3 border-gray-200/80 p-1 w-10 h-10 cursor-pointer">
        <AvatarImage :src="store.authUser.data.profile_image || ''" alt="User" class=" rounded-full" />
       <AvatarFallback class="bg-gradient-to-br from-primary to-secondary text-white font-semibold uppercase">
            {{ store.authUser?.data?.name?.[0]  }}
          </AvatarFallback>
      </Avatar>
    </DropdownMenuTrigger>

    <DropdownMenuContent class=" p-2 shadow-xl border absolute rounded-xl -right-[20px]">
      <!-- Profile Header -->
      <div class="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
        <Avatar class="w-10 h-10">
          <AvatarImage :src="store.authUser.data.profile_image || ''" alt="User" />
          <AvatarFallback class="bg-gradient-to-br from-primary to-secondary text-white font-semibold uppercase">
            {{ store.authUser?.data?.name?.[0] || 'U' }}
          </AvatarFallback>
        </Avatar>
        <div class="space-y-0.5">
          <p class="text-sm font-medium leading-none capitalize">
            {{ store.authUser?.data?.name }}
          </p>
          <p class="text-xs text-muted-foreground">
            {{ store.authUser?.data?.email }}
          </p>
        </div>
      </div>

      <DropdownMenuSeparator class="my-2" />

      <!-- Menu Items -->
      <RouterLink to="/private/accounts">
      <DropdownMenuItem class="py-2.5 px-3 cursor-pointer font-semibold rounded-md hover:bg-accent hover:text-accent-foreground transition">
         <User class=" text-black"/>  Profile
        </DropdownMenuItem>
      </RouterLink>



      <DropdownMenuSeparator class="my-2" />

      <!-- Logout -->
      <DropdownMenuItem
        class="py-2.5 px-3 text-red-600 font-secondary-bold hover:text-red-700 hover:bg-red-50 cursor-pointer rounded-md transition"
        :disabled="authStore.isLoading"
        @click="authStore.logout()"
      >
        <Loader2 v-if="authStore.isLoading" class="mr-2 h-4 w-4 animate-spin" />
        <p class=" flex gap-2 items-center">  Sign out <LogOut class=" text-secondary mt-1"/></p>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
