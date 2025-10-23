<template>
  <div class="bg-white w-full max-h-[90vh] overflow-hidden flex flex-col">
    <div class="flex items-center justify-between  pt-0 pb-3 border-b px-6">
      <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2 ">
       <Pencil :size="16"/> {{ isEditing ? 'Edit Role' : 'Add New Role' }}
      </h2>
      
    </div>

    <form @submit.prevent="onSubmit" class=" pt-4 flex-1">
      <div class="overflow-y-auto max-h-[calc(90vh-180px)] pb-2">

        <div class="mb-8 px-6 ">
          <Label for="roleName" class="block text-base font-medium text-gray-700 mb-2">
            Role Name
          </Label>
          <Input
            v-model="formData.name"
            id="roleName"
            name="name"
            placeholder="Enter role name"
            class="form-input text-base"
          />
          <p v-if="errors.name" class="text-red-600 text-sm mt-1">{{ errors.name }}</p>
        </div>
  
  
        <!-- Permissions Section -->
        <div class="px-6 ">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-gray-900">Permissions</h3>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {{ getSelectedPermissionsCount() }} selected
            </span>
          </div>
  
          <div class="space-y-6">
            <div 
              v-for="module in props.modules" 
              :key="module.id" 
              class="border-2 border-gray-200 rounded-lg overflow-hidden"
            >
              <!-- Module Header -->
              <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg">
                      <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="getModuleIcon(module.name) === 'users'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                        <path v-else-if="getModuleIcon(module.name) === 'shield'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <h4 class="text-base font-semibold text-gray-900 flex items-center gap-2">
                        {{ formatModuleName(module.name) }}
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600">
                          {{ getModuleSelectedCount(module) }}/{{ module.permissions.length }}
                        </span>
                      </h4>
                      <p class="text-sm text-gray-600 mt-1">{{ getModuleDescription(module.name) }}</p>
                    </div>
                  </div>
                  
                  <!-- Select All Button -->
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      @click="toggleAllPermissions(module)"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors"
                      :class="getSelectAllButtonClass(module)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="isAllSelected(module)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {{ getSelectAllButtonText(module) }}
                    </button>
                  </div>
                </div>
              </div>
  
              <!-- Module Permissions -->
              <div class="p-4">
                <div class="grid gap-4 md:grid-cols-2">
                  <div
                    v-for="permission in module.permissions"
                    :key="permission.id"
                    class="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      :id="'perm-' + permission.id"
                      v-model="formData.permissions[permission.id]"
                      :disabled="!canAssignPermission(permission.id)"
                      class="h-4 w-4 accent-secondary mt-0.5"
                    />
                    <div class="flex-1 space-y-1">
                      <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path v-if="getPermissionIcon(permission.name) === 'eye'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          <path v-else-if="getPermissionIcon(permission.name) === 'plus'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                          <path v-else-if="getPermissionIcon(permission.name) === 'edit'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                        <label 
                          :for="'perm-' + permission.id" 
                          class="text-sm font-medium text-gray-900 cursor-pointer"
                        >
                          {{ formatPermissionName(permission.name) }}
                        </label>
                      </div>
                      <p class="text-xs text-gray-600 leading-relaxed">
                        {{ getPermissionDescription(permission.name) }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class=" flex justify-end space-x-3 pt-6 border-t border-gray-200 px-6 ">
        
        <Button 
          type="submit" 
          :disabled="isSubmitting" 
          class="btn"
        >
         <SaveAll/> {{ isEditing ? (isSubmitting ? 'Updating...' : 'Update') : (isSubmitting ? 'Submitting...' : 'Submit') }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRoleStore } from '@/store/common/role-permission-store'
import type { PermissionType } from '@/types/permission-type'
import { Pencil, SaveAll } from 'lucide-vue-next'
import { computed, reactive, ref, watch } from 'vue'
import * as yup from 'yup'

const props = defineProps<{
  //eslint-disable-next-line
  modules: any[]
  roleToEdit: null | { id: string | number; name: string; permissions: PermissionType[] }
}>()

const emit = defineEmits(['close', 'submit', 'role-created', 'role-updated'])

const roleStore = useRoleStore()
const isEditing = computed(() => !!props.roleToEdit)
const isSubmitting = ref(false)
const errors = reactive<{ name?: string }>({})

const formData = reactive({
  name: '',
  permissions: {} as Record<number, boolean>,
})

const canAssignPermission = (permId: number) => {
  // return roleStore.all_permissions.some((mod) =>
  //   mod.permissions.some((p) => p.id === permId)
  // )
  console.log(permId);
  
  return true
}

const resetForm = () => {
  formData.name = props.roleToEdit?.name ?? ''
  formData.permissions = {}
  const allowedPermissionIds = roleStore.all_permissions
    .flatMap((module) => module.permissions.map((p) => p.id))
  const rolePermissionIds = props.roleToEdit?.permissions ?? []
  props.modules.forEach((module) => {
    module.permissions.forEach((perm) => {
      const isAllowed = allowedPermissionIds.includes(perm.id)
      const isAssigned = rolePermissionIds.includes(perm.id)
      formData.permissions[perm.id] = isAllowed && isAssigned
    })
  })
}

// ✅ Readable permission label formatter
const formatPermissionName = (perm: string) => {
  const actionMap: Record<string, string> = {
    access: 'Access',
    create: 'Create', 
    view: 'Read',
    update: 'Update',
    delete: 'Delete',
  }
  const parts = perm.split('_')
  const action = parts[0]
  const module = parts.slice(1).join(' ').replace(/_/g, ' ')
  return `${actionMap[action] || action} ${module
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')}`
}

// Helper functions for UI enhancements
const formatModuleName = (name: string) => {
  return name.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getModuleIcon = (moduleName: string) => {
  const name = moduleName.toLowerCase()
  if (name.includes('user') || name.includes('client')) return 'users'
  if (name.includes('role') || name.includes('permission')) return 'shield'
  return 'megaphone'
}

const getModuleDescription = (moduleName: string) => {
  const name = moduleName.toLowerCase()
  if (name.includes('user') || name.includes('client')) return 'Manage client user accounts and profiles'
  if (name.includes('role') || name.includes('permission')) return 'Manage user roles and permissions'
  if (name.includes('campaign')) return 'Manage marketing campaigns and content'
  return 'Manage system functionality'
}

const getPermissionIcon = (permissionName: string) => {
  const name = permissionName.toLowerCase()
  if (name.includes('access') || name.includes('view') || name.includes('read')) return 'eye'
  if (name.includes('create') || name.includes('add')) return 'plus'
  if (name.includes('update') || name.includes('edit')) return 'edit'
  if (name.includes('delete') || name.includes('remove')) return 'trash'
  return 'eye'
}

const getPermissionDescription = (permissionName: string) => {
  const parts = permissionName.split('_')
  const action = parts[0].toLowerCase()
  const module = parts.slice(1).join(' ').replace(/_/g, ' ')
  
  const actionDescriptions: Record<string, string> = {
    access: 'Access and view',
    view: 'Read and view',
    create: 'Add new',
    update: 'Modify existing',
    delete: 'Remove',
  }
  
  const moduleFormatted = module.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
  
  return `${actionDescriptions[action] || action} ${moduleFormatted.toLowerCase()} information and settings`
}

const getSelectedPermissionsCount = () => {
  return Object.values(formData.permissions).filter(Boolean).length
}
//eslint-disable-next-line
const getModuleSelectedCount = (module: any) => {
  //eslint-disable-next-line
  return module.permissions.filter((perm: any) => formData.permissions[perm.id]).length
}

// Select All functionality
//eslint-disable-next-line
const isAllSelected = (module: any) => {
  //eslint-disable-next-line
  return module.permissions.every((perm: any) => 
    formData.permissions[perm.id] && canAssignPermission(perm.id)
  )
}
//eslint-disable-next-line
const isNoneSelected = (module: any) => {
  //eslint-disable-next-line
  return module.permissions.every((perm: any) => 
    !formData.permissions[perm.id]
  )
}
//eslint-disable-next-line
const getSelectAllButtonText = (module: any) => {
  if (isAllSelected(module)) {
    return 'Clear All'
  } else if (isNoneSelected(module)) {
    return 'Select All'
  } else {
    return 'Select Some'
  }
}
//eslint-disable-next-line
const getSelectAllButtonClass = (module: any) => {
  if (isAllSelected(module)) {
    return 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
  } else {
    return 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
  }
}
//eslint-disable-next-line
const toggleAllPermissions = (module: any) => {
  const shouldSelectAll = !isAllSelected(module)
  //eslint-disable-next-line
  module.permissions.forEach((perm: any) => {
    if (canAssignPermission(perm.id)) {
      formData.permissions[perm.id] = shouldSelectAll
    }
  })
}

const schema = yup.object({
  name: yup.string().required('Role name is required').min(2).max(50),
  permissions: yup.object(
    props.modules.reduce((acc, module) => {
      module.permissions.forEach((perm) => {
        acc[perm.id] = yup.boolean()
      })
      return acc
    }, {} as Record<number, yup.BooleanSchema>)
  ),
})

watch(() => props.roleToEdit, () => resetForm(), { immediate: true })

const close = () => {
  emit('close')
}

const onSubmit = async () => {
  isSubmitting.value = true
  errors.name = undefined
  try {
    const validated = await schema.validate(formData, { abortEarly: false })
    const selectedPermissions = Object.entries(validated.permissions)
      .filter(([, checked]) => checked)
      .map(([id]) => parseInt(id))

    const payload = {
      name: validated.name.trim(),
      permissions: selectedPermissions,
    }

    if (isEditing.value && props.roleToEdit) {
      await roleStore.updateRole({ id: props.roleToEdit.id, ...payload })
      emit('role-updated', { id: props.roleToEdit.id, ...payload })
    } else {
      const newRole = await roleStore.addRole(payload)
      emit('role-created', newRole)
    }

    emit('submit', payload)
    close()
    //eslint-disable-next-line
  } catch (error: any) {
    if (error.inner) {
      for (const err of error.inner) {
        if (err.path === 'name') errors.name = err.message
      }
    } else {
      console.error('Validation or submission failed:', error)
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
