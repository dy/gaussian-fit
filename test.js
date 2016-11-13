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
		right: 1rem;
		font-size: .75rem;
		letter-spacing: .1ex;
		text-transform: uppercase;
		font-weight: 100;
		-webkit-appearance: none;
		background: none;
		border: none;
		padding: 0;
		border-bottom: 1px solid rgba(0,0,0,.1);
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
			gl_PointSize = 2.;
			gl_Position = vec4(position.x, position.y - .333, 0, 1);
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


//default color set
// let colors = colormap({
// 	colormap: 'rainbow-soft',
// 	nshades: 100,
// 	format: 'rgb'
// })


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
		}, 0) + Math.random()*.05;
	});

	render(samples)
}



function autoFit () {

}



function addComponent (x, y) {

}


function render (samples) {
	//normalize samples
	let maxV = samples.reduce((prev, curr) => Math.max(curr, prev));
	samples = samples.map(v => v/maxV);

	//build points
	let points = [];
	for (let i = 0; i < samples.length; i++) {
		points.push(2 * i/samples.length - 1);
		points.push(samples[i]);
	}

	//call render
	plot.render({points: points, color: [0,0,0,1]});
}



//init app
let N = 1024;
generateData(N);


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
