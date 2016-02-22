const path = require('path');
const fs = require('fs');
const yaml = require('yamlparser');
const resolve = require('resolve');

function readYAML(fileName) {
	const data = fs.readFileSync(fileName, 'utf8');
	return yaml.eval(data);
}

const regexes = resolve.sync('uap-core/regexes.yaml') ;
const refImpl = require('uap-ref-impl')(readYAML(regexes));

module.exports = refImpl.parse;
