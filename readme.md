# gaussian-fit [![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Fit time/spectrum/other sequential data with a set of gaussians by [expectation-maximization](https://en.wikipedia.org/wiki/Expectation%E2%80%93maximization_algorithm) algoritm.

[![gaussian-fit](https://raw.githubusercontent.com/formant/gaussian-fit/gh-pages/preview.png "gaussian-fit")](http://dfcreative.github.io/gaussian-fit/)

## Usage

[![npm install gaussian-fit](https://nodei.co/npm/gaussian-fit.png?mini=true)](https://npmjs.org/package/gaussian-fit/)

```js
const fit = require('gaussian-fit')

// time/frequency/etc series
let data = [0, .1, .2, .5, .2, .1, 0]

let how = {
	// predefined components, each one is object {weight, mean, variance}
	// TODO if null - the components will be detected automatically
	components: null,

	// TODO max number of components in case of auto-detection
	maxNumber: 100,

	// max number of iterations
	maxIterations: 200,

	// TODO min difference of likelihood
	tolerance: 1e-5,
}

let components = fit(data, how)

components.forEach({weight, mean, variance} => {
	// every component is an object with weight, mean and variance properties
})
```

## Similar

* [gaussianmixture](https://www.npmjs.com/package/gaussianMixture) — classical gaussian mixture for 1d samples
* [gaussian-mixture-estimator](https://github.com/rreusser/gaussian-mixture-estimator) — nd samples data estimation
