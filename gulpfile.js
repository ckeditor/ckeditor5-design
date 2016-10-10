"use strict";

const ESDoc = require('esdoc');
const gulp = require('gulp');
const fs  = require('fs');
const path = require('path');
const config = require('./esdoc.json');

const destination = path.resolve(__dirname, config.destination);

/** Create json file using esdoc.json config */
gulp.task('esdoc:json', () => {
	ESDoc.generate(config, (results, asts, config) => {
		const json = JSON.stringify(results);
		fs.writeFile(destination, json, err => {
			if (err)
				throw err;
		});
	});
});
