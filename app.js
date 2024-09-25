const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

let IDEAL_FPS = 60;
let FPS = 60;

let dots = [];
let speed = 10;
let nDots = 100;
let size = 10;

function genHexString(len) {
	const hex = "0123456789ABCDEF";
	let output = "";
	for (let i = 0; i < len; ++i) {
		output += hex.charAt(Math.floor(Math.random() * hex.length));
	}
	return output;
}

class Dot {
	constructor(x, y, size, speed) {
		this.x = x;
		this.y = y;
		this.size = size;
		this.vx = Math.cos(speed);
		this.vy = Math.sin(speed);
		this.color = "#" + genHexString(6);
	}

	update() {
		// keep in bounds
		if (this.x > width || this.x < 0) {
			this.vx *= -1;
		}
		if (this.y > height || this.y < 0) {
			this.vy *= -1;
		}

		this.x += this.vx;
		this.y += this.vy;
	}
}

for (let i = 0; i < nDots; i++) {
	dots.push(
		new Dot(
			Math.random() * width,
			Math.random() * height,
			Math.random() * size,
			Math.random() * speed
		)
	);
}

// get values from input
document.getElementById("nDots").oninput = function () {
	nDots = this.value;
	const oldDots = dots;
	dots = [];
	for (let i = 0; i < nDots; i++) {
		if (i < oldDots.length) {
			dots.push(oldDots[i]);
		} else {
			dots.push(
				new Dot(
					Math.random() * width,
					Math.random() * height,
					Math.random() * size,
					Math.random() * speed
				)
			);
		}
	}
};

document.getElementById("speed").oninput = function () {
	const oldSpeed = speed;
	speed = this.value;
	// update speed of all dots
	dots.forEach((dot) => {
		dot.vx = (dot.vx / oldSpeed) * speed;
		dot.vy = (dot.vy / oldSpeed) * speed;
	});
};

document.getElementById("size").oninput = function () {
	const oldSize = size;
	size = this.value;
	// update size of all dots
	dots.forEach((dot) => {
		dot.size = (dot.size / oldSize) * size;
	});
};

// split the window into 100px x 100px squares to make it easier to search dots
let grid = [];

for (let i = 0; i < width / 100; i++) {
	grid.push([]);
	for (let j = 0; j < height / 100; j++) {
		grid[i].push([]);
	}
}

function updateGrid() {
	for (let i = 0; i < width / 100; i++) {
		for (let j = 0; j < height / 100; j++) {
			grid[i][j] = [];
		}
	}

	dots.forEach((dot) => {
		const x = Math.max(0, Math.floor(dot.x / 100));
		const y = Math.max(0, Math.floor(dot.y / 100));
		grid[x][y].push(dot);
	});
}

function draw() {
	ctx.clearRect(0, 0, width, height);

	for (let i = 0; i < nDots; i++) {
		const p = dots[i];
		p.update();

		// draw dot
		ctx.fillStyle = p.color;
		ctx.globalAlpha = 1;
		ctx.beginPath();
		ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
		ctx.fill();

		const x = Math.max(0, Math.floor(p.x / 100));
		const y = Math.max(0, Math.floor(p.y / 100));

		// draw lines between this and other dots, search only the 8 neighbors
		const xMin = Math.max(0, x - 1);
		const xMax = Math.min(width / 100 - 1, x + 1);
		const yMin = Math.max(0, y - 1);
		const yMax = Math.min(height / 100 - 1, y + 1);
		for (let i = xMin; i <= xMax; i++) {
			for (let j = yMin; j <= yMax; j++) {
				const neighbors = grid[i][j];
				for (let k = 0; k < neighbors.length; k++) {
					const q = neighbors[k];
					if (p !== q) {
						const dx = p.x - q.x;
						const dy = p.y - q.y;
						const dist = Math.sqrt(dx * dx + dy * dy);
						if (dist < 100) {
							// change opacity based on distance
							ctx.globalAlpha = 1 - dist / 100;

							ctx.beginPath();
							ctx.moveTo(p.x, p.y);
							ctx.lineTo(q.x, q.y);
							ctx.stroke();
						}
					}
				}
			}
		}
	}

	updateGrid();
}

let lastTime = 0;
let i = 0;

function updateFrameRate() {
	const now = performance.now();
	const elapsed = now - lastTime;
	lastTime = now;

	const fps = 1000 / elapsed;

	if (fps < IDEAL_FPS - 1) {
		FPS++;
	} else if (fps > IDEAL_FPS + 1) {
		FPS--;
	}

	i++;
	if (i > FPS / 2) {
		i = 0;
		document.getElementById("fps").innerText = fps.toFixed(2);
		if (fps < IDEAL_FPS) {
			document.getElementById("fps").style.color = "red";
		} else {
			document.getElementById("fps").style.color = "black";
		}
	}
}

function update() {
	draw();
	updateFrameRate();
	// requestAnimationFrame(update);
	setTimeout(update, 1000 / FPS);
}

update();
