function copySchedule() {
  var spreadsheet = SpreadsheetApp.getActive();
  var scheduleSheet = spreadsheet.getSheetByName("Schedule");
  var comparerSheet = spreadsheet.getSheetByName("Schedule Comparer");
  var ui = SpreadsheetApp.getUi();
  buildSchedule();
  var i = 0, j = 0;

  var scheduleRows = scheduleSheet.getFilter().getRange().getNumRows();
  var scheduleNames = scheduleSheet.getRange(2, 1, scheduleRows - 1, 1).getDisplayValues();
  var scheduleShifts = scheduleSheet.getRange(2, 3, scheduleRows - 1, 7).getDisplayValues();
  var shift;
  var shiftSplit = [];
  var shiftTimeValues = [];
  var timeSplit = [];
  var time1, time2;
  var time1Decimal, time2Decimal;
  var stringTime1, stringTime2;
  var time1AMPM, time2AMPM;

  comparerSheet.getRange(3, 1, 75, 8).clearContent();

  if (scheduleSheet.getRange("J76").getDisplayValue() === "Schedule View") {
    for (i = 0; i < scheduleShifts.length; i++) {
      for (j = 0; j < scheduleShifts[0].length; j++) {
        scheduleShifts[i][j] = scheduleShifts[i][j].replace("--", "-");
      }
    }
  }
  if (scheduleSheet.getRange("J76").getDisplayValue() === "Deployment View") {
    for (i = 0; i < scheduleShifts.length; i++) //update index
    {
      for (j = 0; j < scheduleShifts[0].length; j++) {
        //ui.alert(scheduleShifts);
        shift = scheduleShifts[i][j];
        if (shift == "")
          continue;
        shiftSplit = shift.split("--");
        if (shiftSplit[0].indexOf(":") > 0) {
          timeSplit = shiftSplit[0].split(":");
          shiftTimeValues[0] = Number(timeSplit[0]) + (Number(timeSplit[1]) / 60);
        }
        else
          shiftTimeValues[0] = Number(shiftSplit[0]);

        if (shiftSplit[1] === "CL") {
          if (j == 4 || j == 5)
            shiftTimeValues[1] = 11.75;
          else
            shiftTimeValues[1] = 10.75;
        }
        else
          shiftTimeValues[1] = Number(shiftSplit[1]);

        time1 = shiftTimeValues[0];
        time2 = shiftTimeValues[1];
        if (shiftSplit[1] == "CL" && (time1 > 12 || time1 == 7))
          time1 += 12;

        if (time1 < 7)
          time1 += 12;

        if (time1 > (time2 - 3))
          time2 += 12;

        time1AMPM = "AM";
        time1Decimal = (time1 - Math.floor(time1)) * 60;
        time1 = Math.floor(time1);

        time2AMPM = "AM";
        time2Decimal = (time2 - Math.floor(time2)) * 60;
        time2 = Math.floor(time2);

        if (time1 == 12) {
          time1AMPM = "PM";
        }
        if (time1 > 12) {
          time1 -= 12;
          time1AMPM = "PM";
        }

        if (time1Decimal == 0)
          stringTime1 = time1 + ":00 " + time1AMPM;
        else
          stringTime1 = time1 + ":" + time1Decimal + " " + time1AMPM;

        if (time2 >= 12) {
          time2 -= 12;
          time2AMPM = "PM";
        }
        if (time2Decimal == 0)
          stringTime2 = time2 + ":00 " + time2AMPM;
        else
          stringTime2 = time2 + ":" + time2Decimal + " " + time2AMPM;

        if (time1 < 10)
          stringTime1 = "0" + stringTime1;
        if (time2 < 10)
          stringTime2 = "0" + stringTime2;
        scheduleShifts[i][j] = stringTime1 + "-" + stringTime2;
      }
    }
  }
  comparerSheet.getRange(3, 1, scheduleRows - 1).setValues(scheduleNames);
  comparerSheet.getRange(3, 2, scheduleRows - 1, 7).setValues(scheduleShifts);
}

function formatRedPrairie() {
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getSheetByName("Schedule Comparer");
  var ui = SpreadsheetApp.getUi();
  var sheetNames = sheet.getRange(3, 9, 75).getValues();

  var names = [];
  var i;

  for (i = 0; i < sheetNames.length; i++) {
    if (String(sheetNames[i][0]) != "") {
      names[i] = String(sheetNames[i][0]);
      if (names[i].indexOf("(") >= 0) {
        names[i] = names[i].substring(5, names[i].length);
      }
      if (names[i] == "Kelly, Nathan") {
        names[i] = "Kelly, Jamey";
      }
      if (names[i] == "Wolfe, Cary Dakota") {
        names[i] = "Wolfe, Dakota";
      }
      names[i] = [names[i]];
    }
  }
  var numberRows = names.length;
  sheet.getRange(3, 9, numberRows).setValues(names);

  var sheetWeek, j;
  var weekday = [];
  var weekdayT1 = [];
  var weekdayT2 = [];
  var shiftInfo = [];
  var pairNumber = 0;

  for (j = 10; j < 17; j++) {
    sheetWeek = sheet.getRange(3, j, numberRows).getDisplayValues();
    pairNumber = 0;

    for (i = 0; i < numberRows; i++) {
      weekday[i] = String(sheetWeek[i][0]);
      weekdayT1[i] = "";
      weekdayT2[i] = "";
      shiftInfo[i] = "";
      if (weekday[i].indexOf("Time-off") >= 0) {
        weekday[i] = "";
      }
      if (weekday[i].indexOf(":") >= 0) {
        weekday[i] = weekday[i].substring(weekday[i].indexOf(":") - 2, weekday[i].length);
        weekdayT1[i] = weekday[i].substr(0, 8);
        weekdayT2[i] = weekday[i].substr(weekday[i].indexOf("-") + 1, 8);
      }
      weekday[i] = [weekday[i]];

    }
    sheet.getRange(3, j, numberRows).setValues(weekday);
  }
}

function compareSchedules() {
  var spreadsheet = SpreadsheetApp.getActive();
  var comparerSheet = spreadsheet.getSheetByName("Schedule Comparer");
  var ui = SpreadsheetApp.getUi();
  var i, j, lastRow, lastRowDeployment, lastRowRedPrairie;

  var deploymentNames = [], deploymentShifts = [], redPrairieNames = [], redPrairieShifts = [];
  var matchedName = false;
  var matchedNames = [];

  var changedSchedules = [];
  var unchangedSchedules = [];
  var deployedNotScheduled = [];
  var scheduledNotDeployed = [];
  var matchedSchedules = [];
  var scheduleChanged;

  var clearingRange;

  //get all the names and shifts
  deploymentNames = comparerSheet.getRange(3, 1, 50).getDisplayValues();
  for (i = 0; i < deploymentNames.length; i++) {
    if (deploymentNames[i][0] == "") {
      lastRowDeployment = i;
      break;
    }
  }
  deploymentNames = comparerSheet.getRange(3, 1, lastRowDeployment).getDisplayValues();

  redPrairieNames = comparerSheet.getRange(3, 9, 50).getDisplayValues();
  for (i = 0; i < redPrairieNames.length; i++) {
    if (redPrairieNames[i][0] == "") {
      lastRowRedPrairie = i;
      break;
    }
  }
  redPrairieNames = comparerSheet.getRange(3, 9, lastRowRedPrairie).getDisplayValues();

  deploymentShifts = comparerSheet.getRange(3, 2, 75, 7).getDisplayValues();
  redPrairieShifts = comparerSheet.getRange(3, 10, 75, 7).getDisplayValues();

  //scan through the list of names to determine if there are any names that are scheduled but not deployed, or deployed but not scheduled
  //the first part iterates through the list of deployed names to determine which names are deployed but not scheduled
  for (i = 0; i < deploymentNames.length; i++) {
    matchedName = false;
    for (j = 0; j < redPrairieNames.length; j++) {
      if (deploymentNames[i][0] == redPrairieNames[j][0]) { //if the deployment name is in the list of redprairie names
        matchedName = true;
        matchedNames.push(deploymentNames[i]);
        matchedSchedules.push(matchedNames[matchedNames.length - 1].concat(deploymentShifts[i], redPrairieNames[j], redPrairieShifts[j]));
      }
      if (redPrairieNames[j][0].search(deploymentNames[i][0]) >= 0 && !matchedName) { //if there is a redprairie name with a middle name or middle initial that matches the deployment name
        matchedName = true;
        matchedNames.push(deploymentNames[i]);
        matchedSchedules.push(matchedNames[matchedNames.length - 1].concat(deploymentShifts[i], redPrairieNames[j], redPrairieShifts[j]));
      }
    }
    if (!matchedName) { //if the deployment name is not found in the list of redprairie names, it is added to the list of deployed but not scheduled names
      deployedNotScheduled.push(deploymentNames[i].concat(deploymentShifts[i], deploymentNames[i], [""], [""], [""], [""], [""], [""], [""]));
    }
  }
  ui.alert(deployedNotScheduled);
  //this second part scans through the redprairie names to find names that are scheduled but not deployed
  for (i = 0; i < redPrairieNames.length; i++) {
    matchedName = false;
    for (j = 0; j < deploymentNames.length; j++) {
      if (redPrairieNames[i][0].search(deploymentNames[j][0]) >= 0) { //if a name matches, it doesnt need to be added to the list of matched names because of the communitive property of the equivalence statement
        matchedName = true;
      }
    }
    //we dont need to search the deployment names list for strings that contain redprairie names because deployment names do not support middle names
    if (!matchedName) { //if the red prairie name is not found in the list of deployment names, it is added to the list of scheduled but not deployed
      scheduledNotDeployed.push(redPrairieNames[i].concat([""], [""], [""], [""], [""], [""], [""], redPrairieNames[i], redPrairieShifts[i]));
    }
  }

  //this determines which row the results of the comparison is pasted on
  if (lastRowDeployment > lastRowRedPrairie) {
    lastRow = lastRowDeployment + 2;
  }
  else {
    lastRow = lastRowRedPrairie + 2;
  }

  //this clears the formatting and cells after the last row of schedules
  clearingRange = comparerSheet.getRange(++lastRow, 1, 75, 16);
  clearingRange.clearContent().setFontColor("black").setBackground("white"); //this clears the font color and background color of the 50 rows after the last row

  //this pastes the column headers for the results of the comparison
  comparerSheet.getRange(++lastRow, 1, 1, 16).setValues([["Names", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Names", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]]);

  //this is where the matched schedules are checked to see if they have changed
  lastRow++;
  for (i = 0; i < matchedSchedules.length; i++) {
    scheduleChanged = false;
    for (j = 0; j < 7; j++) { //this checks each shift in the week to determine if changes have been made
      if (matchedSchedules[i][j + 1] != matchedSchedules[i][j + 9]) {
        scheduleChanged = true;
        if (matchedSchedules[i][j + 1] == "") {
          comparerSheet.getRange(lastRow + changedSchedules.length, j + 2).setBackground("red");
        }
        else {
          comparerSheet.getRange(lastRow + changedSchedules.length, j + 2).setFontColor("red");
        }
      }
    }
    if (scheduleChanged) {  //if the persons schedule was changed, it is added to the list of changed schedules
      changedSchedules.push(matchedSchedules[i]);
    }
    else {  //if the persons schedule was not changed, it is added to the list of unchanged schedules
      unchangedSchedules.push(matchedSchedules[i]);
    }
  }

  comparerSheet.getRange(lastRow, 1, changedSchedules.length, 16).setValues(changedSchedules);
  lastRow += changedSchedules.length;

  comparerSheet.getRange(lastRow, 1).setValue("Deployed not Scheduled");
  comparerSheet.getRange(++lastRow, 1, deployedNotScheduled.length, 16).setValues(deployedNotScheduled);
  comparerSheet.getRange(lastRow, 2, deployedNotScheduled.length, 7).setFontColor("red");
  lastRow += deployedNotScheduled.length;

  comparerSheet.getRange(lastRow, 1).setValue("Scheduled not deployed");
  comparerSheet.getRange(++lastRow, 1, scheduledNotDeployed.length, 16).setValues(scheduledNotDeployed);
  for(i = 0; i < scheduledNotDeployed.length; i++) {
    for(j = 0; j < 7; j++) {
      if(scheduledNotDeployed[i][j+9] != "") {
        comparerSheet.getRange(lastRow + i, j + 2).setBackground("red");
      }
    }
  }  
  lastRow += scheduledNotDeployed.length;

  comparerSheet.getRange(lastRow, 1).setValue("Unchanged Schedules");
  comparerSheet.getRange(++lastRow, 1, unchangedSchedules.length, 16).setValues(unchangedSchedules);
}

function clearFormatting() {
  //clears text color and background color from the sheet
  var spreadsheet = SpreadsheetApp.getActive();
  var comparerSheet = spreadsheet.getSheetByName("Schedule Comparer");
  var ui = SpreadsheetApp.getUi();

  if (comparerSheet.getFilter())
    comparerSheet.getFilter().remove();

  comparerSheet.getRange(3, 1, 75).setFontColor("black");
  comparerSheet.getRange(3, 9, 75).setFontColor("black")

  comparerSheet.getRange(3, 2, 75, 7).setFontColor("black").setBackground("white");
  comparerSheet.getRange(3, 10, 75, 7).setFontColor("black").setBackground("white");
}

function copyAndCompare() {
  copySchedule();
  compareSchedules();
}