const color = require('colors');
const fs = require('fs');
const seasonMap = require('./seasonMaps');

const activityMap = require('./activityMap');

var errorsObj = {
    errorsSummary: 0,
    errors: {}
};

function consoleReport() {
    console.log(' ');
    console.log('LOG:'.white);
    console.log(`Errors summary: ${errorsObj.errorsSummary} errors`.white);
    console.log(' ');
    for (let item in errorsObj.errors) {
        let error = errorsObj.errors[item];
        console.log(`${item} level: ${error.count}`.white);
        for (var message in error.msg) {
            console.log(`    ${message}: ${error.msg[message].count} time(s)`.green);
            if (error.msg[message].stack) {
                console.log(`     ${error.msg[message].stack}`.green);
            }
        }
        console.log(' ');
    }
}

function errorHandler(message, level, stackTrace) {
    var isCounterStart = false;
    errorsObj.errorsSummary = errorsObj.errorsSummary + 1;
    if (!errorsObj.errors[level]) {
        errorsObj.errors[level] = {};
        errorsObj.errors[level].count = 1;
        isCounterStart = true;
    }
    if (!isCounterStart) {
        errorsObj.errors[level].count = errorsObj.errors[level].count + 1;
    }
    if (!errorsObj.errors[level].msg) {
        errorsObj.errors[level].msg = {};
        errorsObj.errors[level].msg[message] = {};
        errorsObj.errors[level].msg[message].count = 1;
        errorsObj.errors[level].msg[message].stack = stackTrace;
    } else {
         errorsObj.errors[level].msg[message].count =  errorsObj.errors[level].msg[message].count + 1;
    }
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
                        errorHandler(error.message, 'socket');
                    }                    
                    reducedSockets[socket].investmentStats = investmentStats;
                }
            }

        } catch (error) {
            errorHandler(error.message, 'sockets');
        }
    }

    return reducedSockets;
};

function correctDamageTypes(data) {
    let outputData = {}
    for (let index in data) {
        outputData[data[index].hash] = data[index];
    }

    return outputData;
};

function getAmmoType(slotHash, weaponClassHash) {
    if (slotHash === 4) {
        return 3;
    }
    var specialHashes = {
        '9': true,
        '10': true,
        '11': true,
        '153950757': true,
        '1504945536': true,
        '2489664120': true
    };
    if (specialHashes[weaponClassHash]) {
        return 2;
    }
    return 1;
};

function generateApplicationData (responses, lang) {
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
    let collectibles = responses[6];
    let sources = {};

    // src level
    try {
        for (let item in collectibles) {
            let mappedSrc = activityMap[lang][collectibles[item].sourceHash];
            sources[collectibles[item].itemHash] = {}
            sources[collectibles[item].itemHash].name = mappedSrc ? mappedSrc.section : activityMap[lang].other.section;
            sources[collectibles[item].itemHash].subSection =  mappedSrc ? mappedSrc.subSection : '';
            sources[collectibles[item].itemHash].description = collectibles[item].sourceString;
            sources[collectibles[item].itemHash].hash = collectibles[item].sourceHash;
            try {
                sources[collectibles[item].itemHash].requirements = collectibles[item].stateInfo.requirements.entitlementUnavailableMessage;
            } catch (e) {
                console.log('season requirments can not be acuired');
            }
        }
    } catch (error) {
        errorHandler(error.message, 'source');
    }

    for (let item in weaponDefinition) {

        // cycle to iterate the weapon item type. Definition level

            if (weaponDefinition[item].itemCategoryHashes &&  (weaponDefinition[item].itemCategoryHashes[1] === 1  || weaponDefinition[item].itemCategoryHashes[0] === 1 || weaponDefinition[item].itemCategoryHashes[2] === 1)) {

                try {
                    let displayedPropertyObject = weaponDefinition[item].displayProperties;
                    let statsObject = {};
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
                                icon: damageTypeItem.hasIcon ? damageTypeItem.icon : null,
                                hash: damageTypeHash
                            };
                        }
                    } catch (error) {
                        errorHandler(error.message, 'damage type');
                    }

                    // stats level

                    try {

                        for (let stat in weaponDefinition[item].stats.stats) {
                            if (stats[stat].displayProperties.name) {
                                statsObject[stat] = {
                                    statName: stats[stat].displayProperties.name,
                                    statValue: weaponDefinition[item].stats.stats[stat].value,
                                    minValue: weaponDefinition[item].stats.stats[stat].minimum,
                                    maxValue: weaponDefinition[item].stats.stats[stat].maximum,
                                    hash: stat
                                };
                            }
                        };
                    } catch (error) {
                        errorHandler(error.message, 'stats');
                    };

                    // perks level

                    try {
                        let perksItems = weaponDefinition[item].sockets ? weaponDefinition[item].sockets.socketEntries : [];

                        for (let perk in perksItems) {
                            let perkObjectToPush = {};
                            let hash = perksItems[perk].singleInitialItemHash;
                            let randomizedPerks = [];
                            let tempPerksMap = {};
                            if (perksItems[perk].randomizedPlugItems.length) {
                                for (let randomizedPerk of perksItems[perk].randomizedPlugItems) {
                                    if (!tempPerksMap[randomizedPerk.plugItemHash]) {
                                        tempPerksMap[randomizedPerk.plugItemHash] = true;
                                        randomizedPerks.push(randomizedPerk.plugItemHash);
                                    }
    
                                }
                            }
                            if (perksItems[perk].reusablePlugItems.length) {
                                for (let randomizedPerk of perksItems[perk].reusablePlugItems) {
                                    if (!tempPerksMap[randomizedPerk.plugItemHash]) {
                                        tempPerksMap[randomizedPerk.plugItemHash] = true;
                                        randomizedPerks.push(randomizedPerk.plugItemHash);
                                    }
    
                                }
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
                                        icon: displayObject.hasIcon ? displayObject.icon : null,
                                        investmentStats: investmentStats,
                                        hash: hash
                                    };
                                }
                            }
                        }

                    } catch (error) {
                        errorHandler(error.message, 'perks');
                    }

                    reducedWeaponDescription = {
                        displayedProperties: {
                            name: displayedPropertyObject.name,
                            icon: displayedPropertyObject.hasIcon ? displayedPropertyObject.icon : null
                        },
                        rarity: {
                            name: weaponDefinition[item].inventory.tierTypeName,
                            hash: weaponDefinition[item].inventory.tierType
                        },
                        slot: {
                            name: categories[weaponDefinition[item].itemCategoryHashes[0]].displayProperties.name || null,
                            hash: weaponDefinition[item].itemCategoryHashes[0]
                        },
                        source: {
                            name: sources[item].name,
                            hash: sources[item].hash,
                        },
                        season: {
                            name: getSeason(weaponDefinition[item].hash, sources[item].requirements, sources[item].hash),
                        },
                        class: {
                            name: weaponDefinition[item].itemTypeDisplayName || null,
                            hash: weaponDefinition[item].itemCategoryHashes[3] || weaponDefinition[item].itemCategoryHashes[2]
                        },
                        ammoType: getAmmoType(weaponDefinition[item].itemCategoryHashes[0], weaponDefinition[item].itemCategoryHashes[3] || weaponDefinition[item].itemCategoryHashes[2]),
                        damageType: damageTypeObject,
                        hash: weaponDefinition[item].hash
                    };
                

                    reducedWeapon[weaponDefinition[item].hash] = reducedWeaponDescription;
                    reducedWeaponStats[weaponDefinition[item].hash] = {
                        stats: statsObject,
                        perks: perksArray,
                        description: displayedPropertyObject.description,
                        source: sources[item].description,
                        screenshot: weaponDefinition[item].screenshot ? weaponDefinition[item].screenshot : null
                    }

                } catch (error) {
                    errorHandler(error.message, 'displayed properties', error.stack);
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
    consoleReport();
};

function getSeason(itemHash, requirementsString, activityHash) {
    var exceptions = seasonMap.exceptions;
    var seasonActivities = seasonMap.seasonActivities;
    var requirements = seasonMap.requirements;
    try {
        if (exceptions[itemHash]) {
            return exceptions[itemHash];
        }
        if (seasonActivities[activityHash]) {
            return seasonActivities[activityHash];
        }
        if (requirements[requirementsString]) {
            return requirements[requirementsString];
        }
    
        return 1;
    } catch (err) {
        console.log('season isn\'t detected');
        console.log(err);
    }

}

module.exports = {
    generateSocketsData: generateSocketsData,
    correctDamageTypes: correctDamageTypes,
    generateApplicationData: generateApplicationData
}