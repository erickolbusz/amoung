const tableID = "MapTable";


//-------------------------------------------------------------------------------------------------------------------------------------------------------- HELPER FUNC
//-------------------------------------------------------------- CHECK IF CELL MEETS CRITERIA

function isStageWRCP(cell) {
    cell = +cell;
    return ((cell == 2) || ((cell-globalTodoStageCutoff) == 2));
}
function isBonusWRB(cell) {
    cell = +cell;
    return ((cell == 2) || ((cell-globalTodoStageCutoff) == 2));
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------- DB INTERFACING
//-------------------------------------------------------------- INC/DEC

function increaseGroup(table,tRow,tempNote) {
    dbChangeGroup(tRow.data().mapName,1).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedraw(table,tRow,res,tempNote);
    }});
}
function decreaseGroup(table,tRow,tempNote) {
    dbChangeGroup(tRow.data().mapName,-1).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedraw(table,tRow,res,tempNote);
    }});
}

function increaseStage(table,tRow,stagei,tempNote) {
    dbChangeStage(tRow.data().mapName,stagei,1).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedraw(table,tRow,res,tempNote);
    }});
}
function decreaseStage(table,tRow,stagei,tempNote) {
    dbChangeStage(tRow.data().mapName,stagei,-1).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedraw(table,tRow,res,tempNote);
    }});
}

function increaseBonus(table,tRow,bonusi,tempNote) {
    dbChangeBonus(tRow.data().mapName,bonusi,1).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedraw(table,tRow,res,tempNote);
    }});
}
function decreaseBonus(table,tRow,bonusi,tempNote) {
    dbChangeBonus(tRow.data().mapName,bonusi,-1).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedraw(table,tRow,res,tempNote);
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
function saveMapNote(table,tRow,newText) {
    dbSaveMapNote(tRow.data().mapName,newText).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedraw(table,tRow,res,null);
        globalCurrentNote.focus();
    }});
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
                            mapID: mapInfo.mapID,
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
                            resolve(mapInfo); return;
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

function createTodoItem(table,tRow,todoType,todoNum,tempNote) {
    dbCreateTodo(tRow.data().mapName,todoType,todoNum).then((res) => { if (Number.isNaN(Number(res)) && res !== "Unneeded") {
        tRowUpdateRedraw(table,tRow,res,tempNote);
    }});
}

function removeTodoItem(table,tRow,todoType,todoNum,tempNote) {
    dbDeleteTodo(tRow.data().mapName,todoType,todoNum).then((res) => { if (Number.isNaN(Number(res)) && res !== "Unneeded") {
        tRowUpdateRedraw(table,tRow,res,tempNote);
    }});
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------- SEARCH

$('#SearchBarMaps').on('keyup', function () {
    let query = this.value;
    let queryArr = query.toLowerCase().split(" ");

    let filtersArr = [];

    function isStagedFilter(rowData) { return rowData.mapType === "Staged" || rowData.mapType === "Staged-Linear"; } //c.f. isStaged in bothscript
    function isLinearFilter(rowData) { return rowData.mapType === "Linear" || rowData.mapType === "Staged-Linear"; }
    function isStagedLinearFilter(rowData) { return rowData.mapType === "Staged-Linear"; }

    const typeFilterRegex = /type:(?<maptype>staged-?linear|staged|linear),?/i;
    function createTypeFilter(match) {
        switch (match.groups.maptype) {
            case "staged":
                return isStagedFilter;
                break;
            case "linear":
                return isLinearFilter;
                break;
            case "stagedlinear":
            case "staged-linear":
                return isStagedLinearFilter;
                break;
            default:
                return function(x) { return true; }
                break;
        }
    }


    /*
    tier:
        matches: "t" or "tier"
    year:
        matches: "y" or "year"
    stage count:
        matches: "s" or "stage" or "stages"
    bonus count:
        matches: "b" or "bonus" or "bonuses"
    checkpoint count:
        matches: "cp" or "cps" or "checkpoint" or "checkpoints"
    */
    const numFilterRegex = /(?<type>t(?:ier)?|y(?:ear)?|s(?:tages?)?|b(?:onus(?:es)?)?|(?:cp|checkpoint)s?)(?<filter>>|>=|<|<=|=)(?<num>\d+),?/i;
    const numOrRegex     = /(?<type>t(?:ier)?|y(?:ear)?|s(?:tages?)?|b(?:onus(?:es)?)?|(?:cp|checkpoint)s?)=(?<nums>(?:\d+,)+\d+),?/i;

    function createNumFilter(match) {
        let num = +match.groups.num;
        return function(rowData) {
            let rowField; //what we're comparing to num
            switch (match.groups.type.toLowerCase()) {
                case "t":
                case "tier":
                    rowField = +rowData.tier;
                    break;
                case "y":
                case "year":
                    rowField = +rowData.mapDate.split("-")[0]; //yyyy-mm-dd -> yyyy
                    break;
                case "s":
                case "stage":
                case "stages":
                    filtersArr.push(isStagedFilter); //implies staged
                    rowField = +rowData.cp_count;
                    break;
                case "cp":
                case "cps":
                case "checkpoint":
                case "checkpoints":
                    filtersArr.push(isLinearFilter); //implies linear
                    rowField = +rowData.cp_count;
                    break;
                case "b":
                case "bonus":
                case "bonuses":
                    rowField = rowData.b_pr.length;
                    break;
                default:
                    return true; //don't filter
                    break;
            }

            switch(match.groups.filter) {
                case ">":
                    return (rowField > num);
                    break;
                case ">=":
                    return (rowField >= num);
                    break;
                case "<":
                    return (rowField < num);
                    break;
                case "<=":
                    return (rowField <= num);
                    break;
                case "=":
                    return (rowField == num);
                    break;
                default:
                    return true;
                    break;
            }
        }
    }
    function createNumOrFilter(match) {
        let nums = match.groups.nums.split(",");
        return function(rowData) {
            let rowField; //what we're comparing to num
            switch (match.groups.type.toLowerCase()) {
                case "t":
                case "tier":
                    rowField = +rowData.tier;
                    break;
                case "y":
                case "year":
                    rowField = +rowData.mapDate.split("-")[0]; //yyyy-mm-dd -> yyyy
                    break;
                case "s":
                case "stage":
                case "stages":
                    filtersArr.push(isStagedFilter); //implies staged
                    rowField = +rowData.cp_count;
                    break;
                case "cp":
                case "cps":
                case "checkpoint":
                case "checkpoints":
                    filtersArr.push(isLinearFilter); //implies linear
                    rowField = +rowData.cp_count;
                    break;
                case "b":
                case "bonus":
                case "bonuses":
                    rowField = rowData.b_pr.length;
                    break;
                default:
                    return true; //don't filter
                    break;
            }

            for (let i=0; i<nums.length; i++) {
                if (rowField == +nums[i]) { return true; }
            }
            return false;
        }
    }


    /*
        no pr    group=0
        g7       group=g7 group=any 
        ...
        r10      group=r10 group=top group=any
        ...
        wr       group=wr group=top group=any
    */
    //need two regexs for this... could maybe do something crazy with one but it isn't worth it
    const groupanyFilterRegex = /g(?:roup)?=any,?/i;
    const grouprestFilterRegex = /g(?:roup)?(?<filter>>|>=|<|<=|=)(?<group>none|0|g(?:roup)?[1-7]|r(?:10|[1-9])|top|wr),?/i;
    const groupOrRegex = /g(?:roup)?=(?<groups>(?:(?:none|0|g(?:roup)?[1-7]|r(?:10|[1-9])|top|wr),)+(?:none|0|g(?:roup)?[1-7]|r(?:10|[1-9])|top|wr)),?/i;

    function createGroupAnyFilter(match) {
        return function(rowData) { return rowData.group !== groupLabels[0]; } //not zero group
    }
    function createGroupRestFilter(match) {
        //var groupLabels = ["0","G7","G6","G5","G4","G3","G2","G1","R10","R9","R8","R7","R6","R5","R4","R3","R2","WR"];
        let group = match.groups.group.toUpperCase();
        let num = groupLabels.indexOf(group);
        //if this is -1 then group is either "none" or "top" or "groupx"
        if (num === -1) {
            switch (group) {
                case "GROUP7":
                    num = groupLabels.indexOf("G7");
                    break;
                case "GROUP6":
                    num = groupLabels.indexOf("G6");
                    break;
                case "GROUP5":
                    num = groupLabels.indexOf("G5");
                    break;
                case "GROUP4":
                    num = groupLabels.indexOf("G4");
                    break;
                case "GROUP3":
                    num = groupLabels.indexOf("G3");
                    break;
                case "GROUP2":
                    num = groupLabels.indexOf("G2");
                    break;
                case "GROUP1":
                    num = groupLabels.indexOf("G1");
                    break;
                case "NONE":
                    num = 1;
                    break;
                case "TOP":
                    return function(rowData) {
                        switch(match.groups.filter) {
                            case ">":
                                return (groupLabels.indexOf(rowData.group) > groupLabels.indexOf("R2")); //better than top = wr?
                                break;
                            case ">=":
                                return (groupLabels.indexOf(rowData.group) >= groupLabels.indexOf("R10")); //top or wr
                                break;
                            case "<":
                                return (groupLabels.indexOf(rowData.group) < groupLabels.indexOf("R10")); //g1 or worse
                                break;
                            case "<=":
                                return (groupLabels.indexOf(rowData.group) <= groupLabels.indexOf("R2")); //top or worse
                                break;
                            case "=":
                                return (groupLabels.indexOf(rowData.group) >= groupLabels.indexOf("R10") && groupLabels.indexOf(rowData.group) <= groupLabels.indexOf("R2")); //R10 to R2
                                break;
                            default:
                                return true;
                                break;
                        }
                    }
                    break;
                default:
                    return function(x) { return true; } //just to be safe
                    break;
            }
        }
        return function(rowData) {
            switch(match.groups.filter) {
                case ">":
                    return (groupLabels.indexOf(rowData.group) > num);
                    break;
                case ">=":
                    return (groupLabels.indexOf(rowData.group) >= num);
                    break;
                case "<":
                    return (groupLabels.indexOf(rowData.group) < num);
                    break;
                case "<=":
                    return (groupLabels.indexOf(rowData.group) <= num);
                    break;
                case "=":
                    return (groupLabels.indexOf(rowData.group) == num);
                    break;
                default:
                    return true;
                    break;
            }
        }
    }
    function createGroupOrFilter(match) {
        //var groupLabels = ["0","G7","G6","G5","G4","G3","G2","G1","R10","R9","R8","R7","R6","R5","R4","R3","R2","WR"];
        let groups = match.groups.groups.split(",");

        return function(rowData) {
            let group, num;
            for (let i=0; i<groups.length; i++) {
                group = groups[i].toUpperCase();
                num = groupLabels.indexOf(group);

                if (num === -1) {
                    switch (group) {
                        case "GROUP7":
                            num = groupLabels.indexOf("G7");
                            break;
                        case "GROUP6":
                            num = groupLabels.indexOf("G6");
                            break;
                        case "GROUP5":
                            num = groupLabels.indexOf("G5");
                            break;
                        case "GROUP4":
                            num = groupLabels.indexOf("G4");
                            break;
                        case "GROUP3":
                            num = groupLabels.indexOf("G3");
                            break;
                        case "GROUP2":
                            num = groupLabels.indexOf("G2");
                            break;
                        case "GROUP1":
                            num = groupLabels.indexOf("G1");
                            break;
                        case "NONE":
                            num = 1;
                            break;
                        case "TOP":
                            if (groupLabels.indexOf(rowData.group) >= groupLabels.indexOf("R10") && groupLabels.indexOf(rowData.group) <= groupLabels.indexOf("R2")) { return true; }
                            break;
                        default:
                            return true;
                            break;
                    }
                }

                if (groupLabels.indexOf(rowData.group) == num) { return true; }
            }
            return false;
        }
    }


    const completionFilterRegex = /map:(?:(?:in)?complete|perfect),?/i;

    function createCompletionFilter(match) {
        let type = match[0].toLowerCase();
        return function(rowData) { return rowData.isComplete.includes(type); } //perfect is also flagged as complete
    }


    const todoRegex = /todo:(?<type>m(?:ap)?|s(?:tage)?|b(?:onus)?),?/i;

    function createTodoFilter(match) {
        switch (match.groups.type.toLowerCase()) {
            case "m":
            case "map":
                return function(rowData) {
                    return rowData.groupTodo;
                }
                break;
            case "s":
            case "stage":
                return function(rowData) {
                    for (let i=0; i<rowData.stage_pr.length; i++) {
                        if (isStageCellTodo(rowData.stage_pr[i])) { return true; }
                    }
                    return false;
                }
                break;
            case "b":
            case "bonus":
                return function(rowData) {
                    for (let i=0; i<rowData.b_pr.length; i++) {
                        if (isBonusCellTodo(rowData.b_pr[i])) { return true; }
                    }
                    return false;
                }
                break;
            default:
                return function(x) { return true; }
                break;
        }
    }


    const wrFilterRegex = /wr:(?<type>any|all|map|cp|checkpoint|stage|b(?:onus)?),?/i;

    function createWrFilter(match) {
        switch (match.groups.type.toLowerCase()) {
            case "map":
                return function (rowData) {
                    return (rowData.group === groupLabels[groupLabels.length-1]);
                }
                break;
            case "cp":
            case "checkpoint":
            case "stage":
                return function(rowData) {
                    for (let i=0; i<rowData.stage_pr.length; i++) {
                        if (isStageWRCP(rowData.stage_pr[i])) { return true; }
                    }
                    return false;
                }
                break;
            case "b":
            case "bonus":
                return function(rowData) {
                    for (let i=0; i<rowData.b_pr.length; i++) {
                        if (isBonusWRB(rowData.b_pr[i])) { return true; }
                    }
                    return false;
                }
                break;
            case "any":
            case "all":
                return function(rowData) { //just do all three
                    if (rowData.group === groupLabels[groupLabels.length-1]) { return true; }
                    for (let i=0; i<rowData.stage_pr.length; i++) {
                        if (isStageWRCP(rowData.stage_pr[i])) { return true; }
                    }
                    for (let i=0; i<rowData.b_pr.length; i++) {
                        if (isBonusWRB(rowData.b_pr[i])) { return true; }
                    }
                    return false;
                }
                break;
            default:
                return function(x) { return true; }
                break;
        }
    }


    function createSearchFilter(word) {
        const wordRegex = new RegExp(word, "i");
        return function(rowData) {
            let searchStr = `${rowData.mapName} ${rowData.map_note}`;
            let searchMatch = searchStr.match(wordRegex);
            if (searchMatch) { return true; }
            return false;
        }
    }

    let allFilters = [ //regex, filter that goes with it
        [typeFilterRegex, createTypeFilter], //staged, linear, stagedlinear

        [numFilterRegex, createNumFilter], //stages, cps, bonuses, tier, year
        [numOrRegex, createNumOrFilter], //OR ''

        [groupanyFilterRegex, createGroupAnyFilter], //group:any
        [grouprestFilterRegex, createGroupRestFilter], //groups filtering
        [groupOrRegex, createGroupOrFilter], //OR ''

        [completionFilterRegex, createCompletionFilter], //map:incomplete, complete, perfect

        [todoRegex, createTodoFilter], //todo:map, stage, bonus
        
        [wrFilterRegex, createWrFilter] //wr:all/any, map, cp/checkpoint/stage, b/bonus
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
            //check mapname and note:
            filtersArr.push(createSearchFilter(word));
        }
    });

    let mostStagesShown = 0;
    table.search(function(rowStr,rowData,rowInd) {
        let isDisplayed = true;
        for (let i=0; i<filtersArr.length; i++) { //can't foreach because I want to break
            if (!filtersArr[i](rowData)) { isDisplayed = false; break; }
        }
        if (isDisplayed) { 
            if (rowData.stage_pr.length > mostStagesShown) { 
                mostStagesShown = rowData.stage_pr.length; 
            }
        }
        return isDisplayed;
    });

    if (hideExtraCols) {
        let i;
        for (i=3; i<mostStagesShown+3; i++) {
            table.column(i).visible(true, false);
        }
        for (; i<table.columns()[0].length; i++) {
            table.column(i).visible(false, false);
        }
        if (mostStagesShown === 0) { //everything linear
            table.settings()[0].aoColumns[2].sWidth = `${100-MapTableNameWidth-MapTableTierWidth}%`; //group takes up the rest
        }
        else {
            table.settings()[0].aoColumns[2].sWidth = `${MapTableGroupWidth}%`; //reset the group width
            let restWidth = (100-MapTableNameWidth-MapTableTierWidth-MapTableGroupWidth)/mostStagesShown;
            for (let j=3; j<table.columns()[0].length; j++) {
                table.settings()[0].aoColumns[j].sWidth = `${restWidth}%`;
            }
        }
        table.columns.adjust();
    }

    table.draw();
});



//-------------------------------------------------------------------------------------------------------------------------------------------------------- TABLE RENDERING

//made this its own function because I already need to "manually" adjust the dropdown thing to stop it from resetting
function tRowUpdateRedraw(table,tRow,res,tempNote) {
    if (tempNote) { res.map_note = tempNote; } //temporarily set flickering note
    tRow.data(res);
    table.rows(tRow).draw(false); //keep the page we were on
    let tRowNode = tRow.node();
    if (tRow.child.isShown()) {
        $(tRowNode).find('.control-plus:first').hide();
        $(tRowNode).find('.control-minus:first').show();

        //might need to update the detail, also the "details" class goes away for some reason so add that back in
        //(we need that to differentiate between child row and normal row in the table td onclick events)
        tRow.child(mapTableDetail(tRow.data()));
        $(tRowNode).next('tr').addClass('details');
    }
    else {
        $(tRowNode).find('.control-plus:first').show();
        $(tRowNode).find('.control-minus:first').hide();
    }
}

function renderMapTable(containerId) {
    let colNames = [];
    let cols = [];
    
    cols.push({data: 'mapName', render: nameRender, width: `${MapTableNameWidth}%`});
    colNames.push("Name");

    cols.push({data: 'tier', render: tierRender, width: `${MapTableTierWidth}%`});
    colNames.push("Tier");

    cols.push({data: 'group', render: groupRender, width: `${MapTableGroupWidth}%`});
    colNames.push("Group");

    dbGetAllMaps().then((res) => { if (Array.isArray(res)) {
        //... s1, s2, ..., sn

        //get the longest map (cubic :))
        let mostStages = 0;
        res.forEach((map) => {
            if (map.stage_pr.length > mostStages) { mostStages = map.stage_pr.length; }
        });

        let restWidth = (100-MapTableNameWidth-MapTableTierWidth-MapTableGroupWidth)/mostStages;

        //add all the stages as columns
        for (let si=1; si<=mostStages; si++) {
            if (si==1) {
                cols.push({data: `s${si}`, orderable: true, data: 'stage_pr', defaultContent: 'NULL', render: createStageRender(si), width: `${restWidth}%`});
            }
            else {
                cols.push({data: `s${si}`, orderable: false, data: 'stage_pr', defaultContent: 'NULL', render: createStageRender(si), width: `${restWidth}%`});
            }
            colNames.push(`S${si}`);
        }

        $(`#${containerId}`).html(`${createTableHeader(colNames)}<tbody></tbody>`);

        //global scope! need to edit page number in settings modal
        table = new DataTable(`#${containerId}`, {
            stateSave: true, //remembers what page you were on when you reload the page
            pageLength: entriesPerPage,
            columns: cols,
            data: res,
            autoWidth: false,
            aaSorting: [],
            columnDefs: [
                { type: 'natural-ci', targets: '_all' }
            ],
            language: {
                entries: {
                    _: 'maps',
                    1: 'map'
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

        $('#SearchInfo').text( $("#MapTable_info").text() );


        table.on('info.dt', function(e) {
            $('#SearchInfo').text( $("#MapTable_info").text() );
        });


        table.on('contextmenu', function(e) {
            e.preventDefault();
        });


        table.on('mousedown', 'td', function(e) { if (e.which===1 || e.which===3) { //mouse1 and mouse2
            let tr  = $(this).closest('tr'); //contains info about placement

            let tempNote = null;
            if ($(':focus').hasClass('map-detail-note')) { //currently in a map note right before clicking on this mousedown (mousedown runs before blur)
                if ($(':focus').closest('tr').prev().is(tr)) { //this note is in the detail of "this" row
                    tempNote = $(':focus').val();
                }
            }

            if (!tr.hasClass("details")) { //we DIDN'T click in a dropdown
                //loop over the row to see where the element is
                let tCol = -1;
                let tds = tr.children('td');
                for (let i=0; i<tds.length; i++) {
                    if (tds[i] == this) {
                        tCol = i;
                        break;
                    }
                }

                let tRow = table.row(tr); //the datatables row

                if (e.which===1) { //mouse1
                    switch (tCol) {
                        case 0: //name dropdown
                            if (tRow.child.isShown()) { //hide it
                                $(this).find('.control-plus:first').show();
                                $(this).find('.control-minus:first').hide();
                                tr.next('tr').removeClass('details');
                                tRow.child.hide();
                            }
                            else { //show it
                                $(this).find('.control-plus:first').hide();
                                $(this).find('.control-minus:first').show();
                                tRow.child(mapTableDetail(tRow.data())).show();
                                tr.next('tr').addClass('details');
                            }

                            break;
                        case 2: //group
                            if (globalIsTodo) { createTodoItem(table, tRow, "group", -1, tempNote); } //append to todolist
                            else { increaseGroup(table, tRow, tempNote); } //change group
                            break;
                        default: //anything else i.e. stages
                            if (tCol <= tRow.data().stage_pr.length + 2) { //make sure it's not null
                                if (globalIsTodo) { createTodoItem(table, tRow, "stage", tCol-2, tempNote); }
                                else { increaseStage(table, tRow, tCol-3, tempNote); }
                            }
                            break;
                    }
                }
                else if (e.which===3) { //mouse2
                    switch (tCol) {
                        case 0: //name
                            break;
                        case 2: //group
                            if (globalIsTodo) { removeTodoItem(table, tRow, "group", -1, tempNote); } //append to todolist
                            else { decreaseGroup(table,tRow, tempNote); } //change group
                            break;
                        default: //anything else i.e. stages
                            if (tCol <= tRow.data().stage_pr.length + 2) { //make sure it's not null  
                                if (globalIsTodo) { removeTodoItem(table, tRow, "stage", tCol-2, tempNote); }
                                else { decreaseStage(table, tRow, tCol-3, tempNote); }
                            }
                            break;
                    }
                }
            }
        }});


        table.on('mousedown', '.bonus-cell', function(e) { if (e.which===1 || e.which===3) { //mouse1 and mouse2
            let bonusInfo = $(this).closest('.bonus-parent').attr("id").split("-");
            let bonusNum = +bonusInfo[1].slice(1); //remove the "b" from e.g. "b5" 
            let parenttr = $(this).closest('tr').prev(); //detail is always right after the parent

            let tempNote = null;
            if ($(':focus').hasClass('map-detail-note')) { //currently in a map note right before clicking on this mousedown (mousedown runs before blur)
                if ($(':focus').closest('tr').prev().is(parenttr)) { //this note is in the detail of "this" row
                    tempNote = $(':focus').val();
                }
            }

            if (parenttr.hasClass("dt-hasChild")) { //can never be too sure
                let parenttRow = table.row(parenttr);
                if (bonusNum <= parenttRow.data().b_pr.length) {
                    if (e.which===1) { //mouse1
                        if (globalIsTodo) { createTodoItem(table, parenttRow, "bonus", bonusNum, tempNote); }
                        else { increaseBonus(table, parenttRow, bonusNum-1, tempNote); }
                    }
                    else if (e.which===3) { //mouse2
                        if (globalIsTodo) { removeTodoItem(table, parenttRow, "bonus", bonusNum, tempNote); }
                        else { decreaseBonus(table, parenttRow, bonusNum-1, tempNote); }
                    }
                }
            }
        }});


        table.on('focusin', 'textarea', function(e) {
            globalCurrentNote = $(this);
            note_tempNoteStr = $(this).val();
        });
        table.on('blur', 'textarea', function(e) {
            let newText = $(this).val();
            if (newText !== note_tempNoteStr) {
                let parenttr = $(this).closest('tr').prev(); //detail is always right after the parent
                let parenttRow = table.row(parenttr);
                saveMapNote(table,parenttRow,newText);
            }
        });
        table.on('keydown', 'textarea', function(e) {
            if (e.keyCode === 27) { //escape, don't save
                e.preventDefault();
                $(this).val(note_tempNoteStr);
                $(this).blur();
            }
            if (!e.shiftKey && e.keyCode === 13) { //enter saves and exits, shift+enter is normal
                $(this).blur();
            }
        });
    }});
}


//-------------------------------------------------------------- TABLE DETAIL

function mapTableDetail(data) {
    return  `<div class="map-detail-container">` +
                `<div class="row background-tint">` +
                    `<div class="col s2">` + 
                        `<div class="row map-detail-row">` +
                            makeMapInfoDisplay(data) +
                        `</div>` +
                    `</div>` + 
                    `<div class="col s4">` + 
                        `<div class="row map-detail-row">` +
                            `<div class="col s6">` + 
                                `<div id="${data['mapName']}-b1" class="bonus-parent"><div class="blabel">B1</div>` + makeBonusDisplay(data['b_pr'][0]) + `</div>` +
                                `<div id="${data['mapName']}-b2" class="bonus-parent"><div class="blabel">B2</div>` + makeBonusDisplay(data['b_pr'][1]) + `</div>` +
                                `<div id="${data['mapName']}-b3" class="bonus-parent"><div class="blabel">B3</div>` + makeBonusDisplay(data['b_pr'][2]) + `</div>` +
                                `<div id="${data['mapName']}-b4" class="bonus-parent"><div class="blabel">B4</div>` + makeBonusDisplay(data['b_pr'][3]) + `</div>` +
                                `<div id="${data['mapName']}-b5" class="bonus-parent"><div class="blabel">B5</div>` + makeBonusDisplay(data['b_pr'][4]) + `</div>` +
                            `</div>` + 
                            `<div class="col s6">` + 
                                `<div id="${data['mapName']}-b6" class="bonus-parent"><div class="blabel">B6</div>` + makeBonusDisplay(data['b_pr'][5]) + `</div>` +
                                `<div id="${data['mapName']}-b7" class="bonus-parent"><div class="blabel">B7</div>` + makeBonusDisplay(data['b_pr'][6]) + `</div>` +
                                `<div id="${data['mapName']}-b8" class="bonus-parent"><div class="blabel">B8</div>` + makeBonusDisplay(data['b_pr'][7]) + `</div>` +
                                `<div id="${data['mapName']}-b9" class="bonus-parent"><div class="blabel">B9</div>` + makeBonusDisplay(data['b_pr'][8]) + `</div>` +
                                `<div id="${data['mapName']}-b10" class="bonus-parent"><div class="blabel blabel-10">B10</div>` + makeBonusDisplay(data['b_pr'][9]) + `</div>` +
                            `</div>` + 
                        `</div>` +
                    `</div>` + 
                    `<div class="col s6">` + 
                        `<div class="row map-detail-note-row">` +
                            `<textarea class="map-detail-note" placeholder="(write a searchable note here)">` +
                                `${data['map_note']}` +
                            `</textarea>` +
                        `</div>` +
                    `</div>` + 
                `</div>` +
            `</div>`;
}

function makeMapInfoDisplay(data) {
    let dateArr = data['mapDate'].split('-');
    let month = +dateArr[1];
    let monthStr = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month-1];
    let day = +dateArr[2]; //get rid of leading zeroes
    let dateStr;
    if (dateArr[0] === "2012" && monthStr === "Aug") {
        dateStr = "Added: Before Sep 2012<br>";
    }
    else {
        dateStr = `Added: ${monthStr} ${day} ${dateArr[0]}<br>`;
    }

    let cpstageStr;
    if (data['mapType'] === "Linear") {
        cpstageStr = `Checkpoints: ${data['cp_count']}<br>`;
    }
    else {
        cpstageStr = `Stages: ${data['cp_count']}<br>`;
    }
    return dateStr +
        cpstageStr +
        `<a href="https://main.fastdl.me/maps/surf_${data['mapName']}.bsp.bz2">fastdl.me download</a>`;
}

function makeBonusDisplay(cell) {
    //given "0" "1" or "2" for the string index
    //OR 3 4 5 for todo item
    let bonusi = +cell;
    let todoStr = "";
    if (isBonusCellTodo(bonusi)) {
        bonusi -= globalTodoBonusCutoff;
        todoStr = " todoOverlay"
    }
    let cellInterior;
    if (!cell) { //null cell
        cellInterior = `<div class="null-cell"><i class="material-icons">remove</i></div>`;
    }
    else {
        cellInterior = `<div class="comp-cell-${bonusLabels[bonusi]}${todoStr}"><i class="material-icons">${bonusContent[bonusi]}</i></div>`;
    }
    return `<div class="bonus-cell">${cellInterior}</div>`;
}


//-------------------------------------------------------------- OTHER TABLE RENDERS

function nameRender(data,type,row) {
    switch (type) {
        case "display":
            return makeNameDisplay(data,row);
            break;
        default:
            return data; //alphabetical order for sort
            break;
    }
}
function makeNameDisplay(cell,row) { //we use the "complete" column to choose the class
    let compInfo = row["isComplete"];
    let compi, cellInterior;
    let controlPlus = `<div class="name-control control-plus"><i class="material-icons">expand_more</i></div>`;
    let controlMinus = `<div class="name-control control-minus" style="display: none"><i class="material-icons">expand_less</i></div>`;
    if (compInfo.slice(0,4) === "todo") {
        //this is a todo item on the todo list
        compi = todoCompleteLabels.indexOf(compInfo);
        cellInterior = `<div class="todocomp-cell-${compi}"><b>${cell}</b></div>`;
    }
    else {
        compi = compContent.indexOf(compInfo);
        cellInterior = `<div class="mapcomp-cell-${compi}"><b>${cell}</b></div>`;
    }
    return `<div class="name-cell">${controlPlus}${controlMinus}${cellInterior}</div>`;
}

function tierRender(data,type,row) {
    switch (type) {
        case "display":
            return makeTierDisplay(data,row);
            break;
        case "sort":
            return +data;
            break;
        default: //filter, sort
            return "";
            break;
    }
}
function makeTierDisplay(cell,row) {
    //color based on the name cell
    let compInfo = row["isComplete"];
    let compi, cellInterior;
    if (compInfo.slice(0,4) === "todo") {
        //this is a todo item on the todo list
        compi = todoCompleteLabels.indexOf(compInfo);
        cellInterior = `<div class="todocomp-cell-${compi}"><b>${cell}</b></div>`;
    }
    else {
        compi = compContent.indexOf(compInfo);
        cellInterior = `<div class="mapcomp-cell-${compi}"><b>${cell}</b></div>`;
    }
    return `<div class="tier-cell">${cellInterior}</div>`;
}

function groupRender(data,type,row) {
    switch (type) {
        case "display":
            return makeGroupDisplay(data,row);
            break;
        case "sort":
            return groupLabels.indexOf(data);
            break;
        default:
            return "";
            break;
    }
}
function makeGroupDisplay(cell,row) {
    let groupi = groupLabels.indexOf(cell);
    let cellInterior;
    let classNames = `comp-cell-${cell}`;
    if (row["groupTodo"]) { classNames += " todoOverlay"; }
    if (groupIcons[groupi]) { //this is an icon
        cellInterior = `<div class="${classNames}"><i class="material-icons">${groupContent[groupi]}</i></div>`;
    }
    else {
        cellInterior = `<div class="${classNames}"><b>${groupContent[groupi]}</b></div>`;
    }
    return `<div class="group-cell">${cellInterior}</div>`;
}

//gets stage si (so index si-1)
function createStageRender(si) {
    return function(data,type,row) {
        //data is the stage pr string
        switch (type) {
            case "display": //what goes on table
                return makeStageDisplay(data[si-1]);
                break;
            case "sort":
                if (si==1) { return data.length; } //sort maps by length :)
                else {return ""};
                break;
            default:
                return "";
                break;

        }
    }
}
function makeStageDisplay(cell) {
    //given "0" "1" or "2" for the string index
    //OR 3 4 5 for todo item
    let stagei = +cell;
    let isStageTodo = false;
    if (isStageCellTodo(stagei)) {
        stagei -= globalTodoStageCutoff;
        isStageTodo = true;
    }
    let cellInterior;
    let classNames = `comp-cell-${stageLabels[stagei]}`;
    if (isStageTodo) { classNames += " todoOverlay"; }
    if (!cell) { //null cell
        cellInterior = `<div class="null-cell"><i class="material-icons">remove</i></div>`;
    }
    else {
        cellInterior = `<div class="${classNames}"><i class="material-icons">${stageContent[stagei]}</i></div>`;
    }
    return `<div class="stage-cell">${cellInterior}</div>`;
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------- UI INTERACTION BINDINGS

document.getElementById("TodoToggle").addEventListener('change',function() {
    //true == todo, false == not todo
    globalIsTodo = this.checked; //I don't get it but it works
    localStorage.setItem('globalIsTodo', globalIsTodo);
});



//-------------------------------------------------------------------------------------------------------------------------------------------------------- MAIN

document.addEventListener('DOMContentLoaded', onReadyFunc(renderMapTable,tableID,true));