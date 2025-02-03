<script>
    let isOpen = false;
    let value = "";
    let musics = [];
    let pageSize = 20;
    let albums = [];
    let folders = [];
    let pageObj = {
        music: {
            size: null,
            page: 1
        },
        album: {
            size: null,
            page: 1
        },
        folder: {
            size: null,
            page: 1
        }
    };
    let libs = [];
    let queue = [];
    let playlists = [];
    let libstatus = '';
    let min = 0;
    let max = 0;
    let isVol = false;
    let nowtime = 0;
    let nowplaying = {
        title: '',
        album: '',
        artist: '',
        track: ''
    };
    let addlibpath = '';
    let addlibrec = true;
    let saveplaylistpath = '';

    function paginationCalc(target, size) {
        pageObj[target].size = size;
        pageObj[target].pagecount = Math.ceil(pageObj[target].size / pageSize);
        pageObj[target].paginate = [];
        let start = ((pageObj[target].page - 3) <= 0 ? 1 : (pageObj[target].page - 3));
        let max = ((start + 6) >= pageObj[target].pagecount ? pageObj[target].pagecount : start + 6);
        if(start > 0) {
            pageObj[target].paginate.push(1);
            if(start >= 2) {
                pageObj[target].paginate.push('...');
            }
        }
        if(size > pageSize) {
            if((max - start) <= 6) {
                start = max - 6;
                if(start < 1) {
                    start = 1;
                }
            }
            for(let i = (start+1); i <= max; i++) {
                pageObj[target].paginate.push(i);
            }
            if(pageObj[target].pagecount > max) {
                pageObj[target].paginate.push('...');
            }
            if(max < pageObj[target].pagecount) {
                pageObj[target].paginate.push(pageObj[target].pagecount);
            }
        }
    }

    async function getMusic(clickpage) {
        let target = 'music';

        if(clickpage == '...') { return; }
        if(clickpage <= 0) { return; }
        if(clickpage >= pageObj[target].size) { return; }
        if(clickpage > pageObj[target].pagecount) { return; }

        pageObj[target].page = (clickpage == undefined ? pageObj[target].page : clickpage);

        let params = new URLSearchParams();
        params.append('search', value);
        params.append('limit', pageSize);
        params.append('offset', ((pageObj[target].page-1) * pageSize));

        fetch('/musics.json', {
            method: 'POST',
            body: params
        }).then(async function(res) {
            let json = await res.json();
            let cnt = 0;
            for(let l of json.rows) {
                l.id = cnt;
                cnt++;
            }
            musics = json.rows;
            paginationCalc(target, json.count);
            //eventDispatch('musics_list', insertQueue, musics);
        });
    }

    async function getAlbum(clickpage) {
        let target = 'album';

        if(clickpage == '...') { return; }
        if(clickpage <= 0) { return; }
        if(clickpage >= pageObj[target].size) { return; }
        if(clickpage > pageObj[target].pagecount) { return; }

        pageObj[target].page = (clickpage == undefined ? pageObj[target].page : clickpage);

        let params = new URLSearchParams();
        params.append('search', value);
        params.append('limit', pageSize);
        params.append('offset', ((pageObj[target].page-1) * pageSize));
        params.append('group', 'album');

        fetch('/musics.json', {
            method: 'POST',
            body: params
        }).then(async function(res) {
            let json = await res.json();
            let cnt = 0;
            for(let l of json.rows) {
                l.id = cnt;
                cnt++;
            }
            albums = json.rows;
            paginationCalc(target, json.count);
        });
    }

    async function getFolder(clickpage) {
        let target = 'folder';

        if(clickpage == '...') { return; }
        if(clickpage <= 0) { return; }
        if(clickpage >= pageObj[target].size) { return; }
        if(clickpage > pageObj[target].pagecount) { return; }


        pageObj[target].page = (clickpage == undefined ? pageObj[target].page : clickpage);

        let params = new URLSearchParams();
        params.append('search', value);
        params.append('limit', pageSize);
        params.append('offset', ((pageObj[target].page-1) * pageSize));
        params.append('group', 'folder');

        fetch('/musics.json', {
            method: 'POST',
            body: params
        }).then(async function(res) {
            let json = await res.json();
            let cnt = 0;
            for(let l of json.rows) {
                l.id = cnt;
                cnt++;
            }
            folders = json.rows;
            paginationCalc(target, json.count);
        });
    }

    async function searchMusic() {
        getMusic(1);
        getAlbum(1);
        getFolder(1);
    }

    async function playMusic(row) {
        let params = new URLSearchParams();
        params.append('path', row.path);
        params.append('name', row.name);

        fetch('/play.json', {
            method: 'POST',
            body: params
        });
    }

    async function playFolder(row) {
        let params = new URLSearchParams();
        params.append('path', row.path);

        fetch('/play.json', {
            method: 'POST',
            body: params
        });
    }

    async function getLib() {
        let res = await fetch('/lib.json', {
            method: 'POST'
        });
        libs = await res.json();
    }

    async function insertLib() {
        let params = new URLSearchParams();
        params.append('path', addlibpath);
        params.append('recursive', (addlibrec ? "1": "0"));

        await fetch('/insertlib.json', {
            method: 'POST',
            body: params
        });

        addlibpath = '';
        addlibrec = true;

        await getLib();
    }

    async function getQueue() {
        let res = await fetch('/queue.json', {
            method: 'POST'
        });
        queue = await res.json();
    }

    async function insertQueue(row) {
        let params = new URLSearchParams();
        params.append('path', row.path);
        params.append('name', row.name);

        fetch('/insertqueue.json', {
            method: 'POST',
            body: params
        });

        if(queue.length == 0) {
            playMusic(row);
        }

        await getQueue();
    }

    async function deleteQueue(row) {
        let params = new URLSearchParams();
        params.append('id', row.id);

        await fetch('/deletequeue.json', {
            method: 'POST',
            body: params
        });
        await getQueue();
    }

    async function getPlaylist() {
        fetch('/playlists.json', {
            method: 'POST'
        }).then(async function(res) {
            let json = await res.json();
            let cnt = 0;
            for(let l of json) {
                l.id = cnt;
                cnt++;
            }
            playlists = json;
        });
    }

    async function playPlaylist(row) {
        let params = new URLSearchParams();
        params.append('path', row.path);
        params.append('name', row.name);

        fetch('/loadplaylist.json', {
            method: 'POST',
            body: params
        });
    }

    async function savePlaylist() {
        let params = new URLSearchParams();
        params.append('path', saveplaylistpath);

        await fetch('/saveplaylist.json', {
            method: 'POST',
            body: params
        });

        saveplaylistpath = '';
    }

    async function resumeMusic() {
        fetch('/resume.json');
    }

    async function stopMusic() {
        await fetch('/stop.json');
        getQueue();
    }

    async function pauseMusic() {
        fetch('/togglepause.json');
    }

    async function muteMusic() {
        fetch('/mute.json');
    }

    async function nextMusic() {
        fetch('/next.json');
    }

    async function prevMusic() {
        fetch('/prev.json');
    }

    async function setVolume(sld) {
        if(isVol) {
            isVol = false;
            let params = new URLSearchParams();
            params.append('volume', Number(sld.detail));

            fetch('/volume.json', {
                method: 'POST',
                body: params
            });

        } else {
            isVol = true;
        }
    }

    async function loopMusic() {
        fetch('/loop.json');
    }

    async function clearloopMusic() {
        fetch('/clearloop.json');
    }

    function hiddenSliderCnt() {
        
    }

    function updatePlaytime(val) {
        document.querySelector('.playtime').style.width = val.percentPos + '%';
    }

    async function readlib() {
        fetch('/readlib.json');
        readLibstatus();
    }

    function streamStatus() {
        let stream = new EventSource('/stream');
        stream.addEventListener('message', function(e) {
            if(!e.data) { return; }
            let st = JSON.parse(e.data);

            if(st.duration) {
                max = Math.ceil(st.duration);
                nowtime = Math.ceil(st.timePos);
                nowplaying = st.play;
                nowplaying.album = nowplaying.album || '';
                nowplaying.track = nowplaying.track || '';
                nowplaying.title = nowplaying.title || '';
                nowplaying.artist = nowplaying.artist || '';
                updatePlaytime(st);

            } else {
                st = 0;
                max = 0;
                nowtime = 0;
                nowplaying = {
                    title: '',
                    album: '',
                    artist: '',
                    track: ''
                };
                updatePlaytime(st);
            }
        });
    }

    function readLibstatus() {
        let stream = new EventSource('/readlibstatus');
        stream.addEventListener('message', function(e) {
            if(e.data == 'Finalize') {
                stream.close();
                return;
            }

            libstatus = e.data;
        });
    }

    /*
    function eventDispatch(el, md, data) {
        window.datatableInit(el);
        if(md == undefined) { md = function() {console.log('empty method');} }
        let id;
        id = setInterval(function() {
            if(document.querySelectorAll('#' + el + ' tr').length > 1) {
                clearInterval(id);
                window.dispatchEvent(new CustomEvent(el, {
                    detail: { parSize: pageSize, handler: md }
                }));
            }
        }, 5);
    });*/

    hiddenSliderCnt();
    getLib();
    getMusic();
    getAlbum();
    getFolder();
    getQueue();
    getPlaylist();
    streamStatus();
    readLibstatus();

</script>

<div class="md:flex flex-row w-auto content-center justify-center items-center">
    <div class="basis-1/2">
        <div class="m-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{nowplaying.title}</h5>
            <p class="mb-3 font-normal text-gray-700 dark:text-gray-400">{nowplaying.album} {nowplaying.track} - {nowplaying.title} / {nowplaying.artist}</p>
        </div>
    </div>
    <div class="basis-1/2 m-8">
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div class="bg-blue-600 h-2.5 rounded-full playtime" style="width: 1%"></div>
        </div> 

        <div class="mt-8 inline-flex rounded-md shadow-xs" role="group">
            <button onclick={prevMusic} data-tooltip-target="tooltip-prev" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                <i class="fa-solid fa-angles-left"></i>
                <div id="tooltip-prev" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Prev
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </button>
            <button onclick={resumeMusic} data-tooltip-target="tooltip-play" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                <i class="fa-solid fa-play"></i>
                <div id="tooltip-play" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Play
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </button>
            <button onclick={nextMusic} data-tooltip-target="tooltip-next" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                <i class="fa-solid fa-angles-right"></i>
                <div id="tooltip-next" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Next
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </button>
        </div>
        
        <div class="mr-8 inline-flex rounded-md shadow-xs" role="group">
            <button onclick={pauseMusic} data-tooltip-target="tooltip-pause" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                <i class="fa-solid fa-pause"></i>
                <div id="tooltip-pause" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Pause
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </button>
            <button onclick={stopMusic} data-tooltip-target="tooltip-stop" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                <i class="fa-solid fa-stop"></i>
                <div id="tooltip-stop" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Stop
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </button>
        </div>
        
        <div class="inline-flex rounded-md shadow-xs" role="group">
            <button onclick={loopMusic} data-tooltip-target="tooltip-loop" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                <i class="fa-solid fa-rotate-left"></i>
                <div id="tooltip-loop" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Loop
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </button>
            <button onclick={clearloopMusic} data-tooltip-target="tooltip-clear" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                <i class="fa-solid fa-eraser"></i>
                <div id="tooltip-clear" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Clear loop
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </button>
            <button onclick={muteMusic} data-tooltip-target="tooltip-mute" type="button" class="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                <i class="fa-solid fa-volume-xmark"></i>
                <div id="tooltip-mute" role="tooltip" class="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
                    Mute
                    <div class="tooltip-arrow" data-popper-arrow></div>
                </div>
            </button>
        </div>
    </div>
</div>

<div class="flex items-center ml-8 mr-8 mb-8">   
    <label for="simple-search" class="sr-only">Search</label>
    <div class="relative w-full">
        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5v10M3 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 0V6a3 3 0 0 0-3-3H9m1.5-2-2 2 2 2"/>
            </svg>
        </div>
        <input bind:value={value} onkeydown={(e) => { if(e.key == 'Enter') { searchMusic(); } }} type="text" id="simple-search" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Search Music name..." />
    </div>
    <button onclick={searchMusic} type="submit" class="p-2.5 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
        </svg>
        <span class="sr-only">Search</span>
    </button>
</div>

<div id="default-tab-content" class="m-8">
    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="music" role="tabpanel" aria-labelledby="music-tab">
        <div class="text-sm text-gray-500 dark:text-gray-400">
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table id="musics_list" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                Filename
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Music Title
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Album
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Artist
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Like
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each musics as item}
                            <tr onclick="{insertQueue(item)}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td scope="row" data-index="path" data-json="{JSON.stringify(item)}" class="px-6 py-4 dark:text-white">
                                    {item.path}
                                </td>
                                <td data-index="name" class="px-6 py-4 dark:text-white">
                                    {item.name}
                                </td>
                                <td data-index="tag_album" class="px-6 py-4 dark:text-white"><div class="relative z-0">
                                    {item.tag_album}
                                </td>
                                <td data-index="tag_artist" class="px-6 py-4 dark:text-white">
                                    {item.tag_artist}
                                </td>
                                <td data-index="like" class="px-6 py-4 dark:text-white">
                                    {item.like}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="mt-4 md:flex">
                <div class="mt-1 mr-4 ml-1 mb-2">
                    <span class="text-sm text-gray-700 dark:text-gray-400">
                        Showing <span class="font-semibold text-gray-900 dark:text-white">{((pageObj.music.page-1) * pageSize)+1}</span> to <span class="font-semibold text-gray-900 dark:text-white">{pageObj.music.page * pageSize}</span> of <span class="font-semibold text-gray-900 dark:text-white">{pageObj.music.size}</span> Entries
                    </span>
                </div>
                <nav aria-label="music nagination ml-auto" style="margin-left: auto;">
                    <ul class="flex items-center -space-x-px h-8 text-sm">
                        <li>
                            <a href="javascript:void(0);" onclick="{getMusic(pageObj.music.page-1)}" class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <span class="sr-only">Previous</span>
                            <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                            </svg>
                            </a>
                        </li>
                        {#each pageObj.music.paginate as item}
                            <li>
                                <a href="javascript:void(0);" onclick="{getMusic(item)}" class="{item == pageObj.music.page ? 'z-10 flex items-center justify-center px-3 h-8 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}">
                                    {item}
                                </a>
                            </li>
                        {/each}
                        <li>
                            <a href="javascript:void(0);" onclick="{getMusic(pageObj.music.page+1)}" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                            <span class="sr-only">Next</span>
                            <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                            </svg>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
            
        </div>
    </div>

    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="album" role="tabpanel" aria-labelledby="album-tab">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table id="albums_list" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Path
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Album
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Artist
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each albums as item}
                        <tr onclick="{insertQueue(item)}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td scope="row" data-json="{JSON.stringify(item)}" class="px-6 py-4 dark:text-white">
                                {item.path}
                            </td>
                            <td class="px-6 py-4 dark:text-white">
                                {item.tag_album}
                            </td>
                            <td class="px-6 py-4 dark:text-white">
                                {item.tag_artist}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="mt-4 flex justify-end">
            <div class="mt-1 mr-4">
                <span class="text-sm text-gray-700 dark:text-gray-400">
                    Showing <span class="font-semibold text-gray-900 dark:text-white">{((pageObj.album.page-1) * pageSize)+1}</span> to <span class="font-semibold text-gray-900 dark:text-white">{pageObj.album.page * pageSize}</span> of <span class="font-semibold text-gray-900 dark:text-white">{pageObj.album.size}</span> Entries
                </span>
            </div>
            <nav aria-label="album nagination">
                <ul class="flex items-center -space-x-px h-8 text-sm">
                    <li>
                        <a href="javascript:void(0);" onclick="{getAlbum(pageObj.album.page-1)}" class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                        <span class="sr-only">Previous</span>
                        <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                        </svg>
                        </a>
                    </li>
                    {#each pageObj.album.paginate as item}
                        <li>
                            <a href="javascript:void(0);" onclick="{getAlbum(item)}" class="{item == pageObj.album.page ? 'z-10 flex items-center justify-center px-3 h-8 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}">
                                {item}
                            </a>
                        </li>
                    {/each}
                    <li>
                        <a href="javascript:void(0);" onclick="{getAlbum(pageObj.album.page+1)}" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                        <span class="sr-only">Next</span>
                        <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

      </div>
    </div>

    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="folder" role="tabpanel" aria-labelledby="folder-tab">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table id="folders_list" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Path
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Dir
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each folders as item}
                        <tr onclick="{playFolder(item)}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td scope="row" data-json="{JSON.stringify(item)}" class="px-6 py-4 dark:text-white">
                                {item.path}
                            </td>
                            <td class="px-6 py-4 dark:text-white">
                                {item.dir}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="mt-4 flex justify-end">
            <div class="mt-1 mr-4">
                <span class="text-sm text-gray-700 dark:text-gray-400">
                    Showing <span class="font-semibold text-gray-900 dark:text-white">{((pageObj.folder.page-1) * pageSize)+1}</span> to <span class="font-semibold text-gray-900 dark:text-white">{pageObj.folder.page * pageSize}</span> of <span class="font-semibold text-gray-900 dark:text-white">{pageObj.folder.size}</span> Entries
                </span>
            </div>
            <nav aria-label="folder nagination">
                <ul class="flex items-center -space-x-px h-8 text-sm">
                    <li>
                        <a href="javascript:void(0);" onclick="{getFolder(pageObj.folder.page-1)}" class="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                        <span class="sr-only">Previous</span>
                        <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
                        </svg>
                        </a>
                    </li>
                    {#each pageObj.folder.paginate as item}
                        <li>
                            <a href="javascript:void(0);" onclick="{getFolder(item)}" class="{item == pageObj.folder.page ? 'z-10 flex items-center justify-center px-3 h-8 leading-tight text-blue-600 border border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' : 'flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}">
                                {item}
                            </a>
                        </li>
                    {/each}
                    <li>
                        <a href="javascript:void(0);" onclick="{getFolder(pageObj.folder.page+1)}" class="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                        <span class="sr-only">Next</span>
                        <svg class="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
                        </svg>
                        </a>
                    </li>
                </ul>
            </nav>
        </div>

      </div>
    </div>

    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="queue" role="tabpanel" aria-labelledby="queue-tab">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table id="queue_list" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            ID
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Path
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each queue as item}
                        <tr onclick="{deleteQueue(item)}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td scope="row" data-json="{JSON.stringify(item)}" class="px-6 py-4 dark:text-white">
                                {item.id}
                            </td>
                            <td class="px-6 py-4 dark:text-white">
                                {item.filename}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <div class="flex mt-8">
            <div class="flex-auto">
                <div class="relative z-0">
                    <input bind:value={saveplaylistpath} type="text" id="saveplaylistpath" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                    <label for="saveplaylistpath" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Input save path</label>
                </div>
            </div>

            <div class="w-14 flex-auto">
                <button onclick={savePlaylist} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save plyalist</button>
            </div>
        </div>

      </div>
    </div>

    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="playlist" role="tabpanel" aria-labelledby="playlist-tab">
      <div class="text-sm text-gray-500 dark:text-gray-400">
        
        <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table id="playlists_list" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">
                            Path
                        </th>
                        <th scope="col" class="px-6 py-3">
                            Name
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {#each playlists as item}
                        <tr onclick="{playPlaylist(item)}" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td scope="row" data-json="{JSON.stringify(item)}" class="px-6 py-4 dark:text-white">
                                {item.name}
                            </td>
                            <td class="px-6 py-4 dark:text-white">
                                {item.path}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

      </div>
    </div>

    <div class="hidden p-4 rounded-lg bg-gray-50 dark:bg-gray-800" id="library" role="tabpanel" aria-labelledby="library-tab">
        <div class="text-sm text-gray-500 dark:text-gray-400">
          
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table id="libs_list" class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" class="px-6 py-3">
                                Path
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Path
                            </th>
                            <th scope="col" class="px-6 py-3">
                                Rec
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each libs as item}
                            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td scope="row" data-json="{JSON.stringify(item)}" class="px-6 py-4 dark:text-white">
                                    {item.id}
                                </td>
                                <td class="px-6 py-4 dark:text-white">
                                    {item.path}
                                </td>
                                <td class="px-6 py-4 dark:text-white">
                                    {item.recursive}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

            <div class="flex mt-8">
                <div class="flex-auto">
                    <div class="relative z-0">
                        <input bind:value={addlibpath} type="text" id="floating_standard" class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " />
                        <label for="floating_standard" class="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto">Input Music path</label>
                    </div>
                </div>

                <div class="mt-2 ml-8 w-6 flex-auto">
                    <label class="inline-flex items-center mb-5 cursor-pointer">
                        <input type="checkbox" value="" class="sr-only peer" bind:checked="{addlibrec}">
                        <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"></div>
                        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Recursive</span>
                    </label>
                </div>

                <div class="w-14 flex-auto">
                    <button onclick={insertLib} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Add Lib</button>
                </div>
            </div>

            <div class="mt-8">
                <button onclick={readlib} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                    <i class="fa-solid fa-rotate"></i>
                    &nbsp;Reload Libraly.
                </button>
            </div>

            <div class="mt-8 flex items-center w-full max-w-xs p-4 space-x-4 rtl:space-x-reverse text-gray-500 bg-white divide-x rtl:divide-x-reverse divide-gray-200 rounded-lg shadow-sm dark:text-gray-400 dark:divide-gray-700 dark:bg-gray-800" role="alert">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-500 rotate-45" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 17 8 2L9 1 1 19l8-2Zm0 0V9"/>
                </svg>
                <div class="ps-4 text-sm font-normal">{libstatus}</div>
            </div>
            

        </div>
    </div>
  </div>