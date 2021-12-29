
//options to add
var zodiacs = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn',"Aquarius",'Pisces']
var planets = ['Sun','Moon','Rising','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','N. Node','Chiron']
var planet_symb = ['\u{2609}', '\u{263d}', 'AC', '\u{263f}', '\u{2640}', '\u{2642}', '\u{2643}', '\u{2644}', '\u{2645}', '\u{2646}', '\u{2647}', '\u{260A}','\u{26b7}']

var planet_rows = []

// CREATE DROPDOWN MENUS TO MANUALLY PUT IN PLANET SIGNS
function manual_input(){
	let input_div = document.getElementById("select_menu");

	for(let p=0;p<planets.length;p++){
		let row = document.createElement("div");
		row.classList.add("select_row")

		//name of planet
		let col1 = document.createElement("div");
		col1.classList.add("planet_name")
		col1.innerHTML = (planets[p] + " ( " + planet_symb[p] + " )");
		//col1.innerHTML = planets[p]

		//dropdown for zodiac sign
		let col2 = document.createElement("div");
		col2.classList.add("zodiac_select")
		let dropdown = document.createElement('select');

		for(let z=0;z<zodiacs.length;z++){
			let o = document.createElement("option");
			o.innerHTML = zodiacs[z];
			o.value = zodiacs[z];
			dropdown.appendChild(o);
		}

		//add default
		let o2 = document.createElement("option");
		o2.innerHTML = "-";
		o2.value = "-";
		dropdown.append(o2)
		dropdown.selectedIndex = zodiacs.length; //the default option

		col2.appendChild(dropdown)

		//add all to row
		row.appendChild(col1);
		row.appendChild(col2);
		planet_rows.push(row)

		//add row to div
		input_div.appendChild(row);
	}
}

// SHOW ALL OF THE PLANET DROPDOWNS
function showAllPlanets(){
	for(let i=0;i<planet_rows.length;i++){
		planet_rows[i].style.visibility = "visible";
	}
}

// CHANGE THE VIEW OF THE PLANETS
function changeView(v){
	showAllPlanets();
	if(v == 'basic'){
		for(let i=3;i<planets.length;i++){
			planet_rows[i].style.visibility = "hidden";
		}
	}else if(v == 'personal'){
		for(let i=8;i<planets.length;i++){
			planet_rows[i].style.visibility = "hidden";
		}
	}
}

//resets the dropdown values and the 12-point star
function resetChart(){
	if(!confirm("Are you sure you want to reset your chart?")){return;}

	for(let r=0;r<planet_rows.length;r++){
		planet_rows[r].getElementsByTagName("select")[0].value = "-";
	}

	bcPlanets = [];
	bcCon = {};
	localStorage.removeItem('saved_planets');
	drawStar12();
}
