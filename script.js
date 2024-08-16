const API_KEY = 'AIzaSyAL3iE9PG3qGU3LBPAKNlpRnSc34EGG52U';

function loadClient() {
    gapi.client.setApiKey(API_KEY);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(() => console.log("GAPI client loaded for API"),
              err => console.error("Error loading GAPI client for API", err));
}

function getVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : false;
}

function execute(videoId) {
    return gapi.client.youtube.videos.list({
        "part": ["contentDetails", "status"],
        "id": [videoId]
    });
}

function checkMonetization() {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = getVideoId(videoUrl);
    
    if (!videoId) {
        document.getElementById('result').innerText = 'Неверный URL видео';
        return;
    }

    execute(videoId).then(response => {
        const video = response.result.items[0];
        if (video) {
            const isMonetized = video.status.madeForKids === false && 
                                video.contentDetails.licensedContent === true;
            document.getElementById('result').innerText = isMonetized ? 
                'Видео, вероятно, монетизировано' : 'Видео, вероятно, не монетизировано';
        } else {
            document.getElementById('result').innerText = 'Видео не найдено';
        }
    }, err => console.error("Execute error", err));
}

gapi.load("client", function() {
    loadClient().then(() => {
        document.getElementById('checkButton').addEventListener('click', checkMonetization);
    });
});