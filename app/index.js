const fetch = require('node-fetch');
const fs = require('fs');
const args = require('minimist')(process.argv.slice(2));
const color = require('colors');

const manifestProperties = getPropertiesObject(args);

console.log('let\'s get start'.yellow);


fetch(manifestProperties.inventoryItemDefinition)
    .then((response)=>{
        return response.json();
    })
    .then((body)=>{
        fs.createWriteStream('destination/bundle.json').write(JSON.stringify(body));
    })

function getPropertiesObject(langOption) {
    let lang = langOption.ru || langOption.r ? 'ru' : 'en';
    return {
        enemyRaceDefinition: `https://destiny.plumbing/${lang}/raw/DestinyEnemyRaceDefinition.json`,
        itemCategoryDefinition: `https://destiny.plumbing/${lang}/raw/DestinyItemCategoryDefinition.json`,
        inventoryItemDefinition: `https://destiny.plumbing/${lang}/raw/DestinyInventoryItemDefinition.json`,
        itemTierTypeDefinition: `https://destiny.plumbing/${lang}/raw/DestinyItemTierTypeDefinition.json`,
        sandboxPerkDefinition: `https://destiny.plumbing/${lang}/raw/DestinySandboxPerkDefinition.json`,
        statDefinition: `https://destiny.plumbing/${lang}/raw/DestinyStatDefinition.json`,
        statGroupDefinition: `https://destiny.plumbing/${lang}/raw/DestinyDestinyStatGroupDefinition.json`,
        reducedCollectableInventoryItems: `https://destiny.plumbing/${lang}/raw/reducedCollectableInventoryItems.json`
    };
};