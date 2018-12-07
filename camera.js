var camera = {
	pos: [0,0,0],
	dir: [1, 0, 0], //points in the direction of the vector
	rightDir: function() {return norm([this.dir[1], -1*this.dir[0], 0]);}, //projects to the xy plane, then rotates 90 degrees
	upDir: function() {return cross(this.rightDir(), this.dir);},
	roll: 0, //dir should only change pitch and yaw
	fov: 1.3, //75 degrees
	turn: function(t){
		this.dir = rotateAround(this.dir, [0,0,-1], t);
	},
	pitch: function(t){
		//this is weird. don't understand it so i won't try it.
		//Rodrigues Formula
		//this.dir = add(add(prod(this.dir, Math.cos(t)), prod(this.upDir(), Math.sin(t))), prod(this.dir, dot(this.dir, this.rightDir())*(1-Math.cos(t))));
		this.dir = rotateAround(this.dir, this.rightDir(), t);
		norm(this.dir);

	},
	step: function(x){
		//move forwards along the direction vector by x
		this.pos = add(this.pos, prod(this.dir, x));
	},
	strafe: function(x){ //strafe to the right some amount x
		this.pos = add(this.pos, prod(this.rightDir(), x));
	},
	fly: function(x){ //move directly upwards by some amount x
		this.pos = add(this.pos, [0,0,x]);
	},
	turnAroundOrigin: function(t, v){
		this.dir = rotateAround(this.dir, v, t);
		this.pos = rotateAround(this.pos, v, t);
	}
};

function getRenderPosition(point, w, h){ //returns null if point isn't in bounds, or a pair of points for screen location if it is.
	const aspect = h/w;
	var relativePoint = sub(point, camera.pos); //relative to camera
	var farOut = scalarProj(relativePoint, camera.dir); //how far out the point is I guess, like how far it is in the direction of the camera forwards vector
	var catchWidth = farOut*Math.tan(camera.fov/2); //from center to edge, HALF the width of the screen
	var catchHeight = catchWidth * aspect;
	var farRight = scalarProj(relativePoint, camera.rightDir());
	var farUp = scalarProj(relativePoint, camera.upDir());

	// if(Math.abs(farRight)>catchWidth || Math.abs(farUp)>catchHeight){
	// 	return //not in bounds, don't render. Otherwise, continue
	// }
	if(farOut<0) return; //if the point is behind the camera? i guess

	var xRender = (w/2) + ((w/2) * farRight / catchWidth);
	var yRender = (h/2) - ((h/2) * farUp / catchHeight);
	return [xRender, yRender];

}

function getDistance(point){
	return Math.sqrt(Math.pow(point[0]-camera.pos[0], 2) + Math.pow(point[1]-camera.pos[1], 2) + Math.pow(point[2]-camera.pos[2], 2)); //pythagoras
}

//dumb vector functions

function add(v1, v2){ //add two vectors
	var ret = new Array(v1.length);
	for (var i = 0; i < v1.length; i++) {
		ret[i] = v1[i] + v2[i];
	}
	return ret;
}

function sub(v1, v2){ //subtract two vectors
	var ret = new Array(v1.length);
	for (var i = 0; i < v1.length; i++) {
		ret[i] = v1[i] - v2[i];
	}
	return ret;
}

function div(v1, c){ //divides by a constant
	var ret = new Array(v1.length);
	for (var i = 0; i < v1.length; i++) {
		ret[i] = v1[i] / c;
	}
	return ret;
}

function prod(v1, c){
	var ret = new Array(v1.length);
	for (var i = 0; i < v1.length; i++) {
		ret[i] = v1[i] * c;
	}
	return ret;
}

function dot(v1, v2){ //subtract two vectors
	var dot = 0;
	for (var i = 0; i < v1.length; i++) {
		dot += v1[i] * v2[i];
	}
	return dot;
}

function cross(v1, v2){ //cross product of two 3-vectors
	var xr = (v1[1]*v2[2]) - (v1[2]*v2[1]);
	var yr = (v1[2]*v2[0]) - (v1[0]*v2[2]);
	var zr = (v1[0]*v2[1]) - (v1[1]*v2[0]);
	return [xr,yr,zr];
}

function mag(v){ //vector magnitude
	var sum = 0;
	for (var i = 0; i < v.length; i++) {
		sum += Math.pow(v[i], 2); //
	}
	return Math.sqrt(sum); //generalized Pythagorean Theorem
}

function norm(v){ //norms
	return div(v, mag(v));
}

function scalarProj(v1, v2){ //scalar projection of v1 onto v2
	return dot(v1, div(v2, mag(v2)));
}

function angleBetween(v1, v2){
	return Math.acos(dot(v1, v2)/(mag(v1)*mag(v2)));
}

function rotateAround(v, axis, angle){ //Rodrigues' Method
	return add(
		add(
			prod(
				v, Math.cos(angle)), 
			prod(
				cross(axis, v), Math.sin(angle))), 
		prod(
			axis, dot(axis, v) * (1-Math.cos(angle))));
}