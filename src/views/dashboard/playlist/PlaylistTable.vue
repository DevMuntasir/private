<template>
  <div class="space-y-4 mt-6">
    <template v-if="canViewPlaylists">
    <div class="flex items-center justify-between">
      <Sheet
        v-if="canCreatePlaylist || canUpdatePlaylist"
        v-model:open="isPlaylistSheetOpen"
      >
        <VideoPreview
          :isOpen="isPreviewOpen"
          :videoUrl="videoUrl"
          :width="260"
          :height="430"
          logoUrl="/logo/w-logo.svg"
          @close="onCloseVideoPreview"
        />

        <SheetTrigger as-child v-if="canCreatePlaylist">
          <Button class="btn flex items-center gap-2 group" variant="outline">
            <Plus class="w-4 h-4 transition-transform group-hover:scale-110" />
            Add New Playlist
          </Button>
        </SheetTrigger>

        <SheetContent
          class="w-full sm:max-w-2xl md:max-w-3xl h-full flex flex-col p-0 gap-0"
        >
          <!-- Sticky Header -->
          <div
            class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 shadow-sm"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-50 rounded-lg">
                  <PenBox class="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h2 class="text-xl font-bold text-gray-900 font-primary">
                    {{ sheetTitle }}
                  </h2>
                  <p class="text-[13px] font-secondary-Regular text-gray-600">
                    Manage your video playlist
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <Badge
                  :variant="selectedAdIds.length > 0 ? 'default' : 'secondary'"
                  class="hidden sm:flex"
                >
                  {{ selectedAdIds.length }} ads selected
                </Badge>
                <SheetClose
                  class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X class="w-5 h-5" />
                </SheetClose>
              </div>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto">
            <form class="space-y-4 p-6" @submit.prevent="handleSavePlaylist">
              <!-- Step 1: Basic Information -->
              <div
                class="bg-white rounded-xl border border-gray-200 p-6 shadow-xl"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center"
                  >
                    <FolderOpen class="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 font-primary">
                      Playlist Details
                    </h3>
                    <p class="text-[13px] text-gray-600 font-secondary-Regular">
                      Give your playlist a name and target locations
                    </p>
                  </div>
                </div>

                <div class="space-y-4">
                  <!-- Playlist Name -->
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 mb-2 font-primary"
                    >
                      Playlist Name <span class="text-red-500">*</span>
                    </label>
                    <Input
                      v-model="playlistName"
                      placeholder="e.g., Summer Campaign, Product Launch, etc."
                      class="w-full form-input"
                    />
                    <p
                      v-if="playlistErrors.name"
                      class="text-red-500 text-xs mt-2 flex items-center gap-1"
                    >
                      <AlertCircle class="w-3 h-3" />
                      {{ playlistErrors.name }}
                    </p>
                  </div>

                  <!-- Location Selection in Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2 font-primary"
                      >
                        Target Cities
                      </label>
                      <MultiSelect
                        :modelValue="selectedCityIds"
                        @update:model-value="handleCitySelection"
                        :options="cityOptions"
                        placeholder="Select cities..."
                        :searchable="true"
                        class="rounded-lg"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 mb-2 font-primary"
                      >
                        Specific Locations
                      </label>
                      <MultiSelect
                        :modelValue="selectedLocationIds"
                        @update:model-value="handleLocationSelection"
                        :options="locationOptions"
                        placeholder="Select locations..."
                        :searchable="true"
                        class="rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: Screen Selection -->
              <div
                class="bg-white rounded-xl border h-full shadow-xl border-gray-200 p-6"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center"
                    >
                      <Monitor class="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 font-primary">
                        Select Screens <span class="text-red-500">*</span>
                      </h3>
                      <p class="text-[13px] text-gray-600">
                        Choose where this playlist will be displayed
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge variant="outline" class="hidden sm:flex">
                      {{ selectedScreenIds.length }}/{{
                        availableScreens.length
                      }}
                    </Badge>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      :disabled="
                        isScreensLoading || selectableScreenIds.length === 0
                      "
                      @click="toggleSelectAllScreens"
                    >
                      {{ allScreensSelected ? "Deselect All" : "Select All" }}
                    </Button>
                  </div>
                </div>

                <div class="space-y-3 h-full">
                  <!-- Screens Grid -->
                  <div
                    v-if="isScreensLoading"
                    class="flex items-center justify-center py-10 text-sm text-gray-500"
                  >
                    <Loader class="w-4 h-4 mr-2 animate-spin" />
                    Loading screens...
                  </div>
                  <ScrollArea v-else class="h-[260px]">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
                      <div
                        v-for="screen in availableScreens"
                        :key="screen.id"
                        :class="[
                          'p-3 rounded-lg border-[1px] cursor-pointer transition-all duration-200',
                          selectedScreenIds.includes(screen.id)
                            ? 'border-secondary/20 bg-secondary/5 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                        ]"
                        @click="toggleScreenSelection(screen.id)"
                      >
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3 min-w-0">
                            <div
                              class="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0"
                            >
                              <Monitor class="w-5 h-5 text-secondary" />
                            </div>
                            <div class="min-w-0">
                              <p
                                class="font-medium text-gray-900 text-sm truncate font-secondary-Regular capitalize"
                              >
                                {{ screen.name }}
                              </p>
                              <p
                                class="text-xs text-gray-500 truncate capitalize"
                              >
                                {{ screen.location?.name || "No location" }}
                              </p>
                            </div>
                          </div>
                          <Checkbox
                            :model-value="selectedScreenIds.includes(screen.id)"
                            @update:modelValue="(checked) => handleScreenCheckboxChange(screen.id, checked as boolean)"
                            @click.stop
                            class="shrink-0 data-[state=checked]:bg-secondary"
                          />
                        </div>
                      </div>

                      <!-- Empty State -->
                      <div
                        v-if="!availableScreens.length"
                        class="col-span-2 text-center py-8"
                      >
                        <MonitorOff
                          class="w-12 h-12 text-gray-300 mx-auto mb-3"
                        />
                        <p class="text-gray-500 text-sm">
                          No screens available
                        </p>
                        <p class="text-gray-400 text-xs mt-1">
                          Create screens to get started
                        </p>
                      </div>
                    </div>
                  </ScrollArea>

                  <p
                    v-if="playlistErrors.screens"
                    class="text-red-500 text-xs flex items-center gap-1"
                  >
                    <AlertCircle class="w-3 h-3" />
                    {{ playlistErrors.screens }}
                  </p>
                </div>
              </div>

              <!-- Step 3: Ads Selection -->
              <div
                class="bg-white rounded-xl border border-gray-200 p-6 shadow-xl"
              >
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"
                    >
                      <Video class="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 class="font-semibold text-gray-900 font-primary">
                        Select Video Ads <span class="text-red-500">*</span>
                      </h3>
                      <p
                        class="text-[13px] text-gray-600 font-secondary-Regular"
                      >
                        Choose ads to include in this playlist
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <Badge variant="outline" class="hidden sm:flex">
                      {{ selectedAdIds.length }}/{{ adStore.ads.length }}
                    </Badge>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      :disabled="availableAdIds.length === 0"
                      @click="toggleSelectAllAds"
                    >
                      {{ allAdsSelected ? "Deselect All" : "Select All" }}
                    </Button>
                  </div>
                </div>

                <div class="space-y-3">
                  <!-- Ads Grid -->
                  <ScrollArea class=" ">
                    <div
                      class="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 pr-4"
                    >
                      <div
                        v-for="ad in adStore.ads"
                        :key="ad.id"
                        :class="[
                          'group p-4 rounded-lg border-[1px] cursor-pointer transition-all duration-200',
                          selectedAdIds.includes(ad.id)
                            ? 'border-orange-200 bg-orange-50 shadow-sm'
                            : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50',
                        ]"
                        @click="toggleAdSelection(ad.id)"
                      >
                        <div class="space-y-3">
                          <!-- Thumbnail -->

                          <!-- Ad Info -->
                          <div class="flex items-start justify-between gap-2">
                            <div class="min-w-0 flex-1">
                              <p
                                class="font-medium text-gray-900 text-sm truncate font-secondary-Regular capitalize"
                              >
                                {{ ad.name }}
                              </p>
                            </div>
                            <Checkbox
                              :model-value="selectedAdIds.includes(ad.id)"
                              @update:modelValue="(checked) => handleAdCheckboxChange(ad.id, checked as boolean)"
                              @click.stop
                              class="shrink-0 mt-0.5 data-[state=checked]:bg-secondary"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- Empty State -->
                      <div
                        v-if="!adStore.ads.length"
                        class="col-span-3 text-center py-8"
                      >
                        <VideoOff
                          class="w-12 h-12 text-gray-300 mx-auto mb-3"
                        />
                        <p class="text-gray-500 text-sm">No ads available</p>
                        <p class="text-gray-400 text-xs mt-1">
                          Create ads to build your playlist
                        </p>
                      </div>
                    </div>
                  </ScrollArea>

                  <p
                    v-if="playlistErrors.ads"
                    class="text-red-500 text-xs flex items-center gap-1"
                  >
                    <AlertCircle class="w-3 h-3" />
                    {{ playlistErrors.ads }}
                  </p>
                </div>
              </div>

              <!-- Action Buttons - Sticky Footer -->
              <div
                class="sticky bottom-0 bg-white border-t border-gray-200 -mx-6 -mb-6 px-6 py-3 shadow-lg"
              >
                <div
                  class="flex flex-col sm:flex-row gap-3 justify-between items-center"
                >
                  <div class="text-sm text-gray-600 hidden sm:block">
                    {{ selectedAdIds.length }} ads •
                    {{ selectedScreenIds.length }} screens • Ready to create
                  </div>

                  <div class="flex gap-3 w-full sm:w-auto">
                    <SheetClose as-child>
                      <Button
                        type="button"
                        variant="outline"
                        class="flex-1 sm:flex-none btn !bg-white !text-black"
                        @click="handleCancelPlaylistForm"
                      >
                        Cancel
                      </Button>
                    </SheetClose>
                    <Button
                      type="submit"
                      class="flex-1 sm:flex-none btn"
                      :disabled="
                        isCheckingScreens ||
                        isSavingPlaylist ||
                        !selectedAdIds.length
                      "
                    >
                      <Loader
                        v-if="isCheckingScreens"
                        class="w-4 h-4 animate-spin mr-2"
                      />
                      {{ isCheckingScreens ? "Checking..." : "Continue" }}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
      <div class="flex items-center space-x-2">
        <Select v-model="pageSize">
          <SelectTrigger
            class="w-[120px] font-primary !h-[40px] rounded-[3px] bg-white"
          >
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Per Page</SelectLabel>
            <SelectItem v-for="size in [5, 10, 20]" :key="size" :value="size">
              {{ size }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div class="border bg-white relative">
      <SearchAndFilterBar
        :search-query="searchQuery"
        :model-value="filters"
        @update:modelValue="(val) => (filters = { ...filters, ...val })"
        :selected-filters="selectedFilters"
        @update:selectedFilters="(val) => (selectedFilters = val)"
        @update:searchQuery="(val) => (searchQuery = val)"
        :filter-options="filterOptions"
        :searchable="true"
        :can-search="true"
        :placeholder="'Search by playlist name...'"
        :status-option="[]"
        filter-for="other"
        :canFilter="false"
      />

      <div
        ref="dragWrapper"
        :class="['table-drag-scroll', { 'is-dragging': isDraggingTable }]"
        @pointerdown="handlePointerDown"
        @pointermove="handlePointerMove"
        @pointerup="handlePointerUp"
        @pointerleave="handlePointerUp"
        @pointercancel="handlePointerUp"
        style="--sticky-name-width: 16rem; --sticky-second-width: 16rem"
      >
        <Table class="relative w-full border-separate border-spacing-0">
          <TableHeader class="h-[55px]">
            <TableRow class="bg-table-header">
              <TableHead
                :stickyTop="true"
                class="sticky-col sticky-col--checkbox w-[56px] px-3"
              >
                <Checkbox
                  class="checkbox"
                  :model-value="allSelected"
                  :indeterminate="isIndeterminate"
                  @update:modelValue="toggleSelectAll"
                />
              </TableHead>

              <TableHead
                @click="handleSort('name')"
                :stickyTop="true"
                class="cursor-pointer sticky-col sticky-col--name w-[200px]"
              >
                Playlist Name
              </TableHead>
              <TableHead> Total Ad </TableHead>

              <TableHead class="pr-5 bg-table-header" :stickyTop="true"
                >Locations</TableHead
              >

              <TableHead
                class="pr-5 bg-table-header text-right"
                :stickyTop="true"
                :stickyLastColumn="true"
                >Action</TableHead
              >
            </TableRow>
          </TableHeader>

          <TableBody>
            <template v-if="!loading && playlistRows.length > 0">
              <TableRow
                v-for="row in playlistRows"
                :key="row.playlist.id"
                :class="[
                  selectedUsers.includes(row.playlist.id) ? 'bg-muted/50' : '',
                  editingPlaylistId === row.playlist.id
                    ? 'ring-1 ring-primary/60'
                    : '',
                  'cursor-pointer hover:bg-muted/20 transition-colors',
                ]"
              >
                <TableCell
                  @click="handlePlaylistRowClick($event, row.playlist)"
                  class="sticky-col sticky-col--checkbox w-[56px] text-left"
                >
                  <Checkbox
                    class="checkbox"
                    :model-value="selectedPlaylistIds.includes(row.playlist.id)"
                    @update:modelValue="
                      (checked) => toggleRow(row.playlist.id, checked as boolean)
                    "
                    data-row-ignore="true"
                  />
                </TableCell>

                <TableCell class="min-w-[220px] h-full">
                  <button
                    class="cursor-pointer hover:underline w-full h-full font-primary text-secondary capitalize"
                    @click="handlePlaylistRowClick($event, row.playlist)"
                  >
                    {{ row.playlist.name }}
                  </button>
                </TableCell>
                <TableCell
                  class="min-w-[160px] text-center font-primary font-semibold"
                >
                  {{ row.adCount }}
                </TableCell>
                <TableCell class="min-w-[240px]">
                  <div class="text-sm font-medium text-gray-900">
                    {{ row.locationCount }} Locations
                  </div>
                  <p
                    v-if="row.hasLocations && row.locationSummary"
                    class="text-xs text-gray-600 mt-1"
                  >
                    {{ row.locationSummary }}
                  </p>
                  <p v-else class="text-xs text-gray-500">
                    No locations assigned.
                  </p>
                  <p
                    v-if="row.hasCities && row.citySummary"
                    class="text-xs text-gray-400 mt-1"
                  >
                    Cities: {{ row.citySummary }}
                  </p>
                </TableCell>
                <TableCell class="text-right font-primary">
                  <RouterLink
                    :to="{
                      name: 'playlist-details',
                      params: { id: row.playlist.id },
                    }"
                    class="text-secondary hover:underline"
                  >
                    View Details
                  </RouterLink>
                </TableCell>
              </TableRow>
            </template>

            <template v-else-if="!loading && playlistRows.length < 1">
              <TableRow>
                <TableCell :colspan="10" class="text-center py-6 text-gray-500">
                  No playlist found matching your filters.
                </TableCell>
              </TableRow>
            </template>
          </TableBody>
        </Table>
      </div>

      <TableSkelton v-if="loading" :rows="pageSize" :columns="6" />
    </div>

    <Pagination
      v-if="playlistStore.playlist.length > 0"
      :current-page="currentPage"
      :last-page="playlistStore.pagination?.last_page || 1"
      :total="playlistStore.pagination?.total || 0"
      :per-page="pageSize"
      :from="playlistStore.pagination?.from"
      :to="playlistStore.pagination?.to"
      @page-change="setPage"
    />

    <!-- Drop-in replacement for your current <Dialog> block. No script changes required. -->
    <Dialog
      :open="showPlaylistConfirmation"
      @update:open="
        (val) => {
          if (!val) handleClosePlaylistConfirmation();
          else showPlaylistConfirmation = val;
        }
      "
    >
      <DialogContent class="sm:max-w-[640px] md:max-w-[880px]">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            Confirm Playlist Submission
            <span
              v-if="confirmationScreens?.length"
              class="ml-2 rounded-full border px-2.5 py-0.5 text-xs font-medium text-gray-600"
            >
              {{ confirmationSelectedCount }}/{{ confirmationScreens.length }}
              selected
            </span>
          </DialogTitle>
          <DialogDescription class="text-sm text-muted-foreground">
            {{ confirmationDescription }}
          </DialogDescription>
        </DialogHeader>

        <!-- Legend / summary -->
        <div class="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <span
            class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-green-700 ring-1 ring-inset ring-green-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-3.5 w-3.5"
            >
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
            </svg>
            New
          </span>
          <span
            class="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-red-700 ring-1 ring-inset ring-red-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="h-3.5 w-3.5"
            >
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            Replace
          </span>
        </div>

        <!-- Scroll area with animated list -->
        <TransitionGroup
          name="fade-slide"
          tag="div"
          class=" grid grid-cols-3 max-h-[360px] overflow-y-auto pr-1 gap-3"
        >
          <div
            v-for="screen in confirmationScreens"
            :key="screen.key"
            :class="[
              'rounded-sm border px-4 py-3 transition-colors',
              screen.hasConflict
                ? 'bg-red-50/70 border-red-200/70 text-red-900'
                : 'bg-green-50/70 border-green-200/70 text-green-900',
              screen.isSelectable ? 'cursor-pointer' : 'cursor-default',
              isConfirmationScreenSelected(screen.screenId)
                ? ''
                : 'opacity-60 border-dashed',
            ]"
            @click="
              screen.isSelectable &&
                toggleConfirmationScreenSelection(screen.screenId)
            "
          >
            <div class="flex items-start gap-3">
              <Checkbox
                v-if="screen.isSelectable"
                :model-value="isConfirmationScreenSelected(screen.screenId)"
                @update:modelValue="
                  (checked) =>
                    handleConfirmationCheckboxChange(screen.screenId, checked)
                "
                @click.stop
                class="mt-1 shrink-0 data-[state=checked]:bg-secondary"
              />
              <span
                v-else
                class="mt-1 inline-block h-5 w-5 shrink-0"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 w-full">
                  <span
                    class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 ring-1 ring-inset ring-black/5"
                  >
                    <svg
                      v-if="!screen.hasConflict"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="h-3.5 w-3.5"
                    >
                      <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="h-3.5 w-3.5"
                    >
                      <path
                        d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                      />
                    </svg>
                  </span>

                  <div class="flex justify-between w-full">
                    <p
                      class="truncate font-medium inline-block text-gray-900 font-primary capitalize"
                    >
                      {{ screen.screenLabel }}
                    </p>
                    <span
                      class="shrink-0 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-700 ring-1 ring-inset ring-black/5"
                    >
                      {{ screen.hasConflict ? "Replace" : "New" }}
                    </span>
                  </div>
                </div>

                <!-- Replace details (chips + overflow) -->
                <div
                  v-if="screen.playlistNames.length"
                  class="mt-2 flex items-center gap-1.5 w-fit"
                >
                  <span
                    class="text-xs font-medium text-red-800/90 whitespace-nowrap"
                    >Will replace:</span
                  >
                  <template
                    v-for="(name, idx) in screen.playlistNames.slice(0, 3)"
                    :key="idx"
                  >
                    <span
                      class="truncate rounded-md bg-white/70 px-2 py-0.5 text-xs text-red-800 ring-1 ring-inset ring-red-200/70 w-full"
                    >
                      {{ name }}
                    </span>
                  </template>
                  <span
                    v-if="screen.playlistNames.length > 3"
                    class="cursor-default rounded-md bg-white/70 px-2 py-0.5 text-[11px] text-red-700 ring-1 ring-inset ring-red-200/70"
                    :title="screen.playlistNames.join(', ')"
                  >
                    +{{ screen.playlistNames.length - 3 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="!confirmationScreens.length"
            key="empty"
            class="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              class="mb-2 h-6 w-6 text-gray-400"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p class="text-sm text-gray-500">
              No playlist is currently running on the selected screens.
            </p>
          </div>
        </TransitionGroup>

        <p
          v-if="confirmationScreens.length && !confirmationSelectedCount"
          class="mt-2 text-xs text-red-600"
        >
          Select at least one screen to continue.
        </p>

        <!-- Danger note if replacements will happen -->
        <p
          v-if="selectedConfirmationScreens.some((s) => s.playlistNames.length)"
          class="mt-2 flex items-start gap-2 text-xs text-red-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            class="mt-0.5 h-4 w-4"
          >
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          Submitting will replace the currently running playlist(s) on the
          screens marked "Replace".
        </p>

        <DialogFooter >
          <Button
            type="button"
            variant="outline"
            @click="handleClosePlaylistConfirmation"
            :disabled="isSavingPlaylist"
          >
            Back
          </Button>

          <Button
            type="button"
            class="btn"
            :variant="
              selectedConfirmationScreens.some((s) => s.playlistNames.length)
                ? 'destructive'
                : 'default'
            "
            @click="handleSubmitPlaylistConfirmation"
            :disabled="isSavingPlaylist"
            :aria-busy="isSavingPlaylist"
          >
            <Loader v-if="isSavingPlaylist" class="mr-2 h-4 w-4 animate-spin" />
            {{
              isSavingPlaylist
                ? isEditing
                  ? "Updating…"
                  : "Submitting…"
                : selectedConfirmationScreens.some(
                    (s) => s.playlistNames.length
                  )
                ? `Replace & Submit (${confirmationSelectedCount})`
                : `Submit (${confirmationSelectedCount})`
            }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog
      :open="showRejectModal"
      @update:open="
        (val) => {
          if (!val) {
            handleCancelReject();
          } else {
            showRejectModal = val;
          }
        }
      "
    >
      <DialogContent class="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Reject this Ad?</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting
            <strong>{{ rejectingAd?.name }}</strong
            >.
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Reason</label>
          <textarea
            v-model="rejectNote"
            rows="4"
            class="w-full border rounded-md p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write why you're rejecting this ad..."
          ></textarea>
          <p v-if="rejectError" class="text-red-600 text-sm">
            {{ rejectError }}
          </p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-4">
          <button
            type="button"
            class="px-4 py-2 text-sm rounded-md border hover:bg-gray-50"
            @click="handleCancelReject"
            :disabled="isSavingReject"
          >
            Cancel
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm rounded-md bg-red-600 text-white disabled:opacity-60"
            @click="handleSubmitReject"
            :disabled="isSavingReject || !rejectNote.trim()"
          >
            {{ isSavingReject ? "Submitting..." : "Submit & Reject" }}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </template>
  <ComponentPermissionError v-else />
  </div>
</template>

<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectValue,
} from "@/components/ui/select";
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSearchQuary } from "@/composeable/userSearchQuary";

import { useHorizontalDragScroll } from "@/composeable/useHorizontalDragScroll";

import { Checkbox } from "@/components/ui/checkbox";
import { useRoleStore } from "@/store/common/role-permission-store";
import { PNComponentPermissions } from "@/constant/permission";

import Pagination from "@/shared/components/Pagination.vue";
import TableSkelton from "@/shared/components/TableSkelton.vue";
import ComponentPermissionError from "@/shared/components/ComponentPermissionError.vue";
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
// import SearchAndFilterBar from "../clients/SearchAndFilterBar.vue";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import MultiSelect from "@/components/ui/multiselect/MultiSelect.vue";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/composeable/useToast";
import { AdConstant } from "@/constant/ads";
import { adService } from "@/services/ad-service";
import { locationService } from "@/services/location-service";
import { playlistService } from "@/services/playlist-service";
import { screenService } from "@/services/screen-service";

import VideoPreview from "@/shared/components/VideoPreview.vue";
import { useAdsStore } from "@/store/ad-store";
import { usePlaylistStore } from "@/store/playlist-store";
import { useScreenStore } from "@/store/screen-store";
import type { AdResponse } from "@/types/ad-types";
import type { City, CityLocation } from "@/types/location-types";
import type {
  PlaylistPayload,
  PlaylistScreenSummary,
} from "@/types/playlist-type";
import type { ScreenPlaylistConfirmation } from "@/types/screen-type";
import { PenBox } from "lucide-vue-next";
import SearchAndFilterBar from "@/shared/components/SearchAndFilterBar.vue";
const { showToast } = useToast();
const filterOptions = [
  { label: "Status", value: "status", disable: false },
  { label: "Live Ads", value: "live_ads", disable: true },
];

const videoUrl = ref<string | null>(null);
const isPreviewOpen = ref(false);

const isPlaylistSheetOpen = ref(false);
const playlistName = ref("");
const selectedAdIds = ref<number[]>([]);
const selectedCityIds = ref<number[]>([]);
const selectedLocationIds = ref<number[]>([]);
const selectedScreenIds = ref<number[]>([]);
const isScreensLoading = ref(false);
const cityOptions = ref<{ label: string; value: number }[]>([]);
const locationOptions = ref<{ label: string; value: number }[]>([]);
const playlistErrors = reactive<{
  name: string;
  ads: string;
  cities: string;
  locations: string;
  screens: string;
}>({
  name: "",
  ads: "",
  cities: "",
  locations: "",
  screens: "",
});
const editingPlaylistId = ref<number | null>(null);
const isEditing = computed(() => editingPlaylistId.value !== null);
const sheetTitle = computed(() =>
  isEditing.value ? "Update Playlist" : "Create New Playlist"
);

const playlistStore = usePlaylistStore();
const screenStore = useScreenStore();
const editingPlaylistScreens = ref<PlaylistScreenSummary[]>([]);
const isSavingPlaylist = ref(false);
const isCheckingScreens = ref(false);
const showPlaylistConfirmation = ref(false);
const confirmationServerMessage = ref("");
const screenConfirmationResults = ref<ScreenPlaylistConfirmation[]>([]);
const pendingPlaylistPayload = ref<PlaylistPayload | null>(null);
const confirmationSelectedScreenIds = ref<number[]>([]);

function normalizeScreenId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed.length) {
      return null;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

const pendingScreenIds = computed<number[]>(() => {
  const payload = pendingPlaylistPayload.value;
  if (!payload) {
    return [];
  }

  const source =
    Array.isArray(payload.screen_ids) && payload.screen_ids.length
      ? payload.screen_ids
      : Array.isArray(payload.screenIds)
      ? payload.screenIds
      : [];

  return source
    .map((id) => normalizeScreenId(id))
    .filter((id): id is number => id !== null);
});

const confirmationScreens = computed(() =>
  screenConfirmationResults.value.map((item, index) => {
    const rawPlaylist = Array.isArray(item?.playlist)
      ? item?.playlist ?? []
      : item?.playlist
      ? [item.playlist]
      : [];
    const playlistNames = rawPlaylist
      .map((entry) =>
        entry && typeof entry.name === "string" ? entry.name.trim() : ""
      )
      .filter((name) => name.length > 0);
    const labelCandidates = [
      typeof item?.screen_name === "string" ? item.screen_name : null,
      typeof item?.name === "string" ? item.name : null,
    ].filter((val): val is string => !!val && val.trim().length > 0);
    const fallbackId = pendingScreenIds.value[index];
    const screenId =
      normalizeScreenId(item?.screen_id) ??
      (typeof fallbackId === "number" ? fallbackId : null);
    const screenLabel =
      labelCandidates[0] ??
      (screenId !== null
        ? `Screen #${screenId}`
        : item?.screen_id
        ? `Screen #${item.screen_id}`
        : `Screen ${index + 1}`);
    const hasConflict = playlistNames.length > 0;

    return {
      key: screenId !== null ? `screen-${screenId}` : `index-${index}`,
      screenId,
      screenLabel,
      playlistNames,
      hasConflict,
      isSelectable: screenId !== null,
    };
  })
);

const confirmationSelectedSet = computed(
  () => new Set(confirmationSelectedScreenIds.value)
);

const selectedConfirmationScreens = computed(() => {
  if (!confirmationScreens.value.length) {
    return [];
  }

  const selectedSet = confirmationSelectedSet.value;
  return confirmationScreens.value.filter((screen) => {
    if (!screen.isSelectable) {
      return true;
    }
    return screen.screenId !== null && selectedSet.has(screen.screenId);
  });
});

const confirmationSelectedCount = computed(
  () => selectedConfirmationScreens.value.length
);

const hasExistingPlaylists = computed(() =>
  selectedConfirmationScreens.value.some((item) => item.hasConflict)
);

const confirmationDescription = computed(() =>
  hasExistingPlaylists.value
    ? "Submitting will replace the existing playlists on the screens listed below."
    : "No playlists are currently running on the selected screens. Submit to proceed."
);

const selectedScreenIdsForSubmission = computed(() =>
  selectedConfirmationScreens.value
    .map((screen) => screen.screenId)
    .filter(
      (id): id is number => typeof id === "number" && Number.isFinite(id)
    )
);

watch(
  () => confirmationScreens.value,
  (screens) => {
    if (!Array.isArray(screens) || !screens.length) {
      if (confirmationSelectedScreenIds.value.length) {
        confirmationSelectedScreenIds.value = [];
      }
      return;
    }

    const next: number[] = [];
    screens.forEach((screen) => {
      if (screen.screenId !== null && !next.includes(screen.screenId)) {
        next.push(screen.screenId);
      }
    });

    if (
      confirmationSelectedScreenIds.value.length === next.length &&
      confirmationSelectedScreenIds.value.every((id, idx) => id === next[idx])
    ) {
      return;
    }

    confirmationSelectedScreenIds.value = next;
  },
  { immediate: true }
);

function isConfirmationScreenSelected(screenId: number | null): boolean {
  if (screenId === null) {
    return true;
  }
  return confirmationSelectedSet.value.has(screenId);
}

function updateConfirmationSelection(
  screenId: number | null,
  checked: boolean
) {
  if (screenId === null) {
    return;
  }

  const nextSet = new Set(confirmationSelectedScreenIds.value);
  if (checked) {
    nextSet.add(screenId);
  } else {
    nextSet.delete(screenId);
  }

  const ordered: number[] = [];
  confirmationScreens.value.forEach((screen) => {
    if (screen.screenId !== null && nextSet.has(screen.screenId)) {
      ordered.push(screen.screenId);
    }
  });

  if (
    confirmationSelectedScreenIds.value.length !== ordered.length ||
    confirmationSelectedScreenIds.value.some((id, index) => id !== ordered[index])
  ) {
    confirmationSelectedScreenIds.value = ordered;
  }

  if (checked) {
    if (!selectedScreenIds.value.includes(screenId)) {
      selectedScreenIds.value = [...selectedScreenIds.value, screenId];
    }
  } else {
    selectedScreenIds.value = selectedScreenIds.value.filter(
      (id) => id !== screenId
    );
  }
}

function handleConfirmationCheckboxChange(
  screenId: number | null,
  value: unknown
) {
  if (typeof value !== "boolean") {
    return;
  }
  updateConfirmationSelection(screenId, value);
}

function toggleConfirmationScreenSelection(screenId: number | null) {
  if (screenId === null) {
    return;
  }
  const isSelected = confirmationSelectedSet.value.has(screenId);
  updateConfirmationSelection(screenId, !isSelected);
}
let latestCityRequest = 0;
let latestLocationRequest = 0;
const isHydratingPlaylistForm = ref(false);

const selectedFilters = ref<string[]>([]);
const adStore = useAdsStore();
const roleStore = useRoleStore();
const playlistPermissions = PNComponentPermissions.PlaylistTable;
const canViewPlaylists = computed(() =>
  roleStore.hasPermission(playlistPermissions.view)
);
const canCreatePlaylist = computed(() =>
  roleStore.hasPermission(playlistPermissions.create)
);
const canUpdatePlaylist = computed(() =>
  roleStore.hasPermission(playlistPermissions.update)
);
// const canDeletePlaylist = computed(() =>
//   roleStore.hasPermission(playlistPermissions.delete)
// );
const selectedUsers = ref<number[]>([]);
const loading = ref(false);
const availableScreens = computed(() => {
  const storeScreens = Array.isArray(screenStore.screens)
    ? screenStore.screens
    : [];
  if (!editingPlaylistScreens.value.length) {
    return storeScreens;
  }
  const existingIds = new Set(
    storeScreens
      .map((screen: any) => Number((screen as any)?.id))
      .filter((id) => Number.isFinite(id))
  );
  const fallbackScreens = editingPlaylistScreens.value.filter((screen) => {
    const id = Number(screen.id);
    if (!Number.isFinite(id)) {
      return false;
    }
    if (existingIds.has(id)) {
      return false;
    }
    existingIds.add(id);
    return true;
  });
  return [
    ...storeScreens,
    ...fallbackScreens.map((screen) => ({
      id: screen.id,
      name: screen.name,
      store_name: screen.store_name ?? "",
      location: screen.location
        ? {
            id: screen.location.id,
            name: screen.location.name,
          }
        : null,
    })),
  ];
});

const selectableScreenIds = computed(() =>
  availableScreens.value
    .map((screen: any) => Number((screen as any)?.id))
    .filter((id) => Number.isFinite(id))
);

const allScreensSelected = computed(() => {
  const ids = selectableScreenIds.value;
  if (!ids.length) return false;
  return ids.every((id) => selectedScreenIds.value.includes(id));
});

const availableAdIds = computed(() =>
  (Array.isArray(adStore.ads) ? adStore.ads : [])
    .map((ad: any) => Number((ad as any)?.id))
    .filter((id) => Number.isFinite(id))
);

const allAdsSelected = computed(() => {
  const ids = availableAdIds.value;
  if (!ids.length) return false;
  return ids.every((id) => selectedAdIds.value.includes(id));
});

const {
  containerRef: dragWrapper,
  isDragging: isDraggingTable,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
} = useHorizontalDragScroll();

const {
  searchQuery,
  debouncedSearch,
  currentPage,
  pageSize,
  sortBy,
  buildApiParams,
  filters,
  setPage,
  setSort,
  status,
} = useSearchQuary(
  {
    page: 1,
    perPage: 10,
    search: "",
    sortBy: "name:asc",
    status: null,
  },
  ["status", "live_ads", "active_devices", "video_plays", "impressions"]
);

let statusAlreadyPushed = false;
watch(
  () => filters.value.status,
  (newStatus) => {
    if (
      newStatus !== undefined &&
      newStatus !== null &&
      !statusAlreadyPushed &&
      !selectedFilters.value.includes("status")
    ) {
      selectedFilters.value.push("status");
      statusAlreadyPushed = true;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  try {
    await adStore.fetchAllAdsIndex();
    await playlistStore.fetchAllPlaylistIndex();
    await screenStore.fetchScreensByLocation();
  } catch (error) {
    console.error(error);
  }
  loadCities();
});

watch(
  filters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);
watch(searchQuery, () => {
  currentPage.value = 1;
});

async function fetchLocationOptionsForCities(
  cityIds: Array<number | string>,
  {
    guardLatest = true,
    silent = false,
  }: { guardLatest?: boolean; silent?: boolean } = {}
) {
  const normalizedIds = cityIds
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id));

  if (!normalizedIds.length) {
    latestCityRequest += 1;
    locationOptions.value = [];
    if (selectedLocationIds.value.length) {
      selectedLocationIds.value = [];
    }
    playlistErrors.locations = "";
    playlistErrors.cities = "";
    return;
  }

  let requestId: number | null = null;
  if (guardLatest) {
    requestId = ++latestCityRequest;
  } else {
    latestCityRequest += 1;
  }

  try {
    const { data } = await locationService.getSubAreaByCity(normalizedIds);
    if (guardLatest && requestId !== latestCityRequest) return;

    const options = (data ?? []).flatMap((city: CityLocation) =>
      (city.locations ?? []).map((location) => ({
        value: Number(location.id),
        label: `${location.name}${city?.name ? ` (${city.name})` : ""}`,
      }))
    );

    locationOptions.value = options;

    const validLocationIds = selectedLocationIds.value.filter((id) =>
      options.some((opt) => opt.value === id)
    );
    if (validLocationIds.length !== selectedLocationIds.value.length) {
      selectedLocationIds.value = validLocationIds;
    }

    playlistErrors.locations = "";
    playlistErrors.cities = "";
  } catch (error) {
    if (guardLatest && requestId !== latestCityRequest) return;
    console.error("Failed to load locations for cities", error);
    locationOptions.value = [];
    selectedLocationIds.value = [];
    if (!silent) {
      showToast(
        "Error",
        "Failed to load locations for the selected cities.",
        "error"
      );
    }
  }
}

watch(
  selectedCityIds,
  (cityIds) => {
    if (isHydratingPlaylistForm.value) return;
    fetchLocationOptionsForCities(cityIds);
  },
  { deep: false }
);

watch(
  selectedLocationIds,
  async (locationIds) => {
    if (isHydratingPlaylistForm.value) return;
    const normalizedIds = locationIds
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id));

    if (normalizedIds.length === 0) {
      latestLocationRequest += 1;
      isScreensLoading.value = false;
      selectedScreenIds.value = [];
      playlistErrors.screens = "";
      screenStore.screens = [];
      if (!isHydratingPlaylistForm.value) {
        editingPlaylistScreens.value = [];
      }
      return;
    }

    const requestId = ++latestLocationRequest;
    isScreensLoading.value = true;

    try {
      const screens = await screenStore.fetchScreensByLocation(normalizedIds);
      if (requestId !== latestLocationRequest) {
        return;
      }

      const availableIds = Array.isArray(screens)
        ? screens
            .map((screen: any) => Number(screen?.id))
            .filter((id: number) => Number.isFinite(id))
        : [];

      const validSelections = selectedScreenIds.value.filter((screenId) =>
        availableIds.includes(Number(screenId))
      );
      if (validSelections.length !== selectedScreenIds.value.length) {
        selectedScreenIds.value = validSelections;
      }
      playlistErrors.screens = "";
    } catch (error: any) {
      if (requestId !== latestLocationRequest) {
        return;
      }
      console.error("Failed to load screens for locations", error);
      screenStore.screens = [];
      selectedScreenIds.value = [];
      showToast(
        "Error",
        error?.message || "Failed to load screens for the selected locations.",
        "error"
      );
    } finally {
      if (requestId === latestLocationRequest) {
        isScreensLoading.value = false;
      }
    }
  },
  { deep: false }
);

async function loadCities() {
  try {
    const { data } = await locationService.getAllCity();
    cityOptions.value = (data ?? []).map((city: City) => ({
      value: Number(city.id),
      label: city.name,
    }));
  } catch (error: any) {
    console.error("Failed to load cities", error);
    showToast("Error", error?.message || "Failed to load cities.", "error");
  }
}
watch(
  () => filters.value.status,
  (newVal) => {
    status.value = newVal == null || newVal === "" ? null : Number(newVal);
  }
);

const fetchPlaylists = async () => {
  loading.value = true;
  try {
    await playlistStore.fetchAllPlaylistIndex(buildApiParams());
    selectedPlaylistIds.value = [];
  } finally {
    loading.value = false;
  }
};

watch([debouncedSearch, currentPage, pageSize, sortBy, status], fetchPlaylists);
watch(canViewPlaylists, (hasAccess) => {
  if (hasAccess && playlistStore.playlist.length === 0) {fetchPlaylists() }});

onMounted(() => {
  fetchPlaylists();
  roleStore.fetchAllRoleIndex();
  if (!roleStore.permissionsLoaded) {
    roleStore.fetchSignlePermissions();
  }
});

const selectedPlaylistIds = ref<number[]>([]);
const allSelected = computed(() => {
  return (
    playlistStore.playlist.length > 0 &&
    selectedPlaylistIds.value.length === playlistStore.playlist.length
  );
});
const isIndeterminate = computed(() => {
  return (
    selectedPlaylistIds.value.length > 0 &&
    selectedPlaylistIds.value.length < playlistStore.playlist.length
  );
});

const toggleRow = (id: number, checked: boolean) => {
  if (checked && !selectedPlaylistIds.value.includes(id)) {
    selectedPlaylistIds.value = [...selectedPlaylistIds.value, id];
  } else if (!checked) {
    selectedPlaylistIds.value = selectedPlaylistIds.value.filter(
      (item) => item !== id
    );
  }
};

const setSelectedPlaylists = (ids: number[]) => {
  selectedPlaylistIds.value = [...ids];
};

const toggleSelectAll = (checked: boolean) => {
  if (checked) {
    setSelectedPlaylists(playlistStore.playlist.map((c) => c.id));
  } else {
    setSelectedPlaylists([]);
  }
};

const handleSort = (field: string) => {
  const [currField, currDir] = sortBy.value.split(":");
  const nextDir = currField === field && currDir === "asc" ? "desc" : "asc";
  setSort(`${field}:${nextDir}`);
};

function handleCitySelection(values: Array<string | number>) {
  selectedCityIds.value = values
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id));
  playlistErrors.cities = "";
}

function handleLocationSelection(values: Array<string | number>) {
  selectedLocationIds.value = values
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id));
  playlistErrors.locations = "";
}

function toggleAdSelection(adId: number) {
  if (selectedAdIds.value.includes(adId)) {
    selectedAdIds.value = selectedAdIds.value.filter((id) => id !== adId);
  } else {
    selectedAdIds.value = [...selectedAdIds.value, adId];
  }
  playlistErrors.ads = "";
}

function handleAdCheckboxChange(adId: number, checked: boolean) {
  if (checked) {
    if (!selectedAdIds.value.includes(adId)) {
      selectedAdIds.value = [...selectedAdIds.value, adId];
    }
  } else {
    selectedAdIds.value = selectedAdIds.value.filter((id) => id !== adId);
  }
  playlistErrors.ads = "";
}

function toggleScreenSelection(screenId: number) {
  if (selectedScreenIds.value.includes(screenId)) {
    selectedScreenIds.value = selectedScreenIds.value.filter(
      (id) => id !== screenId
    );
  } else {
    selectedScreenIds.value = [...selectedScreenIds.value, screenId];
  }
  playlistErrors.screens = "";
}

function handleScreenCheckboxChange(screenId: number, checked: boolean) {
  if (checked) {
    if (!selectedScreenIds.value.includes(screenId)) {
      selectedScreenIds.value = [...selectedScreenIds.value, screenId];
    }
  } else {
    selectedScreenIds.value = selectedScreenIds.value.filter(
      (id) => id !== screenId
    );
  }
  playlistErrors.screens = "";
}

function toggleSelectAllScreens() {
  const ids = selectableScreenIds.value;
  if (!ids.length) return;
  selectedScreenIds.value = allScreensSelected.value ? [] : [...ids];
  playlistErrors.screens = "";
}

function toggleSelectAllAds() {
  const ids = availableAdIds.value;
  if (!ids.length) return;
  selectedAdIds.value = allAdsSelected.value ? [] : [...ids];
  playlistErrors.ads = "";
}

async function startEditingPlaylist(playlist: any) {
  if (!playlist || !canUpdatePlaylist.value) return;

  isHydratingPlaylistForm.value = true;

  try {
    editingPlaylistId.value = Number(playlist?.id) || null;
    playlistName.value = playlist?.name ?? "";
    playlistErrors.name = "";
    playlistErrors.ads = "";
    playlistErrors.cities = "";
    playlistErrors.locations = "";
    playlistErrors.screens = "";

    const playlistAds = Array.isArray(playlist?.ads) ? playlist.ads : [];
    const adIds = playlistAds
      .map((ad: any) => Number(ad?.id))
      .filter((id) => Number.isFinite(id));
    selectedAdIds.value = adIds;

    const playlistLocations = Array.isArray(playlist?.locations)
      ? playlist.locations
      : [];
    const locationIds = playlistLocations
      .map((loc: any) => Number(loc?.id))
      .filter((id) => Number.isFinite(id));

    if (playlistLocations.length) {
      const mergedOptions = new Map(
        locationOptions.value.map((opt) => [opt.value, opt])
      );
      playlistLocations.forEach((loc: any) => {
        const value = Number(loc?.id);
        if (!Number.isFinite(value)) return;
        mergedOptions.set(value, {
          value,
          label: loc?.name ?? `Location #${value}`,
        });
      });
      locationOptions.value = Array.from(mergedOptions.values());
    }

    selectedLocationIds.value = locationIds;

    const playlistCities = Array.isArray(playlist?.cities)
      ? playlist.cities
      : [];
    if (playlistCities.length) {
      const mergedCityOptions = new Map(
        cityOptions.value.map((opt) => [opt.value, opt])
      );
      playlistCities.forEach((city: any) => {
        const value = Number(city?.id);
        if (!Number.isFinite(value)) return;
        mergedCityOptions.set(value, {
          value,
          label: city?.name ?? `City #${value}`,
        });
      });
      cityOptions.value = Array.from(mergedCityOptions.values());
    }

    selectedCityIds.value = playlistCities
      .map((city: any) => Number(city?.id))
      .filter((id) => Number.isFinite(id));

    const playlistScreensRaw = Array.isArray((playlist as any)?.screens)
      ? (playlist as any).screens
      : [];
    const normalizedScreens = playlistScreensRaw
      .map((screen: any) => {
        const id = Number(screen?.id);
        if (!Number.isFinite(id)) return null;
        return {
          id,
          name:
            typeof screen?.name === "string" ? screen.name : `Screen #${id}`,
          store_name:
            typeof screen?.store_name === "string" ? screen.store_name : "",
          location:
            screen?.location && Number.isFinite(Number(screen.location?.id))
              ? {
                  id: Number(screen.location.id),
                  name:
                    typeof screen.location?.name === "string"
                      ? screen.location.name
                      : `Location #${screen.location.id}`,
                }
              : null,
        };
      })
      .filter((value): value is PlaylistScreenSummary => Boolean(value));

    const explicitScreenIds = [
      (playlist as any)?.screen_ids,
      (playlist as any)?.screenIds,
      (playlist as any)?.screen_id,
      (playlist as any)?.screenId,
    ]
      .flatMap((value) => {
        if (!value && value !== 0) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === "string") {
          return value
            .split(",")
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0);
        }
        if (typeof value === "number") return [value];
        return [];
      })
      .map((value) => Number(value))
      .filter((id) => Number.isFinite(id));

    const sanitizedScreenIds = Array.from(new Set(explicitScreenIds));
    const normalizedScreenMap = new Map(
      normalizedScreens.map((screen) => [screen.id, screen])
    );
    const fallbackScreens =
      sanitizedScreenIds.length > 0
        ? sanitizedScreenIds.map((id) => {
            const existing = normalizedScreenMap.get(id);
            if (existing) {
              return existing;
            }
            return {
              id,
              name: `Screen #${id}`,
              store_name: "",
              location: null,
            } as PlaylistScreenSummary;
          })
        : normalizedScreens;

    editingPlaylistScreens.value = fallbackScreens;
    selectedScreenIds.value =
      sanitizedScreenIds.length > 0
        ? sanitizedScreenIds
        : fallbackScreens.map((screen) => screen.id);

    isPlaylistSheetOpen.value = true;

    if (selectedCityIds.value.length) {
      await fetchLocationOptionsForCities([...selectedCityIds.value], {
        guardLatest: false,
      });
    } else {
      locationOptions.value = [];
      selectedLocationIds.value = [];
    }

    const locationIdsSnapshot = [...selectedLocationIds.value];
    if (locationIdsSnapshot.length) {
      isScreensLoading.value = true;
      try {
        await screenStore.fetchScreensByLocation(locationIdsSnapshot);
        playlistErrors.screens = "";
      } catch (error) {
        console.error("Failed to preload screens for playlist", error);
        showToast(
          "Error",
          (error as any)?.message ||
            "Unable to load screens for the playlist locations.",
          "error"
        );
      } finally {
        isScreensLoading.value = false;
      }
    } else {
      screenStore.screens = [];
    }
  } finally {
    nextTick(() => {
      isHydratingPlaylistForm.value = false;
    });
  }
}

async function handlePlaylistRowClick(_event: MouseEvent, playlist: any) {
  await startEditingPlaylist(playlist);
}

function resetPlaylistForm() {
  playlistName.value = "";
  selectedAdIds.value = [];
  selectedCityIds.value = [];
  selectedLocationIds.value = [];
  selectedScreenIds.value = [];
  locationOptions.value = [];
  playlistErrors.name = "";
  playlistErrors.ads = "";
  playlistErrors.cities = "";
  playlistErrors.locations = "";
  playlistErrors.screens = "";
  isSavingPlaylist.value = false;
  isCheckingScreens.value = false;
  showPlaylistConfirmation.value = false;
  confirmationServerMessage.value = "";
  screenConfirmationResults.value = [];
  confirmationSelectedScreenIds.value = [];
  pendingPlaylistPayload.value = null;
  editingPlaylistId.value = null;
  editingPlaylistScreens.value = [];
  isHydratingPlaylistForm.value = false;
}

function handleCancelPlaylistForm() {
  resetPlaylistForm();
  isPlaylistSheetOpen.value = false;
}

watch(isPlaylistSheetOpen, (open) => {
  showPlaylistConfirmation.value = false;
  if (open) {
    if (!isEditing.value) {
      screenStore.screens = [];
    } else if (!selectedLocationIds.value.length) {
      screenStore.screens = [];
    }
  } else {
    resetPlaylistForm();
  }
});

function buildPlaylistPayload(): PlaylistPayload | null {
  playlistErrors.name = playlistName.value.trim()
    ? ""
    : "Playlist name is required.";
  playlistErrors.ads =
    selectedAdIds.value.length > 0 ? "" : "Select at least one video ad.";
  playlistErrors.cities =
    selectedCityIds.value.length > 0 ? "" : "Select at least one city.";
  playlistErrors.locations =
    selectedLocationIds.value.length > 0 ? "" : "Select at least one location.";
  playlistErrors.screens =
    selectedScreenIds.value.length > 0 ? "" : "Select at least one screen.";

  if (
    playlistErrors.name ||
    playlistErrors.ads ||
    playlistErrors.cities ||
    playlistErrors.locations ||
    playlistErrors.screens
  ) {
    return null;
  }

  return {
    name: playlistName.value.trim(),
    ad_ids: [...selectedAdIds.value],
    location_ids: [...selectedLocationIds.value],
    screenIds: [...selectedScreenIds.value],
    screen_ids: [...selectedScreenIds.value],
  };
}

async function handleSavePlaylist() {
  if (isEditing.value) {
    if (!canUpdatePlaylist.value) return;
  } else if (!canCreatePlaylist.value) {
    return;
  }
  const basePayload = buildPlaylistPayload();
  if (!basePayload) {
    return;
  }

  const screenIdsSource =
    (basePayload.screen_ids && basePayload.screen_ids.length
      ? basePayload.screen_ids
      : basePayload.screenIds) ?? [];

  const normalizedScreenIds = Array.from(
    new Set(
      screenIdsSource
        .map((id) => Number(id))
        .filter((id) => Number.isFinite(id))
    )
  );

  if (!normalizedScreenIds.length) {
    showToast(
      "Error",
      "Select at least one screen before continuing.",
      "error"
    );
    return;
  }

  const payload: PlaylistPayload = {
    ...basePayload,
    screenIds: normalizedScreenIds,
    screen_ids: normalizedScreenIds,
  };

  pendingPlaylistPayload.value = payload;
  isCheckingScreens.value = true;
  showPlaylistConfirmation.value = false;
  confirmationServerMessage.value = "";
  screenConfirmationResults.value = [];
  confirmationSelectedScreenIds.value = [];

  try {
    const res = await screenService.confirmScreens({
      screen_id: normalizedScreenIds,
    });

    if (!res?.success) {
      throw new Error(
        res?.message || "Failed to check playlists for the selected screens."
      );
    }

    screenConfirmationResults.value = Array.isArray(res.data) ? res.data : [];
    confirmationServerMessage.value = res.message ?? "";
    showPlaylistConfirmation.value = true;
  } catch (error: any) {
    console.error(error);
    const description =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to check playlists for the selected screens.";
    showToast("Error", description, "error");
  } finally {
    isCheckingScreens.value = false;
  }
}

function handleClosePlaylistConfirmation() {
  showPlaylistConfirmation.value = false;
  confirmationServerMessage.value = "";
  screenConfirmationResults.value = [];
  confirmationSelectedScreenIds.value = [];
}

async function handleSubmitPlaylistConfirmation() {
  if (!pendingPlaylistPayload.value) {
    showToast("Error", "Playlist data is missing. Please try again.", "error");
    showPlaylistConfirmation.value = false;
    return;
  }

  const selectedIds = selectedScreenIdsForSubmission.value;
  if (!selectedIds.length) {
    showToast(
      "Error",
      "Select at least one screen before continuing.",
      "error"
    );
    return;
  }

  try {
    isSavingPlaylist.value = true;
    const payload: PlaylistPayload = {
      ...pendingPlaylistPayload.value,
      screenIds: [...selectedIds],
      screen_ids: [...selectedIds],
    };
    const isUpdate = isEditing.value && editingPlaylistId.value !== null;
    if (isUpdate && editingPlaylistId.value !== null) {
      await playlistService.update(editingPlaylistId.value, payload);
    } else {
      await playlistService.create(payload);
    }

    selectedScreenIds.value = [...selectedIds];

    await fetchPlaylists();
    showToast(
      "Success",
      isUpdate
        ? "Playlist updated successfully."
        : "Playlist is ready to be submitted to the server.",
      "success"
    );
    showPlaylistConfirmation.value = false;
    isPlaylistSheetOpen.value = false;
    pendingPlaylistPayload.value = null;
    screenConfirmationResults.value = [];
    confirmationSelectedScreenIds.value = [];
  } catch (error: any) {
    console.error(error);
    showToast(
      "Error",
      error?.message || "Failed to prepare playlist payload.",
      "error"
    );
  } finally {
    isSavingPlaylist.value = false;
  }
}

function getPlaylistAdCount(playlist: any): number {
  return Array.isArray(playlist?.ads) ? playlist.ads.length : 0;
}

function getPlaylistLocationNames(playlist: any): string[] {
  if (!Array.isArray(playlist?.locations)) return [];
  return playlist.locations
    .map((loc: any) => {
      if (typeof loc?.name === "string" && loc.name.trim().length > 0) {
        return loc.name.trim();
      }
      if (Number.isFinite(Number(loc?.id))) {
        return `Location #${Number(loc.id)}`;
      }
      return null;
    })
    .filter((name): name is string => Boolean(name));
}

function getPlaylistCityNames(playlist: any): string[] {
  if (!Array.isArray(playlist?.cities)) return [];
  return playlist.cities
    .map((city: any) => {
      if (typeof city?.name === "string" && city.name.trim().length > 0) {
        return city.name.trim();
      }
      if (Number.isFinite(Number(city?.id))) {
        return `City #${Number(city.id)}`;
      }
      return null;
    })
    .filter((name): name is string => Boolean(name));
}

function formatNameList(names: string[], limit = 3): string {
  if (!names.length) return "";
  if (names.length <= limit) return names.join(", ");
  const shown = names.slice(0, limit).join(", ");
  const remaining = names.length - limit;
  return `${shown} +${remaining} more`;
}

const playlistRows = computed(() => {
  return (playlistStore.playlist || []).map((playlist: any) => {
    const locationNames = getPlaylistLocationNames(playlist);
    const cityNames = getPlaylistCityNames(playlist);
    return {
      playlist,
      adCount: getPlaylistAdCount(playlist),
      locationCount: locationNames.length,
      locationSummary: formatNameList(locationNames),
      hasLocations: locationNames.length > 0,
      citySummary: formatNameList(cityNames),
      hasCities: cityNames.length > 0,
    };
  });
});

const savingStatus = reactive<Record<number, boolean>>({});
const statusDraft = reactive<Record<number, string | number>>({});

const showRejectModal = ref(false);
const rejectingAd = ref<AdResponse | null>(null);
const rejectNote = ref("");
const rejectError = ref("");
const isSavingReject = ref(false);

const prevStatusByAd: Record<number, string | number> = {};

async function handleSubmitReject() {
  if (!rejectingAd.value) return;
  const id = rejectingAd.value.id;

  rejectError.value = "";
  if (!rejectNote.value.trim()) {
    rejectError.value = "Reason is required.";
    return;
  }

  isSavingReject.value = true;
  savingStatus[id] = true;

  try {
    const payload = {
      status: AdConstant.STATUS_REJECTED,
      message: rejectNote.value,
    };

    const res = await adService.updateAdminAdStatus(id, payload);

    if (res.success) {
      showToast("Success", "Ad rejected successfully.", "success");
      showRejectModal.value = false;
      rejectingAd.value = null;
      rejectNote.value = "";
      await fetchPlaylists();
    } else {
      showToast("Error", res.message || "Failed to reject.", "error");
      statusDraft[id] =
        prevStatusByAd[id] ?? rejectingAd.value.status?.value ?? "";
    }
  } catch (e: any) {
    console.error(e);
    showToast("Error", e.message || "Something went wrong.", "error");
    statusDraft[id] =
      prevStatusByAd[id] ?? rejectingAd.value?.status?.value ?? "";
  } finally {
    isSavingReject.value = false;
    savingStatus[id] = false;
  }
}

function handleCancelReject() {
  if (rejectingAd.value) {
    const id = rejectingAd.value.id;
    statusDraft[id] = prevStatusByAd[id] ?? rejectingAd.value.status?.value;
  }
  showRejectModal.value = false;
  rejectingAd.value = null;
  rejectNote.value = "";
  rejectError.value = "";
}

onBeforeUnmount(() => {
  if (videoUrl.value) {
    URL.revokeObjectURL(videoUrl.value);
  }
});
function onCloseVideoPreview() {
  isPreviewOpen.value = false;
  videoUrl.value = null;
}
</script>

<style>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 180ms ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
