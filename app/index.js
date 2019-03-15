const fetch = require('node-fetch');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const color = require('colors');

const weaponMap = require('./weaponMap');
const imageHost = 'https://www.bungie.net'

const manifestProperties = require('./languageSpecificObject').setLanguage(args);

console.log('let\'s get start'.yellow);
console.log('weapon starts are downloading...'.yellow);
console.time('completed');

// stats request

fetch(manifestProperties.statDefinition.url)
    .then((response) => {
        console.log('stats are downloaded'.yellow);

        return response.json();
    })
    .then((body) => {
        fs.createWriteStream(`destination/${manifestProperties.statDefinition.name}.json`).write(JSON.stringify(body));

        return body;
    }).then((stats) => {
        console.log('weapon definition is downloading...'.yellow);

        // definition request

        fetch(manifestProperties.inventoryItemDefinition.url)
            .then((response) => {

                return response.json();
            })
            .then((body) => {
                console.log('definition downloading is completed'.yellow);
                console.log('...processing'.yellow);

                let reducedWeapon = [];
                for (let item in body) {

                    // cycle to iterate the weapon item type

                    for (let classItem of weaponMap.classes) {
                        if (body[item].itemTypeDisplayName === classItem) {
                            try {
                                let displayedPropertyObject = body[item].displayProperties;
                                let statsArray = [];

                                let reducedWeaponDescription = {
                                    displayedProperties: {
                                        name: displayedPropertyObject.name,
                                        description: displayedPropertyObject.description,
                                        image: imageHost + body[item].screenshot || null,
                                        icon: displayedPropertyObject.hasIcon ? imageHost + displayedPropertyObject.icon : null
                                    },
                                    description: {
                                        stats: []
                                    }
                                };

                                try {
                                    for (let stat in body[item].stats.stats) {
                                        if (stats[stat].displayProperties.name) {
                                            statsArray.push({
                                                statName: stats[stat].displayProperties.name,
                                                statValue: body[item].stats.stats[stat].value,
                                                minValue: body[item].stats.stats[stat].minimum,
                                                maxValue: body[item].stats.stats[stat].maximum
                                            });
                                        }
                                    };
                                } catch (error) {
                                    console.log('error in stats level'.red);
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

                fs.createWriteStream(`destination/${manifestProperties.inventoryItemDefinition.name}.json`).write(JSON.stringify(reducedWeapon));

                console.timeEnd('completed');
                console.log('finished'.yellow);
            })
            .catch((error) => {
                console.log(error.message.red);
            });

    })
    .catch((error) => {
        console.log(error.message.red);
    });