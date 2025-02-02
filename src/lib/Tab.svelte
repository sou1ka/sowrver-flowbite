<script>
    import Music from './Music.svelte';
</script>

<div id="default-tab-content" class="m-8">
    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="music" role="tabpanel" aria-labelledby="music-tab">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          <Music />
        </p>
    </div>
    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="album" role="tabpanel" aria-labelledby="album-tab">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Album
      </p>
    </div>
    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="folder" role="tabpanel" aria-labelledby="folder-tab">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Folder
      </p>
    </div>
    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="queue" role="tabpanel" aria-labelledby="queue-tab">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Queue
      </p>
    </div>
    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="playlist" role="tabpanel" aria-labelledby="playlist-tab">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Playlist
      </p>
    </div>
    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="library" role="tabpanel" aria-labelledby="library-tab">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Library
        </p>
    </div>
  </div>