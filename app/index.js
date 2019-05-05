const fetch = require('node-fetch');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const color = require('colors');
const lang = args.lang || 'en';
const isLocal = args.local;
const manifestProperties = require('./languageSpecificObject').setLanguage(lang); 
// const imageHost = 'https://www.bungie.net';
const imageHost = '';

var damageTypePromise,
    statsPromise,
    categoryDefinitionsPromise,
    perksPromise,
    definitionPromise;

if (!isLocal) {
    damageTypePromise = fetch(manifestProperties.damageTypeDefinition.url)
        .then(response => response.json())
        .then((damageTypes) => {
            console.log('damageTypes are downloaded'.yellow);
            console.log('...processing'.yellow);

            return correctDamageTypes(damageTypes);
        });

    statsPromise = fetch(manifestProperties.statDefinition.url)
        .then(response => response.json())
        .then((stats) => {
            console.log('stats are downloaded'.yellow);
            console.log('...processing'.yellow);

            return stats;
        });

    categoryDefinitionsPromise = fetch(manifestProperties.itemCategoryDefinition.url)
        .then(response => response.json())
        .then((categories) => {
            console.log('categories are downloaded'.yellow);
            console.log('...processing'.yellow);

            return categories;
        });

    perksPromise = fetch(manifestProperties.sandboxPerkDefinition.url)
        .then(response => response.json())
        .then((perks) => {
            console.log('perks are downloaded'.yellow);
            console.log('...processing'.yellow);

            return perks;
        });

    definitionPromise = fetch(manifestProperties.inventoryItemDefinition.url)
        .then((definition) => {
            console.log('definitions are downloaded'.yellow);
            console.log('...processing'.yellow);

            return definition.json();
        });

    weaponSocketsPromise = fetch(manifestProperties.inventoryItemDefinition.url)
        .then((definition) => {
            console.log('weapon sockets are downloaded'.yellow);
            console.log('...processing'.yellow);

            return definition.json();
        }).then((data) => {

            return generateSocketsData(data);
        });

} else {
    damageTypePromise = new Promise ((resolve) => {
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

    statsPromise = new Promise ((resolve) => {
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

    categoryDefinitionsPromise = new Promise ((resolve) => {
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
    
    perksPromise = new Promise ((resolve) => {
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

    definitionPromise = new Promise ((resolve) => {
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

    weaponSocketsPromise = new Promise ((resolve) => {
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
}

console.log('let\'s start'.yellow);
console.log('downloading...'.yellow);
console.time('completed');

Promise.all([statsPromise, perksPromise, definitionPromise, damageTypePromise, weaponSocketsPromise, categoryDefinitionsPromise])
    .then((responses) => {
        generateApplicationData(responses);
    })
    .catch((error) => {
        console.log(error.message.red);
    });

function generateApplicationData (responses) {
    console.log('...processing'.yellow);
    let reducedWeapon = {};
    let reducedWeaponStats = {};
    let perksBucket = {}

    let stats = responses[0];
    let perks = responses[1];
    let weaponDefinition = responses[2];
    let damageTypes = responses[3];
    let sockets = responses[4];
    let categories = responses[5];

    for (let item in weaponDefinition) {

        // cycle to iterate the weapon item type. Definition level

            if (weaponDefinition[item].itemCategoryHashes &&  (weaponDefinition[item].itemCategoryHashes[1] === 1  || weaponDefinition[item].itemCategoryHashes[0] === 1 || weaponDefinition[item].itemCategoryHashes[2] === 1)) {

                try {
                    let displayedPropertyObject = weaponDefinition[item].displayProperties;
                    let statsArray = [];
                    let damageTypeObject = {};
                    let perksArray = [];
                    let reducedWeaponDescription = {};

                    // Damage type level

                    try {
                        let damageTypeHash = weaponDefinition[item].defaultDamageTypeHash;

                        if (damageTypeHash && damageTypes[damageTypeHash]) {
                            let damageTypeItem = damageTypes[damageTypeHash].displayProperties;
                            damageTypeObject = {
                                name: damageTypeItem.name,
                                icon: damageTypeItem.hasIcon ?imageHost + damageTypeItem.icon : null,
                                hash: damageTypeHash
                            };
                        }
                    } catch (error) {
                        console.log('error in damage types level'.red);
                        console.log(error.message);
                    }

                    // stats level

                    try {

                        for (let stat in weaponDefinition[item].stats.stat) {

                            if (stats[stat].displayProperties.name) {
                                statsArray.push({
                                    statName: stats[stat].displayProperties.name,
                                    statValue: weaponDefinition[item].stats.stats[stat].value,
                                    minValue: weaponDefinition[item].stats.stats[stat].minimum,
                                    maxValue: weaponDefinition[item].stats.stats[stat].maximum,
                                    hash: stat
                                });
                            }
                        };
                    } catch (error) {
                        console.log('error in stats level'.red);
                        console.log(error.message);
                    };

                    // perks level

                    try {
                        let perksItems = weaponDefinition[item].sockets ? weaponDefinition[item].sockets.socketEntries : [];

                        for (let perk in perksItems) {
                            let perkObjectToPush = {};
                            let hash = perksItems[perk].singleInitialItemHash;
                            let randomizedPerks = [];

                            for (let randomizedPerk of perksItems[perk].randomizedPlugItems) {
                                randomizedPerks.push(randomizedPerk.plugItemHash);
                            }

                            if (perks[hash] || sockets[hash]) {
                                let investmentStats = sockets[hash] ? sockets[hash].investmentStats : [];
                                let displayObject = perks[hash] ? perks[hash].displayProperties : sockets[hash];
                                perkObjectToPush = {
                                    vendorPerk: hash,
                                    randomizedPerks: randomizedPerks
                                }

                                perksArray.push(perkObjectToPush);

                                if (!investmentStats.length) {
                                    investmentStats = perks[hash] && perks[hash].investmentStats ? perks[hash].investmentStats : [];
                                }

                                if (!perksBucket[hash]) {
                                    perksBucket[hash] = {
                                        name: displayObject.name,
                                        description: displayObject.description,
                                        icon: displayObject.hasIcon ? imageHost + displayObject.icon : null,
                                        investmentStats: investmentStats,
                                        hash: hash
                                    };
                                }
                            }
                        }

                    } catch (error) {
                        console.log('error in perks level'.red);
                        console.log(error.message);
                    }

                    reducedWeaponDescription = {
                        displayedProperties: {
                            name: displayedPropertyObject.name,
                            icon: displayedPropertyObject.hasIcon ? imageHost + displayedPropertyObject.icon : null
                        },
                        rarity: {
                            name: weaponDefinition[item].inventory.tierTypeName,
                            hash: weaponDefinition[item].inventory.tierType
                        },
                        slot: {
                            name: categories[weaponDefinition[item].itemCategoryHashes[0]].displayProperties.name || null,
                            hash: weaponDefinition[item].itemCategoryHashes[0]
                        },
                        class: {
                            name: categories[weaponDefinition[item].itemCategoryHashes[2]].displayProperties.name || null,
                            hash: weaponDefinition[item].itemCategoryHashes[2]
                        },
                        damageType: damageTypeObject,
                        hash: weaponDefinition[item].hash
                    };
                

                    reducedWeapon[weaponDefinition[item].hash] = reducedWeaponDescription;
                    reducedWeaponStats[weaponDefinition[item].hash] = {
                        stats: statsArray,
                        perks: perksArray,
                        description: displayedPropertyObject.description,
                        screenshot: weaponDefinition[item].screenshot ? imageHost + weaponDefinition[item].screenshot : null
                    }

                } catch (error) {
                    console.log('error in displayed properties level'.red);
                    console.log(error.message);
                    console.log('..................'.green);
                };
            }
        
    };


    if (!fs.existsSync('./destination')){
        fs.mkdirSync('./destination');
    }
    if (!fs.existsSync(`./destination/${lang}`)){
        fs.mkdirSync(`./destination/${lang}`);
    }
    fs.createWriteStream(`destination/${lang}/weaponMainList.json`).write(JSON.stringify(reducedWeapon));
    fs.createWriteStream(`destination/${lang}/weaponStats.json`).write(JSON.stringify(reducedWeaponStats));
    fs.createWriteStream(`destination/${lang}/perksBucket.json`).write(JSON.stringify(perksBucket));

    console.timeEnd('completed');
    console.log('finished'.yellow);
};

function correctDamageTypes(data) {
    let outputData = {}
    for (let index in data) {
        outputData[data[index].hash] = data[index];
    }

    return outputData;
}

function generateSocketsData (data) {
    console.log('...weapon sockets processing'.yellow);
    
    let reducedSockets = {};

    for (let socket in data) {

        try {

            if (data[socket].itemCategoryHashes && 
            (data[socket].itemCategoryHashes[0] === 59 || data[socket].itemCategoryHashes[1] === 59 || data[socket].itemCategoryHashes[2]=== 59)) {
                let display = data[socket].displayProperties;
                reducedSockets[socket] = {
                    name: display.name,
                    icon: display.hasIcon ? display.icon : null,
                    hasIcon: display.hasIcon,
                    description: display.description
                }

                // investment stats level

                if (data[socket].investmentStats) {
                    let investmentStats = [];

                    try {

                        for (let stat of data[socket].investmentStats) {
                            investmentStats.push({
                                statTypeHash: stat.statTypeHash,
                                value: stat.value
                            });
                        }

                    } catch (error) {
                        console.log('error in investment stats level'.red);
                        console.log(error.message);
                    }
                    
                    reducedSockets[socket].investmentStats = investmentStats
                }
            }

        } catch (error) {
            console.log('error in sockets level'.red);
            console.log(error.message);
        }
    }

    return reducedSockets;
}