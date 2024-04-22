//-------------------------------------------------------------------------------------------------------------------------------------------------------- GLOBALS
const tableDiv = document.getElementById('wrapper');
const hiddenDiv = document.getElementById('hidden-wrapper');

const MAPLISTURL = "https://amongus.nyc/static/KSFmaps.csv";

var table;

var globalIsTodo;// = false;
var globalCurrentTier;// = "1";
var displayMode;// = "stage"; //stage, bonus, note, todo
var globalLastTableHeader;// = "stage"; //saves the last one of these ^ that isn't todo
var currentPages;// = {"1":1, "2":1, "3":1, "4":1, "5":1, "6":1, "7":1, "8":1, "todo":1}; //to save which page we are/were on
var entriesPerPage;
var useHiddenTable;// = false;

var globalDbTimeout = 5000; //ms
var humanClickingPagination = true; //so when the code clicks back to te current page it doesn't get processed like a human click
var globalPageReady = true;

var mapTableNameWidth;// = 10.5;
var mapTableGroupWidth;// = 4;

var todoTableCheckboxWidth;// = 2;
var todoTableNameWidth;// = 10.5;
var todoTableGoalWidth;// = 4;
var todoTableCurrWidth;// = 4;
var todoTableOrigWidth;// = 4;

var note_tempNoteStr = "";
var note_targetRowi = -1;

var searchPlaceholder = "Search";

const lightmodeColorDict = {
    "bodyFtCol": "#000000",
    "bodyBgCol": "#eeeeee",
    "navbarFtCol": "#ffffff",
    "navbarBgCol": "#213552",
    "tableHeaderFtCol": "#ffffff",
    "tableHeaderBgCol": "#578eda",
    "tableFooterFtCol": "#000000",
    "tableFooterBgCol": "#ffffff",
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
    "tableFooterFtCol": "#eeeeee",
    "tableFooterBgCol": "#404d59",
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


//-------------------------------------------------------------- GROUPS

var groupLabels = ["0","G7","G6","G5","G4","G3","G2","G1","R10","R9","R8","R7","R6","R5","R4","R3","R2","WR"]; //what it's saved as in the db
var groupContent = ["close","No Group","G6","G5","G4","G3","G2","G1","#10","#9","#8","#7","#6","#5","#4","#3","#2","star"]; //the actual cell content in the table
var groupIcons = [true,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,false,true]; //is the content a google icon?
var groupSearch = ["group:0", 
    "group:any group:none", //no group complete
    "group:any group:6 group:g6",
    "group:any group:5 group:g5",
    "group:any group:4 group:g4",
    "group:any group:3 group:g3",
    "group:any group:2 group:g2",
    "group:any group:1 group:g1",
    "group:any group:top group:r10 group:#10 #10",
    "group:any group:top group:r9 group:#9 #9",
    "group:any group:top group:r8 group:#8 #8",
    "group:any group:top group:r7 group:#7 #7",
    "group:any group:top group:r6 group:#6 #6",
    "group:any group:top group:r5 group:#5 #5",
    "group:any group:top group:r4 group:#4 #4",
    "group:any group:top group:r3 group:#3 #3",
    "group:any group:top group:r2 group:#2 #2",
    "group:any group:top group:r1 group:#1 #1 group:wr wr"]; //what you need to search to find these

var todoGroupLabels = ["G7","G6","G5","G4","G3","G2","G1","TOP","WR","IMP"]; //here the default index is -1, we truncate the left side of the list based on rank
var todoGroupSearch = ["goal:complete goal:pr",
    "goal:group6 goal:g6",
    "goal:group5 goal:g5",
    "goal:group4 goal:g4",
    "goal:group3 goal:g3",
    "goal:group2 goal:g2",
    "goal:group1 goal:g1",
    "goal:top",
    "goal:wr",
    "goal:improve"];
var todoGroupIcons = [false,false,false,false,false,false,false,false,true,false]; //is the content a google icon
var todoGroupContent = ["Complete","G6","G5","G4","G3","G2","G1","Top","star","Improve"]; //the actual cell content
var todoSearchLabel = "todo"; //this is what you search in the map table to see the todo entries
var todoCompleteLabels = ["todo:incomplete", "todo:complete"];


//-------------------------------------------------------------- STAGES

var globalTodoStageCutoff = 3; //not todo is 0,1,2, so >=3 (3,4,5) are marked as todo 

var stageLabels = ["0","1","WR"];
var stageContent = ["close","check","star"];
//no stageIcons because they're all just true
var stageSearch = ["","","WRCP"];

var todoStageLabels = ["1","WR","IMP"];
var todoStageSearch = ["goal:complete",
    "goal:wrcp",
    "goal:improve"];
var todoStageIcons = [true,true,false];
var todoStageContent = ["check","star","Improve"];


//-------------------------------------------------------------- BONUSES

var globalTodoBonusCutoff = 3; //not todo is 0,1,2, so >=3 (3,4,5) are marked as todo 

var bonusLabels = ["0","1","WR"];
var bonusContent = ["close","check","star"];
//no bonusIcons because they're all just true
var bonusSearch = ["","","WRB"];

var todoBonusLabels = ["1","WR","IMP"];
var todoBonusSearch = ["goal:complete",
    "goal:wrb",
    "goal:improve"];
var todoBonusIcons = [true,true,false];
var todoBonusContent = ["check","star","Improve"];


//-------------------------------------------------------------- MISC LABELS

var typeLabels = ["Staged", "Linear", "Staged-Linear"]; //map type
var typeSearch = ["type:staged", "type:linear", "type:staged type:linear type:staged-linear type:stagedlinear"];

var compContent = ["map:incomplete", "map:complete", "map:complete map:perfect"]; //what the table shows for map/todo completes


//-------------------------------------------------------------- TABLE INDEX ORDER

//normal map table
let colIndexes = ["mapType","isComplete","mapID","mapDate","groupTodo","mapName","group"];
let typeColIndex = colIndexes.indexOf("mapType"); //what column the Type col is
let compColIndex = colIndexes.indexOf("isComplete");
let mapidColIndex = colIndexes.indexOf("mapID");
let mapdateColIndex = colIndexes.indexOf("mapDate");
let groupTodoColIndex = colIndexes.indexOf("groupTodo");
let nameColIndex = colIndexes.indexOf("mapName");
let groupColIndex = colIndexes.indexOf("group");

//todo map table
let todoColIndexes = ["mapType","isDone","todoType","tier","todoCheckbox","todoname","goal","current","original","todoNote"];
let mapTypeTodoColIndex = todoColIndexes.indexOf("mapType");
let compTodoColIndex = todoColIndexes.indexOf("isDone"); //NEEDS to be the same as compColIndex
let todoTypeTodoColIndex = todoColIndexes.indexOf("todoType");
let tierTodoColIndex = todoColIndexes.indexOf("tier");
let checkboxTodoColIndex = todoColIndexes.indexOf("todoCheckbox");
let nameTodoColIndex = todoColIndexes.indexOf("todoname");
let goalTodoColIndex = todoColIndexes.indexOf("goal");
let currTodoColIndex = todoColIndexes.indexOf("current");
let origTodoColIndex = todoColIndexes.indexOf("original");
let noteTodoColIndex = todoColIndexes.indexOf("todoNote");




//-------------------------------------------------------------------------------------------------------------------------------------------------------- CONNECT TO DB

var db;

async function openDatabase() {
    return new Promise(function(resolve, reject) {
        openRequest = window.indexedDB.open("MyTestDatabase", 1);
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




//-------------------------------------------------------------------------------------------------------------------------------------------------------- HELPER FUNC
//-------------------------------------------------------------- CHECK COMPLETION

function isComplete(mapInfo) {
    //group is not "0", no stages are "0" or "0"+todo, no bonuses are "0" or "0"+todo
    let sCompTodo = 0+globalTodoStageCutoff;
    let bCompTodo = 0+globalTodoBonusCutoff;
    let groupCheck = (mapInfo.group === "0") ? false : true;
    let stageCheck = (mapInfo.stage_pr.indexOf("0") === -1) ? true : false;
    let sTodoCheck = (mapInfo.stage_pr.indexOf(sCompTodo) === -1) ? true : false;
    let bonusCheck = (mapInfo.b_pr.indexOf("0") === -1) ? true : false;
    let bTodoCheck = (mapInfo.b_pr.indexOf(bCompTodo) === -1) ? true : false;
    return (groupCheck && stageCheck && sTodoCheck && bonusCheck && bTodoCheck);
}

function isPerfect(mapInfo) {
    //wr on everything
    let sWrTodo = 2+globalTodoStageCutoff;
    let bWrTodo = 2+globalTodoBonusCutoff;
    let groupCheck = (mapInfo.group === "WR") ? true : false;
    let stageCheck = (mapInfo.stage_pr.replaceAll("2","").replaceAll(sWrTodo,"") === "") ? true : false;
    let bonusCheck = (mapInfo.b_pr.replaceAll("2","").replaceAll(bWrTodo,"")  === "") ? true : false;
    return (groupCheck && stageCheck && bonusCheck);
}

function isTodoGroupDone(goalGroup,currentGroup) {
    //compare current to goal to see if we're done
    //have to do some gymnasics because todo "TOP" == group label "R10"-"R2"
    //var todoGroupLabels = ["G7","G6","G5","G4","G3","G2","G1","TOP","WR","IMP"];
    //var groupLabels = ["0","G7","G6","G5","G4","G3","G2","G1","R10","R9","R8","R7","R6","R5","R4","R3","R2","WR"];
    let topGroups = ["R10","R9","R8","R7","R6","R5","R4","R3","R2"]; //correspond to "TOP"
    if (goalGroup === todoGroupLabels[todoGroupLabels.length-1]) { return false; } //IMPROVE is never marked as done
    if (topGroups.indexOf(currentGroup) !== -1) { currentGroup = "TOP"; } //we have a top
    //now we can compare in the todoGroupLabels
    //if we have a "0" then the index is -1 so we can still compare
    return (todoGroupLabels.indexOf(currentGroup) >= todoGroupLabels.indexOf(goalGroup));
}

function isTodoStageDone(goalStage,currentStage) {
    //compare current to goal to see if we're done
    //var todoStageLabels = ["1","WR","IMP"];
    //var stageLabels = ["0","1","WR"];
    if (goalStage === todoStageLabels[todoStageLabels.length-1]) { return false; } //IMPROVE is never marked as done
    //currentStage is 3,4,5 because it's 0,1,2 + 3
    currentStage = +currentStage-globalTodoStageCutoff; //shift to 0,1,2
    currentStage = stageLabels[currentStage]; //look up what the label is
    return (todoStageLabels.indexOf(currentStage) >= todoStageLabels.indexOf(goalStage)); //otherwise compare indices
}

function isTodoBonusDone(goalBonus,currentBonus) {
    //compare current to goal to see if we're done
    //var todoBonusLabels = ["1","WR","IMP"];
    //var bonusLabels = ["0","1","WR"];
    if (goalBonus === todoBonusLabels[todoBonusLabels.length-1]) { return false; } //IMPROVE is never marked as done
    //currentBonus is 3,4,5 because it's 0,1,2 + 3
    currentBonus = +currentBonus-globalTodoBonusCutoff; //shift to 0,1,2
    currentBonus = bonusLabels[currentBonus]; //look up what the label is
    return (todoBonusLabels.indexOf(currentBonus) >= todoBonusLabels.indexOf(goalBonus)); //otherwise compare indices
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
    //return (cell === 3 || cell === 4 || cell === 5);
    return (cell >= globalTodoStageCutoff);
}
function isBonusCellTodo(cell) {
    cell = +cell;
    return (cell >= globalTodoBonusCutoff);
}

function isStageWRCP(cell) {
    cell = +cell;
    return ((cell == 2) || ((cell-globalTodoStageCutoff) == 2));
}
function isBonusWRB(cell) {
    cell = +cell;
    return ((cell == 2) || ((cell-globalTodoStageCutoff) == 2));
}

function isMapNoteNode(t)  { return (displayMode === "note" && t.attributes["data-column-id"].nodeValue == "map_note");}
function isTodoNoteNode(t) { return (displayMode === "todo" && t.attributes["data-column-id"].nodeValue == "todo_note");}
function isNoteNode(t) { return (isMapNoteNode(t) || isTodoNoteNode(t)); }


//-------------------------------------------------------------- SORTING

function sortGroups(a, b) {
    let ai = groupLabels.indexOf(a);
    let bi = groupLabels.indexOf(b);
    if (ai > bi) { return 1; }
    else if (bi > ai) { return -1; }
    else { return 0; }
}

function sortTodoGroups(a, b) {
    let ai = todoGroupLabels.indexOf(a);
    let bi = todoGroupLabels.indexOf(b);
    if (ai > bi) { return 1; }
    else if (bi > ai) { return -1; }
    else { return 0; }
}


//-------------------------------------------------------------- MISC

function isStaged(mapType) { //factoring this out in case it ever changes
    return (mapType == "Staged" || mapType == "Staged-Linear");
}

function getTodoFromName(todoName) {
    //returns [mapName,type,num] like how you format the arguments of createTodoItem
    //map's can't have spaces in them so it's e.g. "map_name S2"
    let spacei = todoName.indexOf(" ");
    if (spacei === -1) { return [todoName,"group",-1]; } //no space so it's just a map name
    if (spacei+2 >= todoName.length) { return null; } //bad format, can't have a (space)S(number)
    let mapName = todoName.slice(0,spacei);
    let typeChar = todoName.charAt(spacei+1); //S or B
    let todoNum = todoName.slice(spacei+2); //the rest of the string, number of stage or bonus
    todoNum = +todoNum;
    if (typeChar === "S") { return [mapName,"stage",todoNum]; }
    if (typeChar === "B") { return [mapName,"bonus",todoNum]; }
    return null; //catch all
}

function isHexColor(hex) { //used in color settings
    if (typeof hex !== 'string') { return false; }
    return (hex.slice(0,1) === '#' && hex.length === 7 && !isNaN(Number('0x' + hex.slice(1,))));
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

/* 
onready events are broken/removed and need a workaround
https://github.com/grid-js/gridjs/issues/1295
https://github.com/grid-js/gridjs/issues/1349
*/
//normal onready event was removed??? in v6 so we have to do this to callback
//thank you so much scarchik https://github.com/grid-js/gridjs/issues/1349
//thank you again, you really have no idea
function createOnReadyCallback(callbackFunc) {
    return function (state, prevState) {
        if (prevState.status < state.status) {
            if (prevState.status === 2 && state.status === 3) {
                callbackFunc();
            }
        }
    }
}

/*
sometimes? when calling forceRender(), the table crashes and just says "An error happened while fetching the data"
console always shows two instances of "[Grid.js] [ERROR]: TypeError: t is undefined log.ts:12:21" being raised together
the error stack is extremely cryptic and opaque and I couldn't get anywhere with it

maybe (MAYBE) forceRender() threw an error that the table was empty (incorrectly) by checking if table.config and table.config.container were defined, then this bubbled
...but those two always seemed to be defined

even better, the error seemed to not exist in gridjs 6.1.1, but that version has REALLY unusably bad search
(if you're on page 1 and search, then you can't get anything from e.g. page 2 in the results)

research got me NO leads ANYWHERE except for https://stackoverflow.com/questions/77959213/gridjs-constant-an-error-happened-while-fetching-the-data
...but I couldn't reproduce their error
BUT the one reply was CORRECT -- if I replace pagination with custom pages with just "pagination: true" then the error COMPLETELY VANISHES

so the options were
1. remove pagination, have t3 and t4 tables lag like crazy + require scrolling (ew!)
2. use default pagination with TEN ROWS PER PAGE (double ew!)
3. spend 6 straight weeks chasing this bug (guess which one I did)

I eventually tried slowly removing pieces of code until the error went away
when I removed ALL cell formatters, the error stopped, making me think that this might be due to high load on formatting/processing

then I looked at the table status (like in the above function)
usually the table is at 3, then you click to rerender and it goes 3 > 1 > 2 > 3 and then it's good again
when this error happens, it goes 3 > 1 > 2 > 3 > 1 > throw errors > 4
I have a feeling that whatever causes the > 1 is the source of the error
but I just have no clue and I just give up 

the important thing here is that when this chain of statuses happens 100% of the time
AND this is the only time I've ver seen status 4 (maybe it's the error code?)
so if I see 1 > 4 then I know FOR SURE that this error has shown up

so what do I, a rational person, do when that happens? just rerender the table again idk:
*/
function errorProtection(state, prevState) {
    if (prevState.status === 1 && state.status === 4) {
        table.forceRender();
        if (useHiddenTable) { switchToHidden(); } //to hide the error table (only for a split second)
    }
}

//loads a piece of data or initializes it if not found
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




//-------------------------------------------------------------------------------------------------------------------------------------------------------- DB INTERFACING
//-------------------------------------------------------------- GETTING ALL DATA

async function dbGetMapsTier(tier) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const mapTable = db.transaction("maps").objectStore("maps"); //readonly
            const requestGet = mapTable.index("tier").getAll(tier);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    resolve(requestGet.result); return;
                } 
                else { resolve([]); return; } //no maps for that tier
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}

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

async function dbGetAllTodos() {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo").objectStore("todo"); //readonly
            const request = todoTable.getAll();

            request.onsuccess = function() {
                if (request.result !== undefined) {
                    //get the current status for each of these from the other database
                    let allTodos = request.result;
                    let mapTable = db.transaction("maps").objectStore("maps");

                    //have to make an array of promises, where each element is a todo status from the db
                    //please work? javascript is absolutely unhinged
                    let mapTablePromises = [];
                    allTodos.forEach((todoItem) => {
                
                        let todoPromise = function(resolve,reject) {
                            const mapRequest = mapTable.index("mapName").get(todoItem.mapName);
                            mapRequest.onsuccess = function() {
                                if (request.result !== undefined) {
                                    let mapInfo = mapRequest.result;
                                    let todoStatus;
                                    switch (todoItem.todoType) {
                                        case "group":
                                            todoStatus = mapInfo.group;
                                            break;
                                        case "stage":
                                            todoStatus = mapInfo.stage_pr.charAt(todoItem.number-1);
                                            break;
                                        case "bonus":
                                            todoStatus = mapInfo.b_pr.charAt(todoItem.number-1);
                                            break;
                                        default:
                                            break;
                                    }
                                    resolve(todoStatus); return;
                                } 
                                else { resolve(-2); return; }
                            }
                            mapRequest.onerror = function() { resolve(-1); return; }
                        }

                        mapTablePromises.push(new Promise(todoPromise));
                    });

                    //wait for all statuses to settle
                    Promise.all(mapTablePromises).then((todoStatuses) => {
                        //put the pieces together...
                        for (let todoi=0; todoi<allTodos.length; todoi++) {
                            allTodos[todoi]["current"] = todoStatuses[todoi]; //maybe make more robust? can this go out of order?
                            //mark as complete if the current >= the goal
                            let todoCheckFunc;
                            switch (allTodos[todoi]["todoType"]) {
                                case "group":
                                    todoCheckFunc = isTodoGroupDone;
                                    break;
                                case "stage":
                                    todoCheckFunc = isTodoStageDone;
                                    break;
                                case "bonus":
                                    todoCheckFunc = isTodoBonusDone;
                                    break;
                                default:
                                    todoCheckFunc = function(_,__) { return false; } //marked as not done by default
                            }
                            if (todoCheckFunc(allTodos[todoi]["goal"] , todoStatuses[todoi])) { allTodos[todoi]["isDone"] = todoCompleteLabels[1]; }
                            else { allTodos[todoi]["isDone"] = todoCompleteLabels[0]; }
                        }
                        resolve(allTodos); return;
                    });
                }
                else { resolve([]); return; } //no todo
            }
            request.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}


//-------------------------------------------------------------- GROUPS

async function dbChangeGroup(mapName,dGroup) {
    console.log(mapName,dGroup);
    if (db) {
        return new Promise(function(resolve,reject) {
            const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
            const requestGet = mapTable.index("mapName").get(mapName);

            requestGet.onsuccess = function() {
                console.log(requestGet);
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
                        resolve("Success"); return;
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
function increaseGroup(mapName) {
    dbChangeGroup(mapName,1).then((res) => { console.log('result',res); if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}
function decreaseGroup(mapName) {
    dbChangeGroup(mapName,-1).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}


//-------------------------------------------------------------- STAGES

async function dbChangeStage(mapName,stagei,dStage) {
    if (db) {
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
                        resolve("Success"); return;
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
function increaseStage(mapName,stagei) {
    dbChangeStage(mapName,stagei,1).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}
function decreaseStage(mapName,stagei) {
    dbChangeStage(mapName,stagei,-1).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}


//-------------------------------------------------------------- BONUSES

async function dbChangeBonus(mapName,bonusi,dBonus) {
    if (db) {
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
                        resolve("Success"); return;
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
function increaseBonus(mapName,stagei) {
    dbChangeBonus(mapName,stagei,1).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}
function decreaseBonus(mapName,stagei) {
    dbChangeBonus(mapName,stagei,-1).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}


//-------------------------------------------------------------- NOTES

async function dbSaveMapNote(mapName,note) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
            const requestGet = mapTable.index("mapName").get(mapName);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let mapInfo = requestGet.result;
                    mapInfo.map_note = note;

                    const requestUpdate = mapTable.put(mapInfo);

                    requestUpdate.onsuccess = function() {
                        resolve("Success"); return;
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

async function dbSaveTodoNote(todoName,note) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            const requestGet = todoTable.get(getTodoFromName(todoName));

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let todoInfo = requestGet.result;
                    todoInfo.todo_note = note;

                    const requestUpdate = todoTable.put(todoInfo);

                    requestUpdate.onsuccess = function() {
                        resolve("Success"); return;
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


//-------------------------------------------------------------- TODO CREATION/REMOVAL

async function dbCreateTodo(mapName,todoType,todoNum) {
    if (db) {
        return new Promise(function(resolve,reject) {
            //first we want to get this map's data and see if we've beaten the stage/bonus
            //or if it's a map, see what group we currently have
            const mapTable = db.transaction("maps", "readwrite").objectStore("maps");
            const requestGet = mapTable.index("mapName").get(mapName);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let mapInfo = requestGet.result;

                    let todoOrig, todoGoal, prStr, newpr;
                    switch (todoType) {
                        case "group":
                            if (mapInfo.groupTodo) { resolve("Unneeded"); return; } //already a todo item
                            mapInfo.groupTodo = true; //mark the group as todo

                            todoOrig = mapInfo.group;
                            let groupi = groupLabels.indexOf(todoOrig);
                            if (groupi === 0) { todoGoal = todoGroupLabels[0]; } //map hasn't been beaten yet, so "improve" isn't an option, default is complete
                            else { todoGoal = todoGroupLabels[todoGroupLabels.length-1]; } //see todoLabelsYesComp instantiation for explanation
                            break;
                        case "stage":
                            prStr = mapInfo.stage_pr;
                            todoOrig = prStr.charAt(todoNum-1); //"0", "1", or "2"
                            if (todoOrig === "") { resolve(-5); return; } //num too big or too small
                            if (isStageCellTodo(todoOrig)) { resolve("Unneeded"); return; } //this is labeled as todo already

                            //otherwise we need to add 3 to it to mark it as todo
                            //todoOrig is 0,1,2 otherwise we would've resolved already
                            newpr = +todoOrig+globalTodoStageCutoff;
                            mapInfo.stage_pr = prStr.slice(0,todoNum-1) + newpr + prStr.slice(todoNum);

                            if (todoOrig === "0") { todoGoal = todoStageLabels[0]; } //hasn't been beaten
                            else { todoGoal = todoStageLabels[todoStageLabels.length-1]; }
                            break;
                        case "bonus":
                            prStr = mapInfo.b_pr;
                            todoOrig = prStr.charAt(todoNum-1); //"0", "1", or "2"
                            if (todoOrig === "") { resolve(-5); return; } //num too big or too small
                            if (isBonusCellTodo(todoOrig)) { resolve("Unneeded"); return; }

                            //otherwise we need to add 3 to it to mark it as todo
                            //todoOrig is 0,1,2 otherwise we would've resolved already
                            newpr = +todoOrig+globalTodoBonusCutoff;
                            mapInfo.b_pr = prStr.slice(0,todoNum-1) + newpr + prStr.slice(todoNum);

                            if (todoOrig === "0") { todoGoal = todoBonusLabels[0]; } //hasn't been beaten
                            else { todoGoal = todoBonusLabels[todoBonusLabels.length-1]; }
                            break;
                        default:
                            resolve(-6); return; //we should never be here;
                            break;
                    }

                    //update the mapinfo with the new todo status
                    const requestUpdate = mapTable.put(mapInfo);

                    requestUpdate.onsuccess = function() {
                        //now we create the todo table item
                        let currentTime = new Date();

                        let todoItem = {
                            removeCheckbox: 0,
                            mapType: mapInfo.mapType,
                            mapName: mapName,
                            mapTier: mapInfo.tier,
                            todoType: todoType, 
                            number: todoNum,
                            original: todoOrig,
                            goal: todoGoal,
                            todo_note: "",
                        };

                        //now go to the todo table and insert
                        const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
                        const requestCreate = todoTable.put(todoItem);

                        requestCreate.onsuccess = function() {
                            resolve("Success"); return;
                        }
                        requestCreate.onerror = function() { resolve(-5); return; } //marked but not created :/
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
function createTodoItem(mapName,todoType,todoNum) {
    dbCreateTodo(mapName,todoType,todoNum).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}

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
                            resolve("Success"); return;
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
function removeTodoItem(mapName,todoType,todoNum) {
    dbDeleteTodo(mapName,todoType,todoNum).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}
function deleteDoneTodos() {
    //goes into the table and uses the row data to see what todos need to be removed
    //easiest way to to do this because otherwise we need to combine todo and maptable data as before
    //at least you can't attack this with inspect element because it uses table, not tablediv
    if (displayMode == "todo" && table.config.columns.length === 10) { //the table rerenders with old data first, so just to be safe
        allRows = table.config.storage.data();

        allDeletes = [];
        allRows.forEach((todoInfo) => {
            if (todoInfo.isDone === todoCompleteLabels[1]) { //marked as done on the table
                allDeletes.push(dbDeleteTodo(todoInfo.mapName, todoInfo.todoType, todoInfo.number));
            }
            Promise.all(allDeletes).then((results) => { //don't care about the results, if it doesn't delete then whatever
                renderTable(tier=globalCurrentTier,rerender=true);
            });
        });

    }
}


//-------------------------------------------------------------- UPDATING TODOS WHEN UPDATING MAPS

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


//-------------------------------------------------------------- MASS DELETING TODOS

async function dbDeleteMarkedTodos() {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            let requestGet = todoTable.index("removeCheckbox").openCursor(IDBKeyRange.only(1));

            requestGet.onsuccess = function() {
                var cursor = requestGet.result;

                if (cursor) {
                    let todoInfo = cursor.value;
                    cursor.continue(); //go next while we delete this one
                    dbDeleteTodo(todoInfo.mapName, todoInfo.todoType, todoInfo.number).then((res) => { 
                        if (res === "Success") { } //succeeded, we're fine
                        else { resolve(-3); return; } //couldn't delete for some reason
                    });
                }
                else { resolve("Success"); return; } //done, or nothing
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}
function deleteMarkedTodos() {
    dbDeleteMarkedTodos().then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}

async function dbToggleTodoCheckbox(todoInfo) {
    //todoInfo is [mapName, todoType, todoNum], exactly in the form of the todoTable key
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            const requestGet = todoTable.get(todoInfo);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let todoItem = requestGet.result;
                    todoItem.removeCheckbox = 1 - todoItem.removeCheckbox;

                    const requestUpdate = todoTable.put(todoItem);

                    requestUpdate.onsuccess = function() {
                        resolve("Success"); return;
                    }
                    requestUpdate.onerror = function() { resolve(-4); return; } //nothing bad
                }
                else { resolve(-3); return; } //weird but whatever
            }
            requestGet.onerror = function () { resolve(-2); return; } //nothing bad
        });
    }
    else { return -1; }
}
function toggleTodoCheckbox(todoInfo) {
    dbToggleTodoCheckbox(todoInfo).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}


//-------------------------------------------------------------- TODO GOALS (GROUP)

async function dbChangeTodoGoalGroup(mapName,dGroup,incompleteFlag) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            const requestGet = todoTable.get([mapName,"group",-1]);
            //var todoGroupLabels = ["G7","G6","G5","G4","G3","G2","G1","TOP","WR","IMP"]; //here the default index is -1, we truncate the left side of the list based on rank

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let todoInfo = requestGet.result;

                    let topGroups = ["R10","R9","R8","R7","R6","R5","R4","R3","R2"]; //these correspond to "TOP"

                    let origGroupi;
                    if (topGroups.indexOf(todoInfo.original) !== -1) { origGroupi = todoGroupLabels.indexOf("TOP"); } //replace e.g. R9 with TOP
                    else { origGroupi = todoGroupLabels.indexOf(todoInfo.original); } //e.g. G2

                    let possibleTodoGroups = todoGroupLabels.slice(origGroupi+1); //-> e.g. [G1, TOP, WR, IMP]

                    if (incompleteFlag) { possibleTodoGroups.splice(-1); } //remove the "IMP" option from the end if this flag is raised
                    if (possibleTodoGroups.length <= 1) { resolve("Unneeded"); return; } //e.g. we have WR, only option is IMPROVE, no need to hit the db or rerender, etc

                    let goalGroupi = possibleTodoGroups.indexOf(todoInfo.goal);
                    if (goalGroupi === -1) { goalGroupi = possibleTodoGroups.length-1; } //should never happen, just say it was IMPROVE
                    //javascript is a real work of art and (-1)%length = -1, not length-1, so I have to do this crap
                    while (goalGroupi+dGroup < 0) { goalGroupi += possibleTodoGroups.length; }
                    let newGoalGroupi = (goalGroupi+dGroup)%possibleTodoGroups.length;
                    let newGoalGroup = possibleTodoGroups[newGoalGroupi];

                    todoInfo.goal = newGoalGroup;
                    const requestUpdate = todoTable.put(todoInfo);

                    requestUpdate.onsuccess = function() {
                        resolve("Success"); return;
                    }
                    requestUpdate.onerror = function() { resolve(-4); return; }
                } 
                else { resolve(-3); return; }
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}
function increaseTodoGoalGroup(mapName,incompleteFlag) {
    dbChangeTodoGoalGroup(mapName,1,incompleteFlag).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}
function decreaseTodoGoalGroup(mapName,incompleteFlag) {
    dbChangeTodoGoalGroup(mapName,-1,incompleteFlag).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}


//-------------------------------------------------------------- TODO GOALS (STAGE)

async function dbChangeTodoGoalStage(mapName,stageNum,dStage,incompleteFlag) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            const requestGet = todoTable.get([mapName,"stage",stageNum]);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined)  {
                    let todoInfo = requestGet.result;

                    let origStagei;
                    if (todoInfo.original === "2") { origStagei = todoStageLabels.indexOf("WR"); } //renamed
                    else { origStagei = todoStageLabels.indexOf(todoInfo.original); }

                    let possibleTodoStages = todoStageLabels.slice(origStagei+1);

                    if (incompleteFlag) { possibleTodoStages.splice(-1); } //remove the "IMP" option from the end if this flag is raised
                    if (possibleTodoStages.length <= 1) { resolve("Unneeded"); return; } //e.g. we have WR, only option is IMPROVE, no need to hit the db or rerender, etc

                    let goalStagei = possibleTodoStages.indexOf(todoInfo.goal);
                    if (goalStagei === -1) { goalStagei = possibleTodoStages.length-1; } //should never happen, just say it was IMPROVE
                    while (goalStagei+dStage < 0) { goalStagei += possibleTodoStages.length; }

                    let newGoalStagei = (goalStagei+dStage)%possibleTodoStages.length;
                    let newGoalStage = possibleTodoStages[newGoalStagei];

                    todoInfo.goal = newGoalStage;
                    const requestUpdate = todoTable.put(todoInfo);

                    requestUpdate.onsuccess = function() {
                        resolve("Success"); return;
                    }
                    requestUpdate.onerror = function() { resolve(-4); return; }
                }
                else { resolve(-3); return; }
            }
            requestGet.onerror = function() { resolve(-2); return; }

        });
    }
    else { return -1; }
}
function increaseTodoGoalStage(mapName,stageNum,incompleteFlag) {
    dbChangeTodoGoalStage(mapName,stageNum,1,incompleteFlag).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}
function decreaseTodoGoalStage(mapName,stageNum,incompleteFlag) {
    dbChangeTodoGoalStage(mapName,stageNum,-1,incompleteFlag).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}


//-------------------------------------------------------------- TODO GOALS (BONUS)

async function dbChangeTodoGoalBonus(mapName,bonusNum,dBonus,incompleteFlag) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            const requestGet = todoTable.get([mapName,"bonus",bonusNum]);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined)  {
                    let todoInfo = requestGet.result;

                    let origBonusi;
                    if (todoInfo.original === "2") { origBonusi = todoBonusLabels.indexOf("WR"); } //renamed
                    else { origBonusi = todoBonusLabels.indexOf(todoInfo.original); }

                    let possibleTodoBonuses = todoBonusLabels.slice(origBonusi+1);

                    if (incompleteFlag) { possibleTodoBonuses.splice(-1); } //remove the "IMP" option from the end if this flag is raised
                    if (possibleTodoBonuses.length <= 1) { resolve("Unneeded"); return; } //e.g. we have WR, only option is IMPROVE, no need to hit the db or rerender, etc

                    let goalBonusi = possibleTodoBonuses.indexOf(todoInfo.goal);
                    if (goalBonusi === -1) { goalBonusi = possibleTodoBonuses.length-1; } //should never happen, just say it was IMPROVE
                    while (goalBonusi+dBonus < 0) { goalBonusi += possibleTodoBonuses.length; }

                    let newGoalBonusi = (goalBonusi+dBonus)%possibleTodoBonuses.length;
                    let newGoalBonus = possibleTodoBonuses[newGoalBonusi];
                    //console.log(goalBonusi, dBonus, newGoalBonusi, newGoalBonus);

                    todoInfo.goal = newGoalBonus;
                    const requestUpdate = todoTable.put(todoInfo);

                    requestUpdate.onsuccess = function() {
                        resolve("Success"); return;
                    }
                    requestUpdate.onerror = function() { resolve(-4); return; }
                }
                else { resolve(-3); return; }
            }
            requestGet.onerror = function() { resolve(-2); return; }
        });
    }
    else { return -1; }
}
function increaseTodoGoalBonus(mapName,bonusNum,incompleteFlag) {
    dbChangeTodoGoalBonus(mapName,bonusNum,1,incompleteFlag).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}
function decreaseTodoGoalBonus(mapName,bonusNum,incompleteFlag) {
    dbChangeTodoGoalBonus(mapName,bonusNum,-1,incompleteFlag).then((res) => { if (res === "Success") {
        renderTable(tier=globalCurrentTier,rerender=true);
    }});
}




//-------------------------------------------------------------------------------------------------------------------------------------------------------- DB -> WEBPAGE CONVERTERS
//-------------------------------------------------------------- CELL FORMATTERS

function makeNameContent(cell,row) { //we use the "complete" column to choose the class
    let compInfo = row.cells[compColIndex].data;
    let compi, cellInterior, classNames;
    if (compInfo.slice(0,4) === "todo") {
        //this is a todo item on the todo list
        compi = todoCompleteLabels.indexOf(compInfo);
        classNames = localStorage.getItem(`todocomp-cell-${compi}ClassName`);
        cellInterior = `<div class="${classNames}"><b>${cell}</b></div>`;
    }
    else {
        compi = compContent.indexOf(compInfo);
        classNames = localStorage.getItem(`mapcomp-cell-${compi}ClassName`);
        cellInterior = `<div class="${classNames}"><b>${cell}</b></div>`;
    }
    return `<div class="name-cell">${cellInterior}</div>`;
}
function makeNameCell(cell,row) { return gridjs.html(makeNameContent(cell,row)); }

function makeBonusContent(cell,row) {
    //given "0" "1" or "2" for the string index
    //OR 3 4 5 for todo item
    let bonusi = +cell;
    let isBonusTodo = false;
    if (isBonusCellTodo(bonusi)) {
        bonusi -= globalTodoBonusCutoff;
        isBonusTodo = true;
    }
    let cellInterior;
    let classNames;
    if (row && isBonusTodo) { classNames = localStorage.getItem(`comp-cell-${bonusLabels[bonusi]}ClassName`) + ` todoOverlay`; } //if we don't pass "row" as an argument we don't get todo behavior, good for todo table
    else { classNames = localStorage.getItem(`comp-cell-${bonusLabels[bonusi]}ClassName`); }
    if (!cell) { //null cell
        cellInterior = `<div class=${localStorage.getItem('null-cellClassName')}><i class="material-icons">remove</i></div>`;
    }
    else {
        cellInterior = `<div class="${classNames}"><i class="material-icons">${bonusContent[bonusi]}</i></div>`;
    }
    return `<div class="bonus-cell">${cellInterior}</div>`;
}
function makeBonusCell(cell,row) { return gridjs.html(makeBonusContent(cell,row)); }

function makeStageContent(cell,row) {
    //given "0" "1" or "2" for the string index
    //OR 3 4 5 for todo item
    let stagei = +cell;
    let isStageTodo = false;
    if (isStageCellTodo(stagei)) {
        stagei -= globalTodoStageCutoff;
        isStageTodo = true;
    }
    let cellInterior, classNames;
    if (row && isStageTodo) { classNames = localStorage.getItem(`comp-cell-${stageLabels[stagei]}ClassName`) + ` todoOverlay`; } //if we don't pass "row" as an argument we don't get todo behavior, good for todo table
    else { classNames = localStorage.getItem(`comp-cell-${stageLabels[stagei]}ClassName`); }
    if (!cell) { //null cell
        cellInterior = `<div class=${localStorage.getItem('null-cellClassName')}><i class="material-icons">remove</i></div>`;
    }
    else {
        cellInterior = `<div class="${classNames}"><i class="material-icons">${stageContent[stagei]}</i></div>`;
    }
    return `<div class="stage-cell">${cellInterior}</div>`;
}
function makeStageCell(cell,row) { return gridjs.html(makeStageContent(cell,row)); }

function makeGroupContent(cell,row) {
    let groupi = groupLabels.indexOf(cell);
    let cellInterior, classNames;
    if (row && row.cells[groupTodoColIndex].data) { classNames = localStorage.getItem(`comp-cell-${cell}ClassName`) + ` todoOverlay`; } //we pass the row sometimes, sometimes we don't (like in todo table we don't want to)
    else { classNames = localStorage.getItem(`comp-cell-${cell}ClassName`); }
    if (groupIcons[groupi]) { //this is an icon
        cellInterior = `<div class="${classNames}"><i class="material-icons">${groupContent[groupi]}</i></div>`;
    }
    else {
        cellInterior = `<div class="${classNames}"><b>${groupContent[groupi]}</b></div>`;
    }
    return `<div class="group-cell">${cellInterior}</div>`;
}
function makeGroupCell(cell,row) { return gridjs.html(makeGroupContent(cell,row)); }

function makeTodoContent(cell,row) {
    //there is this really ridiculous issue with table rendering that I can't find anything online about
    //when I rerender the table with new columns and data, it only rerenders the table once, cool good,
    //but for a split second it has the old data in it for some reason?
    //so you can see things print and re-print in the console several times it's really annoying
    //and I think visually you see some artifacts on the table when you switch tabs sometimes
    //like "0" showing up in a cell for 0.2s
    //what's REALLY REALLY bad is if you switch from Notes to Todo then notes has way less columns than todo
    //so it'll try to render the Notes rows using Todo columns, go out of bounds of the array, and crash
    //easiest workaround (hopefully temporary, this is so stupid) is to just add this line <----------------- HE DIDN'T KNOW
    //because I really cannot find what's going on, again, the table only rerenders itself once
    if (row.length<=Math.max(todoTypeTodoColIndex,currTodoColIndex)) { return; } //stupid shitty ass behavior WHY
    let todoType = row.cells[todoTypeTodoColIndex].data;
    let current = row.cells[currTodoColIndex].data;
    let cellInterior;
    let labelsArr, iconsArr, contentArr;
    let cssLabel;
    switch (todoType) {
        case "group":
            labelsArr = todoGroupLabels;
            iconsArr = todoGroupIcons;
            contentArr = todoGroupContent;
            break;
        case "stage":
            labelsArr = todoStageLabels;
            iconsArr = todoStageIcons;
            contentArr = todoStageContent;
            break;
        case "bonus":
            labelsArr = todoBonusLabels;
            iconsArr = todoBonusIcons;
            contentArr = todoBonusContent;
            break;
        default: //never
            return "";
            break;
    }
    let celli = labelsArr.indexOf(cell);
    let classNames = localStorage.getItem(`todo-cell-${todoType}-${cell}ClassName`);
    if (iconsArr[celli]) { cellInterior = `<div class="${classNames}"><i class="material-icons">${contentArr[celli]}</i></div>`; }
    else { cellInterior = `<div class="${classNames}"><b>${contentArr[celli]}</b></div>`; }
    return `<div class="todo-goal-cell">${cellInterior}</div>`;
}
function makeTodoCell(cell,row) { return gridjs.html(makeTodoContent(cell,row)); }

//this is the "Current" and "Original" columns in the todo table, basically it's just a group or a stage/bonus 012
function makeTodoInfoContent(cell,row) {
    let todoType = row.cells[todoTypeTodoColIndex].data;
    switch (todoType) {
        case "group":
            return makeGroupContent(cell);
            break;
        case "stage":
            return makeStageContent(cell);
            break;
        case "bonus":
            return makeBonusContent(cell);
            break;
        default: //never
            return "";
            break;
    }
}
function makeTodoInfoCell(cell,row) { return gridjs.html(makeTodoInfoContent(cell,row)); }

function makeTodoCheckboxContent(cell,row) {
    let compInfo = row.cells[compColIndex].data;
    let compi = todoCompleteLabels.indexOf(compInfo);

    let cellInterior;
    let classNames = localStorage.getItem(`todocomp-cell-${compi}ClassName`);
    if (cell === 1) {
        cellInterior = `<div class="${classNames}"><input type="checkbox" class="todoCheckbox" checked /></div>`;
    }
    else {
        cellInterior = `<div class="${classNames}"><input type="checkbox" class="todoCheckbox" /></div>`;
    }
    return `<div class="checkbox-cell">${cellInterior}</div>`;
}
function makeTodoCheckboxCell(cell,row) { return gridjs.html(makeTodoCheckboxContent(cell,row)); }


//-------------------------------------------------------------- SEARCH

//mega hack this is disgusting (2 months later comment: it's not disgusting it's awesome)
//basically the search can't see other cells in the row,
//but it parses cells in a row left to right
//so we can save the todoType in here and use it to parse the todoGoal 
var currentTodoType; 

function searchSelector(cell, rowIndex, cellIndex) {
    if (displayMode === "stage" || displayMode === "bonus" || displayMode === "note") {
        //type, isComplete, mapID, mapDate, groupTodo, mapName, group, s1, s2, ...
        //type, isComplete, mapID, mapDate, groupTodo, mapName, group, b1, ..., b10
        //type, isComplete, mapID, mapDate, groupTodo, mapName, group, note
        switch (cellIndex) {
            case typeColIndex:
                let typei = typeLabels.indexOf(cell);
                return typeSearch[typei];
                break;
            case compColIndex:
                return cell; //these are already compContent entries
                break;
            case mapidColIndex:
                return ""; //don't want to look this one up
                break;
            case mapdateColIndex:
                return "year:"+cell.slice(0,cell.indexOf("-")); //2020-01-01 -> 2020
                break;
            case groupTodoColIndex:
                if (cell) { return todoSearchLabel; } //"todo"
                else { return ""; }
                break;
            case nameColIndex:
                return `surf_${cell}`; //for the purists
                break;
            case groupColIndex:
                let groupi = groupLabels.indexOf(cell);
                return groupSearch[groupi];
                break;
            default: //stages, bonuses, or the note
                if (displayMode === "stage") {
                    let stageStr = ""; //maybe have a todo, maybe have a wr, maybe both
                    let stagei = +cell;
                    if (isStageWRCP(cell)) { stageStr = `${stageStr} ${stageSearch[stagei%globalTodoStageCutoff]}`; } //"wrcp"
                    if (isStageCellTodo(cell)) { stageStr = `${stageStr} ${todoSearchLabel}`; } //"todo"
                    return stageStr;
                }
                if (displayMode === "bonus") {
                    let bStr = ""; //maybe have a todo, maybe have a wr, maybe both
                    let bi = +cell;
                    if (isBonusWRB(cell)) { bStr = `${bStr} ${bonusSearch[bi%globalTodoBonusCutoff]}`; } //"wrb"
                    if (isBonusCellTodo(cell)) { bStr = `${bStr} ${todoSearchLabel}`; } //"todo"
                    return bStr;
                }
                if (displayMode === "note") {
                    return cell; //just return the full note
                }
                return ""; //just in case the code gets malformed later
                break;
        }
    }
    else if (displayMode === "todo") {
        switch (cellIndex) {
            case mapTypeTodoColIndex:
                let typei = typeLabels.indexOf(cell);
                return typeSearch[typei];
                break;
            case compTodoColIndex: //whether or not it's done, already formatted
                return cell;
                break;
            case todoTypeTodoColIndex:
                currentTodoType = cell; //"group", "stage", "bonus"
                if (cell === "group") { return `todo:map todo:${cell}`; }
                else { return `todo:${cell}`; }
                break;
            case tierTodoColIndex:
                return `tier:${cell}`;
                break;
            case nameTodoColIndex:
                return cell;
                break;
            case goalTodoColIndex:
                switch (currentTodoType) {
                    case "group":
                        let groupi = todoGroupLabels.indexOf(cell);
                        return todoGroupSearch[groupi];
                        break;
                    case "stage":
                        let stagei = todoStageLabels.indexOf(cell);
                        return todoStageSearch[stagei];
                        break;
                    case "bonus":
                        let bonusi = todoBonusLabels.indexOf(cell);
                        return todoBonusSearch[bonusi];
                        break;
                    default:
                        return "";
                        break;
                }
                break;
            case origTodoColIndex:
                return "";
                break;
            case currTodoColIndex:
                return "";
                break;
            case noteTodoColIndex:
                return cell;
                break;
            default: //should be nothing
                return "";
                break;
        }
    }
    else { //idk
        return cell;
    }
}




//-------------------------------------------------------------------------------------------------------------------------------------------------------- TABLE RENDERING

async function renderTable(tier=globalCurrentTier,rerender=true,callbackFunc=null) {
    console.log('rerendering');
    globalPageReady = false;

    let columns = [ //CHECK THAT THE COLUMN ORDER AGREES WITH SEARCHSELECTOR
        { id: "mapType", name: "Type", hidden: true },
    ];
    let gridJsClasses = { 
        th: localStorage.getItem("tableHeaderClassName"), 
        footer: localStorage.getItem("tableFooterClassName"),
        paginationSummary: localStorage.getItem("tableFooterClassName"),
        paginationButton: localStorage.getItem("tablePaginationClassName"),
        td: localStorage.getItem("tableTdClassName")
    };
    if (displayMode === "stage" || displayMode === "bonus" || displayMode === "note") {
        columns.push({ id: "isComplete", name: "Complete", hidden: true });
        columns.push({ id: "mapID", name: "Map ID", hidden: true });
        columns.push({ id: "mapDate", name: "Add Date", hidden: true });
        columns.push({ id: "groupTodo", name: "Map Todo", hidden: true });
        columns.push({ id: "mapName", name: "Name", sort: true, width: `${mapTableNameWidth}%`, formatter: makeNameCell });
        columns.push({ id: "group", name: "Group", sort: {compare: sortGroups}, width: `${mapTableGroupWidth}%`, formatter: makeGroupCell });

        dbGetMapsTier(tier).then((res) => { if (Array.isArray(res)) {
            globalCurrentTier = tier;
            localStorage.setItem('globalCurrentTier', globalCurrentTier);
            let totalWidthLeft = 99.99-mapTableNameWidth-mapTableGroupWidth; //floats don't cooperate sometimes if we use 100, and we get a scroll bar

            if (displayMode === "stage") { //stages
                //... s1, s2, ..., sn
                //first need to get longest map in the tier
                let mostStages = 0;
                res.forEach((map) => {
                    if (map.stage_pr.length > mostStages) { mostStages = map.stage_pr.length; }
                });

                //add all the fields
                let cellWidth = totalWidthLeft/mostStages;//-0.001;
                for (let si=1; si<=mostStages; si++) {  
                    columns.push({ id: `s${si}`, name: `S${si}`, width: `${cellWidth}%`, formatter: makeStageCell });
                }

                //construct the individual stage fields for the table
                res.forEach((map) => {
                    for (let si=0; si<mostStages; si++) {
                        map[`s${si+1}`] = map.stage_pr[si];
                    }
                });
            }
            else if (displayMode === "bonus") { //bonuses
                //... b1, b2, ..., b10
                //add all the fields
                let cellWidth = totalWidthLeft/10;//-0.001;
                for (let bi=1; bi<=10; bi++) {
                    columns.push({ id: `b${bi}`, name: `B${bi}`, width: `${cellWidth}%`, formatter: makeBonusCell });
                }

                //construct the individual bonus fields for the table
                res.forEach((map) => {
                    for (let bi=0; bi<10; bi++) {
                        map[`b${bi+1}`] = map.b_pr[bi];
                    }
                });
            }
            else if (displayMode === "note") { //note
                //... note (only one for now)
                let cellWidth = totalWidthLeft;
                columns.push({ id: "map_note", name: "Note", width: `${cellWidth}%`, attributes:{ "contenteditable":"true" } });
            }

            //render or rerender
            if (rerender) {
                table.updateConfig({
                    columns: columns,
                    data: res,
                    search: { ignoreHiddenColumns: false, selector: searchSelector },
                    pagination: { limit: entriesPerPage },
                    className: gridJsClasses
                }).forceRender();
            }
            else { //create the table for the first time  
                table = new gridjs.Grid({
                    columns: columns,
                    data: res,
                    search: { ignoreHiddenColumns: false, selector: searchSelector },
                    pagination: { limit: entriesPerPage },
                    className: gridJsClasses
                });
                table.render(tableDiv);
            }
            if (useHiddenTable) { switchToHidden(); } //hide the table, show the fake table with all the data in it
            table.config.store.listeners = []; //remove all old listeners first
            table.config.store.subscribe(createOnReadyCallback(goBackToPage)); //scroll to page
            if (useHiddenTable) { table.config.store.subscribe(createOnReadyCallback(switchFromHidden)); } //when ready, switch back
            table.config.store.subscribe(createOnReadyCallback(copyToHidden)); //and also update the fake table
            table.config.store.subscribe(errorProtection); //stupidest code I'll ever write
            if (callbackFunc) {
                table.config.store.subscribe(createOnReadyCallback(callbackFunc));
            }
        }});
    }
    else if (displayMode === "todo") {
        dbGetAllTodos().then((res) => { if (Array.isArray(res)) {
            //formatters makeTodoCell... uses full row data to see if we have a group, stage, bonus
            let noteCellWidth = 99.99-(todoTableCheckboxWidth+todoTableNameWidth+todoTableGoalWidth+todoTableCurrWidth+todoTableOrigWidth); //floats don't cooperate sometimes if we use 100, and we get a scroll bar
            columns.push({ id: "isDone", name: "Complete", hidden: true });
            columns.push({ id: "todoType", name: "Type", hidden: true });
            columns.push({ id: "mapTier", name: "Tier", hidden: true });
            columns.push({ id: "removeCheckbox", name: "", width: `${todoTableCheckboxWidth}%`, formatter: makeTodoCheckboxCell });
            columns.push({ id: "todoName", name: "Name", sort: true, width: `${todoTableNameWidth}%`, formatter: makeNameCell });
            columns.push({ id: "goal", name: "Goal", sort: {compare: sortTodoGroups}, width: `${todoTableGoalWidth}%`, formatter: makeTodoCell });
            columns.push({ id: "current", name: "Current", width: `${todoTableCurrWidth}%`, formatter: makeTodoInfoCell });
            columns.push({ id: "original", name: "Original", width: `${todoTableOrigWidth}%`, formatter: makeTodoInfoCell });
            columns.push({ id: "todo_note", name: "Note", width: `${noteCellWidth}%`, attributes:{ "contenteditable":"true" } });

            res.forEach((todoItem) => {
                let todoName;
                switch (todoItem.todoType) {
                    case "group": //want to do the map
                        todoName = todoItem.mapName;
                        break;
                    case "stage": //want to do a stage on the map
                        todoName = todoItem.mapName + " S" + todoItem.number;
                        break;
                    case "bonus": //want to do a bonus
                        todoName = todoItem.mapName + " B" + todoItem.number;
                        break;
                    default:
                        break;
                }
                todoItem["todoName"] = todoName;
            });

            //copy/pasted render/rerender code from above, needs to be written twice because it's a callback
            //maybe change the searchSelector since table structure is fundamentally different
            if (rerender) {
                table.updateConfig({
                    columns: columns,
                    data: res,
                    search: { ignoreHiddenColumns: false, selector: searchSelector },
                    pagination: { limit: entriesPerPage },
                    className: gridJsClasses
                }).forceRender();
            }
            else { //create the table for the first time  
                table = new gridjs.Grid({
                    columns: columns,
                    data: res,
                    search: { ignoreHiddenColumns: false, selector: searchSelector },
                    pagination: { limit: entriesPerPage },
                    className: gridJsClasses
                });
                table.render(tableDiv);
            }
            if (useHiddenTable) { switchToHidden(); } //hide the table, show the fake table with all the data in it
            table.config.store.listeners = []; //remove all old listeners first
            table.config.store.subscribe(createOnReadyCallback(goBackToPage)); //scroll to page
            if (useHiddenTable) { table.config.store.subscribe(createOnReadyCallback(switchFromHidden)); } //when ready, switch back
            table.config.store.subscribe(createOnReadyCallback(copyToHidden)); //and also update the fake table
            table.config.store.subscribe(errorProtection); //stupidest code I'll ever write
            if (callbackFunc) {
                table.config.store.subscribe(createOnReadyCallback(callbackFunc));
            }
        }});
    }
}




//-------------------------------------------------------------------------------------------------------------------------------------------------------- UPDATING MAP LIST

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
                                    currentMap.stage_pr = newMap.stage_pr;
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
                                            resolve(`${changeStr}<span class="mapUpdatedTodos">updated ${todoUpdates.length} todo${isPlural}</span>`); return;
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




//-------------------------------------------------------------------------------------------------------------------------------------------------------- AUTOSCROLLING (LOL)

/*
the table jitters like CRAZY when rendering because it's figuring out widths and stuff
NOBODY WANTS THIS!!!!!!
solution: have a fake second table div (not kidding) so the workflow is
  0. real table (A) is showing, fake table (B) is not showing; B.innerHTML = A.innerHTML, but it has no functionality
  1. click something in A
  2. A gets hidden, B gets unhidden -> user now sees "the same table"
  3. A processes, once FULLY done processing...
  4. A HTML is copied in to B
  5. B gets hidden, A gets unhidden
*/
function copyFromHidden() { tableDiv.innerHTML = hiddenDiv.innerHTML; }
function copyToHidden() { 
    if (globalPageReady) {
        hiddenDiv.innerHTML = tableDiv.innerHTML; 
        localStorage.setItem('hiddenTableHTML', hiddenDiv.innerHTML); 
    }
}

function switchToHidden() {
    tableDiv.classList.add('hidden-table-div');
    hiddenDiv.classList.remove('hidden-table-div');
}
function switchFromHidden() {
    if (globalPageReady) {
        document.getElementsByClassName("gridjs-search-input")[0].placeholder = searchPlaceholder; //can't do this any other way because it's also broken! lol!
        hiddenDiv.classList.add('hidden-table-div');
        tableDiv.classList.remove('hidden-table-div');
    }
}

/*
when you click to edit something on page e.g. 3, the rerender will go back to page 1
THIS IS COMPLETELY UNACCEPTABLE
there is NO internal page saving feature and the previously working resetOnPageUpdate
...of course does not work anymore

solution? literally keep a dictionary currentPages of what page we're on for each tier/todo
- change the number when we change pages by clicking previous/next or the page number
- after rerendering, before switching back from the fake table, SCROLL TO THE CURRENT PAGE
this can get REALLY slow so I tried optimizing it a little
also, "clicking" with js counts as real clicking so I have to have a flag that turns off human clicks for a bit
(so that the currentPage doesn't update while we're getting back to currentPage...)
*/
function goBackToPage() {
    //access currentPages and then run getBackToPage()
    //the naming of these functions reflects on my mental state in coding this loophole 
    let currentPageLabel;
    if (displayMode === "todo") { currentPageLabel = "todo"; }
    else { currentPageLabel = globalCurrentTier; }
    getBackToPage(currentPages[currentPageLabel]);
}

function getBackToPage(pageNum) {
    //this fires every single time the table visual changes
    //INCLUDING when we change pages
    //so we only need to have one click call here and it'll run as many as needed
    if (document.getElementsByClassName("gridjs-currentPage").length == 0) { globalPageReady = true; return; } //blank table, just shows Previous | Next
    let currentPage = document.getElementsByClassName("gridjs-currentPage")[0].title.split(" ")[1];
    if (currentPage == pageNum) { //on the right page, exit
        globalPageReady = true;
    }
    else {
        currentPage = +currentPage;
        //we want to get to pageNum
        let paginationButtons = document.getElementsByClassName("gridjs-pages")[0].childNodes;
        let lastPageNum = paginationButtons[paginationButtons.length-2].title.split(" ")[1];
        lastPageNum = +lastPageNum;

        //click the button that gets us the closest to pageNum
        //greedy is optimal here
        //buttons are: Previous, 1, ... , n-1, n, n+1, ..., last, Next
        //the n-1 and n+1 are equivalent to Previous and Next
        //and if we're here we don't want to press "n"
        //so we have Previous, First, Last, Next
        //all of these buttons always exist as indices 0, 1, -2, -1
        //ordering these in case of load in case there's a tie
        //e.g. if we have 6 pages, 1->2->3->4 is slower than 1->6->5->4 since 6 usually has the least entries, and if it doesn't its equal
        let pageDistances = [Math.abs(pageNum-1), Math.abs(lastPageNum - pageNum), Math.abs((currentPage-1) - pageNum), Math.abs((currentPage+1) - pageNum)];
        let minDistance = Math.min(pageDistances[0], pageDistances[1], pageDistances[2], pageDistances[3]);
        let minDistancei = pageDistances.indexOf(minDistance);
        let buttonToClick;

        switch (minDistancei) {
            case 0: //go to page 1
                buttonToClick = paginationButtons[1];
                break;
            case 1: //go to last page
                buttonToClick = paginationButtons[paginationButtons.length-2];
                break;
            case 2: //page--
                buttonToClick = paginationButtons[0];
                break;
            case 3: //page++
                buttonToClick = paginationButtons[paginationButtons.length-1];
                break;
            default:
                break;
        }
        humanClickingPagination = false;

        // waitForElm(".gridjs-pages").then((allpages) => {
        if (buttonToClick) { buttonToClick.click(); }

        humanClickingPagination = true;
        // });
    }
}

//in case we ever need it
// function waitForElm(selector) {
//     return new Promise(resolve => {
//         if (document.querySelector(selector)) {
//             return resolve(document.querySelector(selector));
//         }

//         const observer = new MutationObserver(mutations => {
//             if (document.querySelector(selector)) {
//                 observer.disconnect();
//                 resolve(document.querySelector(selector));
//             }
//         });

//         // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
//         observer.observe(document.body, {
//             childList: true,
//             subtree: true
//         });
//     });
// }




//-------------------------------------------------------------------------------------------------------------------------------------------------------- UI INTERACTION BINDINGS

function unfocusNavItem(itemId) { if (itemId) { document.getElementById(itemId).classList.remove('active'); } }
function   focusNavItem(itemId) { document.getElementById(itemId).classList.add('active'); }

function addMapTableButtons() {
    document.getElementById("TodoToggleDiv").classList.remove('hidden-nav-div');
    document.getElementById("ButtonGap2").classList.remove('hidden-nav-div');
    document.getElementById("StageButton").classList.remove('hidden-nav-div');
    document.getElementById("BonusButton").classList.remove('hidden-nav-div');
    document.getElementById("NoteButton").classList.remove('hidden-nav-div');
    document.getElementById("ButtonGap").classList.remove('hidden-nav-div');

    document.getElementById("DeleteSelectedTodoButton").classList.add('hidden-button');
    document.getElementById("DeleteDoneTodoButton").classList.add('hidden-button');
}
function hideMapTableButtons() {
    document.getElementById("TodoToggleDiv").classList.add('hidden-nav-div');
    document.getElementById("ButtonGap2").classList.add('hidden-nav-div');
    document.getElementById("StageButton").classList.add('hidden-nav-div');
    document.getElementById("BonusButton").classList.add('hidden-nav-div');
    document.getElementById("NoteButton").classList.add('hidden-nav-div');
    document.getElementById("ButtonGap").classList.add('hidden-nav-div');

    document.getElementById("DeleteSelectedTodoButton").classList.remove('hidden-button');
    document.getElementById("DeleteDoneTodoButton").classList.remove('hidden-button');
}

var currentFocusNavTier = null; //any tier, or todo
var currentFocusNavMode = null; //stage, bonus, note
function tierButtonFunc(tierStr) { //easier to factor this out
    if (globalCurrentTier != tierStr || displayMode != globalLastTableHeader) { //don't rerender if we're just mashing the button for the same tier without changing anything
        unfocusNavItem(currentFocusNavTier);

        if (displayMode === "todo") { addMapTableButtons(); }
        displayMode = globalLastTableHeader;
        localStorage.setItem('displayMode', displayMode);
        renderTable(tier=tierStr,rerender=true);

        currentFocusNavTier = `T${tierStr}Button`; focusNavItem(currentFocusNavTier);
    }
}

document.getElementById("T1Button").onclick = function() { tierButtonFunc("1"); }
document.getElementById("T2Button").onclick = function() { tierButtonFunc("2"); }
document.getElementById("T3Button").onclick = function() { tierButtonFunc("3"); }
document.getElementById("T4Button").onclick = function() { tierButtonFunc("4"); }
document.getElementById("T5Button").onclick = function() { tierButtonFunc("5"); }
document.getElementById("T6Button").onclick = function() { tierButtonFunc("6"); }
document.getElementById("T7Button").onclick = function() { tierButtonFunc("7"); }
document.getElementById("T8Button").onclick = function() { tierButtonFunc("8"); }

document.getElementById("TodoButton").onclick = function() {
    if (displayMode !== "todo") {
        unfocusNavItem(currentFocusNavTier);

        hideMapTableButtons();
        displayMode = "todo";
        localStorage.setItem('displayMode', displayMode);
        note_targetRowi = -1; 
        renderTable(rerender=true);

        currentFocusNavTier = "TodoButton"; focusNavItem(currentFocusNavTier); 
    }
}

document.getElementById("StageButton").onclick = function() {
    if (displayMode !== "stage") {
        unfocusNavItem(currentFocusNavMode);

        displayMode = "stage";
        localStorage.setItem('displayMode', displayMode);
        globalLastTableHeader = displayMode;
        localStorage.setItem('globalLastTableHeader', globalLastTableHeader);
        note_targetRowi = -1; 
        renderTable(tier=globalCurrentTier,rerender=true);

        currentFocusNavMode = "StageButton"; focusNavItem(currentFocusNavMode); 
    }
}

document.getElementById("BonusButton").onclick = function() {
    if (displayMode !== "bonus") {
        unfocusNavItem(currentFocusNavMode);

        displayMode = "bonus";
        localStorage.setItem('displayMode', displayMode);
        globalLastTableHeader = displayMode;
        localStorage.setItem('globalLastTableHeader', globalLastTableHeader);
        note_targetRowi = -1; 
        renderTable(tier=globalCurrentTier,rerender=true); 

        currentFocusNavMode = "BonusButton"; focusNavItem(currentFocusNavMode); 
    }
}

document.getElementById("NoteButton").onclick = function() {
    if (displayMode !== "note") {
        unfocusNavItem(currentFocusNavMode);

        displayMode = "note";
        localStorage.setItem('displayMode', displayMode);
        globalLastTableHeader = displayMode;
        localStorage.setItem('globalLastTableHeader', globalLastTableHeader);
        note_targetRowi = -1; 
        renderTable(tier=globalCurrentTier,rerender=true); 

        currentFocusNavMode = "NoteButton"; focusNavItem(currentFocusNavMode); 
    }
}

document.getElementById("TodoToggle").addEventListener('change',function() {
    //true == todo, false == not todo
    globalIsTodo = this.checked; //I don't get it but it works
    localStorage.setItem('globalIsTodo', globalIsTodo);
});

document.getElementById("DeleteSelectedTodoButton").onclick = function () {
    deleteMarkedTodos();
}

document.getElementById("DeleteDoneTodoButton").onclick = function () { 
    deleteDoneTodos();
}




//-------------------------------------------------------------------------------------------------------------------------------------------------------- TABLE EVENT OVERRIDES
//-------------------------------------------------------------- MOUSE1

tableDiv.addEventListener("click", function(e) {
    let t = e.target; //this subelement was clicked on
    if (t) { //no idea why this needs to exist but otherwise sometimes there's an error that t isn't defined

        //identify the page, so when we rerender we can go back
        //stupid hacky bullshit because a bug from 2020 isn't fixed yet
        //https://github.com/grid-js/gridjs/issues/227
        //solution is to look into the table html to see the current page
        //then when the new table is ready, .click() the next page button n-1 times
        if (t && t.nodeName == "BUTTON" && t.attributes.getNamedItem("tabindex").nodeValue === "0" && t.attributes.getNamedItem("role").nodeValue === "button") {
            if (humanClickingPagination) { 
                //we clicked on something to change pagination page
                let currentPageLabel;
                if (displayMode === "todo") { currentPageLabel = "todo"; }
                else { currentPageLabel = globalCurrentTier; }
                let currentSavedPage = currentPages[currentPageLabel];

                switch (t.title) {
                    case "Next":
                        currentSavedPage++;
                        break;
                    case "Previous":
                        if (currentSavedPage > 1) { currentSavedPage--; }
                        break;
                    default: //"Page X"
                        let pageTitle = t.title;
                        if (pageTitle === "pagination.firstPage") { currentSavedPage = 1; } //thank you so much gridjs
                        else {
                            let tPageNum = t.title.split(" ")[1];
                            currentSavedPage = +tPageNum; //cast to int
                        }
                        break;
                }

                currentPages[currentPageLabel] = currentSavedPage;
                localStorage.setItem('currentPages', JSON.stringify(currentPages) );
            }
        }

        //back to regular code...
        //maybe you clicked something inside of a td, go up the hierarchy
        while (t && t.nodeName != 'TD' && t.nodeName != 'TH' && t.nodeName != 'TABLE') { 
            t = t.parentNode;
        }

        if (t && t.nodeName == 'TD') {

            let tRow = t.parentNode.cells; //parent row
            let rowName = tRow[0].innerText; //name of the map for that row

            //loop over the row to find the element
            let tCol = -1;
            for (let i=0; i<tRow.length; i++) {
                if (tRow[i] == t) {
                    tCol = i;
                    break;
                }
            }

            if (displayMode === "stage" || displayMode === "bonus") {
                //name, group, s1, s2, ... or name, group, b1, b2, ..., b10
                switch (tCol) {
                    case 0: //name
                        break;
                    case 1: //group
                        if (globalIsTodo) { createTodoItem(rowName,"group",-1); } //append to todolist
                        else { increaseGroup(rowName); } //change group
                        break;
                    default: //anything else i.e. stages
                        //make sure it's not null  
                        if (!tRow[tCol].innerHTML.includes(`<div class=${localStorage.getItem('null-cellClassName')}><i class="material-icons">remove</i></div>`)) {
                            if (displayMode === "stage") { //stage
                                if (globalIsTodo) { createTodoItem(rowName,"stage",tCol-1); }
                                else { increaseStage(rowName, tCol-2); }
                            }
                            else {  //bonus
                                if (globalIsTodo) { createTodoItem(rowName,"bonus",tCol-1); }
                                else { increaseBonus(rowName, tCol-2); }
                            }
                        }
                        break;
                }
            }
            if (displayMode === "note") {
                //name, group, note
                switch (tCol) {
                    case 0: //name
                        break;
                    case 1:
                        if (globalIsTodo) { createTodoItem(rowName,"group",-1); } //append to todolist
                        else { increaseGroup(rowName); } //change group
                        break;
                    default:
                        break;
                }
            }
            if (displayMode === "todo") {
                //checkbox, name, goal, current, original, note
                //we only have access to the visible cells lol... use the rowname to reverse engineer
                rowName = tRow[1].innerText; //checkbox is zero lol
                let todoInfo = getTodoFromName(rowName);
                //console.log("??",todoInfo);
                if (Array.isArray(todoInfo)) { //if we get back something well-formed
                    switch (tCol) {
                        case 0: //toggle the checkbox
                            toggleTodoCheckbox(todoInfo);
                            break;
                        case 1: //name
                            break;
                        case 2: //change the goal
                            //gotta get current and original
                            //if they're both X then we pass a flag below
                            //so that we can't have "improve" as an option
                            let incompleteFlag = false;
                            let currentText = tRow[3].innerText;
                            let originalText = tRow[4].innerText;

                            switch (todoInfo[1]) {
                                case "group":
                                    if (currentText === groupContent[0] && originalText === groupContent[0]) { incompleteFlag = true; }
                                    increaseTodoGoalGroup(todoInfo[0],incompleteFlag);
                                    break;
                                case "stage":
                                    if (currentText === stageContent[0] && originalText === stageContent[0]) { incompleteFlag = true; }
                                    increaseTodoGoalStage(todoInfo[0],todoInfo[2],incompleteFlag);
                                    break;
                                case "bonus":
                                    if (currentText === bonusContent[0] && originalText === bonusContent[0]) { incompleteFlag = true; }
                                    increaseTodoGoalBonus(todoInfo[0],todoInfo[2],incompleteFlag);
                                    break;
                                default: //?
                                    break;
                            }
                            break;
                        case 3: //change the maptable information, either +group or +stage or +bonus
                            //todoNum is the real stage number (indexed by 1)
                            //but the e.g. increaseStage argument is the index in the string (indexed by 0)
                            switch (todoInfo[1]) {
                                case "group":
                                    increaseGroup(todoInfo[0]);
                                    break;
                                case "stage":
                                    increaseStage(todoInfo[0], todoInfo[2]-1);
                                    break;
                                case "bonus":
                                    increaseBonus(todoInfo[0], todoInfo[2]-1);
                                    break;
                                default: //?
                                    break;
                            }
                            break;
                        default: //can't change "original", "note" is just editable
                            break;
                    }
                }
            }
        }
    }
});


//-------------------------------------------------------------- MOUSE2

tableDiv.addEventListener("contextmenu", function(e) {
    e.preventDefault(); //no right click menu
    let t = e.target; //this subelement was clicked on
    if (t) { //no idea why this needs to exist but otherwise sometimes there's an error that t isn't defined
        //maybe you clicked something inside of a td, go up the hierarchy
        while (t && t.nodeName != 'TD' && t.nodeName != 'TH' && t.nodeName != 'TABLE') { 
            t = t.parentNode;
        }
        if (t && t.nodeName == 'TD') {
            let tRow = t.parentNode.cells; //parent row
            let rowName = tRow[0].innerText; //name of the map for that row

            //loop over the row to find the element
            let tCol = 0;
            for (let i=0; i<tRow.length; i++) {
                if (tRow[i] == t) {
                    tCol = i;
                    break;
                }
            }

            if (displayMode === "stage" || displayMode === "bonus") {
                //name, group, s1, s2, ... or name, group, b1, b2, ..., b10
                switch (tCol) {
                    case 0: //name (or default/undefined behavior)
                        break;
                    case 1: //group
                        if (globalIsTodo) { removeTodoItem(rowName,"group",-1); } //remove from todolist
                        else { decreaseGroup(rowName); } //change group                        
                        break;
                    default: //anything else i.e. stages
                        //make sure it's not null  
                        if (!tRow[tCol].innerHTML.includes(`<div class=${localStorage.getItem('null-cellClassName')}><i class="material-icons">remove</i></div>`)) {
                            if (displayMode === "stage") { //stage
                                if (globalIsTodo) { removeTodoItem(rowName,"stage",tCol-1); }
                                else { decreaseStage(rowName, tCol-2); }
                            }
                            else {  //bonus
                                if (globalIsTodo) { removeTodoItem(rowName,"bonus",tCol-1); }
                                else { decreaseBonus(rowName, tCol-2); }
                            }
                        }
                        break;
                }
            }
            if (displayMode === "note") {
                //name, group, note
                switch (tCol) {
                    case 0: //name (or default)
                        break;
                    case 1:
                        if (globalIsTodo) { removeTodoItem(rowName,"group",-1); } //append to todolist
                        else { decreaseGroup(rowName); } //change group
                        break;
                    default:
                        break;
                }
            }            
            if (displayMode === "todo") {
                //checkbox, name, goal, current, original, note
                //we only have access to the visible cells lol... use the rowname to reverse engineer
                rowName = tRow[1].innerText; //checkbox is zero lol
                let todoInfo = getTodoFromName(rowName);
                if (Array.isArray(todoInfo)) { //if we get back something well-formed
                    switch (tCol) {
                        case 0: //checkbox
                            break;
                        case 1: //name
                            break;
                        case 2: //change the goal
                            //gotta get current and original
                            //if they're both X then we pass a flag below
                            //so that we can't have "improve" as an option
                            let incompleteFlag = false;
                            let currentText = tRow[3].innerText;
                            let originalText = tRow[4].innerText;

                            switch (todoInfo[1]) {
                                case "group":
                                    if (currentText === groupContent[0] && originalText === groupContent[0]) { incompleteFlag = true; }
                                    decreaseTodoGoalGroup(todoInfo[0],incompleteFlag);
                                    break;
                                case "stage":
                                    if (currentText === stageContent[0] && originalText === stageContent[0]) { incompleteFlag = true; }
                                    decreaseTodoGoalStage(todoInfo[0],todoInfo[2],incompleteFlag);
                                    break;
                                case "bonus":
                                    if (currentText === bonusContent[0] && originalText === bonusContent[0]) { incompleteFlag = true; }
                                    decreaseTodoGoalBonus(todoInfo[0],todoInfo[2],incompleteFlag);
                                    break;
                                default: //?
                                    break;
                            }
                            break;
                        case 3: //change the maptable information, either -group or -stage or -bonus
                            //todoNum is the real stage number (indexed by 1)
                            //but the e.g. increaseStage argument is the index in the string (indexed by 0)
                            switch (todoInfo[1]) {
                                case "group":
                                    decreaseGroup(todoInfo[0]);
                                    break;
                                case "stage":
                                    decreaseStage(todoInfo[0], todoInfo[2]-1);
                                    break;
                                case "bonus":
                                    decreaseBonus(todoInfo[0], todoInfo[2]-1);
                                    break;
                                default: //?
                                    break;
                            }
                            break;
                        default: //can't change "original", "note" is just editable
                            break;
                    }
                }
            }
        }
    }
});


//-------------------------------------------------------------- FOCUSIN/OUT FOR NOTES
//the notes are a little weird since they're editable
//and if I make a div wrapper like every other cell type in this table, then the text goes outside the div, so it's not even useful

function focusOnTargetCell() { //this is used multiple times so I just factor it out to stay consistent
    let rowData = document.getElementsByClassName('gridjs-tbody')[0].children;
    if (note_targetRowi !== -1) {
        let newtRowNode = rowData[note_targetRowi];
        let newt;
        if (displayMode === "note") { newt = newtRowNode.cells[2]; }
        if (displayMode === "todo") { newt = newtRowNode.cells[5]; }
        newt.focus();
    }
}

//put the current text in a temp when you focus in
tableDiv.addEventListener('focusin', function(e) {
    let t = e.target;
    if (t && t.attributes["data-column-id"] && isNoteNode(t)) { //td containing note
        let tRowNode = t.parentNode; //parent row
        let allRows = Array.from(tRowNode.parentNode.childNodes);
        note_targetRowi = allRows.indexOf(tRowNode);
        note_tempNoteStr = t.innerText;
    }
    else { note_targetRowi = -1; }
});

//save the (possibly) new text when blurring
tableDiv.addEventListener('focusout', function(e) {
    let t = e.target;
    if (t && t.attributes["data-column-id"] && isNoteNode(t)) {
        //save the note if it changed
        if (t.innerText !== note_tempNoteStr) { //specifically doesn't fire when you hit escape (or just click around)
            let tRowNode = t.parentNode; //parent row
            let rowName; //name of the map/todo for that row
            let allRows = Array.from(tRowNode.parentNode.childNodes);
            let tRowi = allRows.indexOf(tRowNode); //targetRowi but for the cell that we are LEAVING

            let saveNoteFunc;
            if (isMapNoteNode(t)) { rowName = tRowNode.cells[0].innerText; saveNoteFunc = dbSaveMapNote; }
            if (isTodoNoteNode(t)) { rowName = tRowNode.cells[1].innerText; saveNoteFunc = dbSaveTodoNote; }

            saveNoteFunc(rowName,t.innerText).then((res) => { if (res === "Success") {
                renderTable(tier=globalCurrentTier,rerender=true,() => {
                    if (note_targetRowi !== -1 && note_targetRowi !== tRowi) {
                        focusOnTargetCell();
                    }
                });
            }});
        }
        else { 
            //we're leaving a note cell without changing the contents
            //maybe you clicked on something, didn't edit it, scrolled away
            //we have to manually focus because we overrode focusin/out
            focusOnTargetCell();
        }
    }
});


//-------------------------------------------------------------- KEYDOWN CATCHES FOR NOTES

tableDiv.addEventListener('keydown', function(e) {
    let t = e.target;
    if (t && t.attributes["data-column-id"] && isNoteNode(t)) {
        if (e.keyCode === 27) { //escape, don't save
            e.preventDefault();
            note_targetRowi = -1;
            t.innerText = note_tempNoteStr;
            t.blur();
        }
        if (e.keyCode === 13) { //enter, save
            e.preventDefault();
            note_targetRowi = -1;
            t.blur();
        }
        if (e.keyCode === 38) { //uparrow, save
            e.preventDefault();
            let prevRow = t.parentNode.previousSibling;
            if (prevRow) {
                note_targetRowi -= 1;
                t.blur();
            }
        }
        if (e.keyCode === 40) { //downarrow, save
            e.preventDefault();
            let nextRow = t.parentNode.nextSibling;
            if (nextRow) {
                note_targetRowi += 1;
                t.blur();
            }
        }
    }
});




//-------------------------------------------------------------------------------------------------------------------------------------------------------- CUSTOM CSS

function getCreateColorClasses() {
    //----------------------------------------------------------- load up all the color info

    let defaultPalette = lightmodeColorDict;

    let allCustomClasses = {
        nullCellClasses: { //null
            titles: ["null-cell"],
            FtCol: getInitLocalStorage('null-cellFtCol', defaultPalette['null-cellFtCol']),
            BgCol: getInitLocalStorage('null-cellBgCol', defaultPalette['null-cellBgCol'])
        },
        compCell0Classes: { //X
            titles: ["comp-cell-0"],
            FtCol: getInitLocalStorage('comp-cell-0FtCol', defaultPalette['comp-cell-0FtCol']),
            BgCol: getInitLocalStorage('comp-cell-0BgCol', defaultPalette['comp-cell-0BgCol'])
        },
        compCell1Classes: { //check
            titles: ["comp-cell-1", "todo-cell-stage-1", "todo-cell-bonus-1"],
            FtCol: getInitLocalStorage('comp-cell-1FtCol', defaultPalette['comp-cell-1FtCol']),
            BgCol: getInitLocalStorage('comp-cell-1BgCol', defaultPalette['comp-cell-1BgCol'])
        },
        compCell2Classes: { //star
            titles: ["comp-cell-WR", "todo-cell-group-WR", "todo-cell-stage-WR", "todo-cell-bonus-WR"],
            FtCol: getInitLocalStorage('comp-cell-WRFtCol', defaultPalette['comp-cell-WRFtCol']),
            BgCol: getInitLocalStorage('comp-cell-WRBgCol', defaultPalette['comp-cell-WRBgCol'])
        },

        G7Classes: { //G7
            titles: ["comp-cell-G7", "todo-cell-group-G7"],
            FtCol: getInitLocalStorage('comp-cell-G7FtCol', defaultPalette['comp-cell-G7FtCol']),
            BgCol: getInitLocalStorage('comp-cell-G7BgCol', defaultPalette['comp-cell-G7BgCol'])
        },
        G6Classes: { //G6
            titles: ["comp-cell-G6", "todo-cell-group-G6"],
            FtCol: getInitLocalStorage('comp-cell-G6FtCol', defaultPalette['comp-cell-G6FtCol']),
            BgCol: getInitLocalStorage('comp-cell-G6BgCol', defaultPalette['comp-cell-G6BgCol'])
        },
        G5Classes: { //G5
            titles: ["comp-cell-G5", "todo-cell-group-G5"],
            FtCol: getInitLocalStorage('comp-cell-G5FtCol', defaultPalette['comp-cell-G5FtCol']),
            BgCol: getInitLocalStorage('comp-cell-G5BgCol', defaultPalette['comp-cell-G5BgCol'])
        },
        G4Classes: { //G4
            titles: ["comp-cell-G4", "todo-cell-group-G4"],
            FtCol: getInitLocalStorage('comp-cell-G4FtCol', defaultPalette['comp-cell-G4FtCol']),
            BgCol: getInitLocalStorage('comp-cell-G4BgCol', defaultPalette['comp-cell-G4BgCol'])
        },
        G3Classes: { //G3
            titles: ["comp-cell-G3", "todo-cell-group-G3"],
            FtCol: getInitLocalStorage('comp-cell-G3FtCol', defaultPalette['comp-cell-G3FtCol']),
            BgCol: getInitLocalStorage('comp-cell-G3BgCol', defaultPalette['comp-cell-G3BgCol'])
        },
        G2Classes: { //G2
            titles: ["comp-cell-G2", "todo-cell-group-G2"],
            FtCol: getInitLocalStorage('comp-cell-G2FtCol', defaultPalette['comp-cell-G2FtCol']),
            BgCol: getInitLocalStorage('comp-cell-G2BgCol', defaultPalette['comp-cell-G2BgCol'])
        },
        G1Classes: { //G1
            titles: ["comp-cell-G1", "todo-cell-group-G1"],
            FtCol: getInitLocalStorage('comp-cell-G1FtCol', defaultPalette['comp-cell-G1FtCol']),
            BgCol: getInitLocalStorage('comp-cell-G1BgCol', defaultPalette['comp-cell-G1BgCol'])
        },

        R10Classes: { //R10
            titles: ["comp-cell-R10"],
            FtCol: getInitLocalStorage('comp-cell-R10FtCol', defaultPalette['comp-cell-R10FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R10BgCol', defaultPalette['comp-cell-R10BgCol'])
        },
        R9Classes: { //R9
            titles: ["comp-cell-R9"],
            FtCol: getInitLocalStorage('comp-cell-R9FtCol', defaultPalette['comp-cell-R9FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R9BgCol', defaultPalette['comp-cell-R9BgCol'])
        },
        R8Classes: { //R8
            titles: ["comp-cell-R8"],
            FtCol: getInitLocalStorage('comp-cell-R8FtCol', defaultPalette['comp-cell-R8FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R8BgCol', defaultPalette['comp-cell-R8BgCol'])
        },
        R7Classes: { //R7
            titles: ["comp-cell-R7"],
            FtCol: getInitLocalStorage('comp-cell-R7FtCol', defaultPalette['comp-cell-R7FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R7BgCol', defaultPalette['comp-cell-R7BgCol'])
        },
        R6Classes: { //R6
            titles: ["comp-cell-R6"],
            FtCol: getInitLocalStorage('comp-cell-R6FtCol', defaultPalette['comp-cell-R6FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R6BgCol', defaultPalette['comp-cell-R6BgCol'])
        },
        R5Classes: { //R5
            titles: ["comp-cell-R5"],
            FtCol: getInitLocalStorage('comp-cell-R5FtCol', defaultPalette['comp-cell-R5FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R5BgCol', defaultPalette['comp-cell-R5BgCol'])
        },
        R4Classes: { //R4
            titles: ["comp-cell-R4"],
            FtCol: getInitLocalStorage('comp-cell-R4FtCol', defaultPalette['comp-cell-R4FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R4BgCol', defaultPalette['comp-cell-R4BgCol'])
        },
        R3Classes: { //R3
            titles: ["comp-cell-R3"],
            FtCol: getInitLocalStorage('comp-cell-R3FtCol', defaultPalette['comp-cell-R3FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R3BgCol', defaultPalette['comp-cell-R3BgCol'])
        },
        R2Classes: { //R2
            titles: ["comp-cell-R2"],
            FtCol: getInitLocalStorage('comp-cell-R2FtCol', defaultPalette['comp-cell-R2FtCol']),
            BgCol: getInitLocalStorage('comp-cell-R2BgCol', defaultPalette['comp-cell-R2BgCol'])
        },

        todoG7Classes: { //todo: complete
            titles: ["todo-cell-group-G7"],
            FtCol: getInitLocalStorage('todo-cell-group-G7FtCol', defaultPalette['todo-cell-group-G7FtCol']),
            BgCol: getInitLocalStorage('todo-cell-group-G7BgCol', defaultPalette['todo-cell-group-G7BgCol'])
        },
        todoTopClasses: { //todo: top
            titles: ["todo-cell-group-TOP"],
            FtCol: getInitLocalStorage('todo-cell-group-TOPFtCol', defaultPalette['todo-cell-group-TOPFtCol']),
            BgCol: getInitLocalStorage('todo-cell-group-TOPBgCol', defaultPalette['todo-cell-group-TOPBgCol'])
        },
        todoImproveClasses: { //todo: improve
            titles: ["todo-cell-group-IMP", "todo-cell-stage-IMP", "todo-cell-bonus-IMP"],
            FtCol: getInitLocalStorage('todo-cell-group-IMPFtCol', defaultPalette['todo-cell-group-IMPFtCol']),
            BgCol: getInitLocalStorage('todo-cell-group-IMPBgCol', defaultPalette['todo-cell-group-IMPBgCol'])
        },

        //same as check and wr but the text stays black (or whatever the color is chosen to be)
        mapCompCell0Classes: { //for things that aren't done
            titles: ["mapcomp-cell-0", "todocomp-cell-0"],
            FtCol: getInitLocalStorage('mapcomp-cell-0FtCol', defaultPalette['mapcomp-cell-0FtCol']),
            BgCol: getInitLocalStorage('mapcomp-cell-0BgCol', defaultPalette['mapcomp-cell-0BgCol'])
        },
        mapCompCell1Classes: { //for "Done" maps or completed todos
            titles: ["mapcomp-cell-1", "todocomp-cell-1"],
            FtCol: getInitLocalStorage('mapcomp-cell-0FtCol', defaultPalette['mapcomp-cell-0FtCol']),
            BgCol: getInitLocalStorage('comp-cell-1BgCol', defaultPalette['comp-cell-1BgCol'])
        },
        mapCompCell2Classes: { //for perfect maps
            titles: ["mapcomp-cell-2"],
            FtCol: getInitLocalStorage('mapcomp-cell-0FtCol', defaultPalette['mapcomp-cell-0FtCol']),
            BgCol: getInitLocalStorage('comp-cell-WRBgCol', defaultPalette['comp-cell-WRBgCol'])
        }
    };

    //----------------------------------------------------------- turn that dict into css rules

    const jssInst = jss.create();
    const customStyle = {};

    Object.entries(allCustomClasses).forEach((cellClassGroup) => { //for each group of cells with the same colors
        cellClassGroupData = cellClassGroup[1];
        cellClassGroupData.titles.forEach((cellClass) => { //loop over the names of all the classes
            customStyle[cellClass] = { //set the custom css
                "color": cellClassGroupData.FtCol,
                "background-color": cellClassGroupData.BgCol
            };
        });
    });

    //----------------------------------------------------------- the same thing but for the table classes

    //for table stuff we need a !important (cringe!)
    allTableClasses = {
        //doesn't work because it's the input inside that does the work :)
        // gridJSSearch: {
        //     titles: ["tableSearch"],
        //     FtCol: getInitLocalStorage('bodyFtCol', defaultPalette['bodyFtCol'])
        // },
        gridJSHeader: {
            titles: ["tableHeader"],
            FtCol: getInitLocalStorage('tableHeaderFtCol', defaultPalette['tableHeaderFtCol']),
            BgCol: getInitLocalStorage('tableHeaderBgCol', defaultPalette['tableHeaderBgCol']),
            UseBorderRad: false
        },
        gridJSFooter: {
            titles: ["tableFooter"],
            FtCol: getInitLocalStorage('tableFooterFtCol', defaultPalette['tableFooterFtCol']),
            BgCol: getInitLocalStorage('tableFooterBgCol', defaultPalette['tableFooterBgCol']),
            UseBorderRad: "0 0 8px 8px"
        },
        gridJSPagination: { //same as footer but fully round
            titles: ["tablePagination"],
            FtCol: getInitLocalStorage('tableFooterFtCol', defaultPalette['tableFooterFtCol']),
            BgCol: getInitLocalStorage('tableFooterBgCol', defaultPalette['tableFooterBgCol']),
            UseBorderRad: "8px 8px 8px 8px"
        },
        gridJSTd: {
            titles: ["tableTd"],
            FtCol: getInitLocalStorage('bodyFtCol', defaultPalette['bodyFtCol']),
            BgCol: getInitLocalStorage('mapcomp-cell-0BgCol', defaultPalette['mapcomp-cell-0BgCol']), //color the same way as the name cells
            UseBorderRad: "0" //materialize wants this to have a 2px radius so bad
        }
        // gridJSContainer: {
        //     titles: ["tableContainer"],
        //     FtCol: getInitLocalStorage('bodyFtCol', defaultPalette['bodyFtCol']),
        // }
    };

    //whether or not we use the round corners
    let roundTableBool = getInitLocalStorage('useRoundTable', true, 
        getFormatter = (x => (x === 'true')), //str -> bool
        setFormatter = (x => x.toString())); //bool -> str

    //create the css dict
    Object.entries(allTableClasses).forEach((tableClassGroup) => { //for each group of classes with the same colors
        tableClassGroupData = tableClassGroup[1];
        tableClassGroupData.titles.forEach((tableClass) => { //loop over the names of all the classes
            customStyle[tableClass] = { //set the custom css
                "color": `${tableClassGroupData.FtCol} !important`,
                "background-color": `${tableClassGroupData.BgCol} !important`
            };
            if (tableClassGroupData.UseBorderRad) {
                if (roundTableBool) { 
                    customStyle[tableClass]["border-radius"] = tableClassGroupData.UseBorderRad;
                }
                else {
                    customStyle[tableClass]["border-radius"] = "0px";
                }
            }
        });
    });

    //actual fucking brain damage I wish I never used this library
    //https://gridjs.io/docs/config/className tells you the bindings for each component
    //there is no way to give a custom class for .gridjs-wrapper
    //which is fine I guess because it should just be a wrapper?
    //except they put the rounded edges in it, which I want to customize
    if (roundTableBool) {
        document.getElementsByTagName("body")[0].style.setProperty("--TableWrapperBorder", "8px 8px 0 0");
    }
    else {
        document.getElementsByTagName("body")[0].style.setProperty("--TableWrapperBorder", "0"); 
    }

    //----------------------------------------------------------- cement the styles

    const customSheet = jssInst.createStyleSheet(customStyle);
    customSheet.attach();

    //----------------------------------------------------------- go back and tell the ui the new colors

    //now set the names of the classes once we've created them
    //e.g. we create "null-cell" and we get "null-cell-0-0-1"
    Object.entries(allCustomClasses).forEach((cellClassGroup) => { //for each group of cells with the same colors
        cellClassGroupData = cellClassGroup[1];
        cellClassGroupData.titles.forEach((cellClass) => { //loop over all the names of all the classes
            localStorage.setItem(`${cellClass}ClassName`, customSheet.classes[cellClass]); //save the name that the style created
        });
    });
    Object.entries(allTableClasses).forEach((tableClassGroup) => { //for each group of classes with the same colors
        tableClassGroupData = tableClassGroup[1];
        tableClassGroupData.titles.forEach((tableClass) => { //loop over all the names of all the classes
            localStorage.setItem(`${tableClass}ClassName`, customSheet.classes[tableClass]); //save the name that the style created
        });
    });

    //now do the STATIC components of the ui -- we don't need to track any custom class names since these are always present
    let navbarFtCol = getInitLocalStorage('navbarFtCol', defaultPalette['navbarFtCol']);
    let navbarBgCol = getInitLocalStorage('navbarBgCol', defaultPalette['navbarBgCol']);

    //set all the background colors based on the navbar
    document.getElementsByClassName("nav-wrapper")[0].style.setProperty("background-color", navbarBgCol); //the navbar
    document.querySelectorAll('#TableButtonDiv > a').forEach((e) => e.style.setProperty("background-color", navbarBgCol)); //the buttons by the searchbar
    document.querySelectorAll(".modalExitButton").forEach((e) => e.style.setProperty("background-color", navbarBgCol)); //the buttons on modals
    document.getElementById("MaplistUpdateButton").style.setProperty("background-color", navbarBgCol); //button to get new maps
    document.querySelectorAll(".paletteSwapButton").forEach((e) => e.style.setProperty("background-color", navbarBgCol)); //colorscheme buttons
    document.getElementById("helpModalRefreshButton").style.setProperty("background-color", navbarBgCol); //button in the help modal

    //set all the font colors the same way
    document.getElementsByClassName("nav-wrapper")[0].style.setProperty("color", navbarFtCol); //navbar
    document.getElementById("TitleDiv").style.setProperty("color", navbarFtCol, "important"); //the title "KSF Checklist"
    document.getElementsByTagName("body")[0].style.setProperty("--TodoToggleCol", navbarFtCol); //todo switch button
    document.querySelectorAll('div.nav-wrapper > ul > li > a').forEach((e) => e.style.setProperty("color", navbarFtCol)); //the stage/bonus/note + tier buttons on the navbar
    document.querySelectorAll('#TableButtonDiv > a').forEach((e) => e.style.setProperty("color", navbarFtCol)); //buttons by the searchbar
    document.querySelectorAll(".modalExitButton").forEach((e) => e.style.setProperty("color", navbarFtCol)); //the buttons on modals
    document.getElementById("MaplistUpdateButton").style.setProperty("color", navbarFtCol); //button to get new maps
    document.querySelectorAll(".paletteSwapButton").forEach((e) => e.style.setProperty("color", navbarFtCol)); //colorscheme buttons


    //more global things
    let bodyFtCol = getInitLocalStorage('bodyFtCol', defaultPalette['bodyFtCol']);
    let bodyBgCol = getInitLocalStorage('bodyBgCol', defaultPalette['bodyBgCol']);

    //global font color
    document.getElementsByTagName("body")[0].style.setProperty("color", bodyFtCol);//global
    document.getElementsByTagName("body")[0].style.setProperty("--PlaceholderFtCol", bodyFtCol); //for placeholders
    document.getElementsByTagName("body")[0].style.setProperty("--ModalTableCol", bodyFtCol); //modal tables
    document.getElementsByTagName("body")[0].style.setProperty("--InputLineCol", bodyFtCol); //for inputs
    document.querySelectorAll("hr").forEach((e) => e.style.setProperty("background-color", bodyFtCol)); //all hrs need to be done manually :/
    document.querySelectorAll(".settingsInput").forEach((e) => e.style.setProperty("color", bodyFtCol)); //the inputs in settings
    document.querySelectorAll(".collapsible-header").forEach((e) => e.style.setProperty("border-bottom", `1px solid ${bodyFtCol}`)); //lines between collapsible
    document.querySelectorAll(".collapsible-body").forEach((e) => e.style.setProperty("border-bottom", `1px solid ${bodyFtCol}`)); //lines between collapsible

    //global background color
    document.getElementsByTagName("body")[0].style.setProperty("background-color", bodyBgCol); //global
    document.querySelectorAll(".modal").forEach((e) => e.style.setProperty("background-color", bodyBgCol)); //modals
    document.querySelectorAll(".modal-footer").forEach((e) => e.style.setProperty("background-color", bodyBgCol)); //modals


    //misc
    document.getElementById("TitleDiv").innerText = getInitLocalStorage('navbarTitle', "KSF Checklist"); //the title "KSF Checklist"

    document.getElementById('ColorInputTableUI').style.setProperty('border-left', `3px solid ${bodyFtCol}`); //the borders on the settings tables
    document.getElementById('ColorInputTableGroups').style.setProperty('border-left', `3px solid ${bodyFtCol}`);
    document.getElementById('ColorInputTableTops').style.setProperty('border-left', `3px solid ${bodyFtCol}`);
    document.getElementById('ColorInputTableMisc').style.setProperty('border-left', `3px solid ${bodyFtCol}`);

    document.querySelectorAll(".collapsible-header").forEach((e) => e.style.setProperty("background-color", getInitLocalStorage('tableFooterBgCol', defaultPalette['tableFooterBgCol']))); //collapsible bg can't blend in
}




//-------------------------------------------------------------------------------------------------------------------------------------------------------- UPDATE MODAL

var newMapsNeedRerender; //do we need to rerender the table when closing the map updater modal?

document.getElementById("MaplistUpdateButton").onclick = function() { getNewMaps(MAPLISTURL); }

function getNewMaps(url) {
    dbUpdateMapList(url).then((res) => { if (Array.isArray(res)) {
        let mapUpdateHTML;
        if (res.length === 0) { 
            mapUpdateHTML = '<div id="MapUpdateSuccess">Already up to date!</div>';
        }
        else {
            newMapsNeedRerender = true;
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
                    timeStr = (dt === 1) ? `${dt} day` : `${dt} days ago`;
                }
            }
        }  
    }
    document.getElementById('LastUpdateTimestamp').innerText = `(Last update: ${timeStr})`;
}

function onOpenUpdateModal() {
    newMapsNeedRerender = false;
    updateLastUpdateTimestamp();
}

function onCloseUpdateModal() {
    // if (document.getElementById("ModalMapUpdates").innerText !== "" && document.getElementById("MapUpdateSuccess").innerText === "Update successful:") { //crap but better than nothing
    if (newMapsNeedRerender) {
        renderTable(tier=globalCurrentTier,rerender=true);
    }
}




//-------------------------------------------------------------------------------------------------------------------------------------------------------- SETTINGS MODAL

let oldSettings = {};
let newSettings;


//-------------------------------------------------------------- MISC INPUTS
var oldPaginationInputVal;
document.getElementById("PaginationInput").onfocus = function(e) {
    oldPaginationInputVal = e.target.value;
}
document.getElementById("PaginationInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("PaginationInput").onblur = function(e) { 
    let newVal = +e.target.value;
    if (Number.isInteger(newVal) && newVal > 0) {
        newSettings['entriesPerPage'] = newVal;
        updateUnsavedMessage();
    }
    else {
        e.target.value = oldPaginationInputVal; //bad value, put back the old one
    }
}

document.getElementById("NavbarTitleInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("NavbarTitleInput").onblur = function(e) {
    newSettings['navbarTitle'] = e.target.value;
    updateUnsavedMessage();
}


//-------------------------------------------------------------- CHECKBOXES

document.getElementById("HiddenTableCheckbox").onclick = function() {
    newSettings['useHiddenTable'] = this.checked;
    updateUnsavedMessage();
}

document.getElementById("RoundTableCheckbox").onclick = function() {
    newSettings['useRoundTable'] = this.checked;
    updateUnsavedMessage();
}


//-------------------------------------------------------------- MAP TABLE WIDTH INPUTS
var oldMapTableNameWidthVal;
document.getElementById("MapTableNameWidthInput").onfocus = function(e) {
    oldMapTableNameWidthVal = e.target.value;
}
document.getElementById("MapTableNameWidthInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("MapTableNameWidthInput").onblur = function(e) { 
    let newVal = +e.target.value;
    let sumOtherVals = +document.getElementById("MapTableGroupWidthInput").value;
    let remainder = 100-(newVal+sumOtherVals);
    if (newVal > 0 && remainder>0.01) {
        newSettings['MapTableNameWidth'] = newVal;
        document.getElementById("MapTableTheRestWidth").innerText = remainder;
        updateUnsavedMessage();
    }
    else {
        e.target.value = oldMapTableNameWidthVal; //bad value, put back the old one
    }
}

var oldMapTableGroupWidthVal;
document.getElementById("MapTableGroupWidthInput").onfocus = function(e) {
    oldMapTableGroupWidthVal = e.target.value;
}
document.getElementById("MapTableGroupWidthInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("MapTableGroupWidthInput").onblur = function(e) { 
    let newVal = +e.target.value;
    let sumOtherVals = +document.getElementById("MapTableNameWidthInput").value;
    let remainder = 100-(newVal+sumOtherVals);
    if (newVal > 0 && remainder>0.01) {
        newSettings['MapTableGroupWidth'] = newVal;
        document.getElementById("MapTableTheRestWidth").innerText = remainder;
        updateUnsavedMessage();
    }
    else {
        e.target.value = oldMapTableGroupWidthVal; //bad value, put back the old one
    }
}


//-------------------------------------------------------------- TODO TABLE WIDTH INPUTS

// var oldTodoTable%sWidthVal;
// document.getElementById("TodoTable%sWidthInput").onfocus = function(e) {
//     oldTodoTable%sWidthVal = e.target.value;
// }
// document.getElementById("TodoTable%sWidthInput").onkeypress = function(e) { 
//     if (e.keyCode === 13) { e.target.blur(); } //enter key
// }
// document.getElementById("TodoTable%sWidthInput").onblur = function(e) { 
//     let newVal = +e.target.value;
//     let sumOtherVals = (+document.getElementById("TodoTableCheckboxWidthInput").value) 
//                     + (+document.getElementById("TodoTableNameWidthInput").value) 
//                     + (+document.getElementById("TodoTableGoalWidthInput").value) 
//                     + (+document.getElementById("TodoTableCurrWidthInput").value) 
//                     + (+document.getElementById("TodoTableOrigWidthInput").value);
    // let remainder = 100-(newVal+sumOtherVals);
    // if (newVal > 0 && remainder>0.01) {
//         newSettings['TodoTable%sWidth'] = newVal;
        // document.getElementById("TodoTableTheRestWidth").innerText = remainder;
//         updateUnsavedMessage();
//     }
//     else {
//         e.target.value = oldTodoTable%sWidthVal; //bad value, put back the old one
//     }
// }


var oldTodoTableCheckboxWidthVal;
document.getElementById("TodoTableCheckboxWidthInput").onfocus = function(e) {
    oldTodoTableCheckboxWidthVal = e.target.value;
}
document.getElementById("TodoTableCheckboxWidthInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("TodoTableCheckboxWidthInput").onblur = function(e) { 
    let newVal = +e.target.value;
    let sumOtherVals = (+document.getElementById("TodoTableNameWidthInput").value) 
                    + (+document.getElementById("TodoTableGoalWidthInput").value) 
                    + (+document.getElementById("TodoTableCurrWidthInput").value) 
                    + (+document.getElementById("TodoTableOrigWidthInput").value);
    let remainder = 100-(newVal+sumOtherVals);
    if (newVal > 0 && remainder>0.01) {
        newSettings['TodoTableCheckboxWidth'] = newVal;
        document.getElementById("TodoTableTheRestWidth").innerText = remainder;
        updateUnsavedMessage();
    }
    else {
        e.target.value = oldTodoTableCheckboxWidthVal; //bad value, put back the old one
    }
}

var oldTodoTableNameWidthVal;
document.getElementById("TodoTableNameWidthInput").onfocus = function(e) {
    oldTodoTableNameWidthVal = e.target.value;
}
document.getElementById("TodoTableNameWidthInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("TodoTableNameWidthInput").onblur = function(e) { 
    let newVal = +e.target.value;
    let sumOtherVals = (+document.getElementById("TodoTableCheckboxWidthInput").value) 
                    + (+document.getElementById("TodoTableGoalWidthInput").value) 
                    + (+document.getElementById("TodoTableCurrWidthInput").value) 
                    + (+document.getElementById("TodoTableOrigWidthInput").value);
    let remainder = 100-(newVal+sumOtherVals);
    if (newVal > 0 && remainder>0.01) {
        newSettings['TodoTableNameWidth'] = newVal;
        document.getElementById("TodoTableTheRestWidth").innerText = remainder;
        updateUnsavedMessage();
    }
    else {
        e.target.value = oldTodoTableNameWidthVal; //bad value, put back the old one
    }
}

var oldTodoTableGoalWidthVal;
document.getElementById("TodoTableGoalWidthInput").onfocus = function(e) {
    oldTodoTableGoalWidthVal = e.target.value;
}
document.getElementById("TodoTableGoalWidthInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("TodoTableGoalWidthInput").onblur = function(e) { 
    let newVal = +e.target.value;
    let sumOtherVals = (+document.getElementById("TodoTableCheckboxWidthInput").value) 
                    + (+document.getElementById("TodoTableNameWidthInput").value) 
                    + (+document.getElementById("TodoTableCurrWidthInput").value) 
                    + (+document.getElementById("TodoTableOrigWidthInput").value);
    let remainder = 100-(newVal+sumOtherVals);
    if (newVal > 0 && remainder>0.01) {
        newSettings['TodoTableGoalWidth'] = newVal;
        document.getElementById("TodoTableTheRestWidth").innerText = remainder;
        updateUnsavedMessage();
    }
    else {
        e.target.value = oldTodoTableGoalWidthVal; //bad value, put back the old one
    }
}

var oldTodoTableCurrWidthVal;
document.getElementById("TodoTableCurrWidthInput").onfocus = function(e) {
    oldTodoTableCurrWidthVal = e.target.value;
}
document.getElementById("TodoTableCurrWidthInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("TodoTableCurrWidthInput").onblur = function(e) { 
    let newVal = +e.target.value;
    let sumOtherVals = (+document.getElementById("TodoTableCheckboxWidthInput").value) 
                    + (+document.getElementById("TodoTableNameWidthInput").value) 
                    + (+document.getElementById("TodoTableGoalWidthInput").value) 
                    + (+document.getElementById("TodoTableOrigWidthInput").value);
    let remainder = 100-(newVal+sumOtherVals);
    if (newVal > 0 && remainder>0.01) {
        newSettings['TodoTableCurrWidth'] = newVal;
        document.getElementById("TodoTableTheRestWidth").innerText = remainder;
        updateUnsavedMessage();
    }
    else {
        e.target.value = oldTodoTableCurrWidthVal; //bad value, put back the old one
    }
}

var oldTodoTableOrigWidthVal;
document.getElementById("TodoTableOrigWidthInput").onfocus = function(e) {
    oldTodoTableOrigWidthVal = e.target.value;
}
document.getElementById("TodoTableOrigWidthInput").onkeypress = function(e) { 
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
document.getElementById("TodoTableOrigWidthInput").onblur = function(e) { 
    let newVal = +e.target.value;
    let sumOtherVals = (+document.getElementById("TodoTableCheckboxWidthInput").value) 
                    + (+document.getElementById("TodoTableNameWidthInput").value) 
                    + (+document.getElementById("TodoTableGoalWidthInput").value) 
                    + (+document.getElementById("TodoTableCurrWidthInput").value);
    let remainder = 100-(newVal+sumOtherVals);
    if (newVal > 0 && remainder>0.01) {
        newSettings['TodoTableOrigWidth'] = newVal;
        document.getElementById("TodoTableTheRestWidth").innerText = remainder;
        updateUnsavedMessage();
    }
    else {
        e.target.value = oldTodoTableOrigWidthVal; //bad value, put back the old one
    }
}


//-------------------------------------------------------------- COLOR INPUTS

var oldColorInputVal;
function settingsCellFocus(e) {
    oldColorInputVal = e.target.value;
}
function settingsCellKeyPress(e) {
    if (e.keyCode === 13) { e.target.blur(); } //enter key
}
function settingsCellBlur(e) {
    let t = e.target; //I type it too many times here
    if (isHexColor(t.value)) {
        //update the color of the settings cell
        //           input ->   td    ->   tr    -> (first) td ->   div in first td (this has the settingsCell in it)
        let relatedCell = t.parentNode.parentNode.childNodes[0].childNodes[0];
        if (t.id.includes("FtColInput")) { //font color
            if (relatedCell) { relatedCell.style.color = t.value; }
            newSettings[t.id.slice(0,-5)] = t.value;
        }
        else if (t.id.includes("BgColInput")) { //background color
            if (relatedCell) { relatedCell.style.backgroundColor = t.value; }
            newSettings[t.id.slice(0,-5)] = t.value;
        }

        updateUnsavedMessage();
    }
    else {
        t.value = oldColorInputVal; //bad value, put back the old one
    }
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

    //use hidden table?
    document.getElementById("HiddenTableCheckbox").checked = useHiddenTable;
    oldSettings['useHiddenTable'] = localStorage.getItem('useHiddenTable');

    //use round corners?
    document.getElementById("RoundTableCheckbox").checked = (localStorage.getItem('useRoundTable') === 'true');
    oldSettings['useRoundTable'] = localStorage.getItem('useRoundTable');

    //# pages input
    document.getElementById("PaginationInput").value = localStorage.getItem('entriesPerPage');
    oldSettings['entriesPerPage'] = localStorage.getItem('entriesPerPage');

    //website title
    document.getElementById("NavbarTitleInput").value = localStorage.getItem('navbarTitle');
    oldSettings['navbarTitle'] = localStorage.getItem('navbarTitle');

    //map table widths
    document.getElementById("MapTableNameWidthInput").value = localStorage.getItem('MapTableNameWidth');
    oldSettings['MapTableNameWidth'] = localStorage.getItem('MapTableNameWidth');
    document.getElementById("MapTableGroupWidthInput").value = localStorage.getItem('MapTableGroupWidth');
    oldSettings['MapTableGroupWidth'] = localStorage.getItem('MapTableGroupWidth');

    document.getElementById("MapTableTheRestWidth").innerText = 100 - ( (+localStorage.getItem('MapTableNameWidth')) 
                                                                        + (+localStorage.getItem('MapTableGroupWidth')) );

    //todo table widths
    document.getElementById("TodoTableCheckboxWidthInput").value = localStorage.getItem('TodoTableCheckboxWidth');
    oldSettings['TodoTableCheckboxWidth'] = localStorage.getItem('TodoTableCheckboxWidth');
    document.getElementById("TodoTableNameWidthInput").value = localStorage.getItem('TodoTableNameWidth');
    oldSettings['TodoTableNameWidth'] = localStorage.getItem('TodoTableNameWidth');
    document.getElementById("TodoTableGoalWidthInput").value = localStorage.getItem('TodoTableGoalWidth');
    oldSettings['TodoTableGoalWidth'] = localStorage.getItem('TodoTableGoalWidth');
    document.getElementById("TodoTableCurrWidthInput").value = localStorage.getItem('TodoTableCurrWidth');
    oldSettings['TodoTableCurrWidth'] = localStorage.getItem('TodoTableCurrWidth');
    document.getElementById("TodoTableOrigWidthInput").value = localStorage.getItem('TodoTableOrigWidth');
    oldSettings['TodoTableOrigWidth'] = localStorage.getItem('TodoTableOrigWidth');

    document.getElementById("TodoTableTheRestWidth").innerText = 100 - ( (+localStorage.getItem('TodoTableCheckboxWidth')) 
                                                                        + (+localStorage.getItem('TodoTableNameWidth'))
                                                                        + (+localStorage.getItem('TodoTableGoalWidth'))
                                                                        + (+localStorage.getItem('TodoTableCurrWidth'))
                                                                        + (+localStorage.getItem('TodoTableOrigWidth')) );

    //global font
    document.getElementById("bodyFtColInput").value = localStorage.getItem('bodyFtCol');
    document.getElementById("bodyBgColInput").value = localStorage.getItem('bodyBgCol');
    oldSettings['bodyFtCol'] = localStorage.getItem('bodyFtCol');
    oldSettings['bodyBgCol'] = localStorage.getItem('bodyBgCol');

    //nav/buttons
    document.getElementById("navbarFtColInput").value = localStorage.getItem('navbarFtCol');
    document.getElementById("navbarBgColInput").value = localStorage.getItem('navbarBgCol');
    oldSettings['navbarFtCol'] = localStorage.getItem('navbarFtCol');
    oldSettings['navbarBgCol'] = localStorage.getItem('navbarBgCol');

    //tableheader
    document.getElementById("tableHeaderFtColInput").value = localStorage.getItem('tableHeaderFtCol');
    document.getElementById("tableHeaderBgColInput").value = localStorage.getItem('tableHeaderBgCol');
    oldSettings['tableHeaderFtCol'] = localStorage.getItem('tableHeaderFtCol');
    oldSettings['tableHeaderBgCol'] = localStorage.getItem('tableHeaderBgCol');

    //table footer
    document.getElementById("tableFooterFtColInput").value = localStorage.getItem('tableFooterFtCol');
    document.getElementById("tableFooterBgColInput").value = localStorage.getItem('tableFooterBgCol');
    oldSettings['tableFooterFtCol'] = localStorage.getItem('tableFooterFtCol');
    oldSettings['tableFooterBgCol'] = localStorage.getItem('tableFooterBgCol');

    //default map name
    document.getElementById("mapcomp-cell-0FtColInput").value = localStorage.getItem('mapcomp-cell-0FtCol');
    document.getElementById("mapcomp-cell-0BgColInput").value = localStorage.getItem('mapcomp-cell-0BgCol');
    oldSettings['mapcomp-cell-0FtCol'] = localStorage.getItem('mapcomp-cell-0FtCol');
    oldSettings['mapcomp-cell-0BgCol'] = localStorage.getItem('mapcomp-cell-0BgCol');

    //all the other colors
    oldSettings['null-cellFtCol'] = localStorage.getItem('null-cellFtCol');
    oldSettings['null-cellBgCol'] = localStorage.getItem('null-cellBgCol');
    oldSettings['comp-cell-0FtCol'] = localStorage.getItem('comp-cell-0FtCol');
    oldSettings['comp-cell-0BgCol'] = localStorage.getItem('comp-cell-0BgCol');
    oldSettings['comp-cell-1FtCol'] = localStorage.getItem('comp-cell-1FtCol');
    oldSettings['comp-cell-1BgCol'] = localStorage.getItem('comp-cell-1BgCol');
    oldSettings['comp-cell-WRFtCol'] = localStorage.getItem('comp-cell-WRFtCol');
    oldSettings['comp-cell-WRBgCol'] = localStorage.getItem('comp-cell-WRBgCol');
    oldSettings['comp-cell-G7FtCol'] = localStorage.getItem('comp-cell-G7FtCol');
    oldSettings['comp-cell-G7BgCol'] = localStorage.getItem('comp-cell-G7BgCol');
    oldSettings['comp-cell-G6FtCol'] = localStorage.getItem('comp-cell-G6FtCol');
    oldSettings['comp-cell-G6BgCol'] = localStorage.getItem('comp-cell-G6BgCol');
    oldSettings['comp-cell-G5FtCol'] = localStorage.getItem('comp-cell-G5FtCol');
    oldSettings['comp-cell-G5BgCol'] = localStorage.getItem('comp-cell-G5BgCol');
    oldSettings['comp-cell-G4FtCol'] = localStorage.getItem('comp-cell-G4FtCol');
    oldSettings['comp-cell-G4BgCol'] = localStorage.getItem('comp-cell-G4BgCol');
    oldSettings['comp-cell-G3FtCol'] = localStorage.getItem('comp-cell-G3FtCol');
    oldSettings['comp-cell-G3BgCol'] = localStorage.getItem('comp-cell-G3BgCol');
    oldSettings['comp-cell-G2FtCol'] = localStorage.getItem('comp-cell-G2FtCol');
    oldSettings['comp-cell-G2BgCol'] = localStorage.getItem('comp-cell-G2BgCol');
    oldSettings['comp-cell-G1FtCol'] = localStorage.getItem('comp-cell-G1FtCol');
    oldSettings['comp-cell-G1BgCol'] = localStorage.getItem('comp-cell-G1BgCol');
    oldSettings['comp-cell-R10FtCol'] = localStorage.getItem('comp-cell-R10FtCol');
    oldSettings['comp-cell-R10BgCol'] = localStorage.getItem('comp-cell-R10BgCol');
    oldSettings['comp-cell-R9FtCol'] = localStorage.getItem('comp-cell-R9FtCol');
    oldSettings['comp-cell-R9BgCol'] = localStorage.getItem('comp-cell-R9BgCol');
    oldSettings['comp-cell-R8FtCol'] = localStorage.getItem('comp-cell-R8FtCol');
    oldSettings['comp-cell-R8BgCol'] = localStorage.getItem('comp-cell-R8BgCol');
    oldSettings['comp-cell-R7FtCol'] = localStorage.getItem('comp-cell-R7FtCol');
    oldSettings['comp-cell-R7BgCol'] = localStorage.getItem('comp-cell-R7BgCol');
    oldSettings['comp-cell-R6FtCol'] = localStorage.getItem('comp-cell-R6FtCol');
    oldSettings['comp-cell-R6BgCol'] = localStorage.getItem('comp-cell-R6BgCol');
    oldSettings['comp-cell-R5FtCol'] = localStorage.getItem('comp-cell-R5FtCol');
    oldSettings['comp-cell-R5BgCol'] = localStorage.getItem('comp-cell-R5BgCol');
    oldSettings['comp-cell-R4FtCol'] = localStorage.getItem('comp-cell-R4FtCol');
    oldSettings['comp-cell-R4BgCol'] = localStorage.getItem('comp-cell-R4BgCol');
    oldSettings['comp-cell-R3FtCol'] = localStorage.getItem('comp-cell-R3FtCol');
    oldSettings['comp-cell-R3BgCol'] = localStorage.getItem('comp-cell-R3BgCol');
    oldSettings['comp-cell-R2FtCol'] = localStorage.getItem('comp-cell-R2FtCol');
    oldSettings['comp-cell-R2BgCol'] = localStorage.getItem('comp-cell-R2BgCol');
    oldSettings['todo-cell-group-G7FtCol'] = localStorage.getItem('todo-cell-group-G7FtCol');
    oldSettings['todo-cell-group-G7BgCol'] = localStorage.getItem('todo-cell-group-G7BgCol');
    oldSettings['todo-cell-group-TOPFtCol'] = localStorage.getItem('todo-cell-group-TOPFtCol');
    oldSettings['todo-cell-group-TOPBgCol'] = localStorage.getItem('todo-cell-group-TOPBgCol');
    oldSettings['todo-cell-group-IMPFtCol'] = localStorage.getItem('todo-cell-group-IMPFtCol');
    oldSettings['todo-cell-group-IMPBgCol'] = localStorage.getItem('todo-cell-group-IMPBgCol');

    //----------------------------------------------------------- now construct the color cell tables

    let currentFtCol, currentBgCol;
    let bodyFtCol = getInitLocalStorage('bodyFtCol', "#000000");

    //create the color section table for the groups
    let tableGroups = document.getElementById('ColorInputTableGroups');
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
        tableGroupsRowHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="comp-cell-${groupName}FtColInput" value="${currentFtCol}" /></td>`;
        tableGroupsRowHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="comp-cell-${groupName}BgColInput" value="${currentBgCol}" /></td>`;
        tableGroupsRowHTML += "</tr>";

        tableGroupsHTML += tableGroupsRowHTML;
    });
    tableGroupsHTML += `</tbody></table>`;
    tableGroups.innerHTML = tableGroupsHTML;


    //create the tops (r10-r2) section table
    let tableTops = document.getElementById('ColorInputTableTops');
    let tableTopsClasses = ["R10","R9","R8","R7","R6","R5","R4","R3","R2"];
    let tableTopsHTML = `<table class="responsive-table centered" cellspacing="0">` + genColorTableHead("Tops") + `<tbody>`;
    let tableTopsRowHTML;
    tableTopsClasses.forEach((topName) => {
        let topText = groupContent[groupLabels.indexOf(topName)];
        currentFtCol = localStorage.getItem(`comp-cell-${topName}FtCol`);
        currentBgCol = localStorage.getItem(`comp-cell-${topName}BgCol`);
        tableTopsRowHTML =  "<tr>";
        tableTopsRowHTML += `<td><div class="settingsCell" style="color: ${currentFtCol}; background-color: ${currentBgCol};">${topText}</div></td>`;
        tableTopsRowHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="comp-cell-${topName}FtColInput" value="${currentFtCol}" /></td>`;
        tableTopsRowHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="comp-cell-${topName}BgColInput" value="${currentBgCol}" /></td>`;
        tableTopsRowHTML += "</tr>";

        tableTopsHTML += tableTopsRowHTML;
    });
    tableTopsHTML += `</tbody></table>`;
    tableTops.innerHTML = tableTopsHTML;


    //create the misc section table
    //this is disjointed because it's misc
    let tableMisc = document.getElementById('ColorInputTableMisc');
    let tableMiscHTML = `<table class="responsive-table centered" cellspacing="0">` + genColorTableHead("Misc") + `<tbody>`;
    let tableMiscRowHTML;

    //null first
    currentFtCol = localStorage.getItem(`null-cellFtCol`);
    currentBgCol = localStorage.getItem(`null-cellBgCol`);
    tableMiscHTML += "<tr>";
    tableMiscHTML += `<td><div class="settingsCell" style="color: ${currentFtCol}; background-color: ${currentBgCol};"><i class="material-icons">remove</i></div></td>`;
    tableMiscHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="null-cellFtColInput" value="${currentFtCol}" /></td>`;
    tableMiscHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="null-cellBgColInput" value="${currentBgCol}" /></td>`;
    tableMiscHTML += "</tr>";

    //now completions: X, check, star (using the Stage arrays, if it ever ends up mattering in the future)
    let tableCompClasses = [0,1,2];
    tableCompClasses.forEach((stagei) => {
        currentFtCol = localStorage.getItem(`comp-cell-${stageLabels[stagei]}FtCol`);
        currentBgCol = localStorage.getItem(`comp-cell-${stageLabels[stagei]}BgCol`);
        tableMiscRowHTML =  "<tr>";
        tableMiscRowHTML += `<td><div class="settingsCell" style="color: ${currentFtCol}; background-color: ${currentBgCol};"><i class="material-icons">${stageContent[stagei]}</i></div></td>`;
        tableMiscRowHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="comp-cell-${stageLabels[stagei]}FtColInput" value="${currentFtCol}" /></td>`;
        tableMiscRowHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="comp-cell-${stageLabels[stagei]}BgColInput" value="${currentBgCol}" /></td>`;
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
        tableMiscRowHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="todo-cell-group-${todoName}FtColInput" value="${currentFtCol}" /></td>`;
        tableMiscRowHTML += `<td><input class="settingsInput settingsColorInput" style="color: ${bodyFtCol}" id="todo-cell-group-${todoName}BgColInput" value="${currentBgCol}" /></td>`;
        tableMiscRowHTML += "</tr>";

        tableMiscHTML += tableMiscRowHTML;
    });

    tableMiscHTML += `</tbody></table>`;
    tableMisc.innerHTML = tableMiscHTML;

    //----------------------------------------------------------- finalize

    //bind events to these fields that we've created
    Array.from(document.getElementsByClassName("settingsColorInput")).forEach((element) => {
        element.addEventListener('focus', settingsCellFocus);
        element.addEventListener('keypress', settingsCellKeyPress);
        element.addEventListener('blur', settingsCellBlur);
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
        }
    });
    updateUnsavedMessage();
    getCreateColorClasses();
    renderTable(tier=globalCurrentTier,rerender=true); //should probably only reload if any settings have changed... but whatever
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






//-------------------------------------------------------------------------------------------------------------------------------------------------------- MAIN

document.addEventListener('DOMContentLoaded', function() {
    //----------------------------------------------------------- materialize inits

    //instantiate the modals
    var modalElems = document.querySelectorAll('.modal');
    M.Modal.init(modalElems[0],{onOpenStart: onOpenUpdateModal, onCloseStart: onCloseUpdateModal}); //update
    M.Modal.init(modalElems[1],{onOpenStart: loadSettingsModal}); //settings
    M.Modal.init(modalElems[2],); //help

    //instantiate collection
    let collapsibleElems = document.querySelectorAll('.collapsible');
    M.Collapsible.init(collapsibleElems, {});

    //----------------------------------------------------------- now load or init EVERYTHING

    //have to do this one first because it affects table rendering
    useRoundTable = getInitLocalStorage('useRoundTable', true, 
        getFormatter = (x => (x === 'true')), //str -> bool
        setFormatter = (x => x.toString())); //bool -> str

    //render all the custom formatting classes
    getCreateColorClasses();

    //things that automatically update or take care of themselves
    //current page
    currentPages = getInitLocalStorage('currentPages', {"1":1, "2":1, "3":1, "4":1, "5":1, "6":1, "7":1, "8":1, "todo":1}, 
        getFormatter = JSON.parse, //str -> json
        setFormatter = JSON.stringify); //json -> str

    //todo toggle
    globalIsTodo = getInitLocalStorage('globalIsTodo', false, 
        getFormatter = (x => (x === 'true')), //str -> bool
        setFormatter = (x => x.toString())); //bool -> str

    //the tier
    globalCurrentTier = getInitLocalStorage('globalCurrentTier','1');

    //what tabs were most recently displayed
    displayMode = getInitLocalStorage('displayMode',"stage");
    globalLastTableHeader = getInitLocalStorage('globalLastTableHeader',"stage");

    //number of rows per pagination page
    entriesPerPage = getInitLocalStorage('entriesPerPage', 19,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str

    //whether or not we use the hidden table
    useHiddenTable = getInitLocalStorage('useHiddenTable', true, 
        getFormatter = (x => (x === 'true')), //str -> bool
        setFormatter = (x => x.toString())); //bool -> str

    //widths for map table
    mapTableNameWidth = getInitLocalStorage("MapTableNameWidth", 11,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    mapTableGroupWidth = getInitLocalStorage("MapTableGroupWidth", 5,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str

    //widths for todo table
    todoTableCheckboxWidth = getInitLocalStorage("TodoTableCheckboxWidth", 2,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    todoTableNameWidth = getInitLocalStorage("TodoTableNameWidth", 12.5,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    todoTableGoalWidth = getInitLocalStorage("TodoTableGoalWidth", 5,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    todoTableOrigWidth = getInitLocalStorage("TodoTableOrigWidth", 5,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    todoTableCurrWidth = getInitLocalStorage("TodoTableCurrWidth", 5,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str


    //----------------------------------------------------------- change page visuals

    //renderTable takes care of the table settings
    //callback gets us back to the page we were on
    //but we need to possibly flip the todo toggle, etc
    //and add "active" to the tabs we're on
    if (displayMode === "todo") { //we were on the todo table
        hideMapTableButtons(); //get the stage/bonus/note buttons out
        currentFocusNavTier = "TodoButton"; //highlight "todo"
    }
    else if (displayMode === "stage" || displayMode === "bonus" || displayMode === "note") {
        addMapTableButtons(); //get the stage/bonus/note buttons in (they should be here anyway but why not)
        currentFocusNavTier = `T${globalCurrentTier}Button`; //highlight current tier
        globalLastTableHeader = displayMode; //to save current state if we go to todo later
    }

    switch (globalLastTableHeader) { //the last active of stage/bonus/note
        case "stage":
            currentFocusNavMode = "StageButton";
            break;
        case "bonus":
            currentFocusNavMode = "BonusButton";
            break;
        case "note":
            currentFocusNavMode = "NoteButton";
            break;
        default:
            break;
    }

    focusNavItem(currentFocusNavTier); //highlight tier or "todo"
    focusNavItem(currentFocusNavMode); //highlight stage/bonus/note, hidden if we're on todotable
    document.getElementById("TodoToggle").checked = globalIsTodo; //possibly flip the todotoggle, hidden if we're on todotable
    
    // load what the hidden table was from last time
    hiddenDiv.innerHTML = localStorage.getItem('hiddenTableHTML');

    //----------------------------------------------------------- good to go -- load the db and render

    openDatabase().then(
        (dbconn) => {
            db = dbconn;
            renderTable(tier=globalCurrentTier,rerender=false);            
        },
        (dberr) => {
            alert(dberr);
        }
    );
});

















