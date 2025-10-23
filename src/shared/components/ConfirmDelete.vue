<!-- components/ConfirmDeleteDialog.vue -->
<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription>
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex justify-end gap-2 mt-4">
        <Button class="btn !bg-white !text-black" variant="outline" @click="$emit('cancel')">
          Cancel
        </Button>
        <Button class="btn" @click="$emit('confirm')">
          Delete
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

defineProps<{
  open: boolean;
  title?: string;
  description?: string;
}>();

defineEmits(["update:open", "confirm", "cancel"]);
</script>
