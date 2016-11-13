/** @module  gaussian-fit */

'use strict';

const n = require('normal-pdf');


module.exports = fit;

fit.optimize = optimize;
fit.likelihood = likelihood;


let memberships = new WeakMap();


//create components best fit samples
function fit (samples, opts) {
	opts = opts || {};

	let detectComponents = opts.components;

	if (Array.isArray(opts)) {
		opts = {
			components: opts
		};
	}

	//initialize components
	let components = typeof opts.components === 'number' ? Array(opts.components).fill(null) : opts.components || [];

	components = components.map((v, i, components) => {
		if (!v) v = {
			weight: 1/components.length,
			mean: i/components.length,
			variance: 1/components.length
		}
		else if (Array.isArray(v)) {
			v = {
				weight: v[0],
				mean: v[1],
				variance: v[2]
			}
		}
		return v;
	});

	//optimize components
	optimize(samples, components);

	if (!detectComponents) return components;

	//find max error among samples, add new component at the point
	let max = max(error(samples, components));




	if (opts.maxNumber) opts.maxNumber = 100;
	if (opts.maxIterations) opts.maxIterations = 100;

	//for every component iterate till converged
	let diff = Infinity;
	for (let i = 0; i < opts.maxIterations && diff > logLikelihoodTol; i++) {
		components = optimize(samples, components);
		diff = Math.abs(logLikelihood - temp);
		logLikelihood = temp;
	}


	return components;
}


//iteration of em algorithm
function optimize (samples, components) {
	let membership = memberships.has(samples) ? memberships.get(samples) : memberships.set(samples, Array(components.length*samples.length)).get(samples);

	//E-step: ask every sample for preference over existing components
	for (let i = 0; i < samples.length; i++) {
		let x = i/samples.length;

		let ρ = Array(components.length);

		//total probability at the point
		let Σρ = 0;
		for (let c = 0; c < components.length; c++) {
			let {weight, mean, variance} = components[c];
			ρ[c] = weight * n(x, mean, variance);
			Σρ += ρ[c];
		}

		//[c0, c1, c2, c0, c1, c2, ...]
		for (let c = 0; c < components.length; c++) {
			membership[i*components.length + c] = samples[i] * ρ[c]/Σρ;
		}
	}

	//M-step: update components to better cover member samples
	let ω = Array(components.length).fill(0);
	let Σω = 0;
	for (let c = 0; c < components.length; c++) {
		for (let i = 0; i < samples.length; i++) {
			ω[c] += membership[i*components.length + c];
		}
		Σω += ω[c];
	}

	components.forEach((component, c, components) => {
		//get new amp as ratio of the total weight
		component.weight = ω[c] / Σω;

		//get new mean as weighted by ratios value
		let Σμ = 0;
		for (let i = 0, n = samples.length; i < n; i++) {
			Σμ += (i/n) * membership[i*components.length + c];
		}
		component.mean = Σμ/component.weight;

		//get new variations as weighted by ratios stdev
		let Συ = 0;
		for (let i = 0, n = samples.length; i < n; i++) {
			Συ += membership[i*components.length + c] * Math.pow(i/n - component.mean, 2);
		}
		component.variance = Math.max(Συ/component.weight, 1e-5);
	})

	return components;
}


//calculate likelihood
function likelihood (samples, components) {
	let l = 0;
	let p = 0;
	for (let i = 0, n = samples.length; i < n; i++) {
		p = 0;
		for (let c = 0; c < components.length; c++) {
			let comp = components[c];
			p += samples[i] * comp.weight * n(i/n, comp.mean, comp.variance);
		}
		if (p === 0) {
			return -Infinity;
		} else {
			l += Math.log(p);
		}
	}
	return l;
};



