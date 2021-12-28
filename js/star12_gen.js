// Code by Milk
// Inspired by mandala output from https://github.com/seecee96/12-tone-mandala


//import canvas to draw on
var canvas = document.getElementById("star12");
var ctx = canvas.getContext('2d')
canvas.width = 640;
canvas.height = 640;

//hardcoded notes and zodiac signs
var points = {}

let flat='\u{266d}'
var music_notes = ['C','G','D','A','E','B','G'+flat,'D'+flat,'A'+flat,'E'+flat,'B'+flat,'F']
var zodiacs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Pisces']
var zodiac_sym = ['\u{2648}','\u{2649}','\u{264A}','\u{264B}','\u{264C}','\u{264D}','\u{264E}','\u{264F}','\u{2650}','\u{2651}','\u{2652}','\u{2653}']

var connections = {}

// INITIALIZING FUNCTION 
function init(){
	//initialize points
	for(let i=0;i<12;i++){
		points[i] = {'note':music_notes[i],'sign':zodiacs[i],'symb':zodiac_sym[i]};
	}
	
	//connect the points based on music theory
	connect();

	//try to draw it
	drawStar12(15);
}


// CREATE THE 12 SIDED STAR FOR THE NOTES AND THE ZODIACS
function connect(){

	//perfect fifth/fourth (+1)
	addCon('p5p4',1);

	//major 2nd/minor 7th (+2)
	addCon('maj2min7',2);

	//minor 3rd/major 6th (+3)
	addCon('min3maj6',3);

	//major 3rd/minor 6th (+4)
	addCon('maj3min6',4);

	//minor 2nd/major 7th (+5)
	addCon('min2maj7',5);

	//tritone (+6)
	addCon('tritone',6);
}


// ADD CONNECTIONS AROUND ENTIRE WHEEL
function addCon(note_type,add){
	connections[note_type] = [];
	let n = (note_type == "tritone" ? 6 : music_notes.length); //two on each side except for tritones (direct match)
	for(let i=0;i<n;i++){
		let c=[i,(i+add)%12];
		connections[note_type].push(c);
	}
}

// CONVERT DEGREES TO RADIANS
function deg2rad(a){return a*(Math.PI/180)}

// CONVERT ANGLE TO COORDINATES
function deg2Pos(a,d=1){return [d*Math.cos(deg2rad(a)),d*Math.sin(deg2rad(a))]}

// DRAW THE 12 SIDED MANDALA STAR AND SHOW THE ZODIAC AND MUSIC NOTES
function drawStar12(offset=0){
	//center
	let cx = canvas.width/2;
	let cy = canvas.height/2;


	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0,canvas.width,canvas.height);

	//draw labels all around
	ctx.fillStyle = "#ffffff";
	ctx.font = "24px Arial"
	ctx.textAlign = "center"
	let a = 0+offset-90;
	let r = 200;
	let basePos = {}
	for(let i=0;i<12;i++){
		let labels = [points[i]['note'],points[i]['symb']]
		for(let j=0;j<labels.length;j++){
			let p = deg2Pos(a,r+(j*40));
			let x=p[0]
			let y=p[1]

			ctx.fillText(labels[j],cx+x,cy+y)
		}

		//save position of base
		let p = deg2Pos(a,r-20);
		let x=p[0]
		let y=p[1]-10

		basePos[i] = {'x':x,'y':y};

		a+=30  //add 30 degrees around the circle
		a%=360
	}

	//draw connections (use rainbow for each segment group)
	let conn = ['p5p4','maj2min7','min3maj6','maj3min6','min2maj7','tritone']
	let colors = ['#ff0000', '#ff7800', '#ffff00', '#00ff00', '#0079ff', '#a600ae']

	for(let k=0;k<conn.length;k++){
		ctx.strokeStyle = colors[k]
		let s=connections[conn[k]];

		//draw each line
		for(let m=0;m<s.length;m++){

			let b1 = basePos[s[m][0]];
			let b2 = basePos[s[m][1]];
			console.log(s)

			ctx.beginPath()
			ctx.moveTo(b1['x']+cx,b1['y']+cy);
			ctx.lineTo(b2['x']+cx,b2['y']+cy);
			ctx.stroke()
		}	
	}


}

