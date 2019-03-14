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


fetch(manifestProperties.statDefinition.url)
    .then((response)=>{
        console.log('stats are downloaded'.yellow);
        
        return response.json();
    })
    .then((body)=>{
        fs.createWriteStream(`destination/${manifestProperties.statDefinition.name}.json`).write(JSON.stringify(body));
    }).then(()=>{
        console.log('weapon definition is downloading...'.yellow);
        fetch(manifestProperties.inventoryItemDefinition.url)
            .then((response) => {

                return response.json();
            })
            .then((body) => {
                console.log('definition downloading is completed'.yellow);
                console.log('...processing'.yellow);

                let reducedWeapon = [];
                for (let item in body) {
                    for (let classItem of weaponMap.classes) {
                        if (body[item].itemTypeDisplayName === classItem) {
                            try {
                                let displayedPropertyObject = body[item].displayProperties;

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

                                reducedWeapon.push(reducedWeaponDescription);
                            } catch (error) {
                                console.log('item dosen\'t parsed'.red);
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

