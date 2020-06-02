//#region Caching
function cacheShifts() {
  //just some variables
  var spreadsheet = SpreadsheetApp.getActive();
  var sheets = spreadsheet.getSheets();
  var ui = SpreadsheetApp.getUi();
  var sheetData = [];
  var sheetShifts = [];
  var shiftSplitter;
  var i, j;
  var weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  //checks to ensure the deployment sheets are configured properly
  for (i = 0; i < 7; i++) {
    if (sheets[i].getSheetName() != weekdays[i]) {
      ui.alert("Deployment Sheets are Not Configured Correctly.\n" +
        "Please make sure the first 7 sheets are ordered Monday-Sunday.");
      return;
    }
  }

  //get the data for each sheet
  for (i = 0; i < 7; i++) {
    sheetData = sheets[i].getRange(10, 3, 46, 2).getDisplayValues();
    for (j = 0; j < sheetData.length; j++) {
      //skip the lines that don't have shifts in the deployment sheets
      if (j == 10 || j == 14 || (j > 20 && j < 25) || j == 35 || j == 39) {
        continue;
      }
      if (sheetData[j][0] != "" && sheetData[j][1] != "") {
        //checks to see if the shift has a shift splitter in it meaning " train " or "/"
        if (sheetData[j][0].indexOf("/") > 0 || sheetData[j][0].indexOf(" train ") > 0) {
          if (sheetData[j][0].indexOf("/") > 0) {
            shiftSplitter = "/";
          }
          if (sheetData[j][0].indexOf(" train ") > 0) {
            shiftSplitter = " train ";
          }

          //if the shift has a / in it, the first part of the time is given to the first person, and the second part is given to the second person
          if (sheetData[j][1].indexOf("/") > 0) {
            sheetShifts.push(new Shift(sheetData[j][0].substring(0, sheetData[j][0].indexOf(shiftSplitter)), sheetData[j][1].substring(0, sheetData[j][1].indexOf("/")), i, j, true, sheetData[j][0].substring(sheetData[j][0].indexOf(shiftSplitter) + shiftSplitter.length), true, sheetData[j][1].substring(sheetData[j][1].indexOf("/") + 1), 0));
            sheetShifts.push(new Shift(sheetData[j][0].substring(sheetData[j][0].indexOf(shiftSplitter) + shiftSplitter.length), sheetData[j][1].substring(sheetData[j][1].indexOf("/") + 1), i, j, true, sheetData[j][0].substring(0, sheetData[j][0].indexOf(shiftSplitter)), true, sheetData[j][1].substring(0, sheetData[j][1].indexOf("/")), 1));
          }
          else { //else both people get the shift time
            sheetShifts.push(new Shift(sheetData[j][0].substring(0, sheetData[j][0].indexOf(shiftSplitter)), sheetData[j][1], i, j, true, sheetData[j][0].substring(sheetData[j][0].indexOf(shiftSplitter) + shiftSplitter.length), false, "", 0));
            sheetShifts.push(new Shift(sheetData[j][0].substring(sheetData[j][0].indexOf(shiftSplitter) + shiftSplitter.length), sheetData[j][1], i, j, true, sheetData[j][0].substring(0, sheetData[j][0].indexOf(shiftSplitter)), false, "", 1));
          }
        }
        else { //if no shift splitter is present, then the shift is added the the array
          sheetShifts.push(new Shift(sheetData[j][0], sheetData[j][1], i, j));
        }
      }
      else if ((sheetData[j][0] == "" && sheetData[j][1] != "") || (sheetData[j][0] != "" && sheetData[j][1] == "")) {
        ui.alert(`Shift on ${weekdays[i]} at cell row ${j + 10} is missing a name or shift time.`);
      }
    }
  }

  var cache = CacheService.getDocumentCache();
  cache.put('shifts', JSON.stringify(sheetShifts));
  ui.alert(JSON.stringify(sheetShifts));
}

function cacheEmployeeSchedules() {
  //get the shifts from the cache
  const shifts = fetchShifts();
  shifts.sort(compareDeploymentNames);
  var ui = SpreadsheetApp.getUi();

  //get the employeeData from the cache, there is no need to use the fetch employee data function because we only need to access one part of the object
  var cache = CacheService.getDocumentCache();
  var employeeDataCache = cache.get("employeeData");
  if (employeeDataCache == null) {
    SpreadsheetApp.getActive().toast("Caching Employee Data");
    cacheEmployeeData();
    employeeDataCache = cache.get("employeeData");
  }
  const employeeData = JSON.parse(employeeDataCache);

  //some variables used during the loop
  var i, j;
  var employeeDataFind;
  var currScheduleName;
  var currUpdateName, currUpdateDeploymentName, currUpdateScheduleName;
  var currShifts = [], currName, currShift;
  var employeeSchedules = [];
  var employeeFind, employeeFindIndex;

  for (i = 0; i < shifts.length;) {
    //sets the current name and resets the currShifts array
    currName = shifts[i].deploymentName;
    currShifts = [];

    //this fills the current shifts array with all the shifts for each name
    while (i < shifts.length && shifts[i].deploymentName == currName) {
      currShifts.push(shifts[i]);
      i++;
    }

    //this gets the schedule name if it can be found
    employeeDataFind = employeeData.find(function (element) {
      return element.deploymentName == currName;
    });
    if (employeeDataFind == undefined) {
      currUpdateName = scheduleNameLookup(currShifts, employeeData);

      //updates the current employee name and schedule name
      currName = currUpdateName.substring(16, currUpdateName.indexOf(','));
      currScheduleName = currUpdateName.substring(currUpdateName.indexOf(',') + 16);
      //loops through the current shifts and updates their names
      for (j = 0; j < currShifts.length; j++) {
        currShifts[j].deploymentName = currUpdateDeploymentName;
      }
      //ui.alert(`Deployment Name is ${currUpdateName.substring(16,currUpdateName.indexOf(','))}\nSchedule Name is ${currUpdateName.substring(currUpdateName.indexOf(',')+16)}`);
    }
    else {
      currScheduleName = employeeDataFind.scheduleName;
    }

    //searches through the current list of employee schedules to see if one with the same schedule name already exists
    employeeFind = employeeSchedules.find(function (element) {
      return element.scheduleName == currScheduleName;
    });
    //if an employee schedule with the same schedule name already exists, a new employee schedule is created in place of the old one that combines both sets of shifts
    if (employeeFind == undefined) {
      // ui.alert(`${currScheduleName} added as new employee`);
      employeeSchedules.push(new EmployeeSchedule(currName, currScheduleName, currShifts));
    }
    else {
      // ui.alert(`${currScheduleName} already exists in the list of employees`);
      // ui.alert(employeeFind);
      employeeFindIndex = employeeSchedules.indexOf(employeeFind);
      employeeSchedules[employeeFindIndex] = new EmployeeSchedule(currName, currScheduleName, employeeFind.shifts.concat(currShifts), employeeFind.errors);
      // ui.alert(employeeSchedules[employeeFindIndex]);
    }
  }

  cache.put('employeeSchedules', JSON.stringify(employeeSchedules));
  // ui.alert(JSON.stringify(employeeSchedules));
}

function cacheSchedule() {
  var cache = CacheService.getDocumentCache();
  var employeeSchedules = fetchEmployeeSchedules();

  let sheetDate = SpreadsheetApp.getActive().getSheetByName("Monday").getRange(2, 6).getDisplayValue();
  let date = sheetDate.substring(5);
  let ui = SpreadsheetApp.getUi();

  let mySchedule = new Schedule(employeeSchedules, date);
  let scheduleJSON = JSON.stringify(mySchedule);
  cache.put('schedule', scheduleJSON);

  // ui.alert(scheduleJSON);
}

function cacheEmployeeData() {
  var spreadsheet = SpreadsheetApp.getActive();
  spreadsheet.toast("Caching Employee Data");
  var employeeDataSheet = spreadsheet.getSheetByName("Employee Data");
  var employeeSD = employeeDataSheet.getDataRange().getDisplayValues();
  var cache = CacheService.getDocumentCache();

  var i, j;
  var employeeData = [];
  var currentAvailability, currentPositionRanks;
  var dNC, sNC, bC, hDC, pNC, aC, mSC, mHC, pRC, hC;

  for (i = 0; i < employeeSD[0].length; i++) {
    if (employeeSD[0][i] == "Deployment Name") {
      dNC = i; //deployment name column
    }
    if (employeeSD[0][i] == "Schedule Name") {
      sNC = i; //schedule name column
    }
    if (employeeSD[0][i] == "Birthday") {
      bC = i; //birthday column
    }
    if (employeeSD[0][i] == "Hire Date") {
      hDC = i; //hire date column
    }
    if (employeeSD[0][i] == "Phone Number") {
      pNC = i; //phone number column
    }
    if (employeeSD[0][i] == "Monday") {
      aC = i; //monday column
    }
    if (employeeSD[0][i] == "Max Shifts Per Week") {
      mSC = i; //max shifts column
    }
    if (employeeSD[0][i] == "Max Allowed Hours") {
      mHC = i; //max allowed hours column
    }
    if (employeeSD[0][i] == "Runner Rank") {
      pRC = i; //position rank column
    }
    if (employeeSD[0][i] == "House") {
      hC = i; //house column
    }
  }

  for (i = 1; i < employeeSD.length; i++) {
    currentAvailability = [];
    currentPositionRanks = [];
    for (j = aC; j < aC + 7; j++) {
      currentAvailability.push(employeeSD[i][j]);
    }
    for (j = pRC; j < pRC + 7; j++) {
      currentPositionRanks.push(employeeSD[i][j]);
    }
    employeeData.push(new Employee(employeeSD[i][dNC], employeeSD[i][sNC], employeeSD[i][bC], employeeSD[i][bC + 1], employeeSD[i][hDC], employeeSD[i][pNC], currentAvailability, employeeSD[i][mSC], employeeSD[i][mHC], currentPositionRanks, employeeSD[i][hC]));
  }

  cache.put('employeeData', JSON.stringify(employeeData), 216000);
}

function clearCache() {
  var cache = CacheService.getDocumentCache();
  cache.remove('shifts');
  cache.remove('employeeSchedules');
  cache.remove("schedule");
}
//#endregion
//#region Fetchers
function fetchShifts() {
  var cache = CacheService.getDocumentCache();
  var JSONShifts = cache.get('shifts');
  var i;

  if (JSONShifts == null) {
    SpreadsheetApp.getActive().toast("Caching shifts.");
    cacheShifts();
    JSONShifts = cache.get('shifts');
  }

  var shiftsObjArray = JSON.parse(JSONShifts);
  var shifts = [];

  for (i = 0; i < shiftsObjArray.length; i++) {
    shifts.push(new Shift(shiftsObjArray[i].deploymentName, shiftsObjArray[i].deploymentShift, shiftsObjArray[i].weekday, shiftsObjArray[i].row, shiftsObjArray[i].multiDeployment, shiftsObjArray[i].deploymentPair, shiftsObjArray[i].timeSplit, shiftsObjArray[i].timePair, shiftsObjArray[i].pairNumber, shiftsObjArray[i].midShift, shiftsObjArray[i].midShiftPairs));
  }

  return shifts;
}

function fetchEmployeeSchedules() {
  var cache = CacheService.getDocumentCache();
  var JSONEmployeeSchedules = cache.get('employeeSchedules');
  var i;
  var ui = SpreadsheetApp.getUi();

  if (JSONEmployeeSchedules == null) {
    SpreadsheetApp.getActive().toast("Caching Employee Schedules.");
    cacheEmployeeSchedules();
    JSONEmployeeSchedules = cache.get('employeeSchedules');
  }

  var employeeScheduleArray = JSON.parse(JSONEmployeeSchedules);
  var employeeSchedules = [];

  for (i = 0; i < employeeScheduleArray.length; i++) {
    employeeSchedules.push(new EmployeeSchedule(employeeScheduleArray[i].deploymentName, employeeScheduleArray[i].scheduleName, employeeScheduleArray[i].shifts, employeeScheduleArray[i].errors));
  }
  // ui.alert(JSON.stringify(employeeSchedules));
  return employeeSchedules;
}

function fetchSchedule() {
  let cache = CacheService.getDocumentCache();
  let JSONSchedule = cache.get("schedule");

  if (JSONSchedule == null) {
    SpreadsheetApp.getActive().toast('Caching Schedule');
    cacheSchedule();
    JSONSchedule = cache.get("schedule");
  }

  let schedule = JSON.parse(JSONSchedule);

  let mySchedule = new Schedule(schedule.employeeSchedules, schedule.dateString);
  return mySchedule;
}
//#endregion
//#region Schedule Builder
function buildScheduleFromCache() {
  let scheduleObj = fetchSchedule();
  let scheduleSheet = SpreadsheetApp.getActive().getSheetByName("Copy of Schedule");
  let ui = SpreadsheetApp.getUi();
  const scheduleColumns = 11;

  scheduleSheet.getRange(2, 1, 74, scheduleColumns).clearContent();
  if (scheduleSheet.getFilter()) {
    scheduleSheet.getFilter().remove();
  }

  scheduleSheet.getRange(1, 3, 1, 7).setValues([scheduleObj.weekdayHeader]);
  scheduleSheet.getRange(1, 2).setValue("Hours\n" + scheduleObj.totalHours);


  let scheduleArray = [];
  for (let employeeSchedule of scheduleObj.employeeSchedules) {
    scheduleArray.push(employeeSchedule.scheduleArray);
  }
  scheduleArray.sort(compareArrayFirstEle);

  scheduleSheet.getRange(2, 1, scheduleArray.length, scheduleColumns).setValues(scheduleArray);
  scheduleSheet.getRange(1, 1, scheduleArray.length + 1, scheduleColumns).createFilter().sort(1, true);
}

function getScheduleName(nameToFind) {
  var cache = CacheService.getDocumentCache();
  var employeeDataCache = cache.get("employeeData");

  if (employeeDataCache == null) {
    ui.alert("Caching Employee Data");
    cacheEmployeeData();
    employeeDataCache = cache.get("employeeData");
  }

  var employeeData = JSON.parse(employeeDataCache);
  var employeeDataFind = employeeData.find(function (element) {
    return element.deploymentName == nameToFind;
  });

  if (employeeDataFind == undefined) {
    return nameToFind;
  }
  return employeeDataFind.scheduleName;
}

function scheduleNameLookup(shifts, employeeData) {
  var ui = SpreadsheetApp.getUi();
  var i;
  var foundScheduleName = 'none', userScheduleName, foundDeploymentName, userDeploymentName;
  var firstCharacterMatch = [];
  var scheduleNameFound = false;
  var alertResult;
  var dNamePromptResult, sNamePromptResult
  var shift = shifts[0];
  if (shifts == undefined) {
    ui.alert("shifts undefined");
    return `DeploymentName: nameFinderError, ScheduleName: nameFinderError`;
  }
  for (i = 0; i < employeeData.length; i++) {
    if (employeeData[i].deploymentName.charAt(0) == shift.deploymentName.charAt(0)) {
      firstCharacterMatch.push(employeeData[i]);
    }
  }

  for (i = 0; i < firstCharacterMatch.length && !scheduleNameFound; i++) {
    //based on the first character of the deployment name, the user is prompted to confirm a matching deployment name and schedule name as if the sheet deployment name was an error
    alertResult = ui.alert(`Name Match Finder (${i + 1}/${firstCharacterMatch.length})`, `Schedule name for ${shift.deploymentName} could not be found, did you mean\nto enter ${firstCharacterMatch[i].deploymentName} with schedule name ${firstCharacterMatch[i].scheduleName}?\nPress 'Cancel' or 'X' to go to name input.`, ui.ButtonSet.YES_NO_CANCEL);

    //if the user confirms that this is in fact the correct name, the deployment name is updated on the sheet and the schedule name is returned
    if (alertResult == ui.Button.YES) {
      foundScheduleName = firstCharacterMatch[i].scheduleName;
      foundDeploymentName = firstCharacterMatch[i].deploymentName;
      scheduleNameFound = true;
      shiftNameUpdater(shifts, foundDeploymentName);
      ui.alert("Schedule name and deployment name found from name match finder");
      // return "none"
      return `DeploymentName: ${foundDeploymentName}, ScheduleName: ${foundScheduleName}`;
    }

    if (alertResult == ui.Button.CANCEL || alertResult == ui.Button.CLOSE) {
      break;
    }
  }

  if (!scheduleNameFound) {
    dNamePromptResult = ui.prompt('Deployment Name Input', `Schedule name for ${shift.deploymentName} could not be found, please enter\na deployment name to be matched or press 'Cancel' or 'X'\nto skip and keep this deployment name.`, ui.ButtonSet.OK_CANCEL);

    //if the user chooses to enter a user deployment name, the employee data is searched to see if a matching schedule name could be found
    //else if the user chooses not to enter a deployment name, the user is prompted for a schedule name to go with the deployment name temporarily
    if (dNamePromptResult.getSelectedButton() == ui.Button.OK) {
      userDeploymentName = dNamePromptResult.getResponseText();

      //searches through the employee names to see if one of them matches with a schedule name
      var employeeDataFind = employeeData.find(function (element) {
        return element.deploymentName == userDeploymentName;
      });

      //if a schedule name to match the user deployment name is not found in the employee data, then the user is prompted to enter a schedule name
      //else the matched schedule name for the user deployment name is returned
      if (employeeDataFind == undefined) {
        sNamePromptResult = ui.prompt('Schedule Name Input', `Schedule name for ${userDeploymentName} could not be found, please enter\na schedule name or press 'Cancel' or 'X' to skip.`, ui.ButtonSet.OK_CANCEL);

        if (sNamePromptResult.getSelectedButton() == ui.Button.OK) {
          userScheduleName = sNamePromptResult.getResponseText();
          shiftNameUpdater(shifts, userDeploymentName);
          ui.alert("User deployment name and schedule name entered");
          // return 'none';
          return `DeploymentName: ${userDeploymentName}, ScheduleName: ${userScheduleName}`;
          // return userScheduleName;
        }
        else {
          userScheduleName = userDeploymentName;
          ui.alert("user did not enter a schedule name for the entered deployment name");
          shiftNameUpdater(shifts, userDeploymentName);
          // return 'none';
          return `DeploymentName: ${userDeploymentName}, ScheduleName: ${userDeploymentName}`;
          // return userScheduleName;
        }
      }
      else {
        foundScheduleName = employeeDataFind.scheduleName;
        shiftNameUpdater(shifts, userDeploymentName);
        ui.alert("user entered deployment name was matched with a schedule name");
        // return 'none';
        return `DeploymentName: ${userDeploymentName}, ScheduleName: ${foundScheduleName}`;
        // return foundScheduleName;
      }
    }
    else {
      sNamePromptResult = ui.prompt('Schedule Name Input', `Schedule name for ${shift.deploymentName} could not be found, please enter\na temporary schedule name or press 'Cancel' or 'X' to skip.`, ui.ButtonSet.OK_CANCEL);

      if (sNamePromptResult.getSelectedButton() == ui.Button.OK) {
        userScheduleName = sNamePromptResult.getResponseText();
        ui.alert("user did not enter a new deployment name but entered a temporary schedule name");
        // return 'none';
        return `DeploymentName: ${shift.deploymentName}, ScheduleName: ${userScheduleName}`;
        // return userScheduleName
      }
      else {
        userScheduleName = userDeploymentName;
        ui.alert("user did not enter a new deployment name and did not enter a temporary schedule name");
        // return 'none';
        return `DeploymentName: ${shift.deploymentName}, ScheduleName: ${shift.deploymentName}`;
        // return userScheduleName;
      }
    }
  }

  return `DeploymentName: nameFinderError, ScheduleName: nameFinderError`;
}

function shiftNameUpdater(shifts, updateName) {
  const sheets = SpreadsheetApp.getActive().getSheets();
  let currShift, currShiftValue;
  let currRange;
  let shiftSplitter;
  let splitShiftNames = [];
  let newName;
  // let ui = SpreadsheetApp.getUi();
  // ui.alert(`Updating name ${shifts[0].deploymentName} to ${updateName}`);

  //loops through all of the shifts to update their values on the deployment sheets
  for (currShift of shifts) {
    currRange = sheets[currShift.weekday].getRange(currShift.row + 10, 3)
    currShiftValue = currRange.getDisplayValue();

    //if the shift is a split shift, split the split shift into its names
    if (currShiftValue.indexOf("/") > 0 || currShiftValue.indexOf(" train ") > 0) {
      if (currShiftValue.indexOf("/") > 0) {
        shiftSplitter = "/";
      }
      if (currShiftValue.indexOf(" train ") > 0) {
        shiftSplitter = " train ";
      }
      splitShiftNames = currShiftValue.split(shiftSplitter);

      //determine which name in the split shift needs to be updated
      if (splitShiftNames.length == 2) {
        if (splitShiftNames[0] == currShift.deploymentName) {
          splitShiftNames[0] = updateName;
        }
        else if (splitShiftNames[1] == currShift.deploymentName) {
          splitShiftNames[1] = updateName;
        }
        else {
          console.log("Something went wrong!");
        }
        //combines the split shift
        newName = splitShiftNames[0] + shiftSplitter + splitShiftNames[1];
      }
    }
    else {
      newName = updateName;
    }
    // ui.alert(`Updating shift on day ${currShift.weekday} from ${currShiftValue} to ${newName}`);
    currRange.setValue(newName);
  }
}
//#endregion
function compareDeploymentNames(a, b) {
  let personA = a.deploymentName;
  let personB = b.deploymentName;

  let comparison = 0;
  if (personA > personB) {
    comparison = 1;
  } else if (personA < personB) {
    comparison = -1;
  }
  return comparison;
}

function compareArrayFirstEle(a, b) {
  if (a[0] === b[0]) {
    return 0;
  }
  else {
    return (a[0] < b[0]) ? -1 : 1;
  }
}

function outputWeekdayShifts() {
  let schedule = fetchSchedule();
  let ui = SpreadsheetApp.getUi();

  for (let i = 0; i < 7; i++) {
    ui.alert(schedule.getWeekdayShifts(i).join('\n'));
  }
}

// function onEdit(e) //this function records a change log for the edits in the deployment sheets
// {
//   var range = e.range;
//   //checks to see if the edit is made to a shift in a deployment sheet
//   if(range.getSheet().getIndex() < 8 && range.getRow() > 9 && range.getRow() < 56 && range.getColumn() > 2 && range.getColumn() < 5)
//   {
//     var oldCellValue = e.oldValue;
//     var newCellValue = e.value;
//     var editType;
//     var correspondingCell;
//     /*
//     there are 3 types of edits:
//     1. add, where the old cell value is blank
//     2. delete, where the new cell value is blank
//     3. modify, where the old and new cell value are not blank
//     */
//     if(oldCellValue == null)
//     {
//       editType = "Add";
//       oldCellValue = "";
//       if(e.value.oldValue)
//     }
//     else if(e.value.oldValue)
//     {
//       editType = "Delete";
//       newCellValue = "";
//     }
//     else    
//       editType = "Modify";

//     /*
//     there are two types of changes, one for the shift time and one for the person
//     the corresponding cell value is the shift time, if a change is made to the person
//     the corresponding cell value is the person, if a change is made to the shift time
//     */
//     var changeType;
//     if(range.getColumn() == 3)
//     {
//       changeType = "Person";
//       correspondingCell = range.offset(0,1).getDisplayValue();
//     }
//     else
//     {
//       changeType = "Shift";
//       correspondingCell = range.offset(0,-1).getDisplayValue();
//     }
//     //this adds the range in A1 notation and date to the recorded information on the changelog
//     var cell = range.getA1Notation();
//     var days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
//     var day = days[range.getSheet().getIndex()-1];

//     //this adds the change to the changelog sheet
//     var editDetails = [[editType,changeType,oldCellValue,newCellValue,correspondingCell,cell,day]];
//     var changelogSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Changelog");
//     var numberOfChanges = changelogSheet.getRange("H2").getValue();
//     changelogSheet.getRange(numberOfChanges+2,1,1,7).setValues(editDetails);
//   }
// }

function onEdit(e) {
  let range = e.range;
  SpreadsheetApp.getActive().toast(range.getA1Notation());
  if (range.getSheet().getIndex() < 8 && range.getRow() > 9 && range.getRow() < 56 && range.getColumn() > 2 && range.getColumn() < 5) {
    if (range.getNumRows() == 1) {
      let oldCellValue = e.oldValue;
      let newCellValue = e.value;

      //set up the values
      if (range.getColumn() == 3) {
        var singleRowChange = { changeType: "name" };
        singleRowChange.name = newCellValue;
        singleRowChange.shift = range.offset(0, 1).getDisplayValue(); //gets the value of the shift
        singleRowChange.oldValue = oldCellValue;
      }
      else if (range.getColumn() == 4) {
        var singleRowChange = { changeType: "shift" };
        singleRowChange.shift = newCellValue;
        singleRowChange.name = range.offset(0, -1).getDisplayValue(); //gets the value fo the name
        singleRowChange.oldValue = oldCellValue;
      }
      singleRowChange.day = range.getSheet().getIndex() - 1;
      singleRowChange.row = range.getRow();

      //update the values and determine if the shift was added, deleted or modified
      singleRowChange.delete = false;
      singleRowChange.add = false;
      singleRowChange.modify = false;
      if (singleRowChange.oldValue == undefined) {
        singleRowChange.oldValue = "";
        singleRowChange.add = true;
      }
      else if (newCellValue == undefined) {
        if (singleRowChange.changeType == "name") {
          singleRowChange.name = "";
        }
        else {
          singleRowChange.shift = "";
        }
        singleRowChange.delete = true;
      }
      else {
        singleRowChange.modify = true;
      }

      //handle the updates to the schedule
      if (singleRowChange.add && singleRowChange.name != "" && singleRowChange.shift != "") {
        addToSchedule(singleRowChange);
        SpreadsheetApp.getActive().toast("add change success");
      }
      else if (singleRowChange.delete && ((singleRowChange.name == "" && singleRowChange.shift != "") || ((singleRowChange.name != "" && singleRowChange.shift == "")))) {
        // deleteFromSchedule(singleRowChange);
        SpreadsheetApp.getActive().toast("delete change success");
      }
    }
  }
  //edits in the schedule
  if (range.getSheet().getSheetName() == "Schedule") {
    let rangeRow = range.getRow();
    let rangeColumn = range.getColumn();

    //if the cell is within the bounds of the schedule
    if (rangeRow > 1 && rangeColumn > 2 && rangeColumn < 10) {
      let oldCellValue = e.oldValue;
      let newCellValue = e.value;

      //if the cell your are editing is not blank, then it will be changed
      if (oldCellValue != undefined) {
        //deleting a shift from the schedule
        if (newCellValue == undefined) {
          //get schedule object from cache
          let mySchedule = fetchSchedule();
          let ui = SpreadsheetApp.getUi();
          ui.alert(JSON.stringify(mySchedule));

          //get the schedule name of the person we deleted from
          let deletedScheduleName = range.offset(0, 1 - rangeColumn).getDisplayValue();
          let deleteSchedule = mySchedule.getEmployeeScheduleSName(deletedScheduleName);
          let deletedShift = deleteSchedule.shifts[rangeColumn - 3];

          //get shift object from schedule to match the shift we delete from the schedule sheet
          let deleteScheduleIndex = mySchedule.deleteShiftFromSName(deletedScheduleName, rangeColumn - 3);

          //update the employee schedule hours, the weekday header and the total hours
          range.offset(0, 2 - rangeColumn).setValue(mySchedule.employeeSchedules[deleteScheduleIndex].hours);
          range.offset(1 - rangeRow, 0).setValue(mySchedule.weekdayHeader[rangeColumn - 3]);
          range.offset(1 - rangeRow, 2 - rangeColumn).setValue("Hours\n" + mySchedule.totalHours);

          //remove the shift from the deployment sheet
          let sheets = SpreadsheetApp.getActive().getSheets();
          let updateSheet = sheets[rangeColumn - 3];
          if (deletedShift.midShift) {
            SpreadsheetApp.getActive().toast("Mid shift not updated");
          }

          if (deletedShift.multiDeployment) { //if the shift is a multi deployment, the pair with it is set as the cell value
            updateSheet.getRange(deletedShift.row + 10, 3, 1, 1).setValue(deletedShift.deploymentPair);
            if (deletedShift.timeSplit) {
              updateSheet.getRange(deletedShift.row + 10, 4, 1, 1).setValue(deletedShift.timePair);
            }
          }
          else {
            updateSheet.getRange(deletedShift.row + 10, 3, 1, 2).clearContent();
          }
          ui.alert(JSON.stringify(mySchedule));

          let cache = CacheService.getDocumentCache();
          cache.put('schedule', JSON.stringify(mySchedule));
          // SpreadsheetApp.getActive().toast("Shift Delete Success");
        }
        //modifying a shift from the schedule
        if (newCellValue != undefined) {
          SpreadsheetApp.getActive().toast("Shift change");
          //get the schedule from the cache
          let mySchedule = fetchSchedule();

          //get the schedule of the peron's shift we modified
          let modifiedShiftName = range.offset(0, 1 - rangeColumn).getDisplayValue();
          let modifiedSchedule = mySchedule.getEmployeeScheduleSName(modifiedShiftName);
          let modifiedShift = modifiedSchedule.shifts[rangeColumn - 3];

          //check to make sure that the new shift is valid
          let shiftSplit = newCellValue.split("--");
          if (shiftSplit.length != 2) {
            SpreadsheetApp.getActive().toast("The updated shift is not valid");
          }
          else if (Number(shiftSplit[0]) == NaN) {
            SpreadsheetApp.getActive().toast("The updated shift is not valid");
          }
          else if (Number(shiftSplit[1]) == NaN) {
            SpreadsheetApp.getActive().toast("The updated shift is not valid");
          }
          else if (shiftSplit[0] == "") {
            SpreadsheetApp.getActive().toast("The updated shift is not valid");
          }
          else if (shiftSplit[1] == "") {
            SpreadsheetApp.getActive().toast("The updated shift is not valid");
          }
          else {
            //if the new shift time is valid, then update the shift on the schedule
            SpreadsheetApp.getActive().toast("The updated shift is valid");
            let modifiedScheduleIndex = mySchedule.modifyShiftFromSName(modifiedShiftName, newCellValue, rangeColumn - 3);

            //update the hours on the schedule sheet
            range.offset(0, 2 - rangeColumn).setValue(mySchedule.employeeSchedules[modifiedScheduleIndex].hours);
            range.offset(1 - rangeRow, 0).setValue(mySchedule.weekdayHeader[rangeColumn - 3]);
            range.offset(1 - rangeRow, 2 - rangeColumn).setValue("Hours\n" + mySchedule.totalHours);

            //remove the shift from the deployment sheet
            let sheets = SpreadsheetApp.getActive().getSheets();
            let updateSheet = sheets[rangeColumn - 3];
            if (modifiedShift.midShift) {
              SpreadsheetApp.getActive().toast("Mid shift not updated");
            }

            if(modifiedShift.multiDeployment && (newCellValue != modifiedShift.timePair)) { //if the shift is a time split, the cell for the time split is updated
              if(modifiedShift.pairNumber == 0) {
                updateSheet.getRange(modifiedShift.row + 10, 4, 1, 1).setValue(`${newCellValue}/${modifiedShift.timePair}`);
              }
              else if(modifiedShift.pairNumber == 1) {
                updateSheet.getRange(modifiedShift.row + 10, 4, 1, 1).setValue(`${modifiedShift.timePair}/${newCellValue}`);
              }
            }
            else {
              updateSheet.getRange(modifiedShift.row + 10, 4, 1, 1).setValue(newCellValue);
            }
          }
        }
      }
    }
  }
}

function addToSchedule(change) {
  let mySchedule = fetchSchedule();

  changeShift = new Shift(change.name, change.shift, change.day, change.row);
  let ui = SpreadsheetApp.getUi();
  // mySchedule.
}