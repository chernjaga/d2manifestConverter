module.exports = {
    setLanguage: function getPropertiesObject(lang) {
        return {
            collectibleItems: {
                url: `https://destiny.plumbing/${lang}/raw/DestinyCollectibleDefinition.json`,
                name: 'DestinyCollectibleDefinition'
            },
            damageTypeDefinition: {
                url: `https://destiny.plumbing/${lang}/raw/DestinyDamageTypeDefinition.json`,
                name: 'reducedDamageTypeDefinition'
            },
            itemCategoryDefinition: {
                url: `https://destiny.plumbing/${lang}/raw/DestinyItemCategoryDefinition.json`,
                name: 'reducedItemCategoryDefinition'
            },
            inventoryItemDefinition: {
                url: `https://destiny.plumbing/${lang}/raw/DestinyInventoryItemDefinition.json`,
                name: 'reducedInventoryItemDefinition'
            },
            itemTierTypeDefinition: {
                url: `https://destiny.plumbing/${lang}/raw/DestinyItemTierTypeDefinition.json`,
                name: 'reducedItemTierTypeDefinition'
            },
            sandboxPerkDefinition: {
                url: `https://destiny.plumbing/${lang}/raw/DestinySandboxPerkDefinition.json`,
                name: 'reducedSandboxPerkDefinition'
            },
            statDefinition: {
                url: `https://destiny.plumbing/${lang}/raw/DestinyStatDefinition.json`,
                name: 'reducedStatDefinition'
            },
            statGroupDefinition: {
                url: `https://destiny.plumbing/${lang}/raw/DestinyDestinyStatGroupDefinition.json`,
                name: 'reducedDestinyStatGroupDefinition'
            },
            reducedCollectableInventoryItems: {
                url: `https://destiny.plumbing/${lang}/raw/reducedCollectableInventoryItems.json`,
                name: 'reducedCollectableInventoryItem'
            }
        };
    }
}