function buildSchedule() 
{
  var miliTime1 = new Date(); //keeps track of the total runtime of the script
  //#region Variable Declarations
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var sheets = spreadsheet.getSheets(); //an array of the sheets in the current spreadsheet
  var ui = SpreadsheetApp.getUi(); //the spreadsheet ui object
  
  var i = 0, j = 0, k = 0; //iterable values used in for loops
  
  //arrays
  var deploymentValues = []; //the raw values from the deployment sheets
  var uniqueNames = []; //the list of unique names from the deployment sheets
  var names1D = []; //a 1D array of the non-blank names from the deployment sheets, used to find the unique names
  var namedRanges = []; //the list of named ranges in the sheet
  var employeeNames = []; //the list of employee names from the 'names' NamedRange
  var shiftSplit = []; //the shift split around --
  var timeSplit = []; //the time split around :
  var shiftTimeValues = []; //the number values for a shift  
  var dayHours = []; //the total hours for each day, the first two indexes are blank, and has a length of 9
  var dayDates = []; //the date for each day, the first two indexes are blank, and has a length of 9
  var days = ["","","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  
  //the schedule, each index in the schedule array is another array of a length of 9
  //the first [0] index of the second dimension array is the name
  //the second [1] index of the second dimnesion array is the hours
  //the other 7 [2-8] indexes of the second dimension correspond with the weekday
  var schedule = []; 
  
  //other objects and variables
  var valuesCounter = 0; //counts the non-blank values from the deployments
  var dataSheet, scheduleSheet; //Sheet objects used for referncing the Schedule sheet and Data sheet
  var foundName; //boolean value from the names assignment
  var promptResult, alertResult; //the prompt and alert objects returned from the prompt and alert in the names assignment
  var promptText; //the promptText from reassigning a name in the schedule
  var names; //the namedRange of the names list
  var name1, name2; //the names when multiple people are deployed in the same position, used to assign split or training shifts
  var shift1, shift2; //the shifts when multiple people are deployed in the same position, used to assign split or training shifts
  var foundName1, foundName2; //true when the name in a split shift has been previously scheduled
  var scheduleLength; //the length of the schedule
  var shiftSplitter; //is either "/" or " train " depending on the wording to split a shift
  var time1, time2; //the first and second time of a shift
  var shift; //the shift
  var employeeHours; //the total hours an employee is scheduled
  var totalHours = 0; //the total hours that have been scheduled
  var date; //the date for each day
  var errorRow; //the row that contains the error
  var unmatchingShifts = [], unmatchingDays = [];
  var weekday = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  //#endregion
    
  if(sheets[0].getSheetName().search('Monday') >= 0 &&
     sheets[1].getSheetName().search('Tuesday') >= 0 &&
     sheets[2].getSheetName().search('Wednesday') >= 0 &&
     sheets[3].getSheetName().search('Thursday') >= 0 &&
     sheets[4].getSheetName().search('Friday') >= 0 &&
     sheets[5].getSheetName().search('Saturday') >= 0 &&
     sheets[6].getSheetName().search('Sunday') >= 0 &&
     sheets[7].getSheetName().search('Schedule') >= 0 &&
     sheets[8].getSheetName().search('Employee Data') >= 0)
  {
    //#region Getting Deployment Sheet Values
    //monday deployment
    scheduleSheet = sheets[7];
    deploymentValues = sheets[0].getRange('C10:D19').getValues();
    deploymentValues = deploymentValues.concat(sheets[0].getRange('C21:D23').getValues(),
                                               sheets[0].getRange('C25:D30').getValues(),
                                               sheets[0].getRange('C35:D44').getValues(),
                                               sheets[0].getRange('C46:D48').getValues(),
                                               sheets[0].getRange('C50:D55').getValues());
    //tuesday through sunday deployments
    for(i = 1; i < 7; i++)
    {
      deploymentValues = deploymentValues.concat(sheets[i].getRange('C10:D19').getValues(),
                                                 sheets[i].getRange('C21:D23').getValues(),
                                                 sheets[i].getRange('C25:D30').getValues(),
                                                 sheets[i].getRange('C35:D44').getValues(),
                                                 sheets[i].getRange('C46:D48').getValues(),
                                                 sheets[i].getRange('C50:D55').getValues());
    }    
    
    //converts all deployment values to strings and creates a list of names without blanks
    for(i = 0; i < 266; i++)
    {
      deploymentValues[i][0] = String(deploymentValues[i][0]);
      deploymentValues[i][1] = String(deploymentValues[i][1]);
      if(deploymentValues[i][0] != '')
      {
        names1D[valuesCounter] = deploymentValues[i][0];
        valuesCounter++;
      }      
    }
    
    //filters unique names
    uniqueNames = names1D.filter(onlyUnique);
    //#endregion
    //#region Building the Schedule Array
    //adds the unique name list to the first column of the schedule
    for(i = 0; i < uniqueNames.length; i++)
    {
      schedule[i] = [uniqueNames[i]];
    }
    
    //searches the deployment list for each unique name and places the shift in the correct date
    for(j = 0; j < schedule.length; j++)
    {
      for(i = 0; i < deploymentValues.length; i++)
      {
        if(deploymentValues[i][0] === uniqueNames[j])
        {
          //Math.floor(i/38)+1 determines which column/weekday the shift is in
          if(schedule[j][Math.floor(i/38)+2] === undefined)
          {
            schedule[j][Math.floor(i/38)+2] = deploymentValues[i][1]; 
          }
          else
          {
            //if person is deployed twice in one day, check to see if their deployment shifts match
            if(schedule[j][Math.floor(i/38)+2] != deploymentValues[i][1])
            {
               unmatchingShifts.push(deploymentValues[i][0]);
               unmatchingDays.push(Math.floor(i/38));
            }
          }
        }
      }
      //this fills in the blank weekdays of each name with ""
      for(k = 1; k < 9; k++) 
      {
        if(schedule[j][k] === undefined)
          schedule[j][k] = '';
      }
    }       
    //#endregion
    //#region Handling Training and Multiple Deployment
    //gets all schedule names with train or /
    for(i = 0; i < schedule.length; i++)
    {    
      //looks to see if there are any deployed shifts with / or train in them
      if(schedule[i][0].indexOf("/") > 0 || schedule[i][0].indexOf(" train ") > 0)
      {
        if(schedule[i][0].indexOf("/") > 0)
          shiftSplitter = "/";
        if(schedule[i][0].indexOf(" train ") > 0)
          shiftSplitter = " train ";
          
        //gets the first and second name in the deployed shift
        name1 = schedule[i][0].substring(0, schedule[i][0].indexOf(shiftSplitter));
        name2 = schedule[i][0].substring(schedule[i][0].indexOf(shiftSplitter)+shiftSplitter.length);
        
        name1 = name1.trim();
        name2 = name2.trim();

        foundName1 = false;
        foundName2 = false;
        //searches the schedule to see if either person is already deployed
        for(j = 0; j < schedule.length; j++)
        {
          //if they are deployed their shifts from the split shift get added
          if(name1 === schedule[j][0])
          {
            foundName1 = true; 
            for(k = 2; k < schedule[j].length; k++) 
            {
              //will add unmatching shift error if split shift does not match
              if(schedule[i][k] != "")
              {
                if(schedule[i][k].indexOf("/") > 0)                  
                  shift = schedule[i][k].substring(0, schedule[i][k].indexOf("/"));
                else
                  shift = schedule[i][k];
                if(schedule[j][k] == shift || schedule[j][k] == "")
                {
                  schedule[j][k] = shift;
                }
                else
                {
                  unmatchingShifts.push(name1)
                  unmatchingDays.push(k-2);
                }
              }
            }
          }
          if(name2 === schedule[j][0])
          {            
            foundName2 = true;
            for(k = 2; k < schedule[j].length; k++) 
            {
              if(schedule[i][k] != "")
              {
                if(schedule[i][k].indexOf("/") > 0)                  
                  shift = schedule[i][k].substring(schedule[i][k].indexOf("/")+1);
                else
                  shift = schedule[i][k];
                if(schedule[j][k] == shift || schedule[j][k] == "")
                {
                  schedule[j][k] = shift;
                }
                else
                {
                  unmatchingShifts.push(name2)
                  unmatchingDays.push(k-2);
                }
              }
            }
          }
        }
        
        //if they are not deployed they are added to the schedule with their split shift
        if(!foundName1)
        {
          //ui.alert(name1);
          scheduleLength = schedule.push([])-1;
          schedule[scheduleLength].push(name1);
          schedule[scheduleLength].push("");
          for(k = 2; k < 9; k++) 
          {
            if(schedule[i][k].indexOf("/") > 0)                  
              schedule[scheduleLength].push(schedule[i][k].substring(0, schedule[i][k].indexOf("/")));
            else
            {
              if(schedule[i][k] != "")
                schedule[scheduleLength].push(schedule[i][k]);
              else
                schedule[scheduleLength].push("");              
            }
          }          
        }
        
        if(!foundName2)
        {
          scheduleLength = schedule.push([])-1;
          schedule[scheduleLength].push(name2);
          schedule[scheduleLength].push("");
          for(k = 2; k < 9; k++) 
          {
            if(schedule[i][k].indexOf("/") > 0)                  
              schedule[scheduleLength].push(schedule[i][k].substring(schedule[i][k].indexOf("/")+1));
            else
            {
              if(schedule[i][k] != "")
                schedule[scheduleLength].push(schedule[i][k]);
              else
                schedule[scheduleLength].push("");              
            }
          }
        }
        //the split shift is removed from the schedule
        schedule.splice(i, 1);
        i--;
      }                                         
    }    
    //#endregion
    //#region Converting Deployment Names to Schedule Names
    //get names list from Data sheet
    dataSheet = spreadsheet.getSheetByName("Employee Data");
    namedRanges = dataSheet.getNamedRanges();
    for(i = 0; i < namedRanges.length; i++)
    {
      if(namedRanges[i].getName() == "Names")
      {
        //ui.alert("Found Names");
        names = namedRanges[i];
        employeeNames = namedRanges[i].getRange().getValues();
      }
    }
    
    //assigns names to schedule
    for(i = 0; i < schedule.length; i++)
    {
      foundName = false;
      for(j = 0; j < employeeNames.length; j++)
      {
        if(schedule[i][0] == employeeNames[j][0])
        {
          schedule[i][0] = employeeNames[j][1];
          foundName = true;
        }
      }
      
      //allows the user to reassign names to the schedule if their name is not found in the names list
      if(!foundName)
      {
        promptResult = ui.prompt('The name for '+schedule[i][0] + ' was not found', 'What is their name?', ui.ButtonSet.OK_CANCEL);
        if(promptResult.getSelectedButton() == ui.Button.OK)
        {
          //allows the user to add a newly assigned name to the names list
          promptText = promptResult.getResponseText();
          alertResult = ui.alert("Please Confirm","Would you like to add " + schedule[i][0] + ", " + promptText + " to the names list?", ui.ButtonSet.YES_NO);
          if(alertResult == ui.Button.YES)
          {
            dataSheet.getRange(names.getRange().getNumRows()+2, 1).setValue(schedule[i][0]);
            dataSheet.getRange(names.getRange().getNumRows()+2, 2).setValue(promptText);
            names.setRange(dataSheet.getRange(1,1,names.getRange().getNumRows()+2,2));
            employeeNames = names.getRange().getValues();
          }
          schedule[i][0] = promptText;
        }
      }
    }    
    //#endregion
    //#region Hours Calculations
    scheduleSheet.getRange(2,11,75).clearNote();
    scheduleSheet.getRange(2,11,75).clearContent();
    //totals hours for each employee, the schedule and each day
    dayHours.push("");
    dayHours.push("");
    for(i = 2; i < 9; i++)
      dayHours.push(0);
    
    for(i = 0; i < schedule.length; i++)
    {
      employeeHours = 0;
      for(j = 2; j < 9; j++)
      {
        if(schedule[i][j] == "")        
          continue;    
          
        if(schedule[i][0] == "Sherman, Dori")
          continue;
        
        shift = schedule[i][j];        
        shiftSplit = shift.split("--");
        
        if(shiftSplit[0].indexOf(":") > 0)
        {
          timeSplit = shiftSplit[0].split(":");
          shiftTimeValues[0] = Number(timeSplit[0])+(Number(timeSplit[1])/60);
        }
        else        
          shiftTimeValues[0] = Number(shiftSplit[0]);
        
        if(shiftSplit[1] === "CL")  
        {          
          shiftTimeValues[1] = 10.75;
          if(j == 6 || j == 7)
            shiftTimeValues[1] = 11.75;
        }
        else        
          shiftTimeValues[1] = Number(shiftSplit[1]);
        
        time1 = shiftTimeValues[0];
        time2 = shiftTimeValues[1];   
        
        if(shiftSplit[1] == "CL" && (time1 > 12 || time1 == 7))        
          time1+=12;        
        if(time1 < 7)        
          time1+=12;  
        if(time1 > (time2 - 3))        
          time2+=12;   
        //checks to see if the times are not numbers  
        if(isNaN(time1) || isNaN(time2))
        {
          //adds a * to a shift that does not calculate correctly
          //schedule[i][j] = schedule[i][j] + "*";
          scheduleSheet.getRange(i+2,11).setValue("Shift Time Error");
          if(!scheduleSheet.getRange(i+2,11).getNote())
            {
              scheduleSheet.getRange(i+2,11).setNote("Shift time error for "+schedule[i][0] + " on "+ weekday[j-2]);
            }
            else
            {
              scheduleSheet.getRange(i+2,11).setNote(scheduleSheet.getRange(i+2,11).getNote()+"\nShift time error for "+schedule[i][0] + " on "+ weekday[j-2]);
            }
        }
        else
        {
          employeeHours+=(time2-time1);
          dayHours[j]+=(time2-time1);  
        }
      }
      schedule[i][1] = employeeHours;
      totalHours+=employeeHours;
    }    
    //#endregion
    //#region Displaying the Schedule on the Spreadsheet and Errors
    //sets the completed schedule on the schedule sheet and clears the previous run schedule
    scheduleSheet.getRange(2, 1, 74, 10).clearContent(); 
    scheduleSheet.getRange(2, 1, schedule.length, 9).setValues(schedule); 
    
    //add notes for errors
    
    if(unmatchingShifts.length > 0)
    {    
      //first changes deployment names on unmatching shifts to schedule names
      for(i = 0; i < unmatchingShifts.length; i++)
      {        
        for(j = 0; j < employeeNames.length; j++)
        {
          if(unmatchingShifts[i] == employeeNames[j][0])
          {
            unmatchingShifts[i] = employeeNames[j][1];            
          }
        }
      }
      //searches through the schedule array to find the name the matches the unmatching shfit
      for(i = 0; i < unmatchingShifts.length; i++)
      {
        Logger.log(unmatchingShifts[i]);
        for(j = 0; j < schedule.length; j++)
        {
          if(unmatchingShifts[i] == schedule[j][0])
          {
            scheduleSheet.getRange(j+2,11).setValue("Unmatching Shift Error");
            if(!scheduleSheet.getRange(j+2,11).getNote())
            {
              scheduleSheet.getRange(j+2,11).setNote("Unmatching shift error for "+unmatchingShifts[i] + " on "+ weekday[unmatchingDays[i]]);
            }
            else
            {
              scheduleSheet.getRange(j+2,11).setNote(scheduleSheet.getRange(j+2,11).getNote()+"\nUnmatching shift error for "+unmatchingShifts[i] + " on "+ weekday[unmatchingDays[i]]);
            }
          }
        }
      }     
    }  
    
    //sets the hours and total hours for the schedule
    scheduleSheet.getRange(1, 2).setValue("Hours\n" + totalHours);
    
    //sets the weekday, date, and hours for each weekday
    dayDates.push("");
    dayDates.push("");
    for(i = 0; i < 7; i++)
    {
      date = sheets[i].getRange("F2").getDisplayValue();
      date = date.substring(6);
      dayDates.push(date);
    }  
    for(i = 2; i < 9; i++)
    {
      scheduleSheet.getRange(1, i+1).setValue(days[i]+"\n"+dayDates[i]+"\n"+dayHours[i]);
    }
    
    //removes existing schedule filter and creates a new one and sorts by name
    if(scheduleSheet.getFilter())
      scheduleSheet.getFilter().remove();
    
    scheduleSheet.getRange(1, 1, schedule.length+1, 11).createFilter(); 
    scheduleSheet.getFilter().sort(1, true);
    
    //checks to see if the view is set for schedule view
    //if it is, then it changes the schedule to schedule view
    if(scheduleSheet.getRange(76, 10).getDisplayValue() == "Schedule View")
    {
      scheduleSheet.getRange(76, 10).setValue("Deployment View");
      changeView("Schedule View");
    }
    
    //the time at the end of the script
    var miliTime2 = new Date();
    scheduleSheet.getRange("K1").setValue("Execution Time\n(ms): "+(miliTime2-miliTime1)+"\nErrors");
    //#endregion
  }
  else
  {
    //if the sheets are not configured correctly, ie. Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday, Schedule, Data then the script will not run
    ui.alert("Sheets Not Configured Properly");
  }   
}

function onlyUnique(value, index, self) 
{ 
    return self.indexOf(value) === index;
}