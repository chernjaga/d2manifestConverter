const fetch = require('node-fetch');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const color = require('colors');

const weaponMap = require('./weaponMap');
const imageHost = 'https://www.bungie.net';

const manifestProperties = require('./languageSpecificObject').setLanguage(args);

const statsPromise = fetch(manifestProperties.statDefinition.url)
    .then(response => response.json())
    .then((stats) => {
        console.log('stats are downloaded'.yellow);

        fs.createWriteStream(`destination/${args.lang || 'en'}/${manifestProperties.statDefinition.name}.json`).write(JSON.stringify(stats));

        return stats;
    });

const perksPromise = fetch(manifestProperties.sandboxPerkDefinition.url)
    .then(response => response.json())
    .then((perks) => {
        console.log('perks are downloaded'.yellow);
        fs.createWriteStream(`destination/${args.lang || 'en'}/${manifestProperties.sandboxPerkDefinition.name}.json`).write(JSON.stringify(perks));

        return perks;
    });

const definitionPromise = fetch(manifestProperties.inventoryItemDefinition.url)
        .then((definition) => {
            console.log('definitions are downloaded'.yellow);

            return definition.json();
        });

console.log('let\'s start'.yellow);
console.log('downloading...'.yellow);
console.time('completed');

Promise.all([statsPromise, perksPromise, definitionPromise])
    .then((responses) => {
        console.log('...processing'.yellow);

        let stats = responses[0];
        let perks = responses[1];
        let weaponDefinition = responses[2];
        let reducedWeapon = [];

        for (let item in weaponDefinition) {

            // cycle to iterate the weapon item type. Definition level

            for (let classItem of weaponMap.classes) {
                if (weaponDefinition[item].itemTypeDisplayName === classItem) {
                    try {
                        let displayedPropertyObject = weaponDefinition[item].displayProperties;
                        let statsArray = [];

                        let reducedWeaponDescription = {
                            displayedProperties: {
                                name: displayedPropertyObject.name,
                                description: displayedPropertyObject.description,
                                image: imageHost + weaponDefinition[item].screenshot || null,
                                icon: displayedPropertyObject.hasIcon ? imageHost + displayedPropertyObject.icon : null
                            },
                            description: {
                                stats: [],
                                perks: []
                            }
                        };

                        // stats level
                        try {
                            for (let stat in weaponDefinition[item].stats.stats) {
                                if (stats[stat].displayProperties.name) {
                                    statsArray.push({
                                        statName: stats[stat].displayProperties.name,
                                        statValue: weaponDefinition[item].stats.stats[stat].value,
                                        minValue: weaponDefinition[item].stats.stats[stat].minimum,
                                        maxValue: weaponDefinition[item].stats.stats[stat].maximum
                                    });
                                }
                            };
                        } catch (error) {
                            console.log('error in stats level'.red);
                            console.log(error.message);
                        };

                        // perks level

                        try {

                        } catch (error) {
                            console.log('error in perks level'.red);
                            console.log(error.message);
                        };


                        reducedWeaponDescription.description.stats = statsArray;

                        reducedWeapon.push(reducedWeaponDescription);
                    } catch (error) {
                        console.log('error in displayed properties level'.red);
                        console.log(error.message);
                    };
                }
            };
        };

        fs.createWriteStream(`destination/${args.lang || 'en'}/${manifestProperties.inventoryItemDefinition.name}.json`).write(JSON.stringify(reducedWeapon));

        console.timeEnd('completed');
        console.log('finished'.yellow);
    })
    .catch((error) => {
        console.log(error.message.red);
    });