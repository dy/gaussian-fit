require('enable-mobile')
const fit = require('./')
const assert = require('assert')
const css = require('insert-styles')
const createPlot = require('../gl-component')
const colormap = require('colormap')
const norm = require('normal-pdf')


//UI
css(`
	body {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
		cursor: crosshair;
	}

	.auto {
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
`)


let autoButton = document.body.appendChild(document.createElement('button'))
autoButton.classList.add('auto')
autoButton.innerHTML = 'autofit'
autoButton.onclick = (e => autoFit())


document.addEventListener('click', e => {
	addComponent(e.clientX, e.clientY)
})


//main render plot
let plot = createPlot({
	context: {antialias: true},
	autostart: false,
	draw: (gl, vp, data) => {
		if (!data) return;
		let {points, color} = data;

		plot.setAttribute('position', points);
		plot.setUniform('color', data.color);
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
	nshades: 11,
	format: 'rgb'
})


//get data
let N = 128;
let samples = generateData(N);

//render data
render(samples, [0,0,0,1])

//render zero line
render([0, 0], [.95,.95,.95,1])

//initialize single-fit
let components = [{weight: .5, mean: .5, variance: .1}]
components = fit(samples, components)

//render components
render(sampleComponent(components[0]), colors[0]);





//API
function generateData (n) {
	let c = Math.floor(Math.random() * 100);

	let components = Array(c).fill(null).map(c => [
		Math.random()*.9 + .1,
		Math.random(),
		Math.random()*.005
	])

	let samples = Array(n).fill(0).map((sample, i, samples) => {
		let x = i/samples.length;
		return components.reduce((prev, curr) => {
			return prev + curr[0] * norm(x, curr[1], curr[2])
		}, 0) + Math.random()*.1;
	});

	return normalize(samples);
}



function autoFit () {

}



function addComponent (x, y) {
	colors = colormap({
		colormap: 'rainbow-soft',
		nshades: components.length,
		format: 'rgb'
	})
}


function normalize (samples) {
	let maxV = samples.reduce((prev, curr) => Math.max(curr, prev)) || 1;
	return samples.map(v => v/maxV);
}


function render (samples, color) {
	samples = normalize(samples)

	//build points
	let points = [];
	for (let i = 0; i < samples.length; i++) {
		points.push(i/(samples.length-1));
		points.push(samples[i]);
	}

	//call render
	plot.render({points: points, color: color });
}


function sampleComponent(component) {
	let N = 1024;
	let samples = Array(N)
	for (let i = 0; i < N; i++) {
		samples[i] = component.weight * norm(i/N, component.mean, component.variance)
	}
	return samples
}





//rendering normalized by sum of peaks
// 	let maxAmp = 0;
// 	let sumData = Array(1024).fill(0).map((v, i, samples) => {
// 		let x = i/samples.length;
// 		let sum = 0;
// 		for (let c = 0; c < count; c++) {
// 			sum += norm(x, φ[c]/Math.sqrt(τ*υ[c]), μ[c], υ[c]);
// 		}
// 		if (sum > maxAmp) maxAmp = sum;
// 		return sum;
// 	});

// 	//draw sum
// 	let points = [];
// 	for (let i = 0; i < sumData.length; i++) {
// 		points.push(2 * i/sumData.length - 1);
// 		points.push(sumData[i]/maxAmp);
// 	}
// 	plot.render({samples: points, color: [.5,.5,.5,step/steps]});


// 	//draw means drift
// 	for (let c = 0; c < count; c++) {

// 		let color = colors[c];
// 		color[3] = .0 + 1*step/steps;

// 		//means
// 		let points = [];
// 		points.push(μ[c]*2-1, 0);
// 		points.push(μ[c]*2-1, φ[c]/Math.sqrt(τ*υ[c])/maxAmp);
// 		plot.render({samples: points, color: color});


// 		//component
// 		// drawGaussian(φ[c]/Math.sqrt(τ*σ[c]*σ[c])/maxAmp, μ[c], υ[c], color);
// 	}
// }
