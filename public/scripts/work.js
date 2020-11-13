const APIController = (function() {
    const clientId = '173d38bc97e34eda8aa58efca689e449';
    const clientSecret = '62189812718d47f6bacbd48361663e24';	//probably shouldnt be out in public but o well :^)
    // const playlistsToPull = 6;  //amount of playlists to be shown for each genre
    // const songsToPull = 3;      //amount of songs to be shown for each playlist
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    /*
    get list of genres, takes in a token to provide to spotify api to be able to use calls
    function returns promise in async
    use js fetch method to call spotify categories api endpoint, this will be a get request by api documentatio
    */
    const _getGenres = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        //receive result promise from spotify then store it
        const data = await result.json();
        //array of items returned by call
        return data.categories.items;
    }

    /*
    get list of playlists based on given genre, method receives token parameter
    create var to limit # of playlists received by call
    */
    const _getPlaylistByGenre = async (token, genreId) => {
        const playlistsToPull = 20;	//default fetch value
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${playlistsToPull}`, {
            method :'GET',
            headers: {'Authorization' : 'Bearer ' + token}
        });
        //receive data from spotify
        const data = await result.json();
        //return array of items of playlists
        return data.playlists.items;
    }

    /*
    get list of tracks for given playlist, receives token and tracksendpoint
    tracksendpoint included in dataset retrieved from playlists
    so when user selectes playlist, can access tracks api endpoint attached to api object
    */
    const _getTracks = async (token, tracksEndPoint) => {
        const songsToPull = 50;	//default fetch value
        const result = await fetch(`${tracksEndPoint}?limit=${songsToPull}`, {
            method: 'GET',
            headers: {'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    /*
    to single out a track
    */
    const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: {'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    /*
    getters
    */
    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint){
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint){
            return _getTrack(token, trackEndPoint);
        }
    }
})();   //(); to make it call

const UIController = (function() {
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#submitButton',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
		divSonglist: '.song-list',
		divResults : '#results',
		// selectNumPlaylists: '#select_numPlaylists',
		selectNumSongs: '#select_numSongs',
		selectMinutes : '#select_minutes',
    }

    return {
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
				songDetail: document.querySelector(DOMElements.divSongDetail),
				// numPlaylists: document.querySelector(DOMElements.selectNumPlaylists),
				numSongs: document.querySelector(DOMElements.selectNumSongs),
				minutes: document.querySelector(DOMElements.selectMinutes),
            }
        },

        createGenre(text, value) {
			const html = `<option value="${value}">${text}</option>`;
			// document.querySelector(DOMElements.selectGenre).innerHTML = html;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        },

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
			// document.querySelector(DOMElements.selectPlaylist).innerHTML = html;
			document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        createTrack(id, name) {
			const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
			// document.querySelector(DOMElements.divSonglist).innerHTML = html;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

		createResults(songs, minutes, trueMinutes, trueSongs){
			const resultsDiv = document.querySelector(DOMElements.divResults);

			// reset the div for if another playlist creation is called without reloading page
			resultsDiv.innerHTML = '';

			var html = ``;
			// console.log("songs: ", songs);
			// console.log("minutes: ", minutes);
			// console.log("trueMinutes: ", trueMinutes);

			if(songs < 0 || minutes < 0){
				html =
				`
				<div class="row col-sm-6">
					<b>Don't enter negative numbers.</b>
				</div>
				`;
			}

			else if(songs == 0 && minutes != 0){
				html =
				`
				<div class="row col-sm-6">
					You wanted a playlist of ${minutes} minutes, so here's a playlist of
					<b>&nbsp${Math.floor(trueMinutes)} minutes and ${Math.round((trueMinutes - Math.floor(trueMinutes)) * 60)} seconds</b>!
				</div>
				`;
			}else if(songs != 0 && minutes == 0){
				html =
				`
				<div class="row col-sm-6">
					Here are the <b>&nbsp${songs} songs&nbsp</b> from the genre you selected!
				</div>
				`;
			}else if(songs != 0 && minutes != 0){
				html =
				`
				<div class="row col-sm-6">
					Due to API limitations, we cannot create a playlist
					of ${minutes} minutes made up of ${songs} songs, so here's a playlist of <b>&nbsp${trueSongs} songs&nbsp</b> with a length of
					<b>&nbsp${Math.floor(trueMinutes)} minutes and ${Math.round((trueMinutes - Math.floor(trueMinutes)) * 60)} seconds</b>!
				</div>
				`;
			}else if(songs == 0 && minutes == 0){
				html =
				`
				<div class="row col-sm-6">
					<b> Here is the entire playlist! </b>
				</div>
				`;
			}else{
				html =
				`
				<div class="row col-sm-6">
					<b>Sorry, something went wrong!</b>
				</div>
				`;
			}

			// resultsDiv.innerHTML = html;
			resultsDiv.insertAdjacentHTML('beforeend', html);
		},

        resetTracks(){
            this.inputField().tracks.innerHTML = '';
        },

        resetPlaylist(){
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }
})();

const AppController = (function(UICtrl, APICtrl) {
    const DOMInputs = UICtrl.inputField();
    const loadGenres = async () => {
        //get token
        const token  = await APICtrl.getToken();
        //store token
        UICtrl.storeToken(token);
        //get genres
        const genres = await APICtrl.getGenres(token);
        //populate genres
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    DOMInputs.genre.addEventListener('change', async () => {
        UICtrl.resetPlaylist();

        const token = UICtrl.getStoredToken().token;
        const genreSelect = UICtrl.inputField().genre;
		const genreId = genreSelect.options[genreSelect.selectedIndex].value;
		// const numPlaylists = UICtrl.inputField().numPlaylists.value;
		const playlist = await APICtrl.getPlaylistByGenre(token, genreId);
		// console.log("inside genre");
		// console.log(playlist);
		// console.log("numplaylists ", numPlaylists);

		// start old when numPlaylists existed
		// if(!numPlaylists){	//if no numplaylists given, show all
		// 	playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
		// 	console.log("playlists when no numPlaylists in genreEvent", playlist);
		// 	// console.log("no numPlaylists in genreEvent");
		// }else{
		// 	for(let i=0; i<numPlaylists; i++){
		// 		UICtrl.createPlaylist(playlist[i].name, playlist[i].tracks.href);
		// 		console.log("playlists when numPlaylists exists in genreEvent", playlist);
		// 		// console.log("numPlaylists exists in genreEvent");
		// 	}
		// }
		// end old when numPlaylists existed

		playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
		console.log("playlists when no numPlaylists in genreEvent:", playlist);

		// const numPlaylists = DOMInputs.numPlaylists.value;
		// playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
		// for(var i=0; i<numPlaylists; i++){
		// 	UICtrl.createPlaylist(playlist[i].name, playlist[i].tracks.href);
		// 	console.log("populating");
		// }
        // console.log(playlist);

    });

    DOMInputs.submit.addEventListener('click', async (e) => {
        e.preventDefault();
        UICtrl.resetTracks();

        const token = UICtrl.getStoredToken().token;
        const playlistSelect = UICtrl.inputField().playlist;
        const tracksEndpoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        const tracks = await APICtrl.getTracks(token, tracksEndpoint);
		// tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name));
		// var playlistDuration = DOMInputs.minutes.value;
		const playlistDuration = UICtrl.inputField().minutes.value;
		// const numPlaylists = UICtrl.inputField().numPlaylists;	//just used as format, doesnt belong here
		// console.log("playlistduration ", playlistDuration);
		const requestedNumSongs = UICtrl.inputField().numSongs.value;

		if(playlistDuration){	//if playlistDuration given, make playlist of that length
			console.log("playlistDuration exists in submitEvent and is:", playlistDuration);
			var summingLength = 0;
			var currentIndex = 0;
			var totalSongs = 0;
			while(summingLength < playlistDuration){
				// UICtrl.createPlaylist(tracks[currentIndex].href, tracks[currentIndex].name);
				// console.log("current track to sum is", tracks[currentIndex].name);
				// console.log("summingLength is ", summingLength, " in submitEvent");
				// summingLength = summingLength + (tracks[currentIndex].duration_ms / 60000);
				// currentIndex++;
				UICtrl.createTrack(tracks[currentIndex].track.href, tracks[currentIndex].track.name);
				// console.log(tracks[currentIndex].name);
				// console.log("summingLength for ", tracks[currentIndex].track.name, " is ", tracks[currentIndex].track.duration_ms);
				summingLength = summingLength + (tracks[currentIndex].track.duration_ms / 60000);
				currentIndex++;
				totalSongs++;
			}

			if(requestedNumSongs){	//formats result div depending on if both exist
				UICtrl.createResults(requestedNumSongs, playlistDuration, summingLength, totalSongs);
			}else{	//only playlistDuration exists, formats results div appropriately
				UICtrl.createResults(0, playlistDuration, summingLength, 0);
			}


			console.log("summingLength at end of when playlistDuration exists is:", summingLength);
		}else if(requestedNumSongs){	//show only given number of songs (DOMInputs.numSongs.value)	// cat
			console.log("numSongs exists in submitEvent and is:", DOMInputs.numSongs.value);
			for(var i=0; i<requestedNumSongs; i++){	//numPlaylists.value
				UICtrl.createTrack(tracks[i].track.href, tracks[i].track.name);
				console.log("current track when numSongs exists in submitEvent:", tracks[i].track.name);
				// console.log(tracks[i].track.duration_ms);
				// console.log("current track length when numSongs exists in submitEvent", tracks[i].track.duration_ms);
				// console.log("numSongs exists in submitEvent");
			}
			UICtrl.createResults(requestedNumSongs, 0, 0, 0);
		}else if (!DOMInputs.numSongs.value && !playlistDuration){	//if no numSongs AND no duration given, show all songs
			tracks.forEach(single => UICtrl.createTrack(single.track.href, single.track.name));
			console.log("tracks when no numSongs and no playlistDuration in submitEvent", tracks);
			// console.log("no numSongs and no playlistDuration in submitEvent");
			UICtrl.createResults(0, 0, 0, 0);
		}
    });

    DOMInputs.tracks.addEventListener('click', async (e) => {
        e.preventDefault();
        const token = UICtrl.getStoredToken().token;
        const trackEndpoint = e.target.id;
        const track = await APICtrl.getTrack(token, trackEndpoint);

        // UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name, track.duration_ms);
    });

    return{
        init(){
            loadGenres();
        }
    }
})(UIController, APIController);

AppController.init();