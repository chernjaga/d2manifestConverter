const fetch = require('node-fetch');
const fs = require('fs');
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

var language = 'ru';
console.log('Downloading...'.yellow);
fetch(getUrl('/Destiny2/Manifest/'), params)
.then(response => response.json())
.then(json => {
    // console.log(json);
    var path = json.Response.jsonWorldContentPaths[language];
    fetch('https://www.bungie.net/' + path ,params)
    .then(response => response.json())
    .then(json => {
        console.log('writing DestinyCollectibleDefinition');
        fs.createWriteStream('extractedManifest/'+ language +'/DestinyCollectibleDefinition.json').write(JSON.stringify(json['DestinyCollectibleDefinition']));
        return json;
    })
    .then(json => {
        console.log('writing DestinyDamageTypeDefinition');
        fs.createWriteStream('extractedManifest/'+ language +'/DestinyDamageTypeDefinition.json').write(JSON.stringify(json['DestinyDamageTypeDefinition']));
        return json;
    })
    .then(json => {
        console.log('writing DestinyInventoryItemDefinition');
        fs.createWriteStream('extractedManifest/'+ language +'/DestinyInventoryItemDefinition.json').write(JSON.stringify(json['DestinyInventoryItemDefinition']));
        return json;
    })
    .then(json => {
        console.log('writing DestinyItemCategoryDefinition');
        fs.createWriteStream('extractedManifest/'+ language +'/DestinyItemCategoryDefinition.json').write(JSON.stringify(json['DestinyItemCategoryDefinition']));
        return json;
    })
    .then(json => {
        console.log('writing DestinySandboxPerkDefinition');
        fs.createWriteStream('extractedManifest/'+ language +'/DestinySandboxPerkDefinition.json').write(JSON.stringify(json['DestinySandboxPerkDefinition']));
        return json;
    })
    .then(json => {
        console.log('writing DestinyStatDefinition');
        fs.createWriteStream('extractedManifest/'+ language +'/DestinyStatDefinition.json').write(JSON.stringify(json['DestinyStatDefinition']));
        return json;
    })
    
    .catch(error => {
        console.log('*********************************'.red);
        console.log('world content path level'.red);
        console.log(error.message);
        console.log('*********************************'.red);
    })
}).catch(error => {
    console.log('*********************************'.red);
    console.log('manifest level'.red);
    console.log(error.message);
    console.log('*********************************'.red);
});