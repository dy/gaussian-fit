# gaussian-fit [![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Fit time/spectrum/other sequential data with a set of gaussians by [expectation-maximization](https://en.wikipedia.org/wiki/Expectation%E2%80%93maximization_algorithm) algoritm.

[![gaussian-fit](https://raw.githubusercontent.com/dfcreative/gaussian-fit/gh-pages/preview.png "gaussian-fit")](http://dfcreative.github.io/gaussian-fit/)

## Usage

[![npm install gaussian-fit](https://nodei.co/npm/gaussian-fit.png?mini=true)](https://npmjs.org/package/gaussian-fit/)

```js
const fit = require('gaussian-fit')

//time/frequency/etc series
let data = [0, .1, .2, .5, .2, .1, 0]

let how = {
	//predefined components, each one is object {weight, mean, variance}
	//if null - the components will be detected automatically
	components: null,

	//max number of components in case of auto-detection
	maxNumber: 100,

	//max number of iterations
	maxIterations: 200,

	//min difference of likelihood
	tolerance: 1e-5,
}

let components = fit(data, how)

components.forEach({weight, mean, variance} => {
	//every component is an object with weight, mean and variance properties
})
```

### `fit(data, components?)`

Also see webgl version `gaussian-fit/gl` for better performance.

## Similar

* [gaussianmixture](https://www.npmjs.com/package/gaussianMixture) — classical gaussian mixture for 1d samples
