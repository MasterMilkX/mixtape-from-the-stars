let flat='\u{266d}'
let sharp='#'
var music_notes = ['C','G','D','A','E','B','F'+sharp,'C'+sharp,'A'+flat,'E'+flat,'B'+flat,'F']
var zodiacs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn',"Aquarius",'Pisces']
var zodiac_sym = ['\u{2648}','\u{2649}','\u{264A}','\u{264B}','\u{264C}','\u{264D}','\u{264E}','\u{264F}','\u{2650}','\u{2651}','\u{2652}','\u{2653}']
var suffix = ['st','nd','rd','th','th','th','th','th','th','th','th','th']
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

function Song(song_name,artist,stime,key){
	this.song_name = song_name;
	this.artist = artist;
	this.song_time = stime;
	this.song_key = key;
}

///////       INTERACTION FUNCTIONS      //////////


// INITIALIZING FUNCTION FOR THE WEB APP
function init(){
	ascendantDropdown()

	//import the lasty profile if available
	if(localStorage.lastUser){
		cur_profile = JSON.parse(localStorage.lastUser)
		showMain();
	}
	//create a new user
	else{
		document.getElementById("returnMain").style.display = "none";
		showStartup();
		//selectHouse(1);
	}
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
	localStorage.lastUser = JSON.stringify(cur_profile);
	localStorage.lastHouse = 1;
	localStorage.allUsers = JSON.stringify(allUsers);
}

// STORES THE CURRENT PROFILE AS A JSON OBJECT IN THE BROWSER FOR ACCESS LATER
function saveProfile(){
	let allProfiles = {}
	//create new profile storer
	if(!localStorage.allProfiles){
		localStorage.setItem('allProfiles',JSON.stringify(allProfiles));
	}
	//import the previous
	else{
		allProfiles = JSON.parse(localStorage.getItem('allProfiles'));
	}

	//save the current profile
	allProfiles[cur_profile.profileName] = cur_profile

	//update the storage
	localStorage.setItem('allProfiles',JSON.stringify(allProfiles));
}

// SWITCH TO ANOTHER PROFILE
function switchProfile(pname){
	let allProfiles = JSON.parse(localStorage.getItem('allProfiles'));
	cur_profile = allProfiles[pname];
	localStorage.lastUser = JSON.stringify(cur_profile);
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
	for(let i=0;i<12;i++){
		let sign = zodiacs[(cur_profile.ascIndex + i) % 12];
		let item = document.createElement("option");
		item.value = (i+1);
		if(lh == i+1){item.selected = true;}
		item.innerHTML = sign;
		houseDD.appendChild(item)
	}

}

// SELECT THE HOUSE AND SHOW THE PLAYLIST FOR THE ASSOCIATED HOUSE
function selectHouse(house){
	let ai = (cur_profile.ascIndex + house-1) % 12;
	document.getElementById("zodiac_sym").innerHTML = zodiac_sym[ai];
	document.getElementById("music_key_sym").innerHTML = music_notes[ai];
	document.getElementById("house_desc").innerHTML = (house + suffix[house-1] + " House - " + house_descriptions[house-1])
	localStorage.lastHouse = house;
	showHousePlaylist(house);
}

// ADD A SONG TO THE HOUSE PLAYLIST
function addSongToProfile(sname,artist,stime,key){
	let new_song = new Song(sname,artist,stime,key);
	cur_profile.playlistSet[key].append(new_song);
	showHousePlaylist();
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
		row.classList.add("row playlist_entry");

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
		c4.innerHTML = se.song_time;
		row.appendChild(c4);

		//put it all together
		playlistDiv.appendChild(row);
	}
}




// SHOW THE STARTUP SCREEN
function showStartup(){
	document.getElementById("mainPage").style.display = "none";
	document.getElementById("startPage").style.display = "block";
}

// SHOW THE MAIN SCREEN
function showMain(){
	document.getElementById("returnMain").style.display = "block";
	document.getElementById("startPage").style.display = "none";
	document.getElementById("mainPage").style.display = "block";
	addProfileNames();
	generateHouses();
}