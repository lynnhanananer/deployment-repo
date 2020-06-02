// function getAvailable() {
//   var spreadsheet = SpreadsheetApp.getActive();
//   var ui = SpreadsheetApp.getUi();
//   var dataSheet = spreadsheet.getSheetByName("Employee Data");
//   var sheets = spreadsheet.getSheets();
//   var daySheet, deployment, deployed = [];
//   var shiftSplitter;

//   var dayOfWeek = 3;
//   var employeeData;
//   var availabilities = [];
//   var filteredAvailabilities = [];
//   var availabilityColumn, houseColumn;
//   var dataHeaders;
//   var i, j;
//   var availability;
//   var startTime, endTime;
//   var filteredOut = [];

//   var managersList;
//   var fullTimeList;
//   var crewChiefsList;
//   var isManager = false, isFullTime = false, isCrewChief = false, isDeployed = false;
//   var filterManagers = true, filterFullTime = true, filterCrewChiefs = true, excludeDeployed = true;
//   var AD = true, AM = false, PM = false, CL = true, AMPM = false;
//   var house = "Both"

//   //get the starting column for the availability column of the employee data sheet
//   dataHeaders = dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getDisplayValues();
//   for (i = 0; i < dataHeaders[0].length; i++) {
//     if (dataHeaders[0][i] == "Monday") {
//       availabilityColumn = i;
//     }
//     if (dataHeaders[0][i] == "House") {
//       houseColumn = i;
//     }
//   }

//   //get the different employee types i.e. manager, full time and crew chiefs
//   employeeData = spreadsheet.getRangeByName("EmployeeData").getDisplayValues();
//   managersList = spreadsheet.getRangeByName("Managers").getDisplayValues();
//   fullTimeList = spreadsheet.getRangeByName("FullTime").getDisplayValues();
//   crewChiefsList = spreadsheet.getRangeByName("CrewChiefs").getDisplayValues();

//   //replace the schedule names in the named ranges with the deployment names
//   for (i = 0; i < employeeData.length; i++) {
//     for (j = 0; j < managersList.length; j++) {
//       if (managersList[j][0] == employeeData[i][1]) {
//         managersList[j] = employeeData[i][0];
//       }
//     }
//     for (j = 0; j < fullTimeList.length; j++) {
//       if (fullTimeList[j][0] == employeeData[i][1]) {
//         fullTimeList[j] = employeeData[i][0];
//       }
//     }
//     for (j = 0; j < crewChiefsList.length; j++) {
//       if (crewChiefsList[j][0] == employeeData[i][1]) {
//         crewChiefsList[j] = employeeData[i][0];
//       }
//     }
//   }

//   //gets the people deployed for the day selected
//   if (excludeDeployed) {
//     daySheet = sheets[dayOfWeek];
//     deployment = daySheet.getRange(10, 3, 45, 1).getDisplayValues();

//     for (i = 0; i < deployment.length; i++) {
//       if (deployment[i][0] != "") {
//         deployed.push(deployment[i][0]);
//       }
//       if (deployment[i][0].indexOf("/") > 0 || deployment[i][0].indexOf(" train ") > 0) {
//         //ui.alert("Split deployment found: " + deployment[i][0]);
//         if (deployment[i][0].indexOf("/") > 0) {
//           shiftSplitter = "/";
//         }
//         if (deployment[i][0].indexOf(" train ") > 0) {
//           shiftSplitter = " train ";
//         }
//         deployed.push(deployment[i][0].substring(0, deployment[i][0].indexOf(shiftSplitter)).trim());
//         deployed.push(deployment[i][0].substring(deployment[i][0].indexOf(shiftSplitter) + shiftSplitter.length).trim());

//         //ui.alert(deployed[deployed.length - 1] + ", " + deployed[deployed.length - 2]);
//       }
//     }
//   }

//   //sorts through all the employee data and filters out people who are not available on the day selected and filters out the employee types selected to filter  
//   for (i = 0; i < employeeData.length; i++) {
//     //filters out managers if the option is selected
//     if (filterManagers) {
//       for (j = 0; j < managersList.length; j++) {
//         if (managersList[j] == employeeData[i][0]) {
//           isManager = true;
//           break;
//         }
//       }
//     }
//     if (filterManagers && isManager) {
//       filteredOut.push("Manager found: " + employeeData[i][0]);
//       isManager = false;
//       continue;
//     }

//     //filters out full time if the option is selected
//     if (filterFullTime) {
//       for (j = 0; j < fullTimeList.length; j++) {
//         if (fullTimeList[j] == employeeData[i][0]) {
//           isFullTime = true;
//           break;
//         }
//       }
//     }
//     if (filterFullTime && isFullTime) {
//       filteredOut.push("Full Time found: " + employeeData[i][0]);
//       isFullTime = false;
//       continue;
//     }

//     //filters out crew chiefs
//     if (filterCrewChiefs) {
//       for (j = 0; j < crewChiefsList.length; j++) {
//         if (crewChiefsList[j] == employeeData[i][0]) {
//           isCrewChief = true;
//           break;
//         }
//       }
//     }
//     if (filterCrewChiefs && isCrewChief) {
//       filteredOut.push("Crew Chief found: " + employeeData[i][0]);
//       isCrewChief = false;
//       continue;
//     }

//     //filters out deployed employees
//     if (excludeDeployed) {
//       for (j = 0; j < deployed.length; j++) {
//         if (deployed[j] == employeeData[i][0]) {
//           isDeployed = true;
//         }
//       }
//     }
//     if (excludeDeployed && isDeployed) {
//       filteredOut.push("Deployed employee found: " + employeeData[i][0]);
//       isDeployed = false;
//       continue;
//     }

//     //this filters out the people who are not avialable on that day of the week
//     if (employeeData[i][availabilityColumn + dayOfWeek] != "") {
//       availabilities.push([employeeData[i][0], employeeData[i][3], employeeData[i][availabilityColumn + dayOfWeek], employeeData[i][houseColumn]]); //array is deployment name, age, availability for that day of the week and house
//     }
//   }

//   ui.alert(filteredOut.join("\n"));

//   //determine if employee is available in the morning, afternoon or all day
//   //assign a shift type to all the people available that day
//   for (i = 0; i < availabilities.length; i++) {
//     availability = availabilities[i][2].split("--");
//     startTime = availability[0];
//     endTime = availability[1];
//     if (startTime.indexOf(":") >= 0) {
//       startTime = Number(startTime.substring(0, startTime.indexOf(":"))) + 0.5;
//     }
//     if (availabilities[i][1] < 18 && dayOfWeek < 5) //if the employee is younger than 18 and it is not a weekend, we can assume the employee is only available after school
//     {
//       availabilities[i].push("PM");
//       if (endTime == "CL") {
//         availabilities[i][4] = "CL";
//       }
//     }
//     else {
//       if (availabilities[i][2] == "All Day") {
//         availabilities[i].push("AD");
//       }
//       else {
//         if ((startTime > 2) && (startTime <= 7) && ((endTime == "CL") || (endTime > 6))) //covers cases 3PM-7PM--7PM-CL
//         {
//           availabilities[i].push("PM");
//           if (endTime == "CL") //changes afternoon to close if the employee closes
//           {
//             availabilities[i][4] = "CL";
//           }
//         }
//         else if ((startTime > 6) && (endTime < 6)) //covers 7AM--5PM
//         {
//           availabilities[i].push("AM");
//         }
//         else if (startTime > 8 && endTime == "CL") //covers 10AM-12PM--CL
//         {
//           availabilities[i].push("AD");
//         }
//         else if (startTime > endTime) //covers people who are available to work all day except closing
//         {
//           availabilities[i].push("AMPM");
//         }
//         else {
//           var prompt = ui.prompt("Shift Category Error", "The shift category for " + availabilities[i][0] + ", " + availabilities[i][2] + " could not be detected\nPlease type a category (AD, AM, PM, CL or AMPM) or press cancel to drop from the list.", ui.ButtonSet.OK_CANCEL);
//           if (prompt.getSelectedButton() == ui.Button.OK) {
//             var promptText = prompt.getResponseText();
//             while (!(promptText == "AD" || promptText == "AM" || promptText == "PM" || promptText == "CL" || promptText == "AMPM") && prompt.getSelectedButton() == ui.Button.OK) {
//               prompt = ui.prompt("Shift Category Error", "The shift category for " + availabilities[i][0] + ", " + availabilities[i][2] + " could not be detected\nPlease type a category (AD, AM, PM, CL or AMPM) or press cancel to drop from the list.", ui.ButtonSet.OK_CANCEL);
//               promptText = prompt.getResponseText();
//             }
//           }
//           if (prompt.getSelectedButton() != ui.Button.OK) {
//             availabilities.splice(i, 1);
//           }
//         }
//       }
//     }
//   }

//   for (i = 0; i < availabilities.length; i++) {
//     if (availabilities[i][4] == "AMPM" && AMPM) {
//       filteredAvailabilities.push(availabilities[i]);
//     }
//     else if (availabilities[i][4] == "CL" && CL) {
//       filteredAvailabilities.push(availabilities[i]);
//     }
//     else if (availabilities[i][4] == "PM" && PM) {
//       filteredAvailabilities.push(availabilities[i]);
//     }
//     else if (availabilities[i][4] == "AM" && AM) {
//       filteredAvailabilities.push(availabilities[i]);
//     }
//     else if (availabilities[i][4] == "AD" && AD) {
//       filteredAvailabilities.push(availabilities[i]);
//     }
//     else if (!(availabilities[i][4] == "AD" || availabilities[i][4] == "AM" || availabilities[i][4] == "PM" || availabilities[i][4] == "CL" || availabilities[i][4] == "AMPM")) {
//       ui.alert("Shift category filter error.", "Filter error for " + availabilities[i][0] + ", " + availabilities[i][2], ui.ButtonSet.OK_CANCEL);
//     }
//   }
//   ui.alert(filteredAvailabilities.join("\n"));
// }

function getAvailableFromDialog(formInformation) {
  
  var spreadsheet = SpreadsheetApp.getActive();
  var ui = SpreadsheetApp.getUi();
  var dataSheet = spreadsheet.getSheetByName("Employee Data");
  var sheets = spreadsheet.getSheets();
  var daySheet, deployment, deployed = [];
  var shiftSplitter;

  var dayOfWeek = formInformation[0]; //gets the day of the week from monday through sunday starting at value 0 for monday to value 6 for sunday
  var employeeData;
  var availabilities = [];
  var filteredAvailabilities = [];
  var availabilityColumn, houseColumn;
  var dataHeaders;
  var i, j;
  var availability;
  var startTime, endTime;
  var filteredOut = [];
  var dialogDisplay = [];

  var managersList;
  var fullTimeList;
  var crewChiefsList;
  var isManager = false, isFullTime = false, isCrewChief = false, isDeployed = false;
  var filterManagers = formInformation[1],
  filterFullTime = formInformation[2], 
  filterCrewChiefs = formInformation[3], 
  excludeDeployed = formInformation[4];
  var AD = formInformation[5], AM = formInformation[6], PM = formInformation[7], CL = formInformation[8], AMPM = formInformation[9];
  var house = formInformation[10];

  //get the starting column for the availability column of the employee data sheet
  dataHeaders = dataSheet.getRange(1, 1, 1, dataSheet.getLastColumn()).getDisplayValues();
  for (i = 0; i < dataHeaders[0].length; i++) {
    if (dataHeaders[0][i] == "Monday") {
      availabilityColumn = i;
    }
    if (dataHeaders[0][i] == "House") {
      houseColumn = i;
    }
  }

  //get the different employee types i.e. manager, full time and crew chiefs
  employeeData = spreadsheet.getRangeByName("EmployeeData").getDisplayValues();
  managersList = spreadsheet.getRangeByName("Managers").getDisplayValues();
  fullTimeList = spreadsheet.getRangeByName("FullTime").getDisplayValues();
  crewChiefsList = spreadsheet.getRangeByName("CrewChiefs").getDisplayValues();

  //replace the schedule names in the named ranges with the deployment names
  for (i = 0; i < employeeData.length; i++) {
    for (j = 0; j < managersList.length; j++) {
      if (managersList[j][0] == employeeData[i][1]) {
        managersList[j] = employeeData[i][0];
      }
    }
    for (j = 0; j < fullTimeList.length; j++) {
      if (fullTimeList[j][0] == employeeData[i][1]) {
        fullTimeList[j] = employeeData[i][0];
      }
    }
    for (j = 0; j < crewChiefsList.length; j++) {
      if (crewChiefsList[j][0] == employeeData[i][1]) {
        crewChiefsList[j] = employeeData[i][0];
      }
    }
  }

  //gets the people deployed for the day selected
  if (excludeDeployed) {
    daySheet = sheets[dayOfWeek];
    deployment = daySheet.getRange(10, 3, 45, 1).getDisplayValues();

    for (i = 0; i < deployment.length; i++) {
      if (deployment[i][0] != "") {
        deployed.push(deployment[i][0]);
      }
      if (deployment[i][0].indexOf("/") > 0 || deployment[i][0].indexOf(" train ") > 0) {
        //ui.alert("Split deployment found: " + deployment[i][0]);
        if (deployment[i][0].indexOf("/") > 0) {
          shiftSplitter = "/";
        }
        if (deployment[i][0].indexOf(" train ") > 0) {
          shiftSplitter = " train ";
        }
        deployed.push(deployment[i][0].substring(0, deployment[i][0].indexOf(shiftSplitter)).trim());
        deployed.push(deployment[i][0].substring(deployment[i][0].indexOf(shiftSplitter) + shiftSplitter.length).trim());

        //ui.alert(deployed[deployed.length - 1] + ", " + deployed[deployed.length - 2]);
      }
    }
  }

  //sorts through all the employee data and filters out people who are not available on the day selected and filters out the employee types selected to filter  
  for (i = 0; i < employeeData.length; i++) {
    //filters out managers if the option is selected
    if (filterManagers) {
      for (j = 0; j < managersList.length; j++) {
        if (managersList[j] == employeeData[i][0]) {
          isManager = true;
          break;
        }
      }
    }
    if (filterManagers && isManager) {
      filteredOut.push("Manager found: " + employeeData[i][0]);
      isManager = false;
      continue;
    }

    //filters out full time if the option is selected
    if (filterFullTime) {
      for (j = 0; j < fullTimeList.length; j++) {
        if (fullTimeList[j] == employeeData[i][0]) {
          isFullTime = true;
          break;
        }
      }
    }
    if (filterFullTime && isFullTime) {
      filteredOut.push("Full Time found: " + employeeData[i][0]);
      isFullTime = false;
      continue;
    }

    //filters out crew chiefs
    if (filterCrewChiefs) {
      for (j = 0; j < crewChiefsList.length; j++) {
        if (crewChiefsList[j] == employeeData[i][0]) {
          isCrewChief = true;
          break;
        }
      }
    }
    if (filterCrewChiefs && isCrewChief) {
      filteredOut.push("Crew Chief found: " + employeeData[i][0]);
      isCrewChief = false;
      continue;
    }

    //filters out deployed employees
    if (excludeDeployed) {
      for (j = 0; j < deployed.length; j++) {
        if (deployed[j] == employeeData[i][0]) {
          isDeployed = true;
        }
      }
    }
    if (excludeDeployed && isDeployed) {
      filteredOut.push("Deployed employee found: " + employeeData[i][0]);
      isDeployed = false;
      continue;
    }

    //filters out employees not in eligible house
    if(house != "Both" && employeeData[i][houseColumn] != "Both") {
      if (employeeData[i][houseColumn] != house) {
        filteredOut.push("Wrong house found: " + employeeData[i][0] + " " + employeeData[i][houseColumn])
        continue;
      }
    }

    //this filters out the people who are not avialable on that day of the week
    if (employeeData[i][availabilityColumn + dayOfWeek] != "") {
      availabilities.push([employeeData[i][0], employeeData[i][3], employeeData[i][availabilityColumn + dayOfWeek], employeeData[i][houseColumn]]); //array is deployment name, age, availability for that day of the week and house
    }
  }

  //ui.alert(filteredOut.join("\n"));

  //determine if employee is available in the morning, afternoon or all day
  //assign a shift type to all the people available that day
  for (i = 0; i < availabilities.length; i++) {
    availability = availabilities[i][2].split("--");
    startTime = availability[0];
    endTime = availability[1];
    if (startTime.indexOf(":") >= 0) {
      startTime = Number(startTime.substring(0, startTime.indexOf(":"))) + 0.5;
    }
    if (availabilities[i][1] < 18 && dayOfWeek < 5) //if the employee is younger than 18 and it is not a weekend, we can assume the employee is only available after school
    {
      availabilities[i].push("PM");
      if (endTime == "CL") {
        availabilities[i][4] = "CL";
      }
    }
    else {
      if (availabilities[i][2] == "All Day") {
        availabilities[i].push("AD");
      }
      else {
        if ((startTime > 2) && (startTime <= 7) && ((endTime == "CL") || (endTime > 6))) //covers cases 3PM-7PM--7PM-CL
        {
          availabilities[i].push("PM");
          if (endTime == "CL") //changes afternoon to close if the employee closes
          {
            availabilities[i][4] = "CL";
          }
        }
        else if ((startTime > 6) && (endTime < 6)) //covers 7AM--5PM
        {
          availabilities[i].push("AM");
        }
        else if (startTime > 8 && endTime == "CL") //covers 10AM-12PM--CL
        {
          availabilities[i].push("AD");
        }
        else if (startTime > endTime) //covers people who are available to work all day except closing
        {
          availabilities[i].push("AMPM");
        }
        else {
          var prompt = ui.prompt("Shift Category Error", "The shift category for " + availabilities[i][0] + ", " + availabilities[i][2] + " could not be detected\nPlease type a category (AD, AM, PM, CL or AMPM) or press cancel to drop from the list.", ui.ButtonSet.OK_CANCEL);
          if (prompt.getSelectedButton() == ui.Button.OK) {
            var promptText = prompt.getResponseText();
            while (!(promptText == "AD" || promptText == "AM" || promptText == "PM" || promptText == "CL" || promptText == "AMPM") && prompt.getSelectedButton() == ui.Button.OK) {
              prompt = ui.prompt("Shift Category Error", "The shift category for " + availabilities[i][0] + ", " + availabilities[i][2] + " could not be detected\nPlease type a category (AD, AM, PM, CL or AMPM) or press cancel to drop from the list.", ui.ButtonSet.OK_CANCEL);
              promptText = prompt.getResponseText();
            }
          }
          if (prompt.getSelectedButton() != ui.Button.OK) {
            availabilities.splice(i, 1);
          }
        }
      }
    }
  }

  //filter out the people who are not part of the shift parts selected
  for (i = 0; i < availabilities.length; i++) {
    if (availabilities[i][4] == "AMPM" && AMPM) {
      filteredAvailabilities.push(availabilities[i]);
    }
    else if (availabilities[i][4] == "CL" && CL) {
      filteredAvailabilities.push(availabilities[i]);
    }
    else if (availabilities[i][4] == "PM" && PM) {
      filteredAvailabilities.push(availabilities[i]);
    }
    else if (availabilities[i][4] == "AM" && AM) {
      filteredAvailabilities.push(availabilities[i]);
    }
    else if (availabilities[i][4] == "AD" && AD) {
      filteredAvailabilities.push(availabilities[i]);
    }
    else if (!(availabilities[i][4] == "AD" || availabilities[i][4] == "AM" || availabilities[i][4] == "PM" || availabilities[i][4] == "CL" || availabilities[i][4] == "AMPM")) {
      ui.alert("Shift category filter error.", "Filter error for " + availabilities[i][0] + ", " + availabilities[i][2], ui.ButtonSet.OK_CANCEL);
    }
  }

  //creates a better way to display the availabilites
  for(i = 0; i < filteredAvailabilities.length; i++) {

    dialogDisplay.push(filteredAvailabilities[i][0] + ", " + filteredAvailabilities[i][2]);
  }

  ui.alert(dialogDisplay.join('\n'));
}

function availabilityDialog() {
  var html = HtmlService.createHtmlOutputFromFile('AvailabilityDialog')
    .setWidth(317)
    .setHeight(241);
  SpreadsheetApp.getUi()
    .showModalDialog(html, 'Availability Dailog');
}

function availabilityFormInfo(formInformation) {
  var spreadsheet = SpreadsheetApp.getActive();
  var ui = SpreadsheetApp.getUi();

  ui.alert(formInformation);
}