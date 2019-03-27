const fetch = require('node-fetch');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const color = require('colors');

const weaponMap = require('./weaponMap');
// const imageHost = 'https://www.bungie.net';

const manifestProperties = require('./languageSpecificObject').setLanguage(args);

const damageTypePromise = fetch(manifestProperties.damageTypeDefinition.url)
    .then(response => response.json())
    .then((damageTypes) => {
        console.log('damageTypes are downloaded'.yellow);

        // fs.createWriteStream(`destination/${args.lang || 'en'}/${manifestProperties.damageTypeDefinition.name}.json`).write(JSON.stringify(damageTypes));

        return damageTypes;
    });
const statsPromise = fetch(manifestProperties.statDefinition.url)
    .then(response => response.json())
    .then((stats) => {
        console.log('stats are downloaded'.yellow);

        // fs.createWriteStream(`destination/${args.lang || 'en'}/${manifestProperties.statDefinition.name}.json`).write(JSON.stringify(stats));

        return stats;
    });

const categoryDefinitionsPromise = fetch(manifestProperties.itemCategoryDefinition.url)
    .then(response => response.json())
    .then((categories) => {
        console.log('categories are downloaded'.yellow);
        // fs.createWriteStream(`destination/${args.lang || 'en'}/${manifestProperties.itemCategoryDefinition.name}.json`).write(JSON.stringify(categories));

        return categories;
    });

const perksPromise = fetch(manifestProperties.sandboxPerkDefinition.url)
    .then(response => response.json())
    .then((perks) => {
        console.log('perks are downloaded'.yellow);
        // fs.createWriteStream(`destination/${args.lang || 'en'}/${manifestProperties.sandboxPerkDefinition.name}.json`).write(JSON.stringify(perks));

        return perks;
    });

const definitionPromise = fetch(manifestProperties.inventoryItemDefinition.url)
    .then((definition) => {
        console.log('definitions are downloaded'.yellow);

        return definition.json();
    });

const weaponSocketsPromise = fetch(manifestProperties.inventoryItemDefinition.url)
    .then((definition) => {
        console.log('weapon sockets are downloaded'.yellow);

        return definition.json();
    }).then((data) => {
        console.log('weapon sockets processing...'.yellow);
        let reducedSockets = {};

        for (let socket in data) {
            try {
                if (data[socket].nonTransferrable) {
                    let display = data[socket].displayProperties;
                    reducedSockets[socket] = {
                        name: display.name,
                        icon: display.hasIcon ? display.icon : null,
                        hasIcon: display.hasIcon,
                        description: display.description
                    }
                }
            } catch (error) {
                console.log('error in sockets level'.red);
                console.log(error.message);
            }
        }

        // fs.createWriteStream(`destination/${args.lang || 'en'}/weaponSocketsDefinition.json`).write(JSON.stringify(reducedSockets));
        return reducedSockets;
    });

console.log('let\'s start'.yellow);
console.log('downloading...'.yellow);
console.time('completed');

Promise.all([statsPromise, perksPromise, definitionPromise, damageTypePromise, weaponSocketsPromise, categoryDefinitionsPromise])
    .then((responses) => {
        console.log('...processing'.yellow);

        let reducedWeapon = [];
        let reducedWeaponStats = {};
        let perksBucket = {}

        let stats = responses[0];
        let perks = responses[1];
        let weaponDefinition = responses[2];
        let damageTypes = responses[3];
        let sockets = responses[4];
        let categories = responses[5]

        for (let item in weaponDefinition) {

            // cycle to iterate the weapon item type. Definition level

            for (let classItem of weaponMap.classes) {
                if (weaponDefinition[item].itemTypeDisplayName === classItem) {
                    try {
                        let displayedPropertyObject = weaponDefinition[item].displayProperties;
                        let statsArray = [];
                        let damageTypeObject = {};
                        let perksArray = [];
                        let reducedWeaponDescription = {};

                        // Damage type level
                        try {
                            let damageTypeHash = weaponDefinition[item].defaultDamageTypeHash;
                            if (damageTypeHash) {
                                let damageTypeItem = damageTypes[damageTypeHash].displayProperties;

                                damageTypeObject = {
                                    name: damageTypeItem.name,
                                    icon: damageTypeItem.hasIcon ? damageTypeItem.icon : null,
                                    hash: damageTypeHash
                                };
                            }
                        } catch (error) {
                            console.log('error in damage types level'.red);
                            console.log(error.message);
                        }

                        // stats level
                        try {
                            for (let stat in weaponDefinition[item].stats.stats) {
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

                                for (let randomizedPerk in perksItems[perk].randomizedPlugItems) {
                                    let randomizedPerkHash = randomizedPerk.plugItemHash;
                                    if (perks[randomizedPerkHash] || sockets[randomizedPerkHash]) {
                                        let displayObject = perks[randomizedPerkHash] ? perks[randomizedPerkHash].displayProperties : sockets[randomizedPerkHash];
                                        objectToPush = {
                                            name: displayObject.name,
                                            description: displayObject.description,
                                            icon: displayObject.hasIcon ? displayObject.icon : null,
                                            hash: randomizedPerkHash
                                        };
                                        randomizedPerk.push(objectToPush);

                                        if (!perksBucket[randomizedPerkHash]) {
                                            perksBucket[randomizedPerkHash] = objectToPush;
                                        }
                                    }
                                }

                                if (perks[hash] || sockets[hash]) {
                                    let displayObject = perks[hash] ? perks[hash].displayProperties : sockets[hash];
                                    perkObjectToPush = {
                                        vendorPerk: {
                                            name: displayObject.name,
                                            description: displayObject.description,
                                            icon: displayObject.hasIcon ? displayObject.icon : null,
                                            hash: hash
                                        },
                                        randomizedPerks: randomizedPerks
                                    }

                                    perksArray.push(perkObjectToPush);
                                    if (!perksBucket[hash]) {
                                        perksBucket[hash] = {
                                            name: displayObject.name,
                                            description: displayObject.description,
                                            icon: displayObject.hasIcon ? displayObject.icon : null,
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
                                description: displayedPropertyObject.description,
                                // image: weaponDefinition[item].screenshot || null,
                                icon: displayedPropertyObject.hasIcon ? displayedPropertyObject.icon : null
                            },
                            rarity: weaponDefinition[item].inventory.tierTypeName,
                            slot: {
                                name: categories[weaponDefinition[item].itemCategoryHashes[0]].displayProperties.name,
                                hash: weaponDefinition[item].itemCategoryHashes[0]
                            },
                            class: {
                                name: categories[weaponDefinition[item].itemCategoryHashes[2]].displayProperties.name,
                                hash: weaponDefinition[item].itemCategoryHashes[2]
                            },
                            // stats: statsArray,
                            damageType: damageTypeObject,
                            // perks: perksArray,
                            hash: weaponDefinition[item].hash
                        };

                        reducedWeapon.push(reducedWeaponDescription);
                        reducedWeaponStats[weaponDefinition[item].hash] = {
                            stats: statsArray,
                            perks: perksArray
                        }
                    } catch (error) {
                        console.log('error in displayed properties level'.red);
                        console.log(error.message);
                    };
                }
            };
        };

        fs.createWriteStream(`destination/${args.lang || 'en'}/weaponMainList.json`).write(JSON.stringify(reducedWeapon));
        fs.createWriteStream(`destination/${args.lang || 'en'}/weaponStats.json`).write(JSON.stringify(reducedWeaponStats));
        fs.createWriteStream(`destination/${args.lang || 'en'}/perksBucket.json`).write(JSON.stringify(perksBucket));

        console.timeEnd('completed');
        console.log('finished'.yellow);
    })
    .catch((error) => {
        console.log(error.message.red);
    });