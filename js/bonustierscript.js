//-------------------------------------------------------------------------------------------------------------------------------------------------------- GLOBALS
const CURRANNOUNCEVERSION = "v3"; //update this when new announcement is made
const SHOWANNOUNCEMENT = false;

const NUMTIERS = 10;

const BDATAURL = "https://amongus.nyc/static/ratings.csv";
// const BDATAURL = "http://127.0.0.1:8000/static/ratings.csv";
var table;

let bonusesPerPage = 20;

const bonusTiersTableTierWidth = 10;
const bonusTiersTableNameWidth = 40;
const bonusTiersTableDiffWidth = 20;

var tierLabels = [1,2,3,4,5,6,7,8,9,10]; //actual data
var tierContent = ["G","F","E","D","C","B","A","S","X","Y"]; //what it's rendered as

//-------------------------------------------------------------- COLORS

const darkmodeColorDict = {
    "bodyFtCol": "#cccccc",
    "bodyBgCol": "#2e3740",
    "navbarFtCol": "#eeeeee",
    "navbarBgCol": "#213552",
    "tableHeaderFtCol": "#eeeeee",
    "tableHeaderBgCol": "#335380",

    "diff-cellFtCol": "#bdbdbd",
    "diff-cellBgCol": "#6f6f6f",

    "tier-1FtCol": "#4D4D4D",
    "tier-1BgCol": "#eeeeee",

    "tier-2FtCol": "#39404D",
    "tier-2BgCol": "#c9daf8",

    "tier-3FtCol": "#39414D",
    "tier-3BgCol": "#6d9eeb",

    "tier-4FtCol": "#3F4D39",
    "tier-4BgCol": "#6aa84f",

    "tier-5FtCol": "#4D4839", //s25 v30
    "tier-5BgCol": "#f1c232",

    "tier-6FtCol": "#4D4339", //s25 v30
    "tier-6BgCol": "#e69138",

    "tier-7FtCol": "#4D3939", //s25 v30
    "tier-7BgCol": "#a50000",

    "tier-8FtCol": "#CCA199", //s25 v80
    "tier-8BgCol": "#85200c",

    "tier-9FtCol": "#cccccc", //v80
    "tier-9BgCol": "#222222",

    "tier-10FtCol": "#99ACCC", //s25 v80
    "tier-10BgCol": "#122e5e"
};


function getCreateColorClasses() {
    let defaultPalette = darkmodeColorDict;

    Object.keys(defaultPalette).forEach(function(colorClassName) {
        document.getElementsByTagName("body")[0].style.setProperty(`--${colorClassName}`, defaultPalette[colorClassName]);
    });
}


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

async function getBonusData() {
    return new Promise(function(resolve, reject) {
        fetch(BDATAURL).then((res) => res.text()).then((text) => {
            // name,num,difficulty
            // surf_prosurf,34,820.2955
            // surf_firedancer,34,752.0149,<--------------------------------- tier 10
            let ALLBINFO = parseCSV(text);
            let headers = ALLBINFO[0];
            const IDI = headers.indexOf("ID");
            const NAMEI = headers.indexOf("name");
            const ZONEI = headers.indexOf("num");
            const DIFFI = headers.indexOf("difficulty");
            const DI = headers.length; //cutoffs are one longer

            let tiercutoffs = []; //the last bi of whatever tier

            for (let bi=1; bi<ALLBINFO.length; bi++) { //skip the header line
                thisBInfo = ALLBINFO[bi];
                if (isTierCutoff(thisBInfo)) {
                    tiercutoffs.push(bi);
                }
            }

            let allBonuses = [];

            let currtier = NUMTIERS;
            let firsti = 0;
            let lasti = tiercutoffs[0];

            let bnum;
            for (let bi=1; bi<ALLBINFO.length; bi++) { //skip the header line
                thisBInfo = ALLBINFO[bi];

                //tierI = thisMapInfo[TIERI] - 1; //for arr indexing
                bnum = +thisBInfo[ZONEI]-30;

                allBonuses.push({
                    mapName: thisBInfo[NAMEI].substr(5),
                    num: bnum,
                    diff: +thisBInfo[DIFFI],
                    tier: currtier,
                    lowmidhigh: getLowMidHigh(firsti,lasti,bi)
                });

                if (isTierCutoff(thisBInfo)) {
                    firsti = tiercutoffs[NUMTIERS-currtier--]+1;
                    lasti = tiercutoffs[NUMTIERS-currtier];
                    console.log(thisBInfo,firsti,lasti);
                }
            }

            resolve(allBonuses);
        }).catch((e) => reject(e)); //maybe add fallback of a mirror here?
    });
}


//-------------------------------------------------------------------------------------------------------------------------------------------------------- HELPER FUNC

function isTierCutoff(thisBInfo) {
    return thisBInfo.length > 3;
}

function getLowMidHigh(firsti,lasti,bi) {
    console.log(firsti,lasti,bi);
    let frac = (bi-firsti)/(lasti-firsti);
    if (frac < 1/3) { return "high"; }
    if (frac < 2/3) { return "mid"; }
    return "low";
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


//-------------------------------------------------------------------------------------------------------------------------------------------------------- SEARCH

$('#SearchBarBonusTiers').on('keyup', function () {
    let query = this.value;
    let queryArr = query.toLowerCase().split(" ");

    let filtersArr = [];

    //tier searching
    const tierFilterRegex = /t(?:ier)?(?<filter>>|>=|<|<=|=)(?<tier>G|F|E|D|C|B|A|S|X|Y),?/i;
    const tierOrRegex = /t(?:ier)?=(?<tiers>(?:(?:G|F|E|D|C|B|A|S|X|Y),)+(?:G|F|E|D|C|B|A|S|X|Y)),?/i;

    function createTierFilter(match) {
        //var tierContent = ["G","F","E","D","C","B","A","S","X","Y"];
        let tier = match.groups.tier.toUpperCase();
        let num = tierContent.indexOf(tier);

        return function(rowData) {
                console.log(rowData.tier, tierLabels.indexOf(rowData.tier), num);
            switch(match.groups.filter) {
                case ">":
                    return (tierLabels.indexOf(rowData.tier) > num);
                    break;
                case ">=":
                    return (tierLabels.indexOf(rowData.tier) >= num);
                    break;
                case "<":
                    return (tierLabels.indexOf(rowData.tier) < num);
                    break;
                case "<=":
                    return (tierLabels.indexOf(rowData.tier) <= num);
                    break;
                case "=":
                    return (tierLabels.indexOf(rowData.tier) == num);
                    break;
                default:
                    return true;
                    break;
            }
        }
    }
    function createTierOrFilter(match) {
        //var tierContent = ["G","F","E","D","C","B","A","S","X","Y"];
        let tiers = match.groups.tiers.split(",");

        return function(rowData) {
            let tier, num;
            for (let i=0; i<tiers.length; i++) {
                tier = tiers[i].toUpperCase();
                num = tierContent.indexOf(tier);

                if (tierLabels.indexOf(rowData.tier) == num) { return true; }
            }
            return false;
        }

    }


    function createSearchFilter(word) {
        const wordRegex = new RegExp(word, "i");
        return function(rowData) {
            let searchStr = `${rowData.mapName} b${rowData.num}`;
            let searchMatch = searchStr.match(wordRegex);
            if (searchMatch) { return true; }
            return false;
        }
    }

    let allFilters = [ //regex, filter that goes with it
        [tierFilterRegex, createTierFilter], //tier filtering
        [tierOrRegex, createTierOrFilter] //OR
    ];

    let regexMatch, isFilter;
    queryArr.forEach((word) => {
        isFilter = false; //is this word a properly formatted filter?

        allFilters.forEach((regexFilter) => {
            regexMatch = word.match(regexFilter[0]);
            if (regexMatch && regexMatch[0] === word) { //the word needs to be an exact match, no e.g. "qs>3" for stages
                filtersArr.push(regexFilter[1](regexMatch));
                isFilter = true;
            }
        });
        
        if (!isFilter) { //this word didn't fit any regex, treat it as a proper search
            //check name:
            filtersArr.push(createSearchFilter(word));
        }
    });

    table.search(function(rowStr,rowData,rowInd) {
        let isDisplayed = true;
        for (let i=0; i<filtersArr.length; i++) { //can't foreach because I want to break
            if (!filtersArr[i](rowData)) { isDisplayed = false; break; }
        }
        return isDisplayed;
    });

    table.draw();
});


//-------------------------------------------------------------------------------------------------------------------------------------------------------- TABLE RENDERING

function renderBonusTable(containerId, bData) {
    let colNames = [];
    let cols = [];
    
    cols.push({data: 'tier', render: tierRender, orderable: false, width: `${bonusTiersTableTierWidth}%`});
    colNames.push("Tier");

    cols.push({data: 'mapName', render: nameRender, width: `${bonusTiersTableNameWidth}%`});
    colNames.push("Name");

    cols.push({data: 'diff', render: diffRender, width: `${bonusTiersTableDiffWidth}%`});
    colNames.push("Rating");


    $(`#${containerId}`).html(`${createTableHeader(colNames)}<tbody></tbody>`);

    //global scope! need to edit page number
    table = new DataTable(`#${containerId}`, {
        stateSave: true, //remembers what page you were on when you reload the page
        pageLength: bonusesPerPage,
        columns: cols,
        data: bData,
        autoWidth: false,
        aaSorting: [],
        columnDefs: [
            { type: 'natural-ci', targets: '_all' }
        ],
        language: {
            entries: {
                _: 'bonuses',
                1: 'bonus'
            },
            info: '(_TOTAL_ _ENTRIES-TOTAL_)',
            infoFiltered: '',
            infoEmpty: '(_TOTAL_ _ENTRIES-TOTAL_)',
            zeroRecords: ''
        },
        layout: {
            topStart: null,
            topEnd: 'paging',
            bottomStart: null,
            bottomEnd: 'info'
        }
    });

    for (let i=0; i<table.columns()[0].length; i++) {
        table.column(i).visible(true, false); //show all the columns initially, searchbar is empty
    }

    $('#SearchInfo').text( $("#BonusTiersTable_info").text() );

    table.on('info.dt', function(e) {
        $('#SearchInfo').text( $("#BonusTiersTable_info").text() );
    });

    // table.on('contextmenu', function(e) {
    //     e.preventDefault();
    // });
}


//-------------------------------------------------------------- OTHER TABLE RENDERS

function tierRender(data,type,row) {
    switch (type) {
        case "display":
            return makeTierDisplay(data,row);
            break;
        case "sort":
            return data;
            break;
        default:
            return "";
            break;
    }
}
function makeTierDisplay(cell,row) {
    let tieri = tierLabels.indexOf(cell);
    let cellInterior = `<div class="tier-cell-${cell}"><b>${row.lowmidhigh} ${tierContent[tieri]}</b></div>`;
    return `<div class="tier-cell">${cellInterior}</div>`;
}


function nameRender(data,type,row) {
    switch (type) {
        case "display":
            return makeNameDisplay(data,row);
            break;
        case "sort":
            return `${data} b${row["num"]}`;
            break;
        default:
            return "";
            break;
    }
}
function makeNameDisplay(cell,row) {
    let tier = row["tier"];
    let cellInterior = `<div class="name-cell-${tier}"><b>${cell} b${row["num"]}</b></div>`;
    return `<div class="name-cell">${cellInterior}</div>`;
}


function diffRender(data,type,row) {
    switch (type) {
        case "display":
            return makeDiffDisplay(data,row);
            break;
        case "sort":
            return data;
            break;
        default:
            return "";
            break;
    }
}
function makeDiffDisplay(cell,row) {
    let tier = row["tier"];
    let cellInterior = `<div class="diff-cell-${tier}"><b>${cell}</b></div>`;
    return `<div class="diff-cell">${cellInterior}</div>`;
}


//-------------------------------------------------------------------------------------------------------------------------------------------------------- INPUTS

$("#BonusesPerPageInput").on('blur', function () {
    let newVal = +$(this).val();
    if (Number.isInteger(newVal) && newVal > 0) {
        localStorage.setItem("bonusesPerPage", newVal);
        table.page.len(this.value).draw();
    }
});
$("#BonusesPerPageInput").on('keypress', function (e) {
    if (e.keyCode === 13) { $(this).blur(); } //enter key
});


//-------------------------------------------------------------------------------------------------------------------------------------------------------- ONREADY FUNC


document.addEventListener('DOMContentLoaded', function() {

    //----------------------------------------------------------- now load or init EVERYTHING

    //render all the custom formatting classes
    getCreateColorClasses();

    bonusesPerPage = getInitLocalStorage('bonusesPerPage', 20,
        getFormatter = (x => +x), //str -> num
        setFormatter = (x => x.toString())); //num -> str
    $("#BonusesPerPageInput").val(bonusesPerPage);

    $("#SearchBarBonusTiers").val("");

    //----------------------------------------------------------- good to go -- load the db and render

    getBonusData().then(
        (bData) => {
            renderBonusTable("BonusTiersTable",bData);
        },
        (parseerr) => {
            alert(parseerr);
        }
    );
});