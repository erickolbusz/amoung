//-------------------------------------------------------------------------------------------------------------------------------------------------------- GLOBALS
const CURRANNOUNCEVERSION = "v3"; //update this when new announcement is made
const SHOWANNOUNCEMENT = true;

const MAPLISTURL = "https://amongus.nyc/static/KSFmaps.csv";
var db;
var table;
var globalDbTimeout = 5000; //in ms
var note_tempNoteStr = ""; //temp note placeholder
var isMapPage; //are we on map page or todo page
var globalCurrentNote; //the current note (for refocusing)
var newDataNeedRerender; //do we need to rerender the table when closing the updater modal?

//settings modal stuff
var oldSettings = {};
var newSettings;
var oldSettingsVal;

//loaded in onready
var globalIsTodo, navbarTitle;
var hideExtraCols, entriesPerPage, todosPerPage;
var MapTableNameWidth, MapTableTierWidth, MapTableGroupWidth;
var TodoTableNameWidth, TodoTableGoalWidth, TodoTableCurrWidth, TodoTableOrigWidth;


//not all of this is needed in its full capacity by both tables but it's more hassle to split the information up
//-------------------------------------------------------------- GROUPS

// var KSFGroupContent = ["N/A",null,6,5,4,3,2,1,"10","9","8","7","6","5","4","3","2","1"]; //from ksf.surf, [0] is NOT USED!! USE COMPLETION TO CHECK IF COMPLETE

var groupLabels = ["0","G7","G6","G5","G4","G3","G2","G1","R10","R9","R8","R7","R6","R5","R4","R3","R2","WR"]; //what it's saved as in the db
var groupContent = ["close","No Group","G6","G5","G4","G3","G2","G1","#10","#9","#8","#7","#6","#5","#4","#3","#2","star"]; //the actual cell content in the table
var groupIcons = [true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true]; //is the content a google icon?


var todoGroupLabels = ["G7","G6","G5","G4","G3","G2","G1","TOP","WR","IMP"]; //here the default index is -1, we truncate the left side of the list based on rank
var todoGroupIcons = [false,false,false,false,false,false,false,false,true,false]; //is the content a google icon
var todoGroupContent = ["Complete","G6","G5","G4","G3","G2","G1","Top","star","Improve"]; //the actual cell content
var todoCompleteLabels = ["todo:incomplete", "todo:complete"];


//-------------------------------------------------------------- STAGES

var globalTodoStageCutoff = 3; //not todo is 0,1,2, so >=3 (3,4,5) are marked as todo 

var stageLabels = ["0","1","WR"];
var stageContent = ["close","check","star"];
//no stageIcons because they're all just true

var todoStageLabels = ["1","WR","IMP"];
var todoStageIcons = [true,true,false];
var todoStageContent = ["check","star","Improve"];


//-------------------------------------------------------------- BONUSES

var globalTodoBonusCutoff = 3; //not todo is 0,1,2, so >=3 (3,4,5) are marked as todo 

var bonusLabels = ["0","1","WR"];
var bonusContent = ["close","check","star"];
//no bonusIcons because they're all just true

var todoBonusLabels = ["1","WR","IMP"];
var todoBonusIcons = [true,true,false];
var todoBonusContent = ["check","star","Improve"];


//-------------------------------------------------------------- MISC LABELS

var compContent = ["map:incomplete", "map:complete", "map:complete map:perfect"]; //what the table shows for map/todo completes


//-------------------------------------------------------------- COLOR SCHEMES

const lightmodeColorDict = {
    "bodyFtCol": "#000000",
    "bodyBgCol": "#eeeeee",
    "navbarFtCol": "#ffffff",
    "navbarBgCol": "#213552",
    "tableHeaderFtCol": "#ffffff",
    "tableHeaderBgCol": "#578eda",
    "mapcomp-cell-0FtCol": "#000000",
    "mapcomp-cell-0BgCol": "#ffffff",

    "comp-cell-G7FtCol": "#613626",
    "comp-cell-G7BgCol": "#a1887f",
    "comp-cell-G6FtCol": "#4d6220",
    "comp-cell-G6BgCol": "#92a46c",
    "comp-cell-G5FtCol": "#1c6420",
    "comp-cell-G5BgCol": "#5fa763",
    "comp-cell-G4FtCol": "#19654e",
    "comp-cell-G4BgCol": "#53a98f",
    "comp-cell-G3FtCol": "#155067",
    "comp-cell-G3BgCol": "#478fab",
    "comp-cell-G2FtCol": "#122068",
    "comp-cell-G2BgCol": "#3c4fad",
    "comp-cell-G1FtCol": "#2f0f68",
    "comp-cell-G1BgCol": "#5e31ae",

    "comp-cell-R10FtCol": "#5c0c6a",
    "comp-cell-R10BgCol": "#9c27b0",
    "comp-cell-R9FtCol": "#5c0c6a",
    "comp-cell-R9BgCol": "#a02fb3",
    "comp-cell-R8FtCol": "#5c0c6a",
    "comp-cell-R8BgCol": "#a437b6",
    "comp-cell-R7FtCol": "#5c0c6a",
    "comp-cell-R7BgCol": "#a73fb9",
    "comp-cell-R6FtCol": "#5c0c6a",
    "comp-cell-R6BgCol": "#ab48bc",
    "comp-cell-R5FtCol": "#5c0c6a",
    "comp-cell-R5BgCol": "#af50bf",
    "comp-cell-R4FtCol": "#5c0c6a",
    "comp-cell-R4BgCol": "#b258c2",
    "comp-cell-R3FtCol": "#5c0c6a",
    "comp-cell-R3BgCol": "#b660c5",
    "comp-cell-R2FtCol": "#5c0c6a",
    "comp-cell-R2BgCol": "#ba68c8",

    "null-cellFtCol": "#000000",
    "null-cellBgCol": "#bdbdbd",
    "comp-cell-0FtCol": "#a61919",
    "comp-cell-0BgCol": "#e57373",
    "comp-cell-1FtCol": "#27772a",
    "comp-cell-1BgCol": "#81c784",
    "comp-cell-WRFtCol": "#987f10",
    "comp-cell-WRBgCol": "#fdd835",
    "todo-cell-group-G7FtCol": "#613626",
    "todo-cell-group-G7BgCol": "#a1887f",
    "todo-cell-group-IMPFtCol": "#000000",
    "todo-cell-group-IMPBgCol": "#bdbdbd",
    "todo-cell-group-TOPFtCol": "#5c0c6a",
    "todo-cell-group-TOPBgCol": "#af50bf"
};

const darkmodeColorDict = {
    "bodyFtCol": "#eeeeee",
    "bodyBgCol": "#2e3740",
    "navbarFtCol": "#eeeeee",
    "navbarBgCol": "#213552",
    "tableHeaderFtCol": "#eeeeee",
    "tableHeaderBgCol": "#335380",
    "mapcomp-cell-0FtCol": "#eeeeee",
    "mapcomp-cell-0BgCol": "#677180",

    "comp-cell-G7FtCol": "#613626",
    "comp-cell-G7BgCol": "#a1887f",
    "comp-cell-G6FtCol": "#4d6220",
    "comp-cell-G6BgCol": "#92a46c",
    "comp-cell-G5FtCol": "#1c6420",
    "comp-cell-G5BgCol": "#5fa763",
    "comp-cell-G4FtCol": "#19654e",
    "comp-cell-G4BgCol": "#53a98f",
    "comp-cell-G3FtCol": "#155067",
    "comp-cell-G3BgCol": "#478fab",
    "comp-cell-G2FtCol": "#122068",
    "comp-cell-G2BgCol": "#3c4fad",
    "comp-cell-G1FtCol": "#2f0f68",
    "comp-cell-G1BgCol": "#5e31ae",

    "comp-cell-R10FtCol": "#5c0c6a",
    "comp-cell-R10BgCol": "#9c27b0",
    "comp-cell-R9FtCol": "#5c0c6a",
    "comp-cell-R9BgCol": "#a02fb3",
    "comp-cell-R8FtCol": "#5c0c6a",
    "comp-cell-R8BgCol": "#a437b6",
    "comp-cell-R7FtCol": "#5c0c6a",
    "comp-cell-R7BgCol": "#a73fb9",
    "comp-cell-R6FtCol": "#5c0c6a",
    "comp-cell-R6BgCol": "#ab48bc",
    "comp-cell-R5FtCol": "#5c0c6a",
    "comp-cell-R5BgCol": "#af50bf",
    "comp-cell-R4FtCol": "#5c0c6a",
    "comp-cell-R4BgCol": "#b258c2",
    "comp-cell-R3FtCol": "#5c0c6a",
    "comp-cell-R3BgCol": "#b660c5",
    "comp-cell-R2FtCol": "#5c0c6a",
    "comp-cell-R2BgCol": "#ba68c8",

    "null-cellFtCol": "#bdbdbd",
    "null-cellBgCol": "#6f6f6f",    
    "comp-cell-0FtCol": "#a61919",
    "comp-cell-0BgCol": "#c46363", //v *= 0.85
    "comp-cell-1FtCol": "#27772a",
    "comp-cell-1BgCol": "#6da870", //v *= 0.85
    "comp-cell-WRFtCol": "#987f10",
    "comp-cell-WRBgCol": "#d6b72d", //v *= 0.85
    "todo-cell-group-G7FtCol": "#613626",
    "todo-cell-group-G7BgCol": "#a1887f",
    "todo-cell-group-IMPFtCol": "#bdbdbd",
    "todo-cell-group-IMPBgCol": "#6f6f6f",
    "todo-cell-group-TOPFtCol": "#5c0c6a",
    "todo-cell-group-TOPBgCol": "#af50bf"
};



//-------------------------------------------------------------------------------------------------------------------------------------------------------- DATA STORAGE

function getInitLocalStorage(varName, initValue, getFormatter=null, setFormatter=null) {
    let savedVal = localStorage.getItem(varName);

    if (savedVal === null) {
        savedVal = initValue;
        if (setFormatter) { localStorage.setItem(varName, setFormatter(initValue)); }
        else { localStorage.setItem(varName, initValue); }
    }
    else if (getFormatter) { savedVal = getFormatter(savedVal); }

    return savedVal;
}


async function openDatabase() {
    return new Promise(function(resolve, reject) {
        openRequest = window.indexedDB.open("MyTestDatabase", 2);
        let dbtemp;
        let isDbReady = false;

        //new db version (maybe need to build it)
        openRequest.onupgradeneeded = function(event) {
            dbtemp = openRequest.result;
            //maybe instead of adding each map one by one, parse all, see what's not in, add it?

            switch(event.oldVersion) { // existing db version
                default:
                    console.error(`Database error: bad version`);
                    break;
                case 0:
                    //need to build the db

                    //todo table first
                    //each todo is [name, type, number], original, goal, isdone, whendone, note?; current (read from other table)
                    const todoTable = dbtemp.createObjectStore('todo', {keyPath: ['mapName', 'todoType', 'number']}); //e.g. "beginner", "stage", 4 
                    todoTable.createIndex("removeCheckbox", "removeCheckbox", { unique: false }); //so we can delete all the marked ones
                    todoTable.createIndex("mapName", "mapName", { unique: false });

                    const mapTable = dbtemp.createObjectStore('maps', {keyPath: 'mapID'}); //this is the key because there's a 0.01% chance that the map name changes e.g. _fix, only used when checking for new maps
                    mapTable.createIndex("mapName", "mapName", { unique: true }); //the actual key used normally, e.g. for any db functions
                    mapTable.createIndex("tier", "tier", { unique: false }); //so we can search by tier

                    //get all the map data :)
                    fetch(MAPLISTURL).then((res) => res.text()).then((text) => {
                        //each map has {mapname, tier, maptype, cp_count, b_count, group, cp_pr, b_pr, map_note, group_note, cp_notes, b_notes}
                        // 0 = not beaten (X)
                        // 1 = beaten (checkmark)
                        // G6 = group 6 e.g.
                        // R9 = rank 9 e.g.
                        // WR 
                        let ALLMAPINFO = parseCSV(text);
                        let headers = ALLMAPINFO[0];
                        const IDI = headers.indexOf("ID");
                        const DATEI = headers.indexOf("Date Added");
                        const NAMEI = headers.indexOf("Map name");
                        const TIERI = headers.indexOf("Tier");
                        const TYPEI = headers.indexOf("Type");
                        const STAGESI = headers.indexOf("Stages/Cps");
                        const BONUSESI = headers.indexOf("Bonuses");
                        let allMaps = [];

                        let thisMapInfo, tierI, numStages, numBonuses, numId;
                        for (let mapi=1; mapi<ALLMAPINFO.length; mapi++) { //skip the header line
                            thisMapInfo = ALLMAPINFO[mapi];

                            //tierI = thisMapInfo[TIERI] - 1; //for arr indexing
                            if (isStaged(thisMapInfo[TYPEI])) { //we have stages
                                numStages = +thisMapInfo[STAGESI];
                            }
                            else { numStages = 0; } //not staged

                            numBonuses = +thisMapInfo[BONUSESI];
                            numId = +thisMapInfo[IDI]; //otherwise surf_exile, id "89", is under surf_dmd, id "822" due to alphabetical ordering
                            allMaps.push({mapID: numId,
                                mapDate: thisMapInfo[DATEI],
                                mapName: thisMapInfo[NAMEI].substr(5),
                                tier: thisMapInfo[TIERI],
                                mapType: thisMapInfo[TYPEI],
                                cp_count: thisMapInfo[STAGESI],
                                group: groupLabels[0],
                                stage_pr: "0".repeat(numStages), //"" if linear map
                                b_pr: "0".repeat(numBonuses),
                                map_note: "",
                                groupTodo: false,
                                isComplete: compContent[0]
                            });
                        }

                        const mapTable = dbtemp.transaction("maps", "readwrite").objectStore("maps");
                        allMaps.forEach((map) => {
                            let requestCreate = mapTable.add(map);
                            requestCreate.onsuccess = function() {
                                //console.log("added map", event.target.result);
                            };
                        });

                        localStorage.setItem('isDbBuilt','true');
                        localStorage.setItem('lastDbUpdate',new Date());

                    }).catch((e) => console.error(e)); //maybe add fallback of a mirror here?
                    break;
                case 1:
                    //the only change from amongus v1 is that todos now have the mapID field
                    //this is used for better updating them etc
                    //because honestly they could just rename a map to literally anything and I'd have to deal with it
                    //if we landed here that means that the user has already used amongus v1
                    //and so we just need to add the field to their todos and we're ok

                    console.log("Upgrading database from v1 to v2...");

                    dbGetAllMaps().then((res) => { if (Array.isArray(res)) { //get all the maps in the db
                        todoUpdates = [];

                        res.forEach((currentMap) => { //for each map
                            dbGetTodosByMap(currentMap.mapName).then((mapTodos) => { if (Array.isArray(mapTodos)) { //get all todos for this map
                                mapTodos.forEach((todoInfo) => { //for each todo
                                    todoUpdates.push( dbTodoV1toV2([todoInfo.mapName,todoInfo.todoType,todoInfo.number], currentMap.mapID) ); //add the id field
                                });
                            }});
                        });

                        Promise.all(todoUpdates).then((updates) => {
                            let numUpdates = 0;
                            updates.forEach((resolution) => {
                                if (resolution === "Success") { numUpdates++; }
                            });
                            console.log(`Updated ${numUpdates} todos`);
                        });
                    }});
                    break;
            }
        };

        openRequest.onblocked = (event) => {
            //shouldn't trigger if we handle onversionchange
            //but this is webdev and you never know lol
            reject(`There is a new version of the database, and you have an old version open. Please finish what you were doing there and reload: ${event.target.errorCode}`);
        };

        openRequest.onsuccess = (event) => {
            dbtemp = event.target.result;

            dbtemp.onversionchange = function() {
                //new version of db in a new tab
                //I choose to block the new version
                //so nothing happens here
            };

            //generic error handling for the db
            dbtemp.onerror = (event) => {
                console.error(`Database error: ${event.target.errorCode}`);
            };

            isDbReady = true;
        };

        openRequest.onerror = (event) => {
            reject(`IndexedDB was blocked and is required to run. ${event.target.errorCode}`);
        };

        //wait for the db to load and resolve it
        const waitForDb = setInterval(function() {
            const startTime = new Date();
            if (isDbReady && localStorage.getItem('isDbBuilt') === 'true') {
                resolve(dbtemp);
                clearInterval(waitForDb); //redundant?
            } else if (new Date() - startTime > globalDbTimeout) { //timeout
                reject("The database did not respond.");
                clearInterval(waitForDb); //redundant?
            }
        }, 5);

        return;
    });
}


//-------------------------------------------------------------- DB UPDATER

async function dbTodoV1toV2(todoInfo,mapID) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo","readwrite").objectStore("todo");
            const requestGet = todoTable.get(todoInfo);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let todoItem = requestGet.result;

                    todoItem.mapID = mapID;

                    const requestUpdate = todoTable.put(todoItem);

                    requestUpdate.onsuccess = function() {
                        resolve("Success"); return;
                    }
                    requestUpdate.onerror = function() { resolve(-4); return; }
                }
                else { resolve(-3); return; }
            }
            requestGet.onerror = function () { resolve(-2); return; }
        });
    }
    else { return -1; }
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------- DB FUNC NEEDED FOR BOTH
//-------------------------------------------------------------- GETTING ALL 

async function dbGetAllMaps() {
    if (db) {
        return new Promise(function(resolve,reject) {
            const mapTable = db.transaction("maps").objectStore("maps"); //readonly
            const requestGet = mapTable.getAll();

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    resolve(requestGet.result); return;
                } 
                else { resolve([]); return; } //no maps?
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}


//-------------------------------------------------------------- GROUPS

async function dbChangeGroup(mapName,dGroup) {
    if (db && dGroup !== 0) {
        return new Promise(function(resolve,reject) {
            const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
            const requestGet = mapTable.index("mapName").get(mapName);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let mapInfo = requestGet.result;
                    let groupi = groupLabels.indexOf(mapInfo.group);
                    if (groupi === 0) {
                        //map is marked as completed, check off all previously unbeaten stages
                        mapInfo.stage_pr = mapInfo.stage_pr.replaceAll("0","1"); 
                        let strCutoff   = ''+globalTodoStageCutoff; //for maximum robustness
                        let strCutoffpp = ''+(globalTodoStageCutoff+1);
                        mapInfo.stage_pr = mapInfo.stage_pr.replaceAll(strCutoff,strCutoffpp); 
                    }
                    //javascript is a real work of art and (-1)%length = -1, not length-1, so I have to do this crap
                    while (groupi+dGroup < 0) { groupi += groupLabels.length; }
                    let newGroupi = (groupi+dGroup)%groupLabels.length;
                    let newGroup = groupLabels[newGroupi];

                    mapInfo.group = newGroup;

                    if (isPerfect(mapInfo)) { mapInfo.isComplete = compContent[2]; }
                    else if (isComplete(mapInfo)) { mapInfo.isComplete = compContent[1]; }
                    else { mapInfo.isComplete = compContent[0]; }

                    const requestUpdate = mapTable.put(mapInfo);

                    requestUpdate.onsuccess = function() {
                        resolve(mapInfo); return;
                    }
                    requestUpdate.onerror = function() { resolve(-4); return; }
                } 
                else { resolve(-3); return; } //no maps for that tier
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}

// async function dbSyncSetGroup(mapName,groupLabeli) {
//     if (db) {
//         return new Promise(function(resolve,reject) {
//             const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
//             const requestGet = mapTable.index("mapName").get(mapName);
//                     // console.log("AAA");

//             requestGet.onsuccess = function() {
//                     // console.log("AA");
//                 if (requestGet.result !== undefined) {
//                     let mapInfo = requestGet.result;
//                     // console.log("A",mapInfo);
//                     mapInfo.group = groupLabels[groupLabeli];
//                     // console.log("B",mapInfo);

//                     if (isPerfect(mapInfo)) { mapInfo.isComplete = compContent[2]; }
//                     else if (isComplete(mapInfo)) { mapInfo.isComplete = compContent[1]; }
//                     else { mapInfo.isComplete = compContent[0]; }

//                     // console.log("C",mapInfo);

//                     const requestUpdate = mapTable.put(mapInfo);

//                     requestUpdate.onsuccess = function() {
//                         resolve(mapInfo); return;
//                     }
//                     requestUpdate.onerror = function() { resolve(-4); return; }
//                 } 
//                 else { resolve(-3); return; } //no maps for that tier
//             }
//             requestGet.onerror = function() { resolve(-2); return; }
//         });
//     }
//     else { return -1; }
// }


//-------------------------------------------------------------- STAGES

async function dbChangeStage(mapName,stagei,dStage) {
    if (db && dStage !== 0) {
        return new Promise(function(resolve,reject) {
            const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
            const requestGet = mapTable.index("mapName").get(mapName);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let mapInfo = requestGet.result;
                    let prStr = mapInfo.stage_pr;
                    let thisStage = prStr.charAt(stagei); //"0", "1", or "2" UNLESS it's to do then it's 3 4 5

                    if (thisStage === "") { resolve(-4); return; } //stagei > prStr.length
                    thisStage = +thisStage; //so we can do arithmetic with negative numbers (I LOVE JAVASCRIPT)
                    let stageIsTodo = false;
                    if (isStageCellTodo(thisStage)) {
                        thisStage -= globalTodoStageCutoff; //to kick out the todo part
                        stageIsTodo = true;
                    }
                    while (thisStage+dStage < 0) { thisStage += stageLabels.length; }

                    let newStage = (thisStage+dStage)%stageLabels.length;
                    if (stageIsTodo) { newStage+=globalTodoStageCutoff; } //add the todo back
                    mapInfo.stage_pr = prStr.slice(0,stagei) + newStage + prStr.slice(stagei+1); //strings are immutable so we have to do this

                    if (isPerfect(mapInfo)) { mapInfo.isComplete = compContent[2]; }
                    else if (isComplete(mapInfo)) { mapInfo.isComplete = compContent[1]; }
                    else { mapInfo.isComplete = compContent[0]; }

                    const requestUpdate = mapTable.put(mapInfo);

                    requestUpdate.onsuccess = function() {
                        resolve(mapInfo); return;
                    }
                    requestUpdate.onerror = function() { resolve(-5); return; }
                } 
                else { resolve(-3); return; } //no maps for that tier
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}

// async function dbSyncSetStage(mapName,stageStr) { //overwrite stage pr str
//     if (db) {
//         return new Promise(function(resolve,reject) {
//             const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
//             const requestGet = mapTable.index("mapName").get(mapName);

//             requestGet.onsuccess = function() {
//                 if (requestGet.result !== undefined) {
//                     let mapInfo = requestGet.result;

//                     //have to copy over the todos from the old str lol
//                     let prStr = mapInfo.stage_pr;
//                     let newPrStr = "";
//                     for (let si=0; si<prStr.length; si++) {
//                         if (isStageCellTodo(prStr[si])) { newPrStr += makeStageTodo(stageStr[si]); }
//                         else { newPrStr += stageStr[si]; }
//                     }

//                     mapInfo.stage_pr = newPrStr;

//                     //check for completes etc
//                     if (isPerfect(mapInfo)) { mapInfo.isComplete = compContent[2]; }
//                     else if (isComplete(mapInfo)) { mapInfo.isComplete = compContent[1]; }
//                     else { mapInfo.isComplete = compContent[0]; }

//                     const requestUpdate = mapTable.put(mapInfo);

//                     requestUpdate.onsuccess = function() {
//                         resolve(mapInfo); return;
//                     }
//                     requestUpdate.onerror = function() { resolve(-5); return; }
//                 } 
//                 else { resolve(-3); return; } //no maps for that tier
//             }
//             requestGet.onerror = function() { resolve(-2); return; }
//         });
//     }
//     else { return -1; }
// }


//-------------------------------------------------------------- BONUSES

async function dbChangeBonus(mapName,bonusi,dBonus) {
    if (db && dBonus !== 0) {
        return new Promise(function(resolve,reject) {
            const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
            const requestGet = mapTable.index("mapName").get(mapName);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let mapInfo = requestGet.result;
                    let prStr = mapInfo.b_pr;
                    let thisBonus = prStr.charAt(bonusi); //"0", "1", or "2"

                    if (thisBonus === "") { resolve(-4); return; } //bonusi > prStr.length
                    thisBonus = +thisBonus; //so we can do arithmetic with negative numbers (I LOVE JAVASCRIPT)
                    let bonusIsTodo = false;
                    if (isBonusCellTodo(thisBonus)) {
                        thisBonus -= globalTodoBonusCutoff; //to kick out the todo part
                        bonusIsTodo = true;
                    }
                    while (thisBonus+dBonus < 0) { thisBonus += bonusLabels.length; }

                    let newBonus = (thisBonus+dBonus)%bonusLabels.length;
                    if (bonusIsTodo) { newBonus+=globalTodoBonusCutoff; } //add the todo back
                    mapInfo.b_pr = prStr.slice(0,bonusi) + newBonus + prStr.slice(bonusi+1); //strings are immutable so we have to do this

                    if (isPerfect(mapInfo)) { mapInfo.isComplete = compContent[2]; }
                    else if (isComplete(mapInfo)) { mapInfo.isComplete = compContent[1]; }
                    else { mapInfo.isComplete = compContent[0]; }

                    const requestUpdate = mapTable.put(mapInfo);

                    requestUpdate.onsuccess = function() {
                        resolve(mapInfo); return;
                    }
                    requestUpdate.onerror = function() { resolve(-5); return; }
                } 
                else { resolve(-3); return; } //no maps for that tier
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}

// async function dbSyncSetBonus(mapName,bonusStr) { //overwrite bonus pr str
//     if (db) {
//         return new Promise(function(resolve,reject) {
//             const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
//             const requestGet = mapTable.index("mapName").get(mapName);

//             requestGet.onsuccess = function() {
//                 if (requestGet.result !== undefined) {
//                     let mapInfo = requestGet.result;



//                     //check for completes etc
//                     if (isPerfect(mapInfo)) { mapInfo.isComplete = compContent[2]; }
//                     else if (isComplete(mapInfo)) { mapInfo.isComplete = compContent[1]; }
//                     else { mapInfo.isComplete = compContent[0]; }

//                     const requestUpdate = mapTable.put(mapInfo);

//                     requestUpdate.onsuccess = function() {
//                         resolve(mapInfo); return;
//                     }
//                     requestUpdate.onerror = function() { resolve(-5); return; }
//                 } 
//                 else { resolve(-3); return; } //no maps for that tier
//             }
//             requestGet.onerror = function() { resolve(-2); return; }
//         });
//     }
//     else { return -1; }
// }


//-------------------------------------------------------------- GROUP, STAGE, BONUS ALL AT ONCE FOR SYNC

async function dbSyncSetMapData(mapName,groupLabeli,stageStr,bonusStr) {
    if (db) {
        return new Promise(function(resolve,reject) {
                                                                                                                                    // let start = performance.now(); let end;
            const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
            const requestGet = mapTable.index("mapName").get(mapName);

            requestGet.onsuccess = function() {

                if (requestGet.result !== undefined) {
                                                                                                                                    // end = performance.now();
                                                                                                                                    //console.log(mapName,"REQ1",end-start);                                                                                                                                    

                    let mapInfo = requestGet.result;

                    mapInfo.group = groupLabels[groupLabeli];

                    //have to copy over the todos from the old str lol
                    let prStr = mapInfo.stage_pr;
                    let newPrStr = "";
                    for (let si=0; si<prStr.length; si++) {
                        if (isStageCellTodo(prStr[si])) { newPrStr += makeStageTodo(stageStr[si]); }
                        else { newPrStr += stageStr[si]; }
                    }
                    mapInfo.stage_pr = newPrStr;


                    //have to copy over the todos from the old str lol
                    prStr = mapInfo.b_pr;
                    newPrStr = "";
                    for (let bi=0; bi<prStr.length; bi++) {
                        if (isBonusCellTodo(prStr[bi])) { newPrStr += makeBonusTodo(bonusStr[bi]); }
                        else { newPrStr += bonusStr[bi]; }
                    }

                    mapInfo.b_pr = newPrStr;


                    if (isPerfect(mapInfo)) { mapInfo.isComplete = compContent[2]; }
                    else if (isComplete(mapInfo)) { mapInfo.isComplete = compContent[1]; }
                    else { mapInfo.isComplete = compContent[0]; }

                                                                                                                                    // var end = performance.now();
                                                                                                                                    //console.log(mapName,"DONE",end-start); 
                    const requestUpdate = mapTable.put(mapInfo);

                    requestUpdate.onsuccess = function() {

                                                                                                                                    // var end = performance.now();
                                                                                                                                    //console.log(mapName,"REQ2",end-start); 
                        resolve(mapInfo); return;
                    }
                    requestUpdate.onerror = function() { resolve(-4); return; }
                } 
                else { resolve(-3); return; } //no maps for that tier
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}


//-------------------------------------------------------------- DELETING TODOS

async function dbDeleteTodo(mapName,todoType,todoNum) {
    if (db) {
        return new Promise(function(resolve,reject) {
            //make sure what we're deleting exists first to save some executions
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            const requestDelete = todoTable.delete([mapName,todoType,todoNum]);

            requestDelete.onsuccess = function() {
                //now change the maptable info to unmark it
                const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
                const requestGet = mapTable.index("mapName").get(mapName);

                requestGet.onsuccess = function () {
                    if (requestGet.result !== undefined) {
                        let mapInfo = requestGet.result;
                        switch (todoType) {
                            case "group":
                                if (!mapInfo.groupTodo) { resolve("Unneeded"); return; } //not sure how but ok
                                mapInfo.groupTodo = false;
                                break;
                            case "stage":
                                prStr = mapInfo.stage_pr;
                                todoOrig = prStr.charAt(todoNum-1); //"3", "4", or "5"
                                if (todoOrig === "") { resolve(-4); return; } //num too big or too small
                                if (!isStageCellTodo(todoOrig)) { resolve("Unneeded"); return; } //not sure how but ok

                                //otherwise we need to subtract 3
                                //todoOrig is 3,4,5 otherwise we would've resolved already
                                newpr = +todoOrig-globalTodoStageCutoff;
                                mapInfo.stage_pr = prStr.slice(0,todoNum-1) + newpr + prStr.slice(todoNum); //strings are immutable so we have to do this
                                break;
                            case "bonus":
                                prStr = mapInfo.b_pr;
                                todoOrig = prStr.charAt(todoNum-1); //"3", "4", or "5"
                                if (todoOrig === "") { resolve(-4); return; } //num too big or too small
                                if (!isBonusCellTodo(todoOrig)) { resolve("Unneeded"); return; } //not sure how but ok

                                //otherwise we need to add 3 to it to mark it as todo
                                //todoOrig is 3,4,5 otherwise we would've resolved already
                                newpr = +todoOrig-globalTodoBonusCutoff;
                                mapInfo.b_pr = prStr.slice(0,todoNum-1) + newpr + prStr.slice(todoNum); //strings are immutable so we have to do this
                                break;
                            default:
                                resolve(-6); return; //we should never be here
                                break;
                        }

                        const requestUpdate = mapTable.put(mapInfo);

                        requestUpdate.onsuccess = function() {
                            resolve(mapInfo); return;
                        }
                        requestUpdate.onerror = function() { resolve(-5); return; } //deleted but not unmarked :/
                    }
                    else { resolve(-3); return; } //how the hell
                }
                requestGet.onerror = function () { resolve(-2); return; } //deleted but not unmarked :/
            }
            requestDelete.onerror = function() { resolve("Unneeded"); return; }
        });
    }
    else { return -1; }
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------- HELPER FUNC

function isStaged(mapType) { //factoring this out in case it ever changes
    return (mapType == "Staged" || mapType == "Staged-Linear");
}

function parseCSV(str) {
    //thanks Trevor
    //https://stackoverflow.com/questions/1293147/how-to-parse-csv-data/14991797#14991797
    const arr = [];
    let quote = false;  // 'true' means we're inside a quoted field

    // Iterate over each character, keep track of current row and column (of the returned array)
    for (let row = 0, col = 0, c = 0; c < str.length; c++) {
        let cc = str[c], nc = str[c+1];        // Current character, next character
        arr[row] = arr[row] || [];             // Create a new row if necessary
        arr[row][col] = arr[row][col] || '';   // Create a new column (start with empty string) if necessary

        // If the current character is a quotation mark, and we're inside a
        // quoted field, and the next character is also a quotation mark,
        // add a quotation mark to the current column and skip the next character
        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }

        // If it's just one quotation mark, begin/end quoted field
        if (cc == '"') { quote = !quote; continue; }

        // If it's a comma and we're not in a quoted field, move on to the next column
        if (cc == ',' && !quote) { ++col; continue; }

        // If it's a newline (CRLF) and we're not in a quoted field, skip the next character
        // and move on to the next row and move to column 0 of that new row
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }

        // If it's a newline (LF or CR) and we're not in a quoted field,
        // move on to the next row and move to column 0 of that new row
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        // Otherwise, append the current character to the current column
        arr[row][col] += cc;
    }
    return arr;
}

function isString(x) {
    return (typeof x === 'string' || x instanceof String);
}

function createTableHeader(colNames) {
    let retStr = "<thead><tr>";
    colNames.forEach((colName) => {
        if (isString(colName)) {
            retStr += `<th>${colName}</th>`;
        }
        else {
            retStr += `<th></th>`; //plugins and stuff
        }
    });
    retStr += "</tr></thead>";
    return retStr;
}

function genTodoName(rowData) {
    switch (rowData.todoType) {
        case "group": //want to do the map
            return rowData.mapName;
            break;
        case "stage": //want to do a stage on the map
            return rowData.mapName + " S" + rowData.number;
            break;
        case "bonus": //want to do a bonus
            return rowData.mapName + " B" + rowData.number;
            break;
        default:
            return rowData.mapName; //idk
            break;
    }
}


//-------------------------------------------------------------- CHECK COMPLETION

function isComplete(mapInfo) {
    //group is not "0", no stages are "0" or "0"+todo, no bonuses are "0" or "0"+todo
    let sCompTodo = 0+globalTodoStageCutoff;
    let bCompTodo = 0+globalTodoBonusCutoff;
    let groupCheck = !(mapInfo.group === "0");
    let stageCheck = (mapInfo.stage_pr.indexOf("0") === -1);
    let sTodoCheck = (mapInfo.stage_pr.indexOf(sCompTodo) === -1);
    let bonusCheck = (mapInfo.b_pr.indexOf("0") === -1);
    let bTodoCheck = (mapInfo.b_pr.indexOf(bCompTodo) === -1);
    return (groupCheck && stageCheck && sTodoCheck && bonusCheck && bTodoCheck);
}

function isPerfect(mapInfo) {
    //wr on everything
    let sWrTodo = 2+globalTodoStageCutoff;
    let bWrTodo = 2+globalTodoBonusCutoff;
    let groupCheck = (mapInfo.group === "WR");
    let stageCheck = (mapInfo.stage_pr.replaceAll("2","").replaceAll(sWrTodo,"") === "");
    let bonusCheck = (mapInfo.b_pr.replaceAll("2","").replaceAll(bWrTodo,"")  === "");
    return (groupCheck && stageCheck && bonusCheck);
}


//-------------------------------------------------------------- CHECK IF CELL MEETS CRITERIA

//everything is 0 1 2 for inc, comp, wrcp
//but now we've introduced todos
//this is recorded by having a +3
//so it could be 3 4 5
//this function is here in case they ever change anything
//e.g. adding top 10 for stages
function isStageCellTodo(cell) {
    cell = +cell;
    return (cell >= globalTodoStageCutoff);
}
function normStageTodo(cellNum) { if (isStageCellTodo(cellNum)) { return cellNum-globalTodoStageCutoff; } return cellNum; }
function makeStageTodo(cellStr) { let tmp = +cellStr; if (tmp < globalTodoStageCutoff) { tmp += globalTodoStageCutoff; } return tmp.toString(); }
function isBonusCellTodo(cell) {
    cell = +cell;
    return (cell >= globalTodoBonusCutoff);
}
function normBonusTodo(cellNum) { if (isBonusCellTodo(cellNum)) { return cellNum-globalTodoBonusCutoff; } return cellNum; }
function makeBonusTodo(cellStr) { let tmp = +cellStr; if (tmp < globalTodoBonusCutoff) { tmp += globalTodoBonusCutoff; } return tmp.toString(); }



//-------------------------------------------------------------------------------------------------------------------------------------------------------- UPDATE MODAL

document.getElementById("MaplistUpdateButton").onclick = function() { getNewMaps(MAPLISTURL); }

document.getElementById("KsfUpdateButton").onclick = function() { getKsfUpdate(); }


// document.getElementById("MaplistUpdateButton").onclick = function() { 
//     let maplistNum = getInitLocalStorage('DEBUGNUM', 2,
//         getFormatter = (x => +x), //str -> num
//         setFormatter = (x => x.toString())); //num -> str

//     let getUrl;
//     if (maplistNum > 6) {
//         getUrl = MAPLISTURL;
//         console.log("real maplist now");
//     }
//     else {
//         getUrl = `https://erickolbusz.github.io/surftest/mapsv${maplistNum}.csv`;
//         console.log('now on fake maplist', maplistNum);
//     }

//     //write back n+1
//     localStorage.setItem('DEBUGNUM', `${maplistNum+1}`);

//     getNewMaps(getUrl); 
// }


//-------------------------------------------------------------- HELPERS

function getNewMaps(url) {
    dbUpdateMapList(url).then((res) => { if (Array.isArray(res)) {
        let mapUpdateHTML;
        if (res.length === 0) { 
            mapUpdateHTML = '<div id="MapUpdateSuccess">Already up to date!</div>';
        }
        else {
            newDataNeedRerender = true;
            mapUpdateHTML = '<div id="MapUpdateSuccess">Update successful:</div>';
        }
        res.forEach((map) => {
            mapUpdateHTML += `<div class="mapUpdateRow">${map}</div>`;
        });
        document.getElementById("ModalMapUpdates").innerHTML = mapUpdateHTML;
        localStorage.setItem('lastDbUpdate',new Date());
        updateLastUpdateTimestamp();
    }});
}

function updateLastUpdateTimestamp() {
    let oldTime = Date.parse(localStorage.getItem('lastDbUpdate'));
    let newTime = new Date();
    let dt = Math.round((newTime - oldTime)/1000); //in seconds
    let timeStr;
    if (dt < 3) { timeStr = `just now`; }
    else {
        if (dt < 60) { timeStr = `${dt} seconds ago`; }
        else {
            dt = Math.round(dt/60); //minutes
            if (dt < 60) { timeStr = (dt === 1) ? `${dt} minute ago` : `${dt} minutes ago`; }
            else {
                dt = Math.round(dt/60); //hours
                if (dt < 24) { timeStr = (dt === 1) ? `${dt} hours ago` : `${dt} hours ago`; }
                else {
                    dt = Math.round(dt/24); //days
                    timeStr = (dt === 1) ? `${dt} day ago` : `${dt} days ago`;
                }
            }
        }  
    }
    document.getElementById('LastUpdateTimestamp').innerText = `(Last update: ${timeStr})`;
}

function updateLastSyncTimestamp() {
    let oldTime = Date.parse(localStorage.getItem('lastSync'));
    let newTime = new Date();
    let dt = Math.round((newTime - oldTime)/1000); //in seconds
    let timeStr;
    if (Number.isNaN(dt)) { //we've never synced
        timeStr = `never`;
    }
    else if (dt < 3) { timeStr = `just now`; }
    else {
        if (dt < 60) { timeStr = `${dt} seconds ago`; }
        else {
            dt = Math.round(dt/60); //minutes
            if (dt < 60) { timeStr = (dt === 1) ? `${dt} minute ago` : `${dt} minutes ago`; }
            else {
                dt = Math.round(dt/60); //hours
                if (dt < 24) { timeStr = (dt === 1) ? `${dt} hours ago` : `${dt} hours ago`; }
                else {
                    dt = Math.round(dt/24); //days
                    timeStr = (dt === 1) ? `${dt} day ago` : `${dt} days ago`;
                }
            }
        }  
    }
    document.getElementById('LastSyncTimestamp').innerText = `(Last sync: ${timeStr})`;
}

function onOpenUpdateModal() {
    newDataNeedRerender = false;

    updateLastUpdateTimestamp();
    updateLastSyncTimestamp();

    $(".SyncTexts").hide();
    $(".SyncUpdateText").hide();
    $(".SyncUpdateTextHeader").hide();
}

function onCloseUpdateModal() {
    if (newDataNeedRerender) {
        if (isMapPage) {
            dbGetAllMaps().then((res) => { if (Array.isArray(res)) {
                table.clear().rows.add(res).draw(false); //maybe should be changed to add/redraw rows :p
            }});
        }
        else {
            dbGetAllTodos().then((res) => { if (Array.isArray(res)) {
                res.forEach((row) => { row.todoName = genTodoName(row); });
                table.clear().rows.add(res).draw(false); //idk just copypasted from above
            }});
        }
    }
}

async function getKsfUpdate() {
    async function fetchJSON(url, timeout) {
        try {
            let res = await fetch(`https://cors.amongus.nyc:8008/${url}`, { signal: AbortSignal.timeout(timeout), cache: "no-cache" });
            if (!res.ok) { throw new Error("Response was not ok"); }
            return res.json(); 
        }
        catch (e) {
            console.error("Error:",e);
        }
    }

    //god bless you, this is O(n)
    //https://stackoverflow.com/a/58227831
    // const joinById = ( ...lists ) =>
    // Object.values(
    //     lists.reduce(
    //         ( idx, list ) => {
    //             list.forEach( ( record ) => {
    //                 if( idx[ record.name ] )
    //                     idx[ record.name ] = Object.assign( idx[ record.name ], record)
    //                 else
    //                     idx[ record.name ] = record
    //             } )
    //             return idx
    //         },
    //         {}
    //     )
    // );

    const steamId = getInitLocalStorage('steamId', "STEAM_X:X:XXXXXXXX");


    //stealing this from the timestamp
    let oldTime = Date.parse(localStorage.getItem('lastSync'));
    let newTime = new Date();
    let dt = Math.round((newTime - oldTime)/1000); //in seconds

    if (steamId === "STEAM_X:X:XXXXXXXX") {
        $(syncTextDomId).text(`Go set your Steam ID in Settings first!`);
    }
    else if (dt < 60*60*24) {
        $(syncTextDomId).text(`Please be nice to Sam, this has a cooldown of 24 hours. You can manually update by clicking in the meantime.`);
    }
    else {
        let syncData = [];
        table.rows().data().each((map) => {
            // if (map.tier==1) {

            syncData.push( {name: map.mapName, 
                currgroupi: groupLabels.indexOf(map.group),
                currstage_pr: map.stage_pr,
                currb_pr: map.b_pr
            }); //what we have now

            // }
        });


        let mapsSynced = 0;
        function updateSyncMessagePart1(mapsSynced) {
            $("#ModalKsfUpdates").text(`Got data for ${mapsSynced} maps...`);
        }
        function updateSyncMessagePart2() {
            $("#ModalKsfUpdates").text(`Got data for all maps. Syncing...`);
        }
        function updateSyncMessagePart3() {
            $("#ModalKsfUpdates").text(`All maps synced!`);
        }

        // syncData = [{name: "mesa_fixed", currgroupi:0, currstage_pr:"", currb_pr:""}];

    // let start = performance.now();
    // function ptime() { return `T=${performance.now()-start}`; }

        for (let mi=0; mi<syncData.length; mi++){
            let map = syncData[mi];

            //console.log(`https://ksf.surf/api/players/${steamId}/records/map/surf_${map.name}?game=css&mode=0`);
            // console.log(ptime(),mi,"START");
            let data = await fetchJSON(`https://ksf.surf/api/players/${steamId}/records/map/surf_${map.name}?game=css&mode=0`, 8000);
            console.log(data);
            // console.log(ptime(),mi,"API");

            //get current group
            //console.log("YO!", data.records);
            //console.log("YO!", data.records[0]);
            if (data.records[0].completions) { //has beaten the map
                let syncGroup = data.records[0].group;
                //console.log("YO!", syncGroup);
                switch (syncGroup) {
                    case null: //G7
                        map.newgroupi = groupLabels.indexOf("G7");
                        //console.log("surely this works)");
                        break;
                    case 0: //top or wr
                        if (data.records[0].rank === 1) { map.newgroupi = groupLabels.indexOf("WR"); } //wr
                        else { map.newgroupi = groupLabels.indexOf(`R${data.records[0].rank}`); } //top
                        break;
                    default: //1, 2, 3, 4, 5, 6 or maybe sam changed the api to troll me
                        if (!(syncGroup === 1 || syncGroup === 2 || syncGroup === 3 || syncGroup === 4 || syncGroup === 5 || syncGroup === 6)) { $("ModalKsfUpdatesError").text("The API has changed, let me know NOW (group codes have changed)"); }
                        map.newgroupi = groupLabels.indexOf(`G${syncGroup}`);
                        break;
                }
            }
            else { map.newgroupi = map.currgroupi; }

            //get current stages and bonuses
            let newstage_pr = []; //easier to .join() an array because strings are immutable
            let currStage;
            for (let si=0; si<map.currstage_pr.length; si++) {
                currStage = data.records.find(x => x.zoneId === si+1);
                //console.log("???",currStage);
                if (!currStage) { $("ModalKsfUpdatesError").text("The API has changed, let me know NOW (stage zoneIds have changed)"); }
                else if (currStage.completions) { //stage has been beaten
                    if (currStage.rank === 1) { newstage_pr.push("2"); } //wrcp
                    else { newstage_pr.push("1"); }
                }
                else { newstage_pr.push("0"); }
            }
            map.newstage_pr = newstage_pr.join("");

            let newb_pr = [];
            let currBonus;
            for (let bi=0; bi<map.currb_pr.length; bi++) {
                // console.log(bi+1+30, map);
                // console.log(data.records);

                currBonus = data.records.find(x => x.zoneId === bi+1+30);
                if (!currBonus) { $("ModalKsfUpdatesError").text("The API has changed, let me know NOW (bonus zoneIds have changed)"); }
                else if (currBonus.completions) { //bonus has been beaten
                    if (currBonus.rank === 1) { newb_pr.push("2"); } //wrb
                    else { newb_pr.push("1"); }
                }
                else { newb_pr.push("0"); }
            }
            map.newb_pr = newb_pr;


            mapsSynced++;
            updateSyncMessagePart1(mapsSynced);
            // console.log(ptime(),mi,"DONE");
            // console.log(map);
        };


        updateSyncMessagePart2(mapsSynced);

        // //merge the two datasets
        let groupUps = []; //improved
        let groupDns = []; //!rb
        let groupNws = []; //new prs

        let wrcpUps = []; //gotten
        let wrcpDns = []; //lost
        let stagePrs = [];

        let wrbUps = []; //gotten
        let wrbDns = []; //lost
        let bonusPrs = [];

        //line up what's changed
        let mapChangePromises;

        let CHUNKSIZE = 25; //do them in groups. im scared
        let mapBatch;
        // let start = performance.now();
        // function ptime() { return `T=${performance.now()-start}`; }

        let anyGroupUpdates = false;
        let anyStageUpdates = false;
        let anyBonusUpdates = false;

        for (let mapi=0; mapi<syncData.length; mapi+=CHUNKSIZE) {
            mapBatch = syncData.slice(mapi,mapi+CHUNKSIZE);
            mapChangePromises = [];

            mapBatch.forEach((map) => {

                let mapUpdatePromise = function(resolve,reject) {
                    if (map.currgroupi !== map.newgroupi || map.currstage_pr !== map.newstage_pr || map.currb_pr !== map.newb_pr) {
                        //console.log(ptime(),"ready to go to db",map.name);
                        dbSyncSetMapData(map.name,map.newgroupi,map.newstage_pr,map.newb_pr).then((res) => {
                            //console.log(ptime(),"got db response",map.name);
                            if (Number.isNaN(Number(res))) {
                                //console.log(map);

                                //console.log(ptime(),"    A",map.name);

                                if (map.newgroupi !== map.currgroupi) {
                                    anyGroupUpdates = true;
                                    if (map.newgroupi !== 0 && map.currgroupi === 0) { //new pr
                                        groupNws.push({name: map.name, currgroupi: map.currgroupi, newgroupi: map.newgroupi, str: `<b>${map.name}:</b> ${groupLabels[map.newgroupi]}`});
                                    }
                                    else if (map.currgroupi > map.newgroupi) { //went down groups
                                        groupDns.push({name: map.name, currgroupi: map.currgroupi, newgroupi: map.newgroupi, str: `<b>${map.name}:</b> ${groupLabels[map.currgroupi]} 🡒 ${groupLabels[map.newgroupi]}`});
                                    }
                                    else { //went up
                                        groupUps.push({name: map.name, currgroupi: map.currgroupi, newgroupi: map.newgroupi, str: `<b>${map.name}:</b> ${groupLabels[map.currgroupi]} 🡒 ${groupLabels[map.newgroupi]}`});
                                    }
                                }

                                //console.log(ptime(),"    B",map.name);

                                //see if we gained or lost any wrcps or beat something new
                                for (let si=0; si<map.newstage_pr.length; si++) {
                                    //console.log(ptime(),"        ",si,map.name);
                                    if (map.newstage_pr[si] === "2" && map.currstage_pr[si] !== "2") { //gained wrcp
                                        anyStageUpdates = true;
                                        wrcpUps.push({name: map.name, stage: si+1, str: `<b>${map.name}</b> S${si+1}`});
                                    }
                                    else if (map.newstage_pr[si] !== "2" && map.currstage_pr[si] === "2") { //lost wrcp
                                        anyStageUpdates = true;
                                        wrcpDns.push({name: map.name, stage: si+1, str: `<b>${map.name}</b> S${si+1}`});
                                    }
                                    else if (map.newgroupi === 0 && map.newstage_pr[si] !== "0" && map.currstage_pr[si] === "0") { //beat only this stage, not the whole map
                                        anyStageUpdates = true;
                                        stagePrs.push({name: map.name, stage: si+1, str: `<b>${map.name}</b> S${si+1}`});
                                    }
                                }

                                //console.log(ptime(),"    C",map.name);

                                //see if we gained or lost any wrbs or beat something new
                                for (let bi=0; bi<map.newb_pr.length; bi++) {
                                    //console.log(ptime(),"        ",bi,map.name);
                                    if (map.newb_pr[bi] === "2" && map.currb_pr[bi] !== "2") { //gained wrb
                                        anyBonusUpdates = true;
                                        wrbUps.push({name: map.name, bonus: bi+1, str: `<b>${map.name}</b> B${bi+1}`});
                                    }
                                    if (map.newb_pr[bi] !== "2" && map.currb_pr[bi] === "2") { //lost wrb
                                        anyBonusUpdates = true;
                                        wrbDns.push({name: map.name, bonus: bi+1, str: `<b>${map.name}</b> B${bi+1}`});
                                    }
                                    else if (map.newb_pr[bi] !== "0" && map.currb_pr[bi] === "0") { //beat
                                        anyBonusUpdates = true;
                                        bonusPrs.push({name: map.name, bonus: bi+1, str: `<b>${map.name}</b> B${bi+1}`});
                                    }
                                }

                                //console.log(ptime(),"    D",map.name);
                                resolve(); return;
                            }
                            else { console.log("ERROR UDPATING MAP", map); resolve(); return; }
                        });

                    }
                }
                
                //console.log(ptime(),"PUSHING",map.name);
                mapChangePromises.push(new Promise(mapUpdatePromise));


            });


            //console.log(ptime(),"READY TO GO ON",mapi+CHUNKSIZE);
            //console.log(mapChangePromises);
            await Promise.all(mapChangePromises);
            //console.log(ptime(),"DONE WITH",mapi+CHUNKSIZE);


        }

        // syncData.forEach((map) => {

        //     let mapUpdatePromise = function(resolve,reject) {
        //         if (map.currgroupi !== map.newgroupi || map.currstage_pr !== map.newstage_pr || map.currb_pr !== map.newb_pr) {
        //             console.log("ready to go to db",map.name);
        //             dbSyncSetMapData(map.name,map.newgroupi,map.newstage_pr,map.newb_pr).then((res) => {
        //                 if (Number.isNaN(Number(res))) {

        //                     if (map.newgroupi !== 0 && map.currgroupi === 0) { //new pr
        //                         groupNws.push({name: map.name, currgroupi: map.currgroupi, newgroupi: map.newgroupi, str: `<b>${map.name}:</b> ${groupLabels[map.newgroupi]}`});
        //                     }
        //                     else if (map.currgroupi > map.newgroupi) { //went down groups
        //                         groupDns.push({name: map.name, currgroupi: map.currgroupi, newgroupi: map.newgroupi, str: `<b>${map.name}:</b> ${groupLabels[map.currgroupi]} 🡒 ${groupLabels[map.newgroupi]}`});
        //                     }
        //                     else { //went up
        //                         groupUps.push({name: map.name, currgroupi: map.currgroupi, newgroupi: map.newgroupi, str: `<b>${map.name}:</b> ${groupLabels[map.currgroupi]} 🡒 ${groupLabels[map.newgroupi]}`});
        //                     }

        //                     //see if we gained or lost any wrcps or beat something new
        //                     for (let si=0; si<map.newstage_pr; si++) {
        //                         if (map.newstage_pr[si] === "2" && map.currstage_pr[si] !== "2") { //gained wrcp
        //                             wrcpUps.push({name: map.name, stage: si+1, str: `<b>${map.name}</b> S${si+1}`});
        //                         }
        //                         else if (map.newstage_pr[si] !== "2" && map.currstage_pr[si] === "2") { //lost wrcp
        //                             wrcpDns.push({name: map.name, stage: si+1, str: `<b>${map.name}</b> S${si+1}`});
        //                         }
        //                         else if (map.newgroupi === 0 && map.newstage_pr[si] !== "0" && map.currstage_pr[si] === "0") { //beat only this stage, not the whole map
        //                             stagePrs.push({name: map.name, stage: si+1, str: `<b>${map.name}</b> S${si+1}`});
        //                         }
        //                     }

        //                     //see if we gained or lost any wrbs or beat something new
        //                     for (let bi=0; bi<map.newbonus_pr; bi++) {
        //                         if (map.newbonus_pr[bi] === "2" && map.currbonus_pr[bi] !== "2") { //gained wrb
        //                             wrbUps.push({name: map.name, bonus: bi+1, str: `<b>${map.name}</b> B${bi+1}`});
        //                         }
        //                         if (map.newbonus_pr[bi] !== "2" && map.currbonus_pr[si] === "2") { //lost wrb
        //                             wrbDns.push({name: map.name, bonus: bi+1, str: `<b>${map.name}</b> B${bi+1}`});
        //                         }
        //                         else if (map.newbonus_pr[si] !== "0" && map.currbonus_pr[si] === "0") { //beat
        //                             bonusPrs.push({name: map.name, bonus: bi+1, str: `<b>${map.name}</b> B${si+1}`});
        //                         }
        //                     }

        //                     console.log("done with ",map.name);
        //                     resolve(); return;
        //                 }
        //                 else { console.log("ERROR UDPATING MAP", map); resolve(); return; }
        //             });

        //         }
        //     }

        //     mapChangePromises.push(new Promise(mapUpdatePromise));
            
        // });


        // console.log("MADE ALL PROMISES!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        // console.log(mapChangePromises, mapChangePromises.length);

        function updateSortGroup(a,b) {
            if (a.currgroupi == b.currgroupi) { //first go on currgroup
                if (a.newgroupi == b.newgroupi) { //then newgroup
                    return a.name.localeCompare(b.name); //then name
                }
                else { return b.newgroupi - a.newgroupi ; } //higher first
            }
            else { return b.currgroupi - a.currgroupi; }
        }

        function updateSortStage(a,b) {
            if (!a.name.localeCompare(b.name)) { //first go on name
                return a.stage - b.stage; //then number, 1 first
            }    
            else { return a.name.localeCompare(b.name); }
        }

        function updateSortBonus(a,b) {
            if (!a.name.localeCompare(b.name)) { //first go on name
                return a.bonus - b.bonus; //then number, 1 first
            }    
            else { return a.name.localeCompare(b.name); }
        }

        //await Promise.all(mapChangePromises).then(() => {
        updateSyncMessagePart3();
        newDataNeedRerender = (anyGroupUpdates || anyStageUpdates || anyBonusUpdates);

        //console.log(groupUps, groupDns, groupNws);
        groupUps.sort(updateSortGroup);
        groupDns.sort(updateSortGroup);
        groupNws.sort(updateSortGroup);

        wrcpUps.sort(updateSortStage);
        wrcpDns.sort(updateSortStage);
        stagePrs.sort(updateSortStage);

        wrbUps.sort(updateSortBonus);
        wrbDns.sort(updateSortBonus);
        bonusPrs.sort(updateSortBonus);

        let groupDnsStr = '';
        let groupUpsStr = '';
        let groupNwsStr = '';
        groupDns.forEach((update) => { groupDnsStr += `${update.str}<br>`; });
        groupUps.forEach((update) => { groupUpsStr += `${update.str}<br>`; });
        groupNws.forEach((update) => { groupNwsStr += `${update.str}<br>`; });
        if (anyGroupUpdates) { $('#ModalSyncGroupsHeader').show(); $('#ModalSyncGroups').show(); }
        if (groupDnsStr.length > 0) { $('#ModalGroupDns').html(groupDnsStr); $('#ModalGroupDns').show(); }
        if (groupUpsStr.length > 0) { $('#ModalGroupUps').html(groupUpsStr); $('#ModalGroupUps').show(); }
        if (groupNwsStr.length > 0) { $('#ModalGroupNws').html(groupNwsStr); $('#ModalGroupNws').show(); }

        let wrcpDnsStr = '';
        let wrcpUpsStr = '';
        let stagePrsStr = '';
        wrcpDns.forEach((update) => { wrcpDnsStr += `${update.str}<br>`; });
        wrcpUps.forEach((update) => { wrcpUpsStr += `${update.str}<br>`; });
        stagePrs.forEach((update) => { stagePrsStr += `${update.str}<br>`; });
        if (anyStageUpdates) { $('#ModalSyncStagesHeader').show(); $('#ModalSyncStages').show(); }
        if (wrcpDnsStr.length > 0) { $('#ModalStageDns').html(wrcpDnsStr); $('#ModalStageDns').show(); }
        if (wrcpUpsStr.length > 0) { $('#ModalStageUps').html(wrcpUpsStr); $('#ModalStageUps').show(); }
        if (stagePrsStr.length > 0) { $('#ModalStageNws').html(stagePrsStr); $('#ModalStageNws').show(); }

        let wrbDnsStr = '';
        let wrbUpsStr = '';
        let bonusPrsStr = '';
        wrbDns.forEach((update) => { wrbDnsStr += `${update.str}<br>`; });
        wrbUps.forEach((update) => { wrbUpsStr += `${update.str}<br>`; });
        bonusPrs.forEach((update) => { bonusPrsStr += `${update.str}<br>`; });
        if (anyBonusUpdates) { $('#ModalSyncBonusesHeader').show(); $('#ModalSyncBonuses').show(); }
        if (wrbDnsStr.length > 0) { $('#ModalBonusDns').html(wrbDnsStr); $('#ModalBonusDns').show(); }
        if (wrbUpsStr.length > 0) { $('#ModalBonusUps').html(wrbUpsStr); $('#ModalBonusUps').show(); }
        if (bonusPrsStr.length > 0) { $('#ModalBonusNws').html(bonusPrsStr); $('#ModalBonusNws').show(); }

        localStorage.setItem('lastSync',new Date());
        updateLastSyncTimestamp();
        //});

    }
}



//-------------------------------------------------------------- MAP UPDATE DB FUNCS

async function dbGetTodosByMap(mapName,newMapName=null) { //newMapName is for async workaround when updating todos
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo").objectStore("todo");
            let requestGet = todoTable.index("mapName").getAll(mapName);

            requestGet.onsuccess = function() {
                let allTodos = requestGet.result;

                if (newMapName) { resolve([allTodos,newMapName]); return; }
                else { resolve(allTodos); return; }
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}

async function dbRenameMapTodo(todoInfo,newMapName) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo","readwrite").objectStore("todo");
            const requestGet = todoTable.get(todoInfo);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let todoItem = requestGet.result;

                    todoItem.mapName = newMapName;

                    const requestUpdate = todoTable.put(todoItem);

                    requestUpdate.onsuccess = function() {
                        //we just made a new entry, since the name is part of the key
                        //so we need to delete the old one
                        const requestDelete = todoTable.delete(todoInfo);
                        requestDelete.onsuccess = function() {
                            resolve("Success"); return;
                        }
                        requestDelete.onerror = function() { resolve(-5); return; } 
                        
                    }
                    requestUpdate.onerror = function() { resolve(-4); return; }
                }
                else { resolve(-3); return; } //weird but whatever
            }
            requestGet.onerror = function () { resolve(-2); return; }
        });
    }
    else { return -1; }
}


//-------------------------------------------------------------- MAIN UPDATING FUNCS

function isMapUpdated(oldMap,newMap) {
    //takes two jsons and returns what has changed, if anything
    //returns a json of a bunch of booleans
    //assumes the request is well-formed, i.e. oldMap.mapID === newMap.mapID
    //so you're not comparing two completely different maps for the hell of it
    results = {};
    //results.mapDate = (oldMap.mapDate === newMap.mapDate); //what the hell would this even mean?
    results.mapName = (oldMap.mapName === newMap.mapName);
    results.tier = (oldMap.tier === newMap.tier);
    results.mapType = (oldMap.mapType === newMap.mapType);
    results.s_count = (oldMap.stage_pr.length === newMap.stage_pr.length);
    results.b_count = (oldMap.b_pr.length === newMap.b_pr.length);

    //this is just to make it easy to check if we need to look deeper
    results.allSame = (results.mapName && results.tier && results.mapType && results.s_count && results.b_count);

    return results;
    //NOT used: cp_count, group, map_note, groupTodo, isComplete
}

async function dbUpdateMapList(url) {
    if (db) {
        return new Promise(function(resolve,reject) {

            fetch(url).then((res) => res.text()).then((text) => {
                //make a list of all the new map infos
                newAllMaps = {};
                // id : {map: <json>, isused: false}

                //this code is just copypasta from the db initialization code
                //get all the new map data 
                let newALLMAPINFO = parseCSV(text);
                let headers = newALLMAPINFO[0];
                const IDI = headers.indexOf("ID");
                const DATEI = headers.indexOf("Date Added");
                const NAMEI = headers.indexOf("Map name");
                const TIERI = headers.indexOf("Tier");
                const TYPEI = headers.indexOf("Type");
                const STAGESI = headers.indexOf("Stages/Cps");
                const BONUSESI = headers.indexOf("Bonuses");

                let thisMapInfo, numStages, numBonuses, numId;
                for (let mapi=1; mapi<newALLMAPINFO.length; mapi++) { //skip the header line
                    thisMapInfo = newALLMAPINFO[mapi];

                    if (isStaged(thisMapInfo[TYPEI])) { //we have stages
                        numStages = +thisMapInfo[STAGESI];
                    }
                    else { numStages = 0; } //not staged

                    numBonuses = +thisMapInfo[BONUSESI];
                    numId = +thisMapInfo[IDI];

                    //this is kind of like a list, since the keys are numbers for the ids,
                    //but this is slightly more robust and not that much crazier for js
                    newAllMaps[numId] = {
                        mapInfo : { //only has the keys we need for comparison (id, name, tier, type, stage_pr, b_pr)
                            //or for creating a new entry (mapDate, cp_count)
                            mapID: numId,
                            mapDate: thisMapInfo[DATEI],
                            mapName: thisMapInfo[NAMEI].substr(5),
                            tier: thisMapInfo[TIERI],
                            mapType: thisMapInfo[TYPEI],
                            cp_count: thisMapInfo[STAGESI],
                            stage_pr: "0".repeat(numStages), //this will be overwritten later if we have a match
                            b_pr: "0".repeat(numBonuses) //this will be overwritten later if we have a match
                        },
                        isUsed : false
                    };
                }

                //get all the old maps
                dbGetAllMaps().then((res) => { if (Array.isArray(res)) {
                    const mapTable = db.transaction("maps", "readwrite").objectStore("maps");

                    let mapChangePromises = []; //maps that need to be updated
                    let mapChangeStrings = []; //changelog basically

                    let newMap, mapDiffs;
                    res.forEach((currentMap) => {
                        //get the new map entry with the same id
                        newMap = newAllMaps[currentMap.mapID].mapInfo;
                        newAllMaps[currentMap.mapID].isUsed = true;

                        //check if they're the same
                        mapDiffs = isMapUpdated(currentMap,newMap);
                        if (!mapDiffs.allSame) {

                            let renameMapTodo = (!mapDiffs.mapName);
                            let deleteStageTodo = (!mapDiffs.mapType) || (!mapDiffs.s_count);
                            let deleteBonusTodo = (!mapDiffs.b_count);

                            let oldMapName = currentMap.mapName;

                            //something has changed, we need to update the db
                            let mapUpdatePromise = function(resolve,reject) {

                                let changeStr = "";
                                //just go through and replace every field of interest
                                if (!mapDiffs.mapName) { 
                                    changeStr += `surf_${currentMap.mapName} 🡒 surf_${newMap.mapName}, `;
                                    currentMap.mapName = newMap.mapName;
                                }
                                else { changeStr += `surf_${currentMap.mapName}: `} //name is staying the same, but something else changed

                                if (!mapDiffs.tier) { 
                                    changeStr += `t${currentMap.tier} 🡒 t${newMap.tier}, `;
                                    currentMap.tier = newMap.tier;
                                }

                                if (!mapDiffs.mapType) {
                                    changeStr += `${currentMap.mapType} 🡒 ${newMap.mapType}, `;
                                    currentMap.mapType = newMap.mapType;
                                    //map type has completely changed so just use the stage info of the new map
                                    //UNLESS! we go staged -> or <- stagedlinear
                                    if (currentMap.stage_pr.length === 0 || newMap.stage_pr.length === 0) { //was linear, or is now linear -- nuke the stage prs
                                        currentMap.stage_pr = newMap.stage_pr;
                                    }
                                    else { } //don't reset the stages
                                }

                                if (!mapDiffs.s_count && mapDiffs.mapType) { //trigger if stages are different, but if maptype changes then we already know it's different
                                    changeStr += `${currentMap.stage_pr.length} stages 🡒 ${newMap.stage_pr.length}, `;
                                    currentMap.stage_pr = newMap.stage_pr; //just hard reset all stage recs
                                }
                                else { } //don't reset the stages

                                if (!mapDiffs.b_count) {
                                    changeStr += `${currentMap.b_pr.length} bonuses 🡒 ${newMap.b_pr.length}, `;
                                    currentMap.b_pr = newMap.b_pr; //just hard reset all bonus recs
                                }
                                else { } //don't reset

                                //now we need to update the todos...
                                let todoUpdates = [];

                                dbGetTodosByMap(oldMapName,newMap.mapName).then((allInfo) => { if (Array.isArray(allInfo) && Array.isArray(allInfo[0])) {
                                    let allTodos = allInfo[0];
                                    let newMapName = allInfo[1];
                                    allTodos.forEach((todoInfo) => {
                                        if ((deleteStageTodo && todoInfo.todoType === "stage") || (deleteBonusTodo && todoInfo.todoType === "bonus")) {
                                            todoUpdates.push(dbDeleteTodo(todoInfo.mapName,todoInfo.todoType,todoInfo.number));
                                        }
                                        else if (renameMapTodo) { //don't have to rename if we're deleting it anyways
                                            todoUpdates.push(dbRenameMapTodo([todoInfo.mapName,todoInfo.todoType,todoInfo.number], newMapName));
                                        }
                                    });
                                }});

                                const requestUpdate = mapTable.put(currentMap);

                                requestUpdate.onsuccess = function() {
                                    Promise.all(todoUpdates).then((updates) => {
                                        let numUpdates = 0;
                                        updates.forEach((resolution) => {
                                            if (resolution === "Success") { numUpdates++; }
                                        });

                                        if (numUpdates === 0) {
                                            resolve( changeStr.slice(0,-2) ); return; //remove the last comma
                                        }
                                        else {
                                            let isPlural = (todoUpdates.length > 1) ? 's' : '';
                                            resolve(`${changeStr}<span class="mapUpdatedTodos">affected ${todoUpdates.length} todo${isPlural}</span>`); return;
                                        }
                                    });
                                }

                                requestUpdate.onerror = function() {
                                    resolve(`FAILED updating surf_${currentMap.mapName}`); return;
                                }
                            }

                            mapChangePromises.push(new Promise(mapUpdatePromise));
                        }
                    });

                    //we've gone through every current map to check if we should update them
                    //now we might have some new maps (the more common case)
                    for (let newMapID in newAllMaps) {
                        let newMap = newAllMaps[newMapID];
                        if (!newMap.isUsed) { //didn't find a match in the above block
                            //need to add all the bells and whistles
                            let newMapInfo = newMap.mapInfo;
                            newMapInfo.group = groupLabels[0];
                            newMapInfo.map_note = "";
                            newMapInfo.groupTodo = false;
                            newMapInfo.isComplete = compContent[0];

                            let mapCreatePromise = function(resolve,reject) {
                                let changeStr = `new tier ${newMapInfo.tier} map: surf_${newMapInfo.mapName}`;

                                const requestCreate = mapTable.put(newMapInfo);

                                requestCreate.onsuccess = function() {
                                    resolve(changeStr); return;
                                }
                                requestCreate.onerror = function() { 
                                    resolve(`FAILED adding new map surf_${newMapInfo.mapName}`); return;
                                }
                            }

                            mapChangePromises.push(new Promise(mapCreatePromise));
                        }
                    }

                    Promise.all(mapChangePromises).then((changeStrs) => {
                        resolve(changeStrs); return;
                    });

                }});
            });
        });
    }
    else { return -1; }
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------- SETTINGS MODAL
//-------------------------------------------------------------- UPDATER

function getCreateColorClasses() {//updates the colors (and also navbar lol)
    let defaultPalette = lightmodeColorDict;

    Object.keys(defaultPalette).forEach(function(colorClassName) {
        document.getElementsByTagName("body")[0].style.setProperty(`--${colorClassName}`, getInitLocalStorage(colorClassName, defaultPalette[colorClassName]) );
    });

    //...and this one requires js
    document.getElementById("TitleDiv").innerText = getInitLocalStorage('navbarTitle', "KSF Checklist"); //the title "KSF Checklist"
}


//-------------------------------------------------------------- GENERAL EVENT BINDINGS

function settingsInputFocus(e) {
    oldSettingsVal = $(this).val();
}
function settingsInputKeyPress(e) {
    if (e.keyCode === 13) { $(this).blur(); } //enter key
}


//-------------------------------------------------------------- INPUTS UP TOP

function settingsNumberInputBlur() { //paginationInputBlur() { 
    let newVal = +$(this).val();
    if (Number.isInteger(newVal) && newVal > 0) {
        newSettings[ $(this).attr("id").slice(0,-5) ] = newVal;
        updateUnsavedMessage();
    }
    else {
        $(this).val(oldSettingsVal); //bad value, put back the old one
    }
}

function settingsTextInputBlur() { 
    newSettings[ $(this).attr("id").slice(0,-5) ] = $(this).val();
    updateUnsavedMessage();
}

function settingsSteamIdBlur() {
    //make sure its the format of STEAM_X:X:XX...
    steamIdRegex = /STEAM_[01]:[01]:\d+/i;

    let newVal = $(this).val();

    let steamIdMatch = newVal.match(steamIdRegex);
    if (steamIdMatch && steamIdMatch[0] === newVal) { //the word needs to be an exact match
        newSettings[ $(this).attr("id").slice(0,-5) ] = newVal;
        updateUnsavedMessage();
    }
    else {
        $(this).val(oldSettingsVal); //bad value, put back the old one
    }
}

function settingsCheckboxClick() {
    newSettings[ $(this).attr("id").slice(0,-8) ] = this.checked.toString();
    updateUnsavedMessage();
}


//-------------------------------------------------------------- PAGE TABLE WIDTHS

function mapTableWidthBlur(e) {
    let sumAllVals = (+$("#MapTableNameWidthInput").val())
                     +(+$("#MapTableTierWidthInput").val())
                     +(+$("#MapTableGroupWidthInput").val()); //includes new value
    let remainder = 100-sumAllVals;
    if ($(this).val() > 0 && remainder>0.01) {
        newSettings[ $(this).attr("id").slice(0,-5) ] = $(this).val();
        $("#MapTableTheRestWidth").text(remainder);
        updateUnsavedMessage();
    }
    else {
        $(this).val(oldSettingsVal); //bad value, put back the old one
    }
}

function todoTableWidthBlur(e) {
    let sumAllVals = (+$("#TodoTableNameWidthInput").val())
                     +(+$("#TodoTableGoalWidthInput").val())
                     +(+$("#TodoTableCurrWidthInput").val())
                     +(+$("#TodoTableOrigWidthInput").val()); //includes new value
    let remainder = 100-sumAllVals;
    if ($(this).val() > 0 && remainder>0.01) {
        newSettings[ $(this).attr("id").slice(0,-5) ] = $(this).val();
        $("#TodoTableTheRestWidth").text(remainder);
        updateUnsavedMessage();
    }
    else {
        $(this).val(oldSettingsVal); //bad value, put back the old one
    }
}


//-------------------------------------------------------------- COLOR INPUTS

function colorInputBlur(e) {
    let t = $(this); //I type it too many times here imo
    if (isHexColor(t.val())) {
        //update the color of the settings cell
        let relatedCell = t.closest("tr").find(".settingsCell");
        if (t.attr("id").includes("FtColInput")) { //font color
            relatedCell.css('color', t.val());
            newSettings[t.attr("id").slice(0,-5)] = t.val();
        }
        else if (t.attr("id").includes("BgColInput")) { //background color
            relatedCell.css('background-color', t.val());
            newSettings[t.attr("id").slice(0,-5)] = t.val();
        }

        updateUnsavedMessage();
    }
    else {
        $(this).val(oldSettingsVal); //bad value, put back the old one
    }
}

function isHexColor(hex) { //used in color settings
    if (typeof hex !== 'string') { return false; }
    return (hex.slice(0,1) === '#' && hex.length === 7 && !isNaN(Number('0x' + hex.slice(1,))));
}


//-------------------------------------------------------------- COLORSCHEMES

function loadColorScheme(schemeDict) {
    Object.entries(schemeDict).forEach((setting) => { 
        let colVarName = setting[0];
        let colVarVal = setting[1];

        //focus in, change, focus out, so the focusout event handler gets triggered
        let t = document.getElementById(`${colVarName}Input`);
        t.focus();
        t.value = colVarVal;
        t.blur();
    });
}

document.getElementById("LightModeButton").onclick = function() {
    loadColorScheme(lightmodeColorDict);
}

document.getElementById("DarkModeButton").onclick = function() {
    loadColorScheme(darkmodeColorDict);
}


//-------------------------------------------------------------- LOADING/FORMATTING

//so all the generated color cell tables have the same look
function genColorTableHead(leftColName) {
    return `<thead><tr><th class="colorCellCol">${leftColName}</th><th class="colorInputCol">Font</th><th class="colorInputCol">Background</th></tr></thead>`;
}

//loads ALL SETTINGS and presents them, also makes the color cell tables
function loadSettingsModal() {
    oldsettings = {};
    //----------------------------------------------------------- load up literally everything

    let settingsFields = [
        "entriesPerPage", "todosPerPage", //pagination
        "navbarTitle", //KSF Checklist
        "steamId", //Steam ID
        "hideExtraCols", //columns pruning

        "bodyFtCol", "bodyBgCol", //global
        "navbarFtCol", "navbarBgCol", //ui
        "tableHeaderFtCol", "tableHeaderBgCol", //table ui

        "mapcomp-cell-0FtCol", "mapcomp-cell-0BgCol", //default map name

        "null-cellFtCol", "null-cellBgCol", //null cell
        "comp-cell-0FtCol", "comp-cell-0BgCol", //X
        "comp-cell-1FtCol", "comp-cell-1BgCol", //check
        "comp-cell-WRFtCol", "comp-cell-WRBgCol", //WR

        "comp-cell-G7FtCol", "comp-cell-G7BgCol", //groups
        "comp-cell-G6FtCol", "comp-cell-G6BgCol",
        "comp-cell-G5FtCol", "comp-cell-G5BgCol",
        "comp-cell-G4FtCol", "comp-cell-G4BgCol",
        "comp-cell-G3FtCol", "comp-cell-G3BgCol",
        "comp-cell-G2FtCol", "comp-cell-G2BgCol",
        "comp-cell-G1FtCol", "comp-cell-G1BgCol",

        "comp-cell-R10FtCol", "comp-cell-R10BgCol", //tops
        "comp-cell-R9FtCol", "comp-cell-R9BgCol",
        "comp-cell-R8FtCol", "comp-cell-R8BgCol",
        "comp-cell-R7FtCol", "comp-cell-R7BgCol",
        "comp-cell-R6FtCol", "comp-cell-R6BgCol",
        "comp-cell-R5FtCol", "comp-cell-R5BgCol",
        "comp-cell-R4FtCol", "comp-cell-R4BgCol",
        "comp-cell-R3FtCol", "comp-cell-R3BgCol",
        "comp-cell-R2FtCol", "comp-cell-R2BgCol",

        "todo-cell-group-G7FtCol", "todo-cell-group-G7BgCol", //todo: complete
        "todo-cell-group-TOPFtCol", "todo-cell-group-TOPBgCol", //todo: top
        "todo-cell-group-IMPFtCol", "todo-cell-group-IMPBgCol", //todo: improve

        "MapTableNameWidth", "MapTableTierWidth", "MapTableGroupWidth", //map table widths
        "TodoTableNameWidth", "TodoTableGoalWidth", "TodoTableCurrWidth", "TodoTableOrigWidth" //map table widths
        ]
    settingsFields.forEach((field) => oldSettings[field] = localStorage.getItem(field));

    oldSettings['todo-cell-group-G7FtCol'] = localStorage.getItem('todo-cell-group-G7FtCol');
    oldSettings['todo-cell-group-G7BgCol'] = localStorage.getItem('todo-cell-group-G7BgCol');
    oldSettings['todo-cell-group-TOPFtCol'] = localStorage.getItem('todo-cell-group-TOPFtCol');
    oldSettings['todo-cell-group-TOPBgCol'] = localStorage.getItem('todo-cell-group-TOPBgCol');
    oldSettings['todo-cell-group-IMPFtCol'] = localStorage.getItem('todo-cell-group-IMPFtCol');
    oldSettings['todo-cell-group-IMPBgCol'] = localStorage.getItem('todo-cell-group-IMPBgCol');

    //----------------------------------------------------------- fill in the first column of colors

    inputValues = [ //input fields [input id, localstorage name]
        ["steamIdInput", "steamId"], //Steam ID
        ["entriesPerPageInput", "entriesPerPage"], //maps pagination
        ["todosPerPageInput", "todosPerPage"], //todos pagination

        ["navbarTitleInput", "navbarTitle"], //KSF Checklist

        ["bodyFtColInput", "bodyFtCol"], //global
        ["bodyBgColInput", "bodyBgCol"],

        ["navbarFtColInput", "navbarFtCol"], //ui
        ["navbarBgColInput", "navbarBgCol"],

        ["tableHeaderFtColInput", "tableHeaderFtCol"], //table ui
        ["tableHeaderBgColInput", "tableHeaderBgCol"],

        ["mapcomp-cell-0FtColInput", "mapcomp-cell-0FtCol"], //default map name
        ["mapcomp-cell-0BgColInput", "mapcomp-cell-0BgCol"],

        ["MapTableNameWidthInput", "MapTableNameWidth"], //col widths for map table
        ["MapTableTierWidthInput", "MapTableTierWidth"],
        ["MapTableGroupWidthInput", "MapTableGroupWidth"],

        ["TodoTableNameWidthInput", "TodoTableNameWidth"],
        ["TodoTableGoalWidthInput", "TodoTableGoalWidth"],
        ["TodoTableCurrWidthInput", "TodoTableCurrWidth"],
        ["TodoTableOrigWidthInput", "TodoTableOrigWidth"]
    ];
        
    inputValues.forEach((field) => $(`#${field[0]}`).val( oldSettings[field[1]] ) );

    $('#hideExtraColsCheckbox').prop('checked', (localStorage.getItem('hideExtraCols') === 'true'));

    $("#MapTableTheRestWidth").text( 100 - (+oldSettings["MapTableNameWidth"]) - (+oldSettings["MapTableTierWidth"]) - (+oldSettings["MapTableGroupWidth"]) );
    $("#TodoTableTheRestWidth").text( 100 - (+oldSettings["TodoTableNameWidth"]) - (+oldSettings["TodoTableGoalWidth"]) - (+oldSettings["TodoTableCurrWidth"]) - (+oldSettings["TodoTableOrigWidth"]) );

    //----------------------------------------------------------- now construct the color cell tables

    let currentFtCol, currentBgCol;

    //create the color section table for the groups
    let tableGroupsClasses = ["G7","G6","G5","G4","G3","G2","G1"];
    let tableGroupsHTML = `<table class="responsive-table centered" cellspacing="0">` + genColorTableHead("Groups") + `<tbody>`;
    let tableGroupsRowHTML;
    tableGroupsClasses.forEach((groupName) => {
        let groupText = groupContent[groupLabels.indexOf(groupName)];
        currentFtCol = localStorage.getItem(`comp-cell-${groupName}FtCol`);
        currentBgCol = localStorage.getItem(`comp-cell-${groupName}BgCol`);
        //readability is nice :)
        tableGroupsRowHTML =  "<tr>";
        tableGroupsRowHTML += `<td><div class="settingsCell" style="color: ${currentFtCol}; background-color: ${currentBgCol};">${groupText}</div></td>`;
        tableGroupsRowHTML += `<td><input class="settingsInput settingsColorInput" id="comp-cell-${groupName}FtColInput" value="${currentFtCol}" /></td>`;
        tableGroupsRowHTML += `<td><input class="settingsInput settingsColorInput" id="comp-cell-${groupName}BgColInput" value="${currentBgCol}" /></td>`;
        tableGroupsRowHTML += "</tr>";

        tableGroupsHTML += tableGroupsRowHTML;
    });
    tableGroupsHTML += `</tbody></table>`;
    $("#ColorInputTableGroups").html(tableGroupsHTML);

    //create the tops (r10-r2) section table
    // let tableTops = document.getElementById('ColorInputTableTops');
    let tableTopsClasses = ["R10","R9","R8","R7","R6","R5","R4","R3","R2"];
    let tableTopsHTML = `<table class="responsive-table centered" cellspacing="0">` + genColorTableHead("Tops") + `<tbody>`;
    let tableTopsRowHTML;
    tableTopsClasses.forEach((topName) => {
        let topText = groupContent[groupLabels.indexOf(topName)];
        currentFtCol = localStorage.getItem(`comp-cell-${topName}FtCol`);
        currentBgCol = localStorage.getItem(`comp-cell-${topName}BgCol`);
        tableTopsRowHTML =  "<tr>";
        tableTopsRowHTML += `<td><div class="settingsCell" style="color: ${currentFtCol}; background-color: ${currentBgCol};">${topText}</div></td>`;
        tableTopsRowHTML += `<td><input class="settingsInput settingsColorInput" id="comp-cell-${topName}FtColInput" value="${currentFtCol}" /></td>`;
        tableTopsRowHTML += `<td><input class="settingsInput settingsColorInput" id="comp-cell-${topName}BgColInput" value="${currentBgCol}" /></td>`;
        tableTopsRowHTML += "</tr>";

        tableTopsHTML += tableTopsRowHTML;
    });
    tableTopsHTML += `</tbody></table>`;
    $("#ColorInputTableTops").html(tableTopsHTML);

    //create the misc section table
    //this is disjointed because it's misc
    let tableMiscHTML = `<table class="responsive-table centered" cellspacing="0">` + genColorTableHead("Misc") + `<tbody>`;
    let tableMiscRowHTML;

    //null first
    currentFtCol = localStorage.getItem(`null-cellFtCol`);
    currentBgCol = localStorage.getItem(`null-cellBgCol`);
    tableMiscHTML += "<tr>";
    tableMiscHTML += `<td><div class="settingsCell" style="color: ${currentFtCol}; background-color: ${currentBgCol};"><i class="material-icons">remove</i></div></td>`;
    tableMiscHTML += `<td><input class="settingsInput settingsColorInput" id="null-cellFtColInput" value="${currentFtCol}" /></td>`;
    tableMiscHTML += `<td><input class="settingsInput settingsColorInput" id="null-cellBgColInput" value="${currentBgCol}" /></td>`;
    tableMiscHTML += "</tr>";

    //now completions: X, check, star (using the Stage arrays, if it ever ends up mattering in the future)
    let tableCompClasses = [0,1,2];
    tableCompClasses.forEach((stagei) => {
        currentFtCol = localStorage.getItem(`comp-cell-${stageLabels[stagei]}FtCol`);
        currentBgCol = localStorage.getItem(`comp-cell-${stageLabels[stagei]}BgCol`);
        tableMiscRowHTML =  "<tr>";
        tableMiscRowHTML += `<td><div class="settingsCell" style="color: ${currentFtCol}; background-color: ${currentBgCol};"><i class="material-icons">${stageContent[stagei]}</i></div></td>`;
        tableMiscRowHTML += `<td><input class="settingsInput settingsColorInput" id="comp-cell-${stageLabels[stagei]}FtColInput" value="${currentFtCol}" /></td>`;
        tableMiscRowHTML += `<td><input class="settingsInput settingsColorInput" id="comp-cell-${stageLabels[stagei]}BgColInput" value="${currentBgCol}" /></td>`;
        tableMiscRowHTML += "</tr>";

        tableMiscHTML += tableMiscRowHTML;
    });

    //add a blank row in the middle
    tableMiscHTML += `<tr style="height:41px"></tr>`;

    //now do the misc todo labels
    let tableTodoClasses = ["G7","IMP","TOP"];
    tableTodoClasses.forEach((todoName) => {
        let todoText = todoGroupContent[todoGroupLabels.indexOf(todoName)];
        currentFtCol = localStorage.getItem(`todo-cell-group-${todoName}FtCol`);
        currentBgCol = localStorage.getItem(`todo-cell-group-${todoName}BgCol`);
        tableMiscRowHTML =  "<tr>";
        tableMiscRowHTML += `<td><div class="settingsCell" style="color: ${currentFtCol}; background-color: ${currentBgCol};">${todoText}</div></td>`;
        tableMiscRowHTML += `<td><input class="settingsInput settingsColorInput" id="todo-cell-group-${todoName}FtColInput" value="${currentFtCol}" /></td>`;
        tableMiscRowHTML += `<td><input class="settingsInput settingsColorInput" id="todo-cell-group-${todoName}BgColInput" value="${currentBgCol}" /></td>`;
        tableMiscRowHTML += "</tr>";

        tableMiscHTML += tableMiscRowHTML;
    });

    tableMiscHTML += `</tbody></table>`;
    $("#ColorInputTableMisc").html(tableMiscHTML);

    //----------------------------------------------------------- finalize

    //bind events to these fields that we've created

    Array.from(document.getElementsByClassName("settingsNumberInput")).forEach((element) => {
        element.addEventListener('focus', settingsInputFocus);
        element.addEventListener('keypress', settingsInputKeyPress);
        element.addEventListener('blur', settingsNumberInputBlur);
    });

    Array.from(document.getElementsByClassName("settingsTextInput")).forEach((element) => {
        element.addEventListener('focus', settingsInputFocus);
        element.addEventListener('keypress', settingsInputKeyPress);
        element.addEventListener('blur', settingsTextInputBlur);
    });

    Array.from(document.getElementsByClassName("settingsSteamIdInput")).forEach((element) => {
        element.addEventListener('focus', settingsInputFocus);
        element.addEventListener('keypress', settingsInputKeyPress);
        element.addEventListener('blur', settingsSteamIdBlur);
    });

    $("#hideExtraColsCheckbox").click(settingsCheckboxClick);

    Array.from(document.getElementsByClassName("settingsMapWidthInput")).forEach((element) => {
        element.addEventListener('focus', settingsInputFocus);
        element.addEventListener('keypress', settingsInputKeyPress);
        element.addEventListener('blur', mapTableWidthBlur);
    });

    Array.from(document.getElementsByClassName("settingsTodoWidthInput")).forEach((element) => {
        element.addEventListener('focus', settingsInputFocus);
        element.addEventListener('keypress', settingsInputKeyPress);
        element.addEventListener('blur', todoTableWidthBlur);
    });

    Array.from(document.getElementsByClassName("settingsColorInput")).forEach((element) => {
        element.addEventListener('focus', settingsInputFocus);
        element.addEventListener('keypress', settingsInputKeyPress);
        element.addEventListener('blur', colorInputBlur);
    });

    newSettings = JSON.parse(JSON.stringify(oldSettings)); //deep copy
    updateUnsavedMessage();
}


//-------------------------------------------------------------- SAVE SETTINGS 

document.getElementById("SettingsSaveButton").onclick = function() {
    Object.entries(newSettings).forEach((setting) => {
        let settingKey = setting[0];
        let settingVal = setting[1];

        if (oldSettings[settingKey] != settingVal) { //it's different
            window[settingKey] = settingVal;
            localStorage.setItem(settingKey, settingVal);
            oldSettings[settingKey] = settingVal; //so now old = new

            if ( (isMapPage && settingKey==='entriesPerPage') || (!isMapPage && settingKey==='todosPerPage') ) { table.page.len(settingVal).draw(false); } //redraws
        }
    });
    updateUnsavedMessage();
    getCreateColorClasses();
}

function updateUnsavedMessage() {
    let isUnsaved = false;
    for (const setting of Object.entries(oldSettings)) { //test that new agrees with old
        if (newSettings[setting[0]] != setting[1]) {
            isUnsaved = true; break;
        }
    };
    if (!isUnsaved) {
        for (const setting of Object.entries(newSettings)) { //test that old agrees with new
            if (oldSettings[setting[0]] != setting[1]) {
                isUnsaved = true; break;
            }
        };
    }

    let unsavedStr = '';
    if (isUnsaved) { unsavedStr = "You have unsaved settings!"; }
    document.getElementById("SettingsUnsavedWarning").innerText = unsavedStr;
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------- ONREADY FUNC

function onReadyFunc(callbackFunc,tableID,hasTodoToggle) {
    //----------------------------------------------------------- materialize inits

    //instantiate the modals
    var modalElems = document.querySelectorAll('.modal');
    M.Modal.init(modalElems[0],{onOpenStart: onOpenUpdateModal, onCloseStart: onCloseUpdateModal}); //update
    M.Modal.init(modalElems[1],{onOpenStart: loadSettingsModal}); //settings
    M.Modal.init(modalElems[2],); //help
    let announcementModal = M.Modal.init(modalElems[3],); //announcements

    //instantiate collection
    let collapsibleElems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(collapsibleElems, {});

    //----------------------------------------------------------- now load or init EVERYTHING

    //render all the custom formatting classes
    getCreateColorClasses();

    $("#SearchBarMaps").val("");
    $("#SearchBarTodo").val("");

    if (hasTodoToggle) {
        //todo toggle
        globalIsTodo = getInitLocalStorage('globalIsTodo', false, 
            getFormatter = (x => (x === 'true')), //str -> bool
            setFormatter = (x => x.toString())); //bool -> str

        document.getElementById("TodoToggle").checked = globalIsTodo; //possibly flip the todotoggle, hidden if we're on todotable    
        isMapPage = true;
    }
    else { isMapPage = false; }

    hideExtraCols = getInitLocalStorage('hideExtraCols', true, 
        getFormatter = (x => (x === 'true')), //str -> bool
        setFormatter = (x => x.toString())); //bool -> str

    //number of rows per pagination page
    entriesPerPage = getInitLocalStorage('entriesPerPage', 20,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    todosPerPage = getInitLocalStorage('todosPerPage', 25,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str

    navbarTitle = getInitLocalStorage('navbarTitle', "KSF Checklist");
    steamId = getInitLocalStorage('steamId', "STEAM_X:X:XXXXXXXX");

    //mapTable widths
    MapTableNameWidth = getInitLocalStorage('MapTableNameWidth', 20,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    MapTableTierWidth = getInitLocalStorage('MapTableTierWidth', 5,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    MapTableGroupWidth = getInitLocalStorage('MapTableGroupWidth', 8,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str

    //mapTable widths
    TodoTableNameWidth = getInitLocalStorage('TodoTableNameWidth', 20,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    TodoTableGoalWidth = getInitLocalStorage('TodoTableGoalWidth', 8,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    TodoTableCurrWidth = getInitLocalStorage('TodoTableCurrWidth', 8,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    TodoTableOrigWidth = getInitLocalStorage('TodoTableOrigWidth', 8,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str

    //----------------------------------------------------------- good to go -- load the db and render

    openDatabase().then(
        (dbconn) => {
            db = dbconn;
            callbackFunc(tableID);
        },
        (dberr) => {
            alert(dberr);
        }
    );

    let lastAnnouncement = getInitLocalStorage('lastAnnouncement', null);
    if (SHOWANNOUNCEMENT && lastAnnouncement !== CURRANNOUNCEVERSION) {
        localStorage.setItem('lastAnnouncement', CURRANNOUNCEVERSION);
        announcementModal.open();
    } 
}