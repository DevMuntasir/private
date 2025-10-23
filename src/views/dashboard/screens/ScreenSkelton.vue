<template>
  <div class="max-w-[700px]  bg-white rounded-lg mt-5 shadow p-6">
    <!-- Status -->
    <div class="flex items-center mb-4 space-x-2">
      <div class="w-3 h-3 rounded-full bg-yellow-400 animate-pulse"></div>
      <div class="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
    </div>

    <!-- Type & Goal -->
    <div class="flex justify-between mb-4">
      <div>
        <div class="text-sm text-gray-500">Type:</div>
        <div class="h-4 bg-gray-300 rounded w-20 animate-pulse mt-1"></div>
      </div>
      <div>
        <div class="text-sm text-gray-500">Goal:</div>
        <div class="h-4 bg-gray-300 rounded w-32 animate-pulse mt-1"></div>
      </div>
    </div>

    <div class="border-t my-4"></div>

    <!-- Campaign Name -->
    <div class="mb-4">
      <div class="text-sm text-gray-500">Campaign name</div>
      <div class="h-4 bg-gray-300 rounded w-40 animate-pulse mt-1"></div>
    </div>

    <!-- Format ads -->
    <div class="mb-4">
      <div class="text-sm text-gray-500">Format ads</div>
      <div class="h-4 bg-gray-300 rounded w-56 animate-pulse mt-1"></div>
    </div>

    <!-- Bid strategy -->
    <div class="mb-4">
      <div class="text-sm text-gray-500">Bid strategy</div>
      <div class="h-4 bg-gray-300 rounded w-60 animate-pulse mt-1"></div>
    </div>

    <div class="border-t my-4"></div>

    <!-- Budget and dates -->
    <div class="mb-4">
      <div class="text-sm text-gray-500">Budget and dates</div>
      <div class="h-4 bg-gray-300 rounded w-40 animate-pulse mt-1 mb-2"></div>

      <div class="flex justify-between">
        <div>
          <div class="text-sm text-gray-500">Start Date</div>
          <div class="h-4 bg-gray-300 rounded w-32 animate-pulse mt-1"></div>
        </div>
        <div>
          <div class="text-sm text-gray-500">End Date</div>
          <div class="h-4 bg-gray-300 rounded w-32 animate-pulse mt-1"></div>
        </div>
      </div>
    </div>

    <div class="border-t my-4"></div>

    <!-- Locations -->
    <div class="mb-6">
      <div class="text-sm text-gray-500">Locations</div>
      <div class="h-4 bg-gray-300 rounded w-48 animate-pulse mt-1"></div>
    </div>

    <!-- Edit Button -->
    <div class="w-20 h-8 bg-gray-300 rounded animate-pulse"></div>
  </div>
</template>
