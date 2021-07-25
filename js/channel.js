async function apiLoad() {
    const data = await fetch("http://api.persik.by/v2/content/channels?device=web-by", {
        method: 'GET'
    });
    return await data.json();
}

async function loadGenres() {
    const data = await fetch("http://api.persik.by/v2/categories/channel", {
        method: 'GET'
    });
    return await data.json();
}

async function loadTvshows(channelId) {
    const currentDate = moment().format('YYYY-MM-DD');
    const data = await fetch("http://api.persik.by/v2/epg/tvshows".concat('?channels[]=', channelId, '&limit=50&from=', currentDate, '&to=', currentDate), {
        method: 'GET'
    });
    return await data.json();
}

let channels = [];
const showlist = document.getElementsByClassName('channels-block')[0];

loadGenres().then(data => {
    const allGenre = {
        id: 0,
        name: "Все жанры"
    };
    data.unshift(allGenre);
    drawGenres(data);
});

function drawGenres(genres) {
    const dropdown = document.getElementById("dropdown");
    dropdown.addEventListener('change', onGenreChange);
    dropdown.innerHTML = ' ';
    genres.forEach(item => {
        const option = createOption(item);
        dropdown.appendChild(option);
    });
}

function createOption(genre) {
    const option = document.createElement('option');
    option.innerText = genre.name;
    option.value = genre.id;
    return option;
}

apiLoad().then(data => {
    channels = data.channels;
    drawChannel(channels);
})

function drawChannel(items) {
    const channelsBlock = document.getElementsByClassName('channels-block')[0];
    const activeButton = document.getElementById('sorting');
    
    channelsBlock.innerHTML = '';
	
    activeButton.addEventListener('change', () => {
        sortFunction();
    });

    function sortFunction() {
        if(activeButton.value == '1') {
            console.log('Options 1');
        }
        if(activeButton.value == '2') {
            console.log('Options 2');
        }
    }
	
    items.sort(function(a, b){
        return compareStrings(a.name, b.name);
    });

    items.forEach(item => {
        const channelCard = createChannelCard(item);
        channelsBlock.appendChild(channelCard);
    });
    loadTvshows(items[0].channel_id).then(data => drawTvshows(data.tvshows.items));
}

function compareStrings(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
  
    return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function createChannelCard(channel) {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = channel.logo;
    img.onerror = function() {
        img.src = './images/stub.png'
    };

    const name = document.createElement('span');
    name.innerText = channel.name;

    card.appendChild(img);
    card.appendChild(name);
	
    card.addEventListener('click', () =>{
        loadTvshows(channel.channel_id).then(data => drawTvshows(data.tvshows.items));
    });

    return card;
}

function drawTvshows(tvshows) {
    const tvshowsArea = document.getElementsByClassName('tvshows')[0];
    tvshowsArea.innerHTML = '';
    tvshows.forEach(element => {
        const tvshowCard = createTvshowCard(element);
        tvshowsArea.appendChild(tvshowCard);
    });

    const currentTvshow = document.getElementsByClassName('current-tvshow')[0];
    //console.log(currentTvshow.getBoundingClientRect());
    if(currentTvshow) {
        setTimeout(() => {
            currentTvshow.scrollIntoView({behavior: 'smooth', block: 'center'})
        }, 0);
    }
}

function createTvshowCard(tvshow) {
    const currentTime = moment().unix();
    if(currentTime >= +tvshow.start && currentTime < tvshow.stop) {
        return createCurrentTvshowCard(tvshow);
    }
    return createSimpleTvshowCard(tvshow);
}

function createSimpleTvshowCard(tvshow) {
    const card = document.createElement('div');
    card.classList.add('simple-tvshow');

    const title = document.createElement('span');
    title.classList.add('tvshowtitle');
    title.innerText = tvshow.title;
    title.title = tvshow.title;

    const time = document.createElement('span');
    time.classList.add('tvshowtime');
    const startTime = moment.unix(tvshow.start).format('HH:mm');
    const endTime = moment.unix(tvshow.stop).format('HH:mm');
    time.innerText = `${ startTime }-${ endTime }`;

    card.appendChild(title);
    card.appendChild(time);

    return card;
}

function createCurrentTvshowCard(tvshow) {
    const card = document.createElement('div');
    card.classList.add('current-tvshow');

    const title = document.createElement('span');
    title.classList.add('tvshowtitle-cur');
    title.innerText = tvshow.title;
    title.title = tvshow.title;

    const info = document.createElement('div');
    info.classList.add('tvshow-info');

    const startSpan = document.createElement('span');
    const startTime = moment.unix(tvshow.start).format('HH:mm');
    startSpan.innerText = startTime;

    const endSpan = document.createElement('span');
    const endTime = moment.unix(tvshow.stop).format('HH:mm');
    endSpan.innerText = endTime;

    const progress = document.createElement('div');
    progress.classList.add('progress');

    const progressLine = document.createElement('div');
    progressLine.classList.add('progress-line');
    progressLine.style.width = getProgress(tvshow.start, tvshow.stop) + "%";

    progress.appendChild(progressLine);

    info.appendChild(startSpan);
    info.appendChild(progress);
    info.appendChild(endSpan);

    card.appendChild(title);
    card.appendChild(info);

    return card;
}

function getProgress(start, stop) {
    const currentTime = moment().unix();
    return Math.round(((currentTime - start) / (stop - start)) * 100);
}

function onGenreChange(event) {
    const id = +event.target.value;
    let filteredChannels;
    if(id !== 0) {
        filteredChannels = channels.filter(ch => ch.genres.includes(id));
    } else {
        filteredChannels = channels;
    }

    drawChannel(filteredChannels);
}

//apiLoad().then(data => console.log(data.channels[0]));