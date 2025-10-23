<script setup lang="ts">
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-vue-next";

</script>

<template>
  <div>
    <Alert className="border-orange-200 bg-orange-50 p-5 flex gap-2 items-center">
      <Lock className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium"> Access Restricted</p>
            <p className="text-sm mt-1">
              You don't have permission to view this data
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  </div>
</template>
