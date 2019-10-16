const fetch = require('node-fetch');
const fs = require('fs-extra');
const apiKey = require('./apiKey').key;
const color = require('colors');
const params =  {
                    method: 'get',
                    headers: {
                        'X-API-Key': apiKey,
                        'Content-Type': 'json'
                    }
                };

const getUrl = function(url) {
    return `https://www.bungie.net/Platform${url}`
};

function fetchManifestTables (language) {
    console.log('Tables are downloading...'.yellow);
    console.time('downloading');
    return new Promise((resolve) => {
        fetch(getUrl('/Destiny2/Manifest/'), params)
        .then(response => response.json())
        .then(json => {
            var path = json.Response.jsonWorldContentPaths[language];
            fetch('https://www.bungie.net/' + path ,params)
            .then(response => response.json())
            .then(json => {
                console.log('writing Entities');
                var output = {}
                var testData = 'Entities'
                for (var field in json) {
                    createManifestDefinition(field, json, language);
                    output[field] = field;
                }
                fs.outputFileSync('extractedManifest/' + testData + '.json', JSON.stringify(output));
                return json;
            })
            .then(() => {
                console.timeEnd('downloading')
                resolve();
            })
            .catch(error => {
                console.log('*********************************'.red);
                console.log('world content writing level'.red);
                console.log(error.message);
                console.log('*********************************'.red);
            })
        }).catch(error => {
            console.log('*********************************'.red);
            console.log('manifest level downloading'.red);
            console.log(error.message);
            console.log('*********************************'.red);
        });
    });
};

function createManifestDefinition(field, data, language) {
    console.log('writing ' + field);
    fs.outputFileSync('extractedManifest/'+ language +'/' + field + '.json', JSON.stringify(data[field]));
}

module.exports = {
    fetchManifestTables: fetchManifestTables
}