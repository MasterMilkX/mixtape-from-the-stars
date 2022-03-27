/* global songSearchList */
/* global accessToken */

//key -> pitch class notation -> C = 0, C# = 1, .... B = 11
// mode -> Major = 1, Minor = 0
var keyConvert = ["C", "C#", "D", "E"+flat, "E", "F", "F#", "G", "A"+flat, "A", "B"+flat, "B"];
var songFilled = []

//search the spotify song api for a specific text query
function searchSong(q){
	console.log("searching spotify for: " + q)

	//reset the search list
	songSearchList = [];
	songFilled = [];
	curSelSearchSong = 0;

	document.getElementById("search_results").innerHTML = "";
	document.getElementById("status").innerHTML = "&nbsp;";  //reset the status message

	//fetch a new search list
	fetch("https://api.spotify.com/v1/search?q=" + encodeURIComponent(q) + "&type=track&limit=10", {
	  headers: {
	    Accept: "application/json",
	    Authorization: "Bearer " + accessToken,
	    "Content-Type": "application/json"
  	}}).then(response => response.json()).then(data => parseSearchData(data))
}

//parse the data to pass to the playlist and the search results
function parseSearchData(data){
	//console.log(data.tracks.items)
	let res = data.tracks.items;
	console.log("got " + res.length + " results...")

	if(res.length == 0){
		document.getElementById("status").innerHTML = "No results found...";
		return;
	}

	for(let i=0;i<res.length;i++){
		songFilled.push(false);
		let songItem = res[i];
		let id = songItem.id;
		let name = songItem.name;
		let artist = songItem.artists[0].name;
		let url = songItem.external_urls.spotify;

		//add start of new spotify track to the search list
		songSearchList.push(new SpotifyTrack(id,name,artist,null,null,url))

		//get the rest of the data
		fetch("https://api.spotify.com/v1/audio-features/" + id, {
		  headers: {
		    Accept: "application/json",
		    Authorization: "Bearer " + accessToken,
		    "Content-Type": "application/json"
		  }
		}).then(response => response.json()).then(data => updateSpotifyTrack(data));
	}
}

//retrieve metadata and update the sp
function updateSpotifyTrack(data){
	let index = getSearchSong(data.id);
	let song_time = msToMinSec(parseInt(data.duration_ms))
	let key = (data.key == -1 ? "?" : keyConvert[parseInt(data.key)]);
	let minor = (data.mode == 0 ? "m" : "");

	//pass to update the song info
	songSearchList[index].duration = song_time;
	songSearchList[index].key = (key+minor);

	//post to the search bar
	songFilled[index] = true;
	if(songFilled.indexOf(false) == -1){
		fillSearchArea();
	}
}

//convert from milliseconds to a nice minute, second form
function msToMinSec(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

//search for the song in the search list that matches the id
function getSearchSong(id){
	for(let i=0;i<songSearchList.length;i++){
		if(songSearchList[i].spotid == id)
			return i;
	}
	return -1;
}
