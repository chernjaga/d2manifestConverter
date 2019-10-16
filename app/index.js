const fetch = require('node-fetch');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const color = require('colors');
const lang = args.lang || 'en';
const fetchManifestTables = require('./extract').fetchManifestTables;
const utils = require('./utils');
const generateApplicationData = utils.generateApplicationData;
const correctDamageTypes = utils.correctDamageTypes;
const generateSocketsData = utils.generateSocketsData;

console.log('let\'s start'.yellow);
console.time('completed');

new Promise((resolve) => {
    resolve(fetchManifestTables(lang));
    // resolve();
}).then(function() {
    const collectibleItemsPromise = new Promise ((resolve) => {
            const collectibles = require(`../extractedManifest/${lang}/DestinyCollectibleDefinition.json`);
            resolve(collectibles);
        }).then((collectibles) => {
            console.log('weapon collectibles are downloaded'.yellow);
            console.log('...processing'.yellow);

            return collectibles;
        }).catch((error) => {
            console.log('can\'t read DestinyCollectibleDefinition.json'.red);
            console.log(error.message);
        });

    const damageTypePromise = new Promise ((resolve) => {
            const damageTypeDefinition = require(`../extractedManifest/${lang}/DestinyDamageTypeDefinition.json`);
            resolve(damageTypeDefinition);
        }).then((damageTypes) => {
            console.log('damageTypes are downloaded'.yellow);
            console.log('...processing'.yellow);

            return correctDamageTypes(damageTypes);
        }).catch((error) => {
            console.log('can\'t read DestinyDamageTypeDefinition.json'.red);
            console.log(error.message);
        });

    const statsPromise = new Promise ((resolve) => {
            const itemStats = require(`../extractedManifest/${lang}/DestinyStatDefinition.json`);
            resolve(itemStats);
        }).then((stats) => {
            console.log('weapon stats are downloaded'.yellow);
            console.log('...processing'.yellow);

            return stats;
        }).catch((error) => {
            console.log('can\'t read DestinyStatDefinition.json'.red);
            console.log(error.message);
        });

    const categoryDefinitionsPromise = new Promise ((resolve) => {
            const categoryDefinitions = require(`../extractedManifest/${lang}/DestinyItemCategoryDefinition.json`);
            resolve(categoryDefinitions);
        }).then((categories) => {
            console.log('categories stats are downloaded'.yellow);
            console.log('...processing'.yellow);

            return categories;
        }).catch((error) => {
            console.log('can\'t read DestinyItemCategoryDefinition.json'.red);
            console.log(error.message);
        });

    const perksPromise = new Promise ((resolve) => {
            const perksDefinitions = require(`../extractedManifest/${lang}/DestinySandboxPerkDefinition.json`);
            resolve(perksDefinitions);
        }).then((perks) => {
            console.log('perks are downloaded'.yellow);
            console.log('...processing'.yellow);

            return perks;
        }).catch((error) => {
            console.log('can\'t read DestinySandboxPerkDefinition.json'.red);
            console.log(error.message);
        });

    const definitionPromise = new Promise ((resolve) => {
            const itemDefinitions = require(`../extractedManifest/${lang}/DestinyInventoryItemDefinition.json`);
            resolve(itemDefinitions);
        }).then((definitions) => {
            console.log('itemDefinitions are downloaded'.yellow);
            console.log('...processing'.yellow);

            return definitions;
        }).catch((error) => {
            console.log('can\'t read DestinyInventoryItemDefinition.json'.red);
            console.log(error.message);
        });

    const weaponSocketsPromise = new Promise ((resolve) => {
            const socketsDefinitions = require(`../extractedManifest/${lang}/DestinyInventoryItemDefinition.json`);
            resolve(socketsDefinitions);
        }).then((data) => {
            console.log('weapon sockets are downloaded'.yellow);
            console.log('...processing'.yellow);

            return generateSocketsData(data);
        }).catch((error) => {
            console.log('can\'t read DestinyInventoryItemDefinition.json for sockets level'.red);
            console.log(error.message);
        });

    const plugSetPromise = new Promise ((resolve) => {
            const plugSetDefinitions = require(`../extractedManifest/${lang}/DestinyPlugSetDefinition.json`);
            resolve(plugSetDefinitions);
        }).then((data) => {
            console.log('PlugSets are downloaded'.yellow);
            console.log('...processing'.yellow);

            return data;
        }).catch((error) => {
            console.log('can\'t read DestinyPlugSetDefinition.json for plug sets level'.red);
            console.log(error.message);
        });

    Promise.all([statsPromise, perksPromise, definitionPromise, damageTypePromise, weaponSocketsPromise, categoryDefinitionsPromise, collectibleItemsPromise, plugSetPromise])
        .then((responses) => {
            generateApplicationData(responses, lang);
        })
        .catch((error) => {
            console.log(error.message.red);
        });
});



