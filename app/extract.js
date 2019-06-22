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
    console.log('Tables downloading...'.yellow);
    console.time('downloading');
    return new Promise((resolve) => {
        fetch(getUrl('/Destiny2/Manifest/'), params)
        .then(response => response.json())
        .then(json => {
            var path = json.Response.jsonWorldContentPaths[language];
            fetch('https://www.bungie.net/' + path ,params)
            .then(response => response.json())
            .then(json => {
                console.log('writing DestinyCollectibleDefinition');
                fs.outputFileSync('extractedManifest/'+ language +'/DestinyCollectibleDefinition.json', JSON.stringify(json['DestinyCollectibleDefinition']));
                return json;
            })
            .then(json => {
                console.log('writing DestinyDamageTypeDefinition');
                fs.outputFileSync('extractedManifest/'+ language +'/DestinyDamageTypeDefinition.json', JSON.stringify(json['DestinyDamageTypeDefinition']));
                return json;
            })
            .then(json => {
                console.log('writing DestinyInventoryItemDefinition');
                fs.outputFileSync('extractedManifest/'+ language +'/DestinyInventoryItemDefinition.json', JSON.stringify(json['DestinyInventoryItemDefinition']));
                return json;
            })
            .then(json => {
                console.log('writing DestinyItemCategoryDefinition');
                fs.outputFileSync('extractedManifest/'+ language +'/DestinyItemCategoryDefinition.json', JSON.stringify(json['DestinyItemCategoryDefinition']));
                return json;
            })
            .then(json => {
                console.log('writing DestinySandboxPerkDefinition');
                fs.outputFileSync('extractedManifest/'+ language +'/DestinySandboxPerkDefinition.json', JSON.stringify(json['DestinySandboxPerkDefinition']));
                return json;
            })
            .then(json => {
                console.log('writing DestinyStatDefinition');
                fs.outputFileSync('extractedManifest/'+ language +'/DestinyStatDefinition.json', JSON.stringify(json['DestinyStatDefinition']));
                return json;
            })
            .then(() => {
                console.timeEnd('downloading')
                resolve();
            })
            .catch(error => {
                console.log('*********************************'.red);
                console.log('world content writong level'.red);
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

module.exports = {
    fetchManifestTables: fetchManifestTables
}