let flat='\u{266d}'
let sharp='#'
var music_notes = ['C','G','D','A','E','B','F'+sharp,'C'+sharp,'A'+flat,'E'+flat,'B'+flat,'F']
var zodiacs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn',"Aquarius",'Pisces']
var zodiac_sym = ['\u{2648}','\u{2649}','\u{264A}','\u{264B}','\u{264C}','\u{264D}','\u{264E}','\u{264F}','\u{2650}','\u{2651}','\u{2652}','\u{2653}']
var suffix = ['st','nd','rd','th','th','th','th','th','th','th','th','th']
var houseSigns = []
var house_descriptions = [
	"self, identity", 
	"values, material wealth",
	"communication",
	"home, parents",
	"creativity, children, pleasure",
	"work, tasks, daily life",
	"partnerships, relationships",
	"sex, possession, taboo, death",
	"philosophy, wisdom, education",
	"reputation, power, career",
	"community, friendships",
	"spirituality, subconscious"
]

var cur_profile = null;
var songSearchList = [];    //list of parsed Spotify Tracks
var curSelSearchSong = 0;
var curPlaylist = {};

/////////      HELPER FUNCTIONS      //////////

// GETS THE MUSIC KEY FROM A SIGN
function getKey(sign){
	let i = zodiacs.indexOf(sign);
	return music_notes[i];
}

// GET THE ZODIAC SIGN BASED ON THE MUSIC KEY
function getSign(key){
	let i = music_notes.indexOf(key);
	return zodiacs[i];
}
function getHousebyKey(key){
	return houseSigns.indexOf(zodiacs[music_notes.indexOf(key)])+1
}
function getHousebySign(sign){
	return houseSigns.indexOf(sign)+1;
	
}

/////////      CLASS DEFINITIONS     //////////

// USER PROFILE WITH SONG LIST AND ASCENDANT
function Profile(profileName, ascendant){
	this.profileName = profileName;
	this.ascendant = ascendant;

	//create empty playlist set
	this.playlistSet = {};
	this.ascIndex = zodiacs.indexOf(ascendant);
	for(let z=1;z<=12;z++){
		let i = (this.ascIndex + (z-1)) % 12
		this.playlistSet[z] = new HousePlaylist(z,zodiacs[i]) 
	}
}

// PLAYLIST OBJECT FOR ASSOCIATED HOUSE AND SIGN
function HousePlaylist(house,sign){
	this.house = house;
	this.sign = sign;
	this.key = getKey(sign);
	this.songList = [];
}

//create a new spotify track with all of the information
function SpotifyTrack(id,name,artist,duration,key,url){
	this.spotid = id;
	this.song_name = name;
	this.artist = artist;
	this.duration = duration;
	this.key = key;
	this.url = url;
}

///////       INTERACTION FUNCTIONS      //////////

//access the spotify API database
var accessToken='BQBXYXDsUn2tFXgi-awvbGc16AA6BGoe_SVHRCcVmEHGHo1fJ1hz9gz8_-lVIysl3EJVz3baTuSle6JdaJDNwxyq3cURqQQzLzKlasyg0idCPNVecsQ2evQPBVitGDM0gnj9VxrqJzSjr88Q';
function newToken(){
	let client_id = "36934065df3a436b9d0542c5c78adb2a";
	let client_secret = "ddcb90f01830407085c7d8c402f19fa9";
	//encode the above here: https://www.base64encode.org/

	fetch('https://accounts.spotify.com/api/token', {
	    method: 'POST',
	    headers: {
	        'Authorization': 'Basic ' + "MzY5MzQwNjVkZjNhNDM2YjlkMDU0MmM1Yzc4YWRiMmE6ZGRjYjkwZjAxODMwNDA3MDg1YzdkOGM0MDJmMTlmYTk=",
	        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
	    },
	    body: 'grant_type=client_credentials',
	    json: true
	})
	.then(response => response.json())
	.then(data => {
	    accessToken = data.access_token;
	    console.log('generated a new token! Expires in ' + data.expires_in);
	});
}

// INITIALIZING FUNCTION FOR THE WEB APP
function init(){
	ascendantDropdown()
	newToken();

	//import the lasty profile if available
	if(localStorage.lastUser){
		switchProfile(localStorage.lastUser)
		showMain();
	}
	//create a new user
	else{
		document.getElementById("returnMain").style.display = "none";
		showStartup();
		//selectHouse(1);
	}
}

// POPULATES THE SEARCH AREA WITH SELECTABLE SONGS
function fillSearchArea(){
	let searchArea = document.getElementById("search_results")
	searchArea.innerHTML = ""
	let maxstrlen = 100;

	for(let i=0;i<songSearchList.length;i++){
		let song = songSearchList[i];
		let sn = (song.song_name.length > maxstrlen ? song.song_name.substr(0,maxstrlen) : song.song_name)
		let an = (song.artist.length > maxstrlen ? song.artist.substr(0,maxstrlen) : song.artist)

		let row = document.createElement("div")
		row.classList.add("row")
		row.classList.add("search_entry")
		row.onclick = function(){setSearchIndex(i)};

		let c1 = document.createElement("div");
		c1.classList.add("col-xs-5");
		c1.innerHTML = sn
		row.appendChild(c1)

		let c3 = document.createElement("div");
		c3.classList.add("col-xs-5");
		c3.innerHTML = an
		row.appendChild(c3)

		let c2 = document.createElement("div");
		c2.classList.add("col-xs-2")
		c2.innerHTML = songSearchList[i].key;
		row.appendChild(c2);

		searchArea.appendChild(row);
	}
}

// SET THE SELECTED SEARCH INDEX TO THIS VALUE
function setSearchIndex(i){
	let allSearches = document.getElementsByClassName("search_entry");
	for(let s=0;s<allSearches.length;s++){
		allSearches[s].classList.remove("selSearch");
		if(s == i)
			allSearches[s].classList.add("selSearch");
	}
	curSelSearchSong = i;
}

// GENERATE THE DROPDOWNS FOR THE ASCENDANT HOUSE SELECTION
function ascendantDropdown(){
	let ascDD = document.getElementById("ascSelect");
	ascDD.innerHTML = "";
	for(let z=0;z<12;z++){
		let zodiac = zodiacs[z]
		let item = document.createElement("option")
		item.value = zodiac;
		item.innerHTML = zodiac;
		ascDD.appendChild(item)
	}
}

// CREATE A NEW USER PROFILE BASED ON ASCENDANT HOUSE
function createNewUser(){
	let profileName = document.getElementById("nameInput").value;
	//check for the same user
	let allUsers = [];
	if(localStorage.allUsers){
		allUsers = JSON.parse(localStorage.allUsers);
		if(allUsers.indexOf(profileName) != -1){
			if(!confirm("A user named " + profileName + " already exists. Do you want to reset their data?")){return;}
		}
		allUsers.push(profileName);
	}

	let new_prof = new Profile(profileName,document.getElementById("ascSelect").value)
	cur_profile = new_prof;
	saveProfile();
	showMain();
	localStorage.lastUser = cur_profile.profileName;
	localStorage.lastHouse = 1;
	localStorage.allUsers = JSON.stringify(allUsers);
}

// STORES THE CURRENT PROFILE AS A JSON OBJECT IN THE BROWSER FOR ACCESS LATER
function saveProfile(){
	let allProfiles = {}
	//create new profile storer
	if(localStorage.allProfiles){
		allProfiles = JSON.parse(localStorage.allProfiles);
	}

	//save the current profile
	allProfiles[cur_profile.profileName] = cur_profile

	//update the storage
	localStorage.setItem('allProfiles',JSON.stringify(allProfiles));
}

// SWITCH TO ANOTHER PROFILE
function switchProfile(pname){
	let allProfiles = JSON.parse(localStorage.allProfiles);
	cur_profile = allProfiles[pname];
	localStorage.lastUser = pname;
	generateHouses();
}

// SET THE DROPDOWN FOR PROFILE NAMES FOUND ON THE SYSTEM
function addProfileNames() {
	if(!localStorage.allProfiles){return;}

	let allProfiles = JSON.parse(localStorage.getItem('allProfiles'));
	let names = Object.keys(allProfiles);
	let profileDD = document.getElementById("profile_select");
	profileDD.innerHTML = "";
	for(let n=0;n<names.length;n++){
		let item = document.createElement("option");
		item.value = names[n];
		item.innerHTML = names[n];
		if(cur_profile.profileName == names[n])
			item.selected = true;
		profileDD.appendChild(item);
	}
}

// GENERATES THE DROPDOWN LIST OF HOUSES TO SELECT FROM
function generateHouses(){
	//set the last house playlist
	let lh = (localStorage.lastHouse ? parseInt(localStorage.lastHouse) : 1);
	selectHouse(lh);

	//make the dropdown list
	let houseDD = document.getElementById("house_selection");
	houseDD.innerHTML = "";
	houseSigns = [];
	for(let i=0;i<12;i++){
		let sign = zodiacs[(cur_profile.ascIndex + i) % 12];
		let item = document.createElement("option");
		item.value = (i+1);
		if(lh == i+1){item.selected = true;}
		item.innerHTML = sign;
		houseSigns.push(sign)
		houseDD.appendChild(item)
	}

}

// SELECT THE HOUSE AND SHOW THE PLAYLIST FOR THE ASSOCIATED HOUSE
function selectHouse(house){
	let ai = (cur_profile.ascIndex + (house-1)) % 12;
	console.log(ai)
	document.getElementById("zodiac_sym").innerHTML = zodiac_sym[ai];
	document.getElementById("zodiac_img").src = "HelloKitty_Zodiac/" + zodiacs[ai] + ".gif"
	document.getElementById("music_key_sym").innerHTML = music_notes[ai];
	document.getElementById("house_desc").innerHTML = (house + suffix[house-1] + " House - " + house_descriptions[house-1])
	localStorage.lastHouse = house;
	showHousePlaylist(house);
}

// ADD A SONG TO THE HOUSE PLAYLIST
function addSongToProfile(){
	let new_song = songSearchList[curSelSearchSong];
	let key = new_song.key.replace("m","")
	let house = getHousebyKey(key)
	cur_profile.playlistSet[house].songList.push(new_song);
	document.getElementById("status").innerHTML = "[ " + new_song.song_name + " ] added to " + house + suffix[house-1] + " house (" + getSign(key) + ") playlist!"

	if(localStorage.lastHouse == house)
		showHousePlaylist(house);
	
	saveProfile();
}

// SHOW THE LIST OF SONGS UNDER THE HOUSE
function showHousePlaylist(house){
	let songs = cur_profile.playlistSet[house].songList;
	let playlistDiv = document.getElementById("playlist");
	playlistDiv.innerHTML = "";
	for(let s=0;s<songs.length;s++){
		let se = songs[s];
		let row = document.createElement("div")
		row.classList.add("row");
		row.classList.add("playlist_entry");

		//order in list
		let c1 = document.createElement("div");
		c1.classList.add("col-xs-1");
		c1.innerHTML = s+1;
		row.appendChild(c1);

		//song name
		let c2 = document.createElement("div");
		c2.classList.add("col-xs-5");
		c2.innerHTML = se.song_name;
		row.appendChild(c2);

		//artist
		let c3 = document.createElement("div");
		c3.classList.add("col-xs-4");
		c3.innerHTML = se.artist;
		row.appendChild(c3);

		//time
		let c4 = document.createElement("div");
		c4.classList.add("col-xs-2");
		c4.innerHTML = se.duration;
		row.appendChild(c4);

		//put it all together
		row.value = s;
		row.onclick = function(){selectPlaylistSong(s)}
		playlistDiv.appendChild(row);
	}
	curPlaylist = {"house":house,"index":-1,"song":null};
}

//select a song to play from the playlist
function selectPlaylistSong(i){
	let playlist = cur_profile.playlistSet[curPlaylist["house"]];
	curPlaylist["index"] = i;
	curPlaylist["song"] = playlist.songList[i];

	//show selected
	let song_entries = document.getElementsByClassName("playlist_entry");
	for(let p=0;p<song_entries.length;p++){
		song_entries[p].classList.remove("played_entry")
		if(p == i)
			song_entries[p].classList.add("played_entry")
	}

	//set the iframe to the currently selected song
	let spotifyFrame = document.getElementById("spotifyFrame");
	spotifyFrame.src = curPlaylist["song"].url.replace("https://open.spotify.com/track/","https://open.spotify.com/embed/track/") + "?utm_source=generator";
}

// PLAY THE NEXT SONG ON THE QUEUE
function playNextSong(){
	let curPlaySong = document.getElementsByClassName("played_entry");
	let index = 0;
	if (curPlaySong.length == 0)
		index = 0;
	else
		index = curPlaySong[0].value + 1
	selectPlaylistSong(index)
}

// REMOVE CURRENT SONG FROM THE PLAYLIST
function deleteSong(){
	let index = curPlaylist["index"];
	if(index >= 0 && confirm("Remove " + curPlaylist['song'].song_name + " from " + curPlaylist['house']  + " playlist?")){
		cur_profile.playlistSet[curPlaylist["house"]].songList.splice(index,1);
		document.getElementsByClassName("played_entry")[0].remove();
		saveProfile();
	}
	
}

// SHUFFLE AN ARRAY
function shuffle(array){
	for (let i = array.length - 1; i > 0; i--) {
	    const j = Math.floor(Math.random() * (i + 1));
	    const temp = array[i];
	    array[i] = array[j];
	    array[j] = temp;
	}
 	return array
}

// SHUFFLE THE CURRENT PLAYLIST SONGS
function shufflePlaylist(){
	let playlist = cur_profile.playlistSet[curPlaylist["house"]].songList;
	cur_profile.playlistSet[curPlaylist["house"]].songList = shuffle(playlist)
	saveProfile();
	showHousePlaylist(curPlaylist["house"]);
	console.log("playlist shuffled!")
}

// SHOW THE STARTUP SCREEN
function showStartup(){
	document.getElementById("mainPage").style.display = "none";
	document.getElementById("startPage").style.display = "block";

	document.body.style.background = "url(http://www.zingerbugimages.com/backgrounds/purple_satin_love_bats.gif)";
	console.log("startup")
}

// SHOW THE MAIN SCREEN
function showMain(){
	document.getElementById("returnMain").style.display = "block";
	document.getElementById("startPage").style.display = "none";
	document.getElementById("mainPage").style.display = "block";
	addProfileNames();
	generateHouses();

	document.body.style.background = "url('bg.jpeg') no-repeat center center";
	document.body.style.backgroundSize = "100% 100%"
	console.log("main")
}

//search the song
window.addEventListener("keypress", function(e){
	let q = document.getElementById("song_input").value;
	if(e.keyCode == 13 && q != ""){
		console.log("searching shortcut!")
		searchSong(q);
	}
})