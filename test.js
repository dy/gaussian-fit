require('enable-mobile')
const fit = require('./')
const assert = require('assert')
const css = require('insert-styles')
const createPlot = require('../gl-component')
const colormap = require('colormap')
const norm = require('normal-pdf')
const τ = Math.PI * 2;
const raf = require('raf')

//UI
css(`
	body {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		cursor: crosshair;
	}

	.auto {
		display: none;
		cursor: pointer;
		z-index: 1;
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		font-size: .9rem;
		letter-spacing: .05ex;
		font-weight: 700;
		-webkit-appearance: none;
		appearance: none;
		background: none;
		text-transform: uppercase;
		border: none;
		padding: 0;
		border-bottom: 2px solid rgba(0,0,0,.1);
	}
	.auto:hover, .auto:active {
		border-bottom-color: rgba(0,0,0,.9);
	}

	.link {
		text-decoration: none;
		cursor: pointer;
		z-index: 1;
		position: absolute;
		top: 1rem;
		left: 1rem;
		font-size: .9rem;
		letter-spacing: .05ex;
		font-weight: 700;
		-webkit-appearance: none;
		appearance: none;
		background: none;
		text-transform: uppercase;
		border: none;
		padding: 0;
		color: rgb(0,0,0);
		border-bottom: 2px solid rgba(0,0,0,.15);
	}
	.link:hover, .link:active {
		border-bottom-color: rgba(0,0,0,.9);
	}
`)


let autoButton = document.body.appendChild(document.createElement('button'))
autoButton.classList.add('auto')
autoButton.innerHTML = 'autofit'
// autoButton.onclick = (e => autoFit())

let link = document.body.appendChild(document.createElement('a'))
link.classList.add('link')
link.innerHTML = 'EM'
link.title = 'Expectation maximization on github'
link.href='https://github.com/dfcreative/gaussian-fit'


document.addEventListener('click', e => {
	addComponent(e.clientX, e.clientY)
})
document.body.addEventListener('touchstart', e => {
	addComponent(e.touches[0].clientX, e.touches[0].clientY)
})


//main render plot
let plot = createPlot({
	autostart: false,
	draw: (gl, vp, data) => {
		if (!data) return;
		let {points, color} = data;

		plot.setAttribute('position', points);
		plot.setUniform('color', color);
		gl.drawArrays(gl.LINE_STRIP, 0, points.length/2);
	},
	vert: `
		attribute vec2 position;
		void main () {
			gl_Position = vec4(position.x*2. - 1., position.y*2. - 1., 0, 1);
		}
	`,
	frag: `
		precision mediump float;

		uniform vec4 color;

		void main(void) {
			gl_FragColor = color;
		}
	`
})




//init app

//default color set
let colors = colormap({
	colormap: 'rainbow-soft',
	nshades: 100,
	format: 'rgb'
}).map(([r,g,b,a]) => [r/255,g/255,b/255,a])


//get data
let N = 128;
let samples = generateData(N);

//initialize single-fit
let components = [{weight: .5, mean: .5, variance: .1}]

raf(function frame () {
	components = fit(samples, {
		components: components,
		maxIterations: 1
	})

	update(samples, components)

	raf(frame)
})



//API
function update (samples, components) {
	plot.clear()

	//render data
	render(samples, [0,0,0,1])

	let N = 512
	let maxAmp = 0;
	let sumData = Array(N).fill(0).map((v, i) => {
		let sum = 0;
		components.forEach((component, c, components) => {
			sum += component.weight * norm(i/N, component.mean, component.variance);
		});
		if (sum > maxAmp) maxAmp = sum;
		return sum;
	});
	sumData = normalize(sumData);
	render(sumData, [.75, .75, .75, 1]);

	components.forEach((component, c, components) => {
		let samples = Array(N)
		let coef = component.weight / maxAmp
		for (let i = 0; i < N; i++) {
			samples[i] = coef * norm(i/N, component.mean, component.variance)
		}

		render(samples, colors[(c*17) % colors.length]);
	})

	return components
}


function generateData (n) {
	let c = Math.floor(Math.random() * 3 + 2);

	let components = Array(c).fill(null).map(c => [
		Math.random() + .15,
		Math.random() * .75 + .15,
		Math.random()*.005 + 0.0005
	])

	//redistribute means to equal 1
	let sum = components.reduce((prev, curr) => {
		return prev + curr[0]/Math.sqrt(τ*curr[2])
	}, 0)
	components = components.map(c => {
		c[0] /= sum
		return c;
	})

	let samples = Array(n).fill(0).map((sample, i, samples) => {
		let x = i/samples.length;
		return components.reduce((prev, curr) => {
			return prev + curr[0] * norm(x, curr[1], curr[2])
		}, 0) + Math.random()*.01;
	});

	samples = normalize(samples)

	return samples
}



function autoFit () {

}



function addComponent (l, t) {
	let x = l/window.innerWidth
	let y = 1 - t/window.innerHeight
	components.push({weight: y, mean: x, variance: .01})
}


function normalize (samples) {
	let maxV = samples.reduce((prev, curr) => Math.max(curr, prev)) || 1;
	return samples.map(v => v/maxV);
}


function render (samples, color) {
	//build points
	let points = [];
	for (let i = 0; i < samples.length; i++) {
		points.push(i/(samples.length-1));
		points.push(samples[i]);
	}

	//call render
	plot.render({points: points, color: color });
}


