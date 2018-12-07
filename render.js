c = document.getElementById("render");
ctx = c.getContext('2d');

fovSlider = document.getElementById("fovslider");
sizeSlider = document.getElementById("sizeslider");
mouseCheckbox = document.getElementById("mouseCheckbox");
functionBox = document.getElementById("functionbox");
//plotButton = document.getElementById("plotbutton");

//const pointSet = [[2, 1, 0],[2,-1,0], [3, -1, 0], [1, -1, 0], [2, 1, 1], [0,0,-2], [0, 0, 2]];// some training points
//const pointLocs = [[1,1,1], [-1,1,1], [1,-1,1], [-1,-1,1], [1,1,-1],[-1,1,-1], [1,-1,-1], [-1,-1,-1]]; //corners of a cube

var pointLocs = []; //set with plotFunction
var pointSet = [];
var tableRows = [];

const deltaTime=1000/30;
const scale = 20;
const mouseSpeed = 0.01;
const pointColor = "green";
const selectedColor = "red";

var pointSize = 1;

var keys = [];
var selectBoxes = [];
var mouseX = 0;
var mouseY = 0;
var mouseControls = false;

var xMin = -2;
var xMax = 2;
var yMin = -2;
var yMax = 2;
var dX = 0.05;
var dY = 0.05;
var graphedFunction = function(x,y){
	//return Math.sin(4*x)*Math.cos(4*y);
	//return 5*Math.pow(Math.E, -1*(Math.pow(x,2)+Math.pow(y,2)));
	//return Math.sqrt(1-Math.pow(x,2)-Math.pow(y,2));
	//return Math.random();
	//return (y*Math.pow(x,2)) / (Math.pow(x,4) + Math.pow(y,2));
	let funcString = functionBox.value;
	return math.eval(funcString, {x: x, y: y});
}

function Point(x,y,z) {
	this.pos = [x,y,z];
	this.selected = false;
	this.renderedPos = [];
	//this.size = 1;
}

window.addEventListener("keydown", function (e) {
	keys[e.keyCode] = true;
});
window.addEventListener("keyup", function (e) {
	keys[e.keyCode] = false;
});
window.addEventListener("mousemove", function (e) {
	if(document.pointerLockElement == c){ //pointer is locked to
		var xDiff = e.movementX;//e.clientX - mouseX;
		var yDiff = e.movementY;//e.clientY - mouseY;
		mouseX = e.clientX;
		mouseY = e.clientY;
		camera.turn(xDiff * mouseSpeed);
		camera.pitch(-1* yDiff * mouseSpeed);
	}
})

init();

function init(){
	//this line moves the triples array in pointLocs into what actually gets parsed, the array of Point objects in pointSet.
	// for (var i = 0; i < pointLocs.length; i++) {
	// 	pointSet[i] = new Point(pointLocs[i][0],pointLocs[i][1],pointLocs[i][2]);
	// }
	updatePlot();
	window.requestAnimationFrame(loop);
}

function updatePlot(){
	pointSet = plotFunction(xMin,xMax,yMin,yMax,dX,dY,graphedFunction);
}

function loop(){
	if(document.pointerLockElement == c){
		keyEvents();
	}
	pageEvents();
	clear();
	renderScene(pointSet);
	connectPoints(pointSet);

	window.setTimeout(window.requestAnimationFrame(loop), 1000*deltaTime);
}

function keyEvents(){
	if(keys[37]){ //left
		camera.turn(-0.03);
	}
	if(keys[39]){ //right
		camera.turn(0.03);
	}
	if(keys[38]){ //up
		camera.pitch(0.03);
	}
	if(keys[40]){ //down
		camera.pitch(-0.03);
	}
	if(keys[32]){ //space
		camera.fly(0.03);
	}
	if(keys[16]){ //shift
		camera.fly(-0.03);
	}
	if(keys[87]){ //w
		camera.step(0.03);
	}
	if(keys[83]){ //s
		camera.step(-0.03);
	}
	if(keys[68]){ //d
		console.log('d');
		camera.strafe(0.03);
	}
	if(keys[65]){ //a
		camera.strafe(-0.03);
	}


	if(keys[74]){ //j
		camera.turnAroundOrigin(0.02, [0,0,1]);
	}
	if(keys[76]){ //l
		camera.turnAroundOrigin(-0.02, [0,0,1]);
	}

	if(keys[75]){ //k
		camera.turnAroundOrigin(-0.02, camera.rightDir());
	}
	if(keys[73]){ //i
		camera.turnAroundOrigin(0.02, camera.rightDir());
	}
}

function pageEvents(){
	camera.fov = fovSlider.value * Math.PI / 180;
	pointSize = sizeSlider.value / 100;
}

c.addEventListener("click", function() {
	c.requestPointerLock();
});

//"legacy", returns a 1d list not 2d
function plotFunctionList(xmin, xmax, ymin, ymax, dx, dy, f){
	let xlength = Math.floor((xmax-xmin)/dx);
	let ylength = Math.floor((ymax-ymin)/dy);
	let d = [];
	for (var x = xmin; x <= xmax; x+=dx) {
		for (var y = ymin; y < ymax; y+=dy) {
			z = f(x,y);
			d.push(new Point(x,y,z));
		}
	}
	return d; //just a list of the points
}

function plotFunction(xmin, xmax, ymin, ymax, dx, dy, f){
	let xlength = Math.floor((xmax-xmin)/dx);
	let ylength = Math.floor((ymax-ymin)/dy);
	let d = [];
	let i=0;
	for (var x = xmin; x <= xmax; x+=dx) {
		let j=0;
		d[i] = []; //now it's 2d
		for (var y = ymin; y < ymax; y+=dy) {
			z = f(x,y);
			d[i][j] = new Point(x,y,z);
			j++;
		}
		i++;
	}
	return d; //2d array of the points
}

function renderScene(points){
	for (var i = 0; i < points.length; i++) {
		for (var j = 0; j < points[0].length; j++) {
			var xy = getRenderPosition(points[i][j].pos, c.width, c.height);
			var s = scale/getDistance(points[i][j].pos) * pointSize; //inverse
			//console.log(s);
			if(xy){
				var thisColor = pointColor;
				if(points[i].selected) thisColor = selectedColor;
				drawPoint(xy[0], xy[1], s, thisColor); //25 size for now
				points[i][j].renderedPos = xy;
			}
			else{
				points[i][j].renderedPos = null;
			}
		}
	}
}

function connectPoints(points){
	ctx.lineWidth = 1;
	ctx.strokeStyle = "green";
	for (var i = 0; i < points.length-1; i++) {
		for (var j = 0; j < points.length-1; j++) {
			let thisPoint = points[i][j];
			let downPoint = points[i][j+1];
			let rightPoint = points[i+1][j];
			if(thisPoint.renderedPos && downPoint.renderedPos && rightPoint.renderedPos){
				ctx.beginPath();
				ctx.moveTo(rightPoint.renderedPos[0], rightPoint.renderedPos[1]);
				ctx.lineTo(thisPoint.renderedPos[0], thisPoint.renderedPos[1]);
				ctx.lineTo(downPoint.renderedPos[0], downPoint.renderedPos[1]);

				//ctx.closePath();
				ctx.stroke();
				//ctx.fill();
			}
		}
	}
}

function generateField(n){ //generates a field of (2n)^3 points
	var field = []
	for (var i = -n; i <= n; i+=2) {
		for (var j = -n; j <= n; j+=2) {
			for (var k = -n; k <= n; k+=2) {
				field.push([i,j,k]);
			}
		}
	}
	return field;
}

function drawPoint(x, y, s, c){
	ctx.beginPath();
	ctx.arc(x, y, s, 0, 2*Math.PI);
	ctx.closePath();
	ctx.fillStyle = c;
	ctx.fill();
}

function clear(){
	oldStyle = ctx.fillStyle;
	ctx.fillStyle = "black"; //background color
	ctx.fillRect(0,0,c.width,c.height);
	ctx.fillStyle = oldStyle;
}