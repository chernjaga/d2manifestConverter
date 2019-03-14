const fetch = require('node-fetch');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const color = require('colors');

const manifestProperties = getPropertiesObject(args);

console.log('let\'s get start'.yellow);
console.time('downloading');


fetch(manifestProperties.enemyRaceDefinition.url)
    .then((response) => {

        return response.json();
    })
    .then((body) => {
        fs.createWriteStream(`destination/${manifestProperties.enemyRaceDefinition.name}.json`).write(JSON.stringify(body));
        console.timeEnd('downloading');
        console.log('finished'.yellow);
    })
    .catch((error) => {
        console.log(error.message.red);
    });

function getPropertiesObject(langOption) {
    let lang = langOption.ru || langOption.r ? 'ru' : 'en';

    return {
        enemyRaceDefinition: {
            url: `https://destiny.plumbing/${lang}/raw/DestinyEnemyRaceDefinition.json`,
            name: 'DestinyEnemyRaceDefinition'
        },
        itemCategoryDefinition: {
            url: `https://destiny.plumbing/${lang}/raw/DestinyItemCategoryDefinition.json`,
            name: 'DestinyItemCategoryDefinition'
        },
        inventoryItemDefinition: {
            url: `https://destiny.plumbing/${lang}/raw/DestinyInventoryItemDefinition.json`,
            name: 'DestinyInventoryItemDefinition'
        },
        itemTierTypeDefinition: {
            url: `https://destiny.plumbing/${lang}/raw/DestinyItemTierTypeDefinition.json`,
            name: 'DestinyItemTierTypeDefinition'
        },
        sandboxPerkDefinition: {
            url: `https://destiny.plumbing/${lang}/raw/DestinySandboxPerkDefinition.json`,
            name: 'DestinySandboxPerkDefinition'
        },
        statDefinition: {
            url: `https://destiny.plumbing/${lang}/raw/DestinyStatDefinition.json`,
            name: 'DestinyStatDefinition'
        },
        statGroupDefinition: {
            url: `https://destiny.plumbing/${lang}/raw/DestinyDestinyStatGroupDefinition.json`,
            name: 'DestinyDestinyStatGroupDefinition'
        },
        reducedCollectableInventoryItems: {
            url: `https://destiny.plumbing/${lang}/raw/reducedCollectableInventoryItems.json`,
            name: 'reducedCollectableInventoryItem'
        }
    };
};