<script>
    import * as lib from '../lib.js';
    lib.getMusic();
    let musics = [];

    window.addEventListener('musics', (event) => {
        musics = event.detail.musics;
        let id;
        id = setInterval(function() {
            if(document.querySelectorAll('#musics_list tr').length > 0) {
                clearInterval(id);
                window.dispatchEvent(new CustomEvent('musicsload', {
                    detail: { musics }
                }));
            }
        }, 5);
    });
</script>


<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table id="musics_list" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3" data-sort="path">
                    Filename
                </th>
                <th scope="col" class="px-6 py-3" data-sort="name">
                    Music Title
                </th>
                <th scope="col" class="px-6 py-3" data-sort="album">
                    Album
                </th>
                <th scope="col" class="px-6 py-3" data-sort="artist">
                    Artist
                </th>
                <th scope="col" class="px-6 py-3" data-sort="like">
                    Like
                </th>
            </tr>
        </thead>
        <tbody>
            {#each musics as item}
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td scope="row" class="path px-6 py-4 dark:text-white">
                        {item.path}
                    </td>
                    <td class="name px-6 py-4 dark:text-white">
                        {item.name}
                    </td>
                    <td class="album px-6 py-4 dark:text-white">
                        {item.tag_album}
                    </td>
                    <td class="artist px-6 py-4 dark:text-white">
                        {item.tag_artist}
                    </td>
                    <td class="like px-6 py-4 dark:text-white">
                        {item.like}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
