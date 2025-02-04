const tableID = "TodoTable";


//-------------------------------------------------------------------------------------------------------------------------------------------------------- HELPER FUNC
//-------------------------------------------------------------- CHECK COMPLETION

function isTodoDone(row) {
    let todoCheckFunc; //the function that will mark as complete if the current >= the goal (depends on type of todo)
    switch (row.todoType) {
        case "group": //want to do the map
            todoCheckFunc = isTodoGroupDone;
            break;
        case "stage": //want to do a stage on the map
            todoCheckFunc = isTodoStageDone;
            break;
        case "bonus": //want to do a bonus
            todoCheckFunc = isTodoBonusDone;
            break;
        default:
            break;
    }
    return todoCheckFunc(row.goal, row.current);
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



//-------------------------------------------------------------------------------------------------------------------------------------------------------- DB INTERFACING
//-------------------------------------------------------------- GETTING ALL DATA

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


//-------------------------------------------------------------- NOTES

async function dbSaveTodoNote(mapName,todoType,todoNum,note) {
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            const requestGet = todoTable.get([mapName,todoType,todoNum]);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let todoInfo = requestGet.result;
                    todoInfo.todo_note = note;

                    const requestUpdate = todoTable.put(todoInfo);

                    requestUpdate.onsuccess = function() {
                        resolve(todoInfo); return;
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
// function saveTodoNote(table,tRow,newText,nextFocusTarget) {
function saveTodoNote(table,tRow,newText) {
    dbSaveTodoNote(tRow.data().mapName,tRow.data().todoType,tRow.data().number,newText).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedrawTodo(table,tRow,res,true);
        globalCurrentNote.focus();
    }});
}


//-------------------------------------------------------------- TODO CREATION/REMOVAL

function deleteMarkedTodos() {
    let isTodoMarked = function(rowData) { return rowData.removeCheckbox===1; }
    deleteMultipleTodos(isTodoMarked);
}

function deleteDoneTodos() {
    deleteMultipleTodos(isTodoDone);
}

function deleteMultipleTodos(conditionFunc) {
    let allDeletes = [];
    let allDelRows = [];
    let currPromise;
    // let table = $('#todoTable').DataTable();
    table.rows().every( function (rowIdx, tableLoop, rowLoop) {
        if (conditionFunc(this.data())) {
            allDeletes.push(dbDeleteTodo(this.data().mapName, this.data().todoType, this.data().number)); //deletion promises
            allDelRows.push(this); //rows in the table
        }
    });
    Promise.all(allDeletes).then((res) => {
        for (let i=0; i<allDeletes.length; i++) {
            currPromise = res[i];
            if (Number.isNaN(Number(currPromise)) && currPromise !== "Unneeded") { //success
                allDelRows[i].remove(); //remove the row in the table
            }
        }
        table.draw(); //redraw at the end
    });
}


//-------------------------------------------------------------- MASS DELETING TODOS

async function dbToggleTodoCheckbox(mapName,todoType,todoNum) {
    //todoTable key is [mapName, todoType, todoNum]
    if (db) {
        return new Promise(function(resolve,reject) {
            const todoTable = db.transaction("todo", "readwrite").objectStore("todo");
            const requestGet = todoTable.get([mapName,todoType,todoNum]);

            requestGet.onsuccess = function() {
                if (requestGet.result !== undefined) {
                    let todoItem = requestGet.result;
                    todoItem.removeCheckbox = 1 - todoItem.removeCheckbox;

                    const requestUpdate = todoTable.put(todoItem);

                    requestUpdate.onsuccess = function() {
                        resolve(todoItem); return;
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
function toggleTodoCheckbox(table,tRow,tempNote) {
    dbToggleTodoCheckbox(tRow.data().mapName, tRow.data().todoType, tRow.data().number).then((res) => { if (Number.isNaN(Number(res))) {
        tRowUpdateRedrawTodo(table,tRow,res,true,tempNote);
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
                        resolve(todoInfo); return;
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
function increaseTodoGoalGroup(table,tRow,incompleteFlag,tempNote) {
    dbChangeTodoGoalGroup(tRow.data().mapName,1,incompleteFlag).then((res) => { if (Number.isNaN(Number(res)) && res !== "Unneeded") {
        tRowUpdateRedrawTodo(table,tRow,res,true,tempNote);
    }});
}
function decreaseTodoGoalGroup(table,tRow,incompleteFlag,tempNote) {
    dbChangeTodoGoalGroup(tRow.data().mapName,-1,incompleteFlag).then((res) => { if (Number.isNaN(Number(res)) && res !== "Unneeded") {
        tRowUpdateRedrawTodo(table,tRow,res,true,tempNote);
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
                        resolve(todoInfo); return;
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
function increaseTodoGoalStage(table,tRow,incompleteFlag,tempNote) {
    dbChangeTodoGoalStage(tRow.data().mapName,tRow.data().number,1,incompleteFlag).then((res) => { if (Number.isNaN(Number(res)) && res !== "Unneeded") {
        tRowUpdateRedrawTodo(table,tRow,res,true,tempNote);
    }});
}
function decreaseTodoGoalStage(table,tRow,incompleteFlag,tempNote) {
    dbChangeTodoGoalStage(tRow.data().mapName,tRow.data().number,-1,incompleteFlag).then((res) => { if (Number.isNaN(Number(res)) && res !== "Unneeded") {
        tRowUpdateRedrawTodo(table,tRow,res,true,tempNote);
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

                    todoInfo.goal = newGoalBonus;
                    const requestUpdate = todoTable.put(todoInfo);

                    requestUpdate.onsuccess = function() {
                        resolve(todoInfo); return;
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
function increaseTodoGoalBonus(table,tRow,incompleteFlag,tempNote) {
    dbChangeTodoGoalBonus(tRow.data().mapName,tRow.data().number,1,incompleteFlag).then((res) => { if (Number.isNaN(Number(res)) && res !== "Unneeded") {
        tRowUpdateRedrawTodo(table,tRow,res,true,tempNote);
    }});
}
function decreaseTodoGoalBonus(table,tRow,incompleteFlag,tempNote) {
    dbChangeTodoGoalBonus(tRow.data().mapName,tRow.data().number,-1,incompleteFlag).then((res) => { if (Number.isNaN(Number(res)) && res !== "Unneeded") {
        tRowUpdateRedrawTodo(table,tRow,res,true,tempNote);
    }});
}


//-------------------------------------------------------------- CHANGING CURRENT (GROUP)

function increaseTodoCurrGroup(table,tRow,tempNote) {
    dbChangeGroup(tRow.data().mapName,1).then((res) => { if (Number.isNaN(Number(res))) {
        if (tRow.data().current === groupLabels[0]) { //we had an incomplete map and now we don't
            //all the stages of the map are marked done now
            //if there's any stage todos we want to rerender them
            table.rows().every( function (rowIdx, tableLoop, rowLoop) {
                let thisData = this.data();
                if ( (thisData.mapName === tRow.data().mapName) //same map
                    && (thisData.todoType === "stage") //stage on that map
                    && (thisData.current == globalTodoStageCutoff) ) { //currently not done
                        thisData.current = ''+(globalTodoStageCutoff+1);
                        tRowUpdateRedrawTodo(table,this,thisData,false);
                }
            });
        }
        tRow.data().current = res.group; //overwrite the "current"
        tRowUpdateRedrawTodo(table,tRow,tRow.data(),false,tempNote);
    }});
}
function decreaseTodoCurrGroup(table,tRow,tempNote) {
    dbChangeGroup(tRow.data().mapName,-1).then((res) => { if (Number.isNaN(Number(res))) {
        if (tRow.data().current === groupLabels[0]) { //we had an incomplete map and now we don't
            //all the stages of the map are marked done now
            //if there's any stage todos we want to rerender them
            table.rows().every( function (rowIdx, tableLoop, rowLoop) {
                let thisData = this.data();
                if ( (thisData.mapName === tRow.data().mapName) //same map
                    && (thisData.todoType === "stage") //stage on that map
                    && (thisData.current == globalTodoStageCutoff) ) { //currently not done
                        thisData.current = ''+(globalTodoStageCutoff+1);
                        tRowUpdateRedrawTodo(table,this,thisData,false);
                }
            });
        }
        tRow.data().current = res.group; //overwrite the "current"
        tRowUpdateRedrawTodo(table,tRow,tRow.data(),false,tempNote);
    }});
}


//-------------------------------------------------------------- CHANGING CURRENT (STAGE/BONUS)

function increaseTodoCurrStage(table,tRow,tempNote) {
    dbChangeStage(tRow.data().mapName,tRow.data().number-1,1).then((res) => { if (Number.isNaN(Number(res))) {
        tRow.data().current = res.stage_pr.charAt(tRow.data().number-1);
        tRowUpdateRedrawTodo(table,tRow,tRow.data(),false,tempNote);
    }});
}
function decreaseTodoCurrStage(table,tRow,tempNote) {
    dbChangeStage(tRow.data().mapName,tRow.data().number-1,-1).then((res) => { if (Number.isNaN(Number(res))) {
        tRow.data().current = res.stage_pr.charAt(tRow.data().number-1);
        tRowUpdateRedrawTodo(table,tRow,tRow.data(),false,tempNote);
    }});
}

function increaseTodoCurrBonus(table,tRow,tempNote) {
    dbChangeBonus(tRow.data().mapName,tRow.data().number-1,1).then((res) => { if (Number.isNaN(Number(res))) {
        tRow.data().current = res.b_pr.charAt(tRow.data().number-1);
        tRowUpdateRedrawTodo(table,tRow,tRow.data(),false,tempNote);
    }});
}
function decreaseTodoCurrBonus(table,tRow,tempNote) {
    dbChangeBonus(tRow.data().mapName,tRow.data().number-1,-1).then((res) => { if (Number.isNaN(Number(res))) {
        tRow.data().current = res.b_pr.charAt(tRow.data().number-1);
        tRowUpdateRedrawTodo(table,tRow,tRow.data(),false,tempNote);
    }});
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------- SEARCH

$('#SearchBarTodo').on('keyup', function () {
    let query = this.value;
    let queryArr = query.toLowerCase().split(" ");
    
    let filtersArr = [];

    function isMapFilter(rowData) { return rowData.todoType === "group"; }
    function isStageFilter(rowData) { return rowData.todoType === "stage"; }
    function isBonusFilter(rowData) { return rowData.todoType === "bonus"; }

    const typeFilterRegex = /todo:(?<todotype>s(?:tage)?|b(?:onus)?|m(?:ap)?|g(?:roup)?|(?:in)?complete|done),?/i;
    const typeOrRegex =     /todo:(?<todotypes>(?:(?:s(?:tage)?|b(?:onus)?|m(?:ap)?|g(?:roup)?),)+(?:s(?:tage)?|b(?:onus)?|m(?:ap)?|g(?:roup)?)),?/i;
    function createTypeFilter(match) {
        let todoType;
        switch (match.groups.todotype) {
            case "s":
            case "stage":
                return isStageFilter;
                break;
            case "b":
            case "bonus":
                return isBonusFilter;
                break;
            case "m":
            case "map":
            case "g":
            case "group":
                return isMapFilter;
                break;
            case "incomplete":
                return function(x) { return !isTodoDone(x); }
                break;
            case "complete":
            case "done":
                return isTodoDone;
                break;
            default:
                return function(x) { return true; }
                break;
        }
    }
    function createTypeOrFilter(match) {
        let rawTypes = match.groups.todotypes.split(",");
        let types = [];
        for (let i=0; i<rawTypes.length; i++) {
            switch (rawTypes[i]) {
                case "s":
                case "stage":
                    types.push("stage");
                    break;
                case "b":
                case "bonus":
                    types.push("bonus");
                    break;
                case "m":
                case "map":
                case "g":
                case "group":
                    types.push("group");
                    break;
                default:
                    break;
            }
        }
        return function(rowData) {
            for (let i=0; i<types.length; i++) {
                if (rowData.todoType === types[i]) { return true; }
            }
            return false;
        }
    }


    const tierFilterRegex = /t(?:ier)?(?<filter>>|>=|<|<=|=)(?<num>\d+),?/i;
    const tierOrRegex     = /t(?:ier)?=(?<nums>(?:\d+,)+\d+),?/i;

    function createTierFilter(match) {
        let num = +match.groups.num;
        return function(rowData) {
            let tierNum = +rowData.mapTier;

            switch(match.groups.filter) {
                case ">":
                    return (tierNum > num);
                    break;
                case ">=":
                    return (tierNum >= num);
                    break;
                case "<":
                    return (tierNum < num);
                    break;
                case "<=":
                    return (tierNum <= num);
                    break;
                case "=":
                    return (tierNum == num);
                    break;
                default:
                    return true;
                    break;
            }
        }
    }
    function createTierOrFilter(match) {
        let nums = match.groups.nums.split(",");
        return function(rowData) {
            let tierNum = +rowData.mapTier;

            for (let i=0; i<nums.length; i++) {
                if (tierNum == +nums[i]) { return true; }
            }
            return false;
        }
    }



    /*
        goal:complete goal:pr
        goal:group6 goal:g6
        goal:top
        goal:wr goal:wrcp goal:wrb
        goal:improve
    */
    const goalFilterRegex = /g(?:oal)?(?<filter>>|>=|<|<=|=)(?<group>pr|comp(?:lete)?|g(?:roup)?[1-7]|top|wr(?:b|cp)?|imp(?:rove)?),?/i;
    const goalOrRegex = /g(?:oal)?=(?<groups>(?:(?:pr|comp(?:lete)?|g(?:roup)?[1-7]|top|wr(?:b|cp)?|imp(?:rove)?),)+(?:pr|comp(?:lete)?|g(?:roup)?[1-7]|top|wr(?:b|cp)?|imp(?:rove)?)),?/i;

    function createGoalFilter(match) {
        let group = match.groups.group;
        let groupi = -1;
        let stagei = -1;
        let bonusi = -1;
        switch (group) {
            case "pr":
            case "comp":
            case "complete":
                groupi = todoGroupLabels.indexOf("G7");
                stagei = todoStageLabels.indexOf("1");
                bonusi = todoBonusLabels.indexOf("1");
                break;
            case "g7":
            case "group7":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("G7");
                break;
            case "g6":
            case "group6":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("G6");
                break;
            case "g5":
            case "group5":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("G5");
                break;
            case "g4":
            case "group4":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("G4");
                break;
            case "g3":
            case "group3":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("G3");
                break;
            case "g2":
            case "group2":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("G2");
                break;
            case "g1":
            case "group1":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("G1");
                break;
            case "top":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("TOP");
                break;
            case "wr":
                filtersArr.push(isMapFilter);
                groupi = todoGroupLabels.indexOf("WR");
                break;
            case "wrb":
                filtersArr.push(isBonusFilter);
                bonusi = todoBonusLabels.indexOf("WR");
                break;
            case "wrcp":
                filtersArr.push(isStageFilter);
                stagei = todoStageLabels.indexOf("WR");
                break;
            case "imp":
            case "improve":
                groupi = todoGroupLabels.indexOf("IMP");
                stagei = todoStageLabels.indexOf("IMP");
                bonusi = todoBonusLabels.indexOf("IMP");
                break;
            default:
                return function(x) { return true; }
                break;
        }

        return function(rowData) {
            let labelsArr, num;
            switch (rowData.todoType) {
                case "group":
                    labelsArr = todoGroupLabels;
                    num = groupi;
                    break;
                case "stage":
                    labelsArr = todoStageLabels;
                    num = stagei;
                    break;
                case "bonus":
                    labelsArr = todoBonusLabels;
                    num = bonusi;
                    break;
                default:
                    return true;
                    break;
            }
            let rowField = labelsArr.indexOf(rowData.goal);
            switch (match.groups.filter) {
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
    function createGoalOrFilter(match) {
        let groups = match.groups.groups.split(",");
        let groupis = [];
        let stageis = [];
        let bonusis = [];
        let group;
        for (let i=0; i<groups.length; i++) { 
            group = groups[i];
            switch (group) {
                case "pr":
                case "comp":
                case "complete":
                    groupis.push(todoGroupLabels.indexOf("G7"));
                    stageis.push(todoStageLabels.indexOf("1"));
                    bonusis.push(todoBonusLabels.indexOf("1"));
                    break;
                case "g7":
                case "group7":
                    groupis.push(todoGroupLabels.indexOf("G7"));
                    break;
                case "g6":
                case "group6":
                    groupis.push(todoGroupLabels.indexOf("G6"));
                    break;
                case "g5":
                case "group5":
                    groupis.push(todoGroupLabels.indexOf("G5"));
                    break;
                case "g4":
                case "group4":
                    groupis.push(todoGroupLabels.indexOf("G4"));
                    break;
                case "g3":
                case "group3":
                    groupis.push(todoGroupLabels.indexOf("G3"));
                    break;
                case "g2":
                case "group2":
                    groupis.push(todoGroupLabels.indexOf("G2"));
                    break;
                case "g1":
                case "group1":
                    groupis.push(todoGroupLabels.indexOf("G1"));
                    break;
                case "top":
                    groupis.push(todoGroupLabels.indexOf("TOP"));
                    break;
                case "wr":
                    groupis.push(todoGroupLabels.indexOf("WR"));
                    break;
                case "wrb":
                    bonusis.push(todoBonusLabels.indexOf("WR"));
                    break;
                case "wrcp":
                    stageis.push(todoStageLabels.indexOf("WR"));
                    break;
                case "imp":
                case "improve":
                    groupis.push(todoGroupLabels.indexOf("IMP"));
                    stageis.push(todoStageLabels.indexOf("IMP"));
                    bonusis.push(todoBonusLabels.indexOf("IMP"));
                    break;
                default:
                    break;
            }
        }

        return function(rowData) {
            let labelsArr, nums;
            switch (rowData.todoType) {
                case "group":
                    labelsArr = todoGroupLabels;
                    nums = groupis;
                    break;
                case "stage":
                    labelsArr = todoStageLabels;
                    nums = stageis;
                    break;
                case "bonus":
                    labelsArr = todoBonusLabels;
                    nums = bonusis;
                    break;
                default:
                    return true;
                    break;
            }
            let rowField = labelsArr.indexOf(rowData.goal);

            for (let i=0; i<nums.length; i++) {
                if (rowField == nums[i]) { return true; }
            }
            return false;
        }
    }


    function createSearchFilter(word) {
        const wordRegex = new RegExp(word, "i");
        return function(rowData) {
            let searchStr = `${rowData.todoName} ${rowData.todo_note}`;
            let searchMatch = searchStr.match(wordRegex);
            if (searchMatch) { return true; }
            return false;
        }
    }

    let allFilters = [ //regex, filter that goes with it
        [typeFilterRegex, createTypeFilter], //stage, bonus, map/group
        [typeOrRegex, createTypeOrFilter], //OR ''
        [tierFilterRegex, createTierFilter], //tier... duh
        [tierOrRegex, createTierOrFilter], //OR ''
        [goalFilterRegex, createGoalFilter], //group, top, wr, improve etc
        [goalOrRegex, createGoalOrFilter] //OR ''
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

    table.search(function(rowStr,rowData,rowInd) {
        let isDisplayed = true;
        for (let i=0; i<filtersArr.length; i++) { //can't foreach because I want to break
            if (!filtersArr[i](rowData)) { isDisplayed = false; break; }
        }
        if (isDisplayed) { 
            // console.log(rowData); 
        }
        return isDisplayed;
    }).draw();
});



//-------------------------------------------------------------------------------------------------------------------------------------------------------- TABLE RENDERING

function tRowUpdateRedrawTodo(table,tRow,newData,keepCurrent,tempNote) {
    //"current" isn't stored in the database so we need to keep track of it
    //sometimes we just want to keep it from the old data to the new
    //sometimes we specifically want to change it (when we click on current)
    if (keepCurrent) { newData.current = tRow.data().current; }
    //now do the normal stuff
    if (tempNote) { newData.todo_note = tempNote; }
    newData.todoName = genTodoName(newData); //have to readd this
    tRow.data(newData);
    table.rows(tRow).draw(false); //keep the page we were on
}

function renderTodoTable(containerId) {
    let colNames = [];
    let cols = [];

    cols.push({data: 'todoName', render: todoNameRender, width: `${TodoTableNameWidth}%`}); //uses map name + todotype + todonum //
    colNames.push("Name");

    cols.push({data: 'goal', render: todoGoalRender, width: `${TodoTableGoalWidth}%`});
    colNames.push("Goal");

    cols.push({data: 'current', render: todoCurrRender, width: `${TodoTableCurrWidth}%`});
    colNames.push("Current");

    cols.push({data: 'original', render: todoOrigRender, width: `${TodoTableOrigWidth}%`});
    colNames.push("Original");
    
    cols.push({data: 'todo_note', render: todoNoteRender});
    colNames.push("Note");

    $(`#${containerId}`).html(`${createTableHeader(colNames)}<tbody></tbody>`);

    dbGetAllTodos().then((res) => { if (Array.isArray(res)) {

        res.forEach((row) => {
            row.todoName = genTodoName(row);
        });

        table = new DataTable(`#${containerId}`, {
            stateSave: true, //remembers what page you were on when you reload the page
            pageLength: todosPerPage,
            columns: cols,
            data: res,
            autoWidth: false,
            columnDefs: [
                { type: 'natural-ci', targets: '_all' }
            ],
            language: {
                entries: {
                    _: 'todos',
                    1: 'todo'
                },
                info: '(_TOTAL_ _ENTRIES-TOTAL_)',
                infoFiltered: '',
                infoEmpty: '(_TOTAL_ _ENTRIES-TOTAL_)',
                zeroRecords: '',
                emptyTable: 'No todos found'
            },
            layout: {
                topStart: null,
                topEnd: 'paging',
                bottomStart: null,
                bottomEnd: 'info'
            }
        });

        $('#SearchInfo').text( $("#TodoTable_info").text() );

        table.on('info.dt', function(e) {
            $('#SearchInfo').text( $("#TodoTable_info").text() );
        });


        table.on('contextmenu', function(e) {
            e.preventDefault();
        });


        table.on('mousedown', 'td', function(e) { if (e.which===1 || e.which===3) { //mouse1 and mouse2
            let tr  = $(this).closest('tr'); //contains info about placement

            let tempNote = null;
            if ($(':focus').hasClass('todo-note-text')) { //currently in a todo note right before clicking on this mousedown (mousedown runs before blur)
                if ($(':focus').closest('tr').is(tr)) { //this note is in the detail of "this" row
                    tempNote = $(':focus').val();
                }
            }

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
            let tRowData = tRow.data();

            switch (tCol) {
                case 0: //checkbox??
                    if (e.which===1 && e.target.classList.contains("todoCheckbox")) {
                        toggleTodoCheckbox(table,tRow,tempNote);
                    }
                    break;
                case 1: //goal
                    //gotta get current and original
                    //if they're both X then we pass a flag below
                    //so that we can't have "improve" as an option
                    let incompleteFlag = false;

                    switch (tRowData.todoType) {
                        case "group":
                            if (tRowData.current === groupLabels[0] && tRowData.original === groupLabels[0]) { incompleteFlag = true; }
                            if (e.which===1) { increaseTodoGoalGroup(table,tRow,incompleteFlag,tempNote); }
                            else if (e.which===3) { decreaseTodoGoalGroup(table,tRow,incompleteFlag,tempNote); }
                            break;
                        case "stage":
                            if (tRowData.current == globalTodoStageCutoff && tRowData.original === stageLabels[0]) { incompleteFlag = true; }
                            if (e.which===1) { increaseTodoGoalStage(table,tRow,incompleteFlag,tempNote); }
                            else if (e.which===3) { decreaseTodoGoalStage(table,tRow,incompleteFlag,tempNote); }
                            break;
                        case "bonus":
                            if (tRowData.current == globalTodoBonusCutoff && tRowData.original === bonusLabels[0]) { incompleteFlag = true; }
                            if (e.which===1) { increaseTodoGoalBonus(table,tRow,incompleteFlag,tempNote); }
                            else if (e.which===3) { decreaseTodoGoalBonus(table,tRow,incompleteFlag,tempNote); }
                            break;
                        default: //?
                            break;
                    }

                    break;
                case 2: //current
                    //change the maptable information, either +group or +stage or +bonus
                    //todoNum is the real stage number (indexed by 1)
                    //but the e.g. increaseStage argument is the index in the string (indexed by 0)
                    switch (tRowData.todoType) {
                        case "group":
                            if (e.which===1) { increaseTodoCurrGroup(table,tRow,tempNote); }
                            else if (e.which===3) { decreaseTodoCurrGroup(table,tRow,tempNote); }
                            break;
                        case "stage":
                            if (e.which===1) { increaseTodoCurrStage(table,tRow,tempNote); }
                            else if (e.which===3) { decreaseTodoCurrStage(table,tRow,tempNote); }
                            break;
                        case "bonus":
                            if (e.which===1) { increaseTodoCurrBonus(table,tRow,tempNote); }
                            else if (e.which===3) { decreaseTodoCurrBonus(table,tRow,tempNote); }
                            break;
                        default: //?
                            break;
                    }
                    break;
                case 3: //original
                    break;
                case 4: //note
                    break;
                default: //idk
                    break;
            }
        }});


        table.on('focusin', 'input[type="text"]', function(e) {
            globalCurrentNote = $(this);
            note_tempNoteStr = $(this).val();
        });
        table.on('blur', 'input[type="text"]', function(e) {
            let newText = $(this).val();
            if (newText !== note_tempNoteStr) {
                let parenttr = $(this).closest('tr'); //detail is always right after the parent
                let parenttRow = table.row(parenttr);
                saveTodoNote(table,parenttRow,newText);
            }
        });
        table.on('keydown', 'input[type="text"]', function(e) {
            if (e.keyCode === 27) { //escape, don't save
                e.preventDefault();
                $(this).val(note_tempNoteStr);
                $(this).blur();
            }
            if (e.keyCode === 13) { //enter
                $(this).blur();
            }
            if (e.keyCode === 38) {
                let prevRow = $(this).closest('tr').prev();
                if (prevRow.length>0) {
                    prevRow.find('input[type="text"]').focus();
                }
            }
            if (e.keyCode === 40) {
                let nextRow = $(this).closest('tr').next();
                if (nextRow.length>0) {
                    nextRow.find('input[type="text"]').focus();
                }
            }
        });
    }});
}


//-------------------------------------------------------------- OTHER TABLE RENDERS

function todoCheckboxRender(data,type,row) {
    switch (type) {
        case "display":
            if (data === 1) { return `<div><input type="checkbox" class="todoCheckbox" checked /></div>`; }
            else            { return `<div><input type="checkbox" class="todoCheckbox" /></div>`; }
            break;
        default:
            return "";
            break;
    }
}

function todoNameRender(data,type,row) {
    switch (type) {
        case "display":
            let classNames; 
            if (isTodoDone(row)) { classNames = `todocomp-cell-1`; }//classNames = localStorage.getItem(`todocomp-cell-1ClassName`); }
            else { classNames = `todocomp-cell-0`; }//classNames = localStorage.getItem(`todocomp-cell-0ClassName`); }

            let checkboxStr;
            if (row.removeCheckbox===1) { checkboxStr = " checked"; }
            else { checkboxStr = "";}
            return `<div class="name-cell"><input type="checkbox" class="todoCheckbox"${checkboxStr} /><div class="${classNames}"><b>${data}</b></div></div>`;

            break;
        default:
            return "";
            break;
    }
}

function makeSortVal(typeVal,currVal,origVal,idVal,stageVal) {
    //for sorting:
    //1. group > stage > bonus
    let exp1 = BigInt(todoBonusLabels.length + todoStageLabels.length + todoGroupLabels.length + 1);
    //2. if there's a tie then use current as tiebreaker (0,1,2 for stage/bonus, one of groupLabels for group)
    let exp2 = BigInt(groupLabels.length + 1);
    //3. if there's still a tie then use original as tiebreaker (same thing)
    let exp3 = BigInt(groupLabels.length + 1);
    // //4. if there's still a tie then use map id as tiebreaker (~800 maps ish)
    let exp4 = BigInt(15); //TODO: INCREASE THIS IN 2250 WHEN THERE ARE 2^15 MAPS
    //5. if there's still a tie (for stages/bonuses) then sort in stage/bonus order duh (max 30 stages so multiply by 2^5=32)
    let exp5 = BigInt(5);
    // return -1 * ( (((typeVal<<5) + currVal<<13) + idVal<<5) + stageVal );
    return BigInt(-1) * ( ((((BigInt(typeVal)<<exp1) + BigInt(currVal)<<exp2) + BigInt(origVal)<<exp3) + BigInt(idVal)<<exp4) + BigInt(stageVal) );
}
function todoGoalRender(data,type,row) {
    switch (row.todoType) {
        case "group":
            let groupi = todoGroupLabels.indexOf(data);
            let sortTypeVal_group = groupi;
            let sortCurrVal_group = groupLabels.indexOf(row.current);
            let sortOrigVal_group = groupLabels.indexOf(row.original);
            let sortIdVal_group = row.mapID;
            let sortStageVal_group = 0;
            switch (type) {
                case "display":
                    let cellInterior;
                    if (todoGroupIcons[groupi]) { 
                        cellInterior = `<div class="todo-cell-group-${data}"><i class="material-icons">${todoGroupContent[groupi]}</i></div>`;
                    }
                    else {
                        cellInterior = `<div class="todo-cell-group-${data}"><b>${todoGroupContent[groupi]}</b></div>`;
                    }
                    return `<div class="todo-goal-cell">${cellInterior}</div>`;
                    break;
                case "sort":
                    return makeSortVal(sortTypeVal_group, sortCurrVal_group, sortOrigVal_group, sortIdVal_group, sortStageVal_group); //above stage, bonus
                    break;
                default:
                    return "";
                    break;
            }
        case "stage":
            let stagei = todoStageLabels.indexOf(data);
            let sortTypeVal_stage = todoGroupLabels.length + stagei;
            let sortCurrVal_stage = normStageTodo(+row.current);
            let sortOrigVal_stage = +row.original;
            let sortIdVal_stage = row.mapID;
            let sortStageVal_stage = row.number;
            switch (type) {
                case "display":
                    let cellInterior;
                    if (todoStageIcons[stagei]) { 
                        cellInterior = `<div class="todo-cell-stage-${data}"><i class="material-icons">${todoStageContent[stagei]}</i></div>`;
                    }
                    else {
                        cellInterior = `<div class="todo-cell-stage-${data}"><b>${todoStageContent[stagei]}</b></div>`;
                    }
                    return `<div class="todo-goal-cell">${cellInterior}</div>`;
                    break;
                case "sort":
                    return makeSortVal(sortTypeVal_stage, sortCurrVal_stage, sortOrigVal_stage, sortIdVal_stage, sortStageVal_stage); //below group, above bonus
                    break;
                default:
                    return "";
                    break;
            }
        case "bonus":
            let bonusi = todoBonusLabels.indexOf(data);
            let sortTypeVal_bonus = todoGroupLabels.length + todoStageLabels.length + bonusi;
            let sortCurrVal_bonus = normBonusTodo(+row.current);
            let sortOrigVal_bonus = +row.original;
            let sortIdVal_bonus = row.mapID;
            let sortStageVal_bonus = row.number;
            switch (type) {
                case "display":
                    let cellInterior;
                    if (todoBonusIcons[bonusi]) { 
                        cellInterior = `<div class="todo-cell-bonus-${data}"><i class="material-icons">${todoBonusContent[bonusi]}</i></div>`;
                    }
                    else {
                        cellInterior = `<div class="todo-cell-bonus-${data}"><b>${todoBonusContent[bonusi]}</b></div>`;
                    }
                    return `<div class="todo-goal-cell">${cellInterior}</div>`;
                    break;
                case "sort":
                    return makeSortVal(sortTypeVal_bonus, sortCurrVal_bonus, sortOrigVal_bonus, sortIdVal_bonus, sortStageVal_bonus);
                    break;
                default:
                    return "";
                    break;
            }
        default:
            return "";
            break;
    }
}

function todoCurrRender(data,type,row) { //this is EXACTLY the render from the map table
    switch (type) {
        case "display":
            switch (row.todoType) {
                case "group":
                    return makeGroupDisplay(data);
                    break;
                case "stage":
                    return makeStageDisplay(data);
                    break;
                case "bonus":
                    return makeStageDisplay(data); //makeBonusDisplay adds another border around it
                    break;
                default:
                    return "";
                    break;
            }
            break;
        case "sort":
            switch (row.todoType) {
                case "group":
                    return -1 * groupLabels.indexOf(data);
                    break;
                case "stage":
                    return -1 * ( groupLabels.length + normStageTodo(+data) );
                    break;
                case "bonus":
                    return -1 * ( groupLabels.length + stageLabels.length + normBonusTodo(+data) ); //makeBonusDisplay adds another border around it
                    break;
                default:
                    return "";
                    break;
            }
            break;
        default:
            return "";
            break;
    }
}

function todoOrigRender(data,type,row) { //this is EXACTLY the render from the map table
    switch (type) {
        case "display":
            switch (row.todoType) {
                case "group":
                    return makeGroupDisplay(data);
                    break;
                case "stage":
                    return makeStageDisplay(data);
                    break;
                case "bonus":
                    return makeStageDisplay(data); //makeBonusDisplay adds another border around it
                    break;
                default:
                    return "";
                    break;
            }
            break;
        case "sort":
            switch (row.todoType) {
                case "group":
                    return -1 * groupLabels.indexOf(data);
                    break;
                case "stage":
                    return -1 * ( groupLabels.length + normStageTodo(+data) );
                    break;
                case "bonus":
                    return -1 * ( groupLabels.length + stageLabels.length + normBonusTodo(+data) ); //makeBonusDisplay adds another border around it
                    break;
                default:
                    return "";
                    break;
            }
            break;
        default:
            return "";
            break;
    }
}

function todoNoteRender(data,type,row) {
    switch (type) {
        case "display":
            return `<div class="note-cell"><input type="text" class="todo-note-text" value="${data}"/></div>`;
            break;
        default:
            return "";
            break;
    }
}

//-------------------------------------------------------------- REFACTORED

function makeGroupDisplay(cell) {
    let groupi = groupLabels.indexOf(cell);
    let cellInterior;//, classNames;
    if (groupIcons[groupi]) { //this is an icon
        cellInterior = `<div class="comp-cell-${cell}"><i class="material-icons">${groupContent[groupi]}</i></div>`;
    }
    else {
        cellInterior = `<div class="comp-cell-${cell}"><b>${groupContent[groupi]}</b></div>`;
    }
    return `<div class="group-cell">${cellInterior}</div>`;
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
    let cellInterior, classNames;
    if (!cell) { //null cell
        cellInterior = `<div class="null-cell"><i class="material-icons">remove</i></div>`;
    }
    else {
        cellInterior = `<div class="comp-cell-${stageLabels[stagei]}"><i class="material-icons">${stageContent[stagei]}</i></div>`;
    }
    return `<div class="stage-cell">${cellInterior}</div>`;
}

function makeBonusDisplay(cell) {
    //given "0" "1" or "2" for the string index
    //OR 3 4 5 for todo item
    let bonusi = +cell;
    let isBonusTodo = false;
    if (isBonusCellTodo(bonusi)) {
        bonusi -= globalTodoBonusCutoff;
        isBonusTodo = true;
    }
    let cellInterior;
    if (!cell) { //null cell
        cellInterior = `<div class="null-cell"><i class="material-icons">remove</i></div>`;
    }
    else {
        cellInterior = `<div class="comp-cell-${bonusLabels[bonusi]}"><i class="material-icons">${bonusContent[bonusi]}</i></div>`;
    }
    return `<div class="bonus-cell">${cellInterior}</div>`;
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------- UI INTERACTION BINDINGS

document.getElementById("DeleteSelectedTodoButton").onclick = function () { deleteMarkedTodos(); }

document.getElementById("DeleteDoneTodoButton").onclick = function () { deleteDoneTodos(); }



//-------------------------------------------------------------------------------------------------------------------------------------------------------- MAIN

document.addEventListener('DOMContentLoaded', onReadyFunc(renderTodoTable,tableID,false));