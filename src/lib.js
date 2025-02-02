export let isOpen = false;
export let value = "";
export let musics = [];
export let page = 1;
export let pageSize = 20;
export let albums = [];
export let folders = [];
export let libs = [];
export let queue = [];
export let playlists = [];
export let libstatus = '';
export let min = 0;
export let max = 0;
export let isVol = false;
export let nowtime = 0;
export let nowplaying = {
    title: '',
    album: '',
    artist: '',
    track: ''
};
export let addlibpath = '';
export let addlibrec = true;
export let saveplaylistpath = '';

export async function getMusic() {
    let params = new URLSearchParams();
    params.append('search', value);

    fetch('/musics.json', {
        method: 'POST',
        body: params
    }).then(async function(res) {
        let json = await res.json();
        let cnt = 0;
        for(let l of json) {
            l.id = cnt;
            cnt++;
        }
        musics = json;
        window.dispatchEvent(new CustomEvent('musics', {
            detail: { musics }
        }));
    });

    params.append('group', 'album');
    fetch('/musics.json', {
        method: 'POST',
        body: params
    }).then(async function(res) {
        let json = await res.json();
        let cnt = 0;
        for(let l of json) {
            l.id = cnt;
            cnt++;
        }
        albums = json;
    });

    params.append('group', 'folder');
    fetch('/musics.json', {
        method: 'POST',
        body: params
    }).then(async function(res) {
        let json = await res.json();
        let cnt = 0;
        for(let l of json) {
            l.id = cnt;
            cnt++;
        }
        folders = json;
    });
}

export async function playMusic(row) {
    let params = new URLSearchParams();
    params.append('path', row.detail.path);
    params.append('name', row.detail.name);

    fetch('/play.json', {
        method: 'POST',
        body: params
    });
}

export async function playFolder(row) {
    let params = new URLSearchParams();
    params.append('path', row.detail.path);

    fetch('/play.json', {
        method: 'POST',
        body: params
    });
}

export async function getLib() {
    let res = await fetch('/lib.json', {
        method: 'POST'
    });
    libs = await res.json();
}

export async function insertLib() {
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

export async function getQueue() {
    let res = await fetch('/queue.json', {
        method: 'POST'
    });
    queue = await res.json();
}

export async function insertQueue(row) {
    let params = new URLSearchParams();
    params.append('path', row.detail.path);
    params.append('name', row.detail.name);

    fetch('/insertqueue.json', {
        method: 'POST',
        body: params
    });

    if(queue.length == 0) {
        playMusic(row);
    }

    await getQueue();
}

export async function deleteQueue(row) {
    let params = new URLSearchParams();
    params.append('id', row.detail.id);

    await fetch('/deletequeue.json', {
        method: 'POST',
        body: params
    });
    await getQueue();
}

export async function getPlaylist() {
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

export async function playPlaylist(row) {
    let params = new URLSearchParams();
    params.append('path', row.detail.path);
    params.append('name', row.detail.name);

    fetch('/loadplaylist.json', {
        method: 'POST',
        body: params
    });
}

export async function savePlaylist() {
    let params = new URLSearchParams();
    params.append('path', saveplaylistpath);

    await fetch('/saveplaylist.json', {
        method: 'POST',
        body: params
    });

    saveplaylistpath = '';
}

export async function resumeMusic() {
    fetch('/resume.json');
}

export async function stopMusic() {
    await fetch('/stop.json');
    getQueue();
}

export async function pauseMusic() {
    fetch('/togglepause.json');
}

export async function muteMusic() {
    fetch('/mute.json');
}

export async function nextMusic() {
    fetch('/next.json');
}

export async function prevMusic() {
    fetch('/prev.json');
}

export async function setVolume(sld) {
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

export async function loopMusic() {
    fetch('/loop.json');
}

export async function clearloopMusic() {
    fetch('/clearloop.json');
}

export function hiddenSliderCnt() {
    
}

export function updatePlaytime(val) {
    document.querySelector('.playtime').style.width = val.duration + '%';
}

export async function readlib() {
    fetch('/readlib.json');
    readLibstatus();
}

/*
setTimeout(async function() {
    //$: console.log('Init');
    hiddenSliderCnt();
    getLib();
    getMusic();
    getQueue();
    getPlaylist();
    streamStatus();
    readLibstatus();
}, 1000);*/

export function streamStatus() {
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
/*
            (async function() {
                if(queue) {
                    await deleteQueue();
                    if(queue && queue.length > 0 && queue[0]) {
                        await playMusic({
                            detail: {
                                path: queue[0].path,
                                name: ''
                            }
                        });
                    }
                }
            })();*/
        }
    });
}

export function readLibstatus() {
    let stream = new EventSource('/readlibstatus');
    stream.addEventListener('message', function(e) {
        if(e.data == 'Finalize') {
            stream.close();
            return;
        }

        libstatus = e.data;
    });
}