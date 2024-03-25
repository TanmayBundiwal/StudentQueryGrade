document.getElementById("Search1").addEventListener("click", function (){
	let userInput1 = document.getElementById("DeptName");
	let Inputint = userInput1.options[userInput1.selectedIndex].value;
	console.log(userInput1);
	let Input1 = String(Inputint);
	console.log(Input1);
	let Query1 = {
		"WHERE": {
			"IS": {
				"courses_dept": Input1
			}
		},
		"OPTIONS": {
			"COLUMNS": [
				"courses_title",
				"courses_id",
				"courses_year"
			]
		}
	};
	let req = new XMLHttpRequest();
	let url1 = "http://localhost:4321/query";
	req.open("POST", url1, true);
	req.setRequestHeader("Content-Type", "application/json");

	req.send(JSON.stringify(Query1));

	req.onload = function (){
		// Disclaimer: Took a bit of code from this youtube video: https://www.youtube.com/watch?v=0WAqNYGrUGM
		let Result1 = JSON.parse(req.response).result;
		if(req.status === 200){
			document.getElementById("Table1").style.display="block";
			let Table1 = "";
			for(let i in Result1){
				Table1 += '<tr>' +
								'<td>' + Result1[i]["courses_title"] + '</td>' +
								'<td>' + Result1[i]["courses_id"] + '</td>' +
								'<td>' + Result1[i]["courses_year"] + '</td>' +
								'</tr>';
			}
			document.getElementById("TableDisplay1").innerHTML=Table1;
		}else{
			document.getElementById("Display1").innerHTML = "Error occurred";
		}
	}
});

document.getElementById("Search2").addEventListener("click", function (){
	let userInput2 = document.getElementById("ProfName").value;
	let Input2 = String(userInput2);
	let Query2 = {
		"WHERE": {
			"IS": {
				"courses_instructor": Input2
			}
		},
		"OPTIONS": {
			"COLUMNS": [
				"courses_title",
				"courses_dept",
				"courses_id"
			]
		}
	};
	let url2 = "http://localhost:4321/query";
	let req = new XMLHttpRequest();
	req.open("POST", url2, true);
	req.setRequestHeader("Content-Type", "application/json");
	req.send(JSON.stringify(Query2));

	req.onload = function (){
		let Result2 = JSON.parse(req.response).result;
		if(req.status === 200){
			document.getElementById("Table2").style.display="block";
			// Disclaimer: Took a bit of code from this youtube video: https://www.youtube.com/watch?v=0WAqNYGrUGM
			let Table2 = "";
			for(let i in Result2){
				Table2 += '<tr>' +
					'<td>' + Result2[i]["courses_title"] + '</td>' +
					'<td>' + Result2[i]["courses_dept"] + '</td>' +
					'<td>' + Result2[i]["courses_id"] + '</td>' +
					'</tr>';
			}
			if(!isNaN(Input2)){
				document.getElementById("Table2").style.display="none";
				document.getElementById("Display2").style.display="block";
				document.getElementById("Display2").innerHTML ="instructor must contain characters other than just numbers";
			}else{
				document.getElementById("Display2").style.display="none";
				document.getElementById("TableDisplay2").innerHTML=Table2;
			}
		}else{
			document.getElementById("Table2").style.display="none";
			document.getElementById("Display2").style.display="block";
			document.getElementById("Display2").innerHTML = "Error occurred";
		}
	}
});
