function sortByStartInput()
{
  var ui = SpreadsheetApp.getUi();
  
  var promptResult = ui.prompt('Sort By Day','Enter the day to be sorted',ui.ButtonSet.OK);
  var day = promptResult.getResponseText();
  var alertResult;
  
  if(promptResult.getSelectedButton() != ui.Button.CLOSE)
  {
    if((day.charAt(0) == "M" || day.charAt(0) == "m") && day != "Monday")
    {
      alertResult = ui.alert("User Value Correction","You entered " + day + ", did you mean Monday?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        day = "Monday";
      }
    }
    if(((day.charAt(0) == "T" || day.charAt(0) == "t") && day.charAt(1) == "u")&& day != "Tuesday")
    {
      alertResult = ui.alert("User Value Correction","You entered " + day + ", did you mean Tuesday?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        day = "Tuesday";
      }
    }
    if((day.charAt(0) == "W" || day.charAt(0) == "w") && day != "Wednesday")
    {
      alertResult = ui.alert("User Value Correction","You entered " + day + ", did you mean Wednesday?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        day = "Wednesday";
      }
    }
    if(((day.charAt(0) == "T" || day.charAt(0) == "t") && day.charAt(1) == "h")&& day != "Thursday")
    {
      alertResult = ui.alert("User Value Correction","You entered " + day + ", did you mean Thursday?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        day = "Thursday";
      }
    }
    if((day.charAt(0) == "F" || day.charAt(0) == "f") && day != "Friday")
    {
      alertResult = ui.alert("User Value Correction","You entered " + day + ", did you mean Friday?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        day = "Friday";
      }
    }
    if(((day.charAt(0) == "S" || day.charAt(0) == "s") && day.charAt(1) == "a")&& day != "Saturday")
    {
      alertResult = ui.alert("User Value Correction","You entered " + day + ", did you mean Saturday?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        day = "Saturday";
      }
    }
    if(((day.charAt(0) == "S" || day.charAt(0) == "s") && day.charAt(1) == "u")&& day != "Sunday")
    {
      alertResult = ui.alert("User Value Correction","You entered " + day + ", did you mean Sunday?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        day = "Sunday";
      }
    }    
    
    while((!(day == "Monday" || day == "Tuesday" || day == "Wednesday" || day == "Thursday" || day == "Friday" || day == "Saturday" || day == "Sunday")) 
           && promptResult.getSelectedButton() != ui.Button.CLOSE)
    {
      promptResult = ui.prompt('Sort By Day','Errant Entry\nEnter the day to be sorted',ui.ButtonSet.OK);
      day = promptResult.getResponseText();
    }
    if(promptResult.getSelectedButton() != ui.Button.CLOSE)
    {
      sortByStart(day);
    }
  }
}

function changeViewInput()
{
  var ui = SpreadsheetApp.getUi();
  
  var promptResult = ui.prompt('Change View','Enter the schedule view\nDeployment View or Schedule View',ui.ButtonSet.OK);
  var view = promptResult.getResponseText();
  
  var alertResult;
  
  if(promptResult.getSelectedButton() != ui.Button.CLOSE)
  {
    if((view.charAt(0) == "S" || view.charAt(0) == "s") && view != "Schedule View")
    {
      alertResult = ui.alert("User Value Correction","You entered " + view + ", did you mean Schedule View?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        view = "Schedule View";
      }
    }
    if((view.charAt(0) == "D" || view.charAt(0) == "d") && view != "Deployment View")
    {
      alertResult = ui.alert("User Value Correction","You entered " + view + ", did you mean Deployment View?",ui.ButtonSet.YES_NO);
      if(alertResult = ui.Button.YES)
      {
        view = "Deployment View";
      }
    }
    while((!(view == "Schedule View" || view == "Deployment View")) 
           && promptResult.getSelectedButton() != ui.Button.CLOSE)
    {
      promptResult = ui.prompt('Change View','Enter the schedule view\nDeployment View or Schedule View',ui.ButtonSet.OK);
      view = promptResult.getResponseText();
    }
    if(promptResult.getSelectedButton() != ui.Button.CLOSE)
    {
      changeView(view);
    }
  }
}

function sortByStart(day)
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var sheets = spreadsheet.getSheets(); //an array of the sheets in the current spreadsheet
  var ui = SpreadsheetApp.getUi(); //the spreadsheet ui object
  var scheduleSheet;
  var rangeText;
  var filter;
  var spaceCount = 0;
  var time1 = 0;
  var time2 = 0;
  var shift;
  var shiftSplit = [];
  var timeSplit = [];
  var i = 0;
  var shiftTimeValues = [];
  var view;
  if(sheets[7].getSheetName().search("Schedule") >= 0 && sheets[7].getFilter())
  {
    scheduleSheet = sheets[7];
    view = scheduleSheet.getRange("J76").getDisplayValue(); 
    filter = scheduleSheet.getFilter();

    if(day == "Monday")    
      rangeText = "C2:C" + filter.getRange().getNumRows(); 
    if(day == "Tuesday")    
      rangeText = "D2:D" + filter.getRange().getNumRows(); 
    if(day == "Wednesday")    
      rangeText = "E2:E" + filter.getRange().getNumRows(); 
    if(day == "Thursday")
      rangeText = "F2:F" + filter.getRange().getNumRows(); 
    if(day == "Friday")
      rangeText = "G2:G" + filter.getRange().getNumRows(); 
    if(day == "Saturday")
      rangeText = "H2:H" + filter.getRange().getNumRows(); 
    if(day == "Sunday")
      rangeText = "I2:I" + filter.getRange().getNumRows(); 
    
    scheduleSheet.getRange(2, 10, 74, 1).clearContent(); 
    
    if(view == "Deployment View")
    {
      var shiftValues = scheduleSheet.getRange(rangeText).getDisplayValues();
      for(i = 2; i < filter.getRange().getNumRows()+1; i++)
      {
        if(shiftValues[i-2] == "")
        {
          continue;
        }
        shift = String(shiftValues[i-2]);
        
        shiftSplit = shift.split("--");

        if(shiftSplit[0].indexOf(":") > 0)
        {
          timeSplit = shiftSplit[0].split(":");
          shiftTimeValues[0] = Number(timeSplit[0])+(Number(timeSplit[1])/60);
        }
        else
        {
          shiftTimeValues[0] = Number(shiftSplit[0]);
        }        
        
        time1 = shiftTimeValues[0];   
        if(shiftSplit[1] == "CL" && (time1 > 12 || time1 == 7))
        {
          time1+=12;
        }
        if(time1 < 7)
        {
          time1+=12;
        }  
        
        time1/=24;
        scheduleSheet.getRange("J"+i).setValue(time1); 
      }
      var filterRows = filter.getRange().getNumRows();
      
      scheduleSheet.getFilter().remove();
      filter = scheduleSheet.getRange("A1:J"+filterRows).createFilter(); 
      filter.sort(1,true).sort(10,true); 
    }
    else
    {
      var shiftValues = scheduleSheet.getRange(rangeText).getDisplayValues();
      for(i = 2; i < filter.getRange().getNumRows()+1; i++)
      {
        if(shiftValues[i-2] == "")
        {
          continue;
        }
        shift = String(shiftValues[i-2]);
        scheduleSheet.getRange("J"+i).setValue(shift.substring(0,8)); 
      }
      var filterRows = filter.getRange().getNumRows();
      
      scheduleSheet.getFilter().remove();
      filter = scheduleSheet.getRange("A1:J"+filterRows).createFilter(); 
      filter.sort(1,true).sort(10,true); 
    }
  }
  else
  {
    ui.alert("Sheets Not Configured Properly");
  }
}

function changeView(view)
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var sheets = spreadsheet.getSheets(); //an array of the sheets in the current spreadsheet
  var ui = SpreadsheetApp.getUi(); //the spreadsheet ui object
  var scheduleSheet;
  
  var shiftTimeValues = [];
  var shiftSplit = [];
  var timeSplit = [];
  
  var maxRange = 0;
  var shiftValues;
  var time1 = 0, time2 = 0;
  var stringTime1, stringTime2;
  var shift;
  var time1AMPM, time2AMPM;
  var time1Decimal, time2Decimal;

  var i = 0;
  var j = 0;
  
  if(sheets[7].getSheetName().search("Schedule") >= 0 && sheets[7].getFilter())
  {
    scheduleSheet = sheets[7];
    maxRange = scheduleSheet.getFilter().getRange().getNumRows();
    if(!(scheduleSheet.getRange("J76").getDisplayValue() == view)) 
    {
      if(view == "Schedule View")
      {
        scheduleSheet.getRange("J76").setValue("Schedule View"); 
        for(j = 3; j < 10; j++) 
        {
          shiftValues = scheduleSheet.getRange(2, j, maxRange).getDisplayValues();
          for(i = 0; i < maxRange; i++)
          {
            shift = shiftValues[i][0];
            if(shift == "")
              continue;
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
              if(j == 7 || j == 8)             
                shiftTimeValues[1] = 11.75;              
              else
                shiftTimeValues[1] = 10.75;
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
            
            time1AMPM = "AM";
            time1Decimal = (time1 - Math.floor(time1))*60;
            time1 = Math.floor(time1);

            time2AMPM = "AM";
            time2Decimal = (time2 - Math.floor(time2))*60;
            time2 = Math.floor(time2);
            
            if(time1 == 12)
            {
              time1AMPM = "PM";
            }
            if(time1 > 12)
            {
              time1-=12;
              time1AMPM = "PM";
            }
            
            if(time1Decimal == 0)            
              stringTime1 = time1 + ":00 "+time1AMPM;            
            else                         
              stringTime1 = time1 + ":" + time1Decimal + " "+time1AMPM;
                        
            if(time2 >= 12)
            {
              time2-=12;
              time2AMPM = "PM";
            }
            if(time2Decimal == 0)            
              stringTime2 = time2 + ":00 "+ time2AMPM;            
            else            
              stringTime2 = time2 + ":" + time2Decimal + " "+time2AMPM;
            
            if(time1<10)
              stringTime1="0"+stringTime1;
            if(time2<10)
              stringTime2="0"+stringTime2;
            shiftValues[i][0] = stringTime1 + "--" + stringTime2;
          }
          scheduleSheet.getRange(2, j, maxRange).setValues(shiftValues); 
          scheduleSheet.setColumnWidth(j, 115); 
        }
      }
      if(view == "Deployment View")
      {
        scheduleSheet.getRange("J76").setValue("Deployment View"); 
        for(j = 3; j < 10; j++) //update index
        {
          shiftValues = scheduleSheet.getRange(2, j, maxRange).getDisplayValues();
          for(i = 0; i < maxRange; i++)
          {
            //ui.alert(shiftValues);
            if(shiftValues[i][0] == "")
              continue;
            shift = shiftValues[i][0];
            shiftSplit = shift.split("--");
            shiftSplit[0] = shiftSplit[0].substring(0,5);
            shiftSplit[1] = shiftSplit[1].substring(0,5);
            
            if(shiftSplit[0].charAt(3) == "0" && shiftSplit[0].charAt(4) == "0")
            {
              shiftSplit[0] = shiftSplit[0].substring(0,2);
            }
            if(shiftSplit[0].charAt(0) == "0")
            {
              shiftSplit[0] = shiftSplit[0].substring(1,shiftSplit[0].length);
            }            
            if(shiftSplit[1] === "11:45" || shiftSplit[1] === "10:45")
            {
              shiftSplit[1] = "CL";
            }
            else
            {
              if(shiftSplit[1].charAt(3) == "0" && shiftSplit[1].charAt(4) == "0")
              {
                shiftSplit[1] = shiftSplit[1].substring(0,2);
              }
              if(shiftSplit[1].charAt(0) == "0")
              {
              shiftSplit[1] = shiftSplit[1].substring(1,shiftSplit[1].length);
              }
            }            
            shiftValues[i][0] = shiftSplit[0] + "--" + shiftSplit[1];
          }
          scheduleSheet.getRange(2, j, maxRange).setValues(shiftValues);
          scheduleSheet.setColumnWidth(j, 92);
        }
      }
    }
  }
  else
  {
    ui.alert("Sheets Not Configured Properly");
  }
}

function filterManagers()
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var scheduleSheet = spreadsheet.getSheetByName("Schedule");
  var ui = SpreadsheetApp.getUi();
  
  var numberNames = scheduleSheet.getFilter().getRange().getNumRows() - 1;
  var names = scheduleSheet.getRange(2,1,numberNames).getDisplayValues();

  var managers = spreadsheet.getRangeByName("Managers").getDisplayValues();
  
  var i = 0, j = 0;
  
  for(i = 0; i < names.length; i++)
  {
    for(j = 0; j < managers.length; j++)
    {
      if(names[i] == managers[j][0])
      {
        names.splice(i,1);
        i--;
      }
    }
  }
  
  var criteria = SpreadsheetApp.newFilterCriteria()
  .setHiddenValues(names)
  .build();
  scheduleSheet.getFilter().removeColumnFilterCriteria(1).setColumnFilterCriteria(1, criteria);
  scheduleSheet.getFilter().sort(1, true);
}

function filterCrewChiefs()
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var scheduleSheet = spreadsheet.getSheetByName("Schedule");
  var ui = SpreadsheetApp.getUi();
  
  var numberNames = scheduleSheet.getFilter().getRange().getNumRows() - 1;
  var names = scheduleSheet.getRange(2,1,numberNames).getDisplayValues();

  var crewChiefs = spreadsheet.getRangeByName("CrewChiefs").getDisplayValues();
  
  var i = 0, j = 0;
  
  for(i = 0; i < names.length; i++)
  {
    for(j = 0; j < crewChiefs.length; j++)
    {
      if(names[i] == crewChiefs[j][0])
      {
        names.splice(i,1);
        i--;
      }
    }
  }
  
  var criteria = SpreadsheetApp.newFilterCriteria()
  .setHiddenValues(names)
  .build();
  scheduleSheet.getFilter().removeColumnFilterCriteria(1).setColumnFilterCriteria(1, criteria);
  scheduleSheet.getFilter().sort(1, true);
}

function clearFilter()
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var scheduleSheet = spreadsheet.getSheetByName("Schedule");
  
  scheduleSheet.getFilter().removeColumnFilterCriteria(1);
  scheduleSheet.getFilter().sort(1, true);
}

function updateSchedule()
{
  var spreadsheet = SpreadsheetApp.getActive();
  var changeLogSheet = spreadsheet.getSheetByName("Changelog");
  var scheduleSheet = spreadsheet.getSheetByName("Schedule");
  var ui = SpreadsheetApp.getUi();
  var i;
  var editType,changeType, oldValue, newValue, correspondingValue, cell, date;
  var days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  var schedule = scheduleSheet.getFilter().getRange().getDisplayValues();
  var employeeNames = spreadsheet.getRangeByName("Names").getDisplayValues();

  var numChanges = spreadsheet.getRangeByName("NumChanges").getDisplayValue();
  var changes = changeLogSheet.getRange(2,1,numChanges,7).getDisplayValues();
  ui.alert(changes);
  
  if(numChanges == 1)
  {
    //assign values
    editType = changes[0][0];
    changeType = changes[0][1];
    oldValue = changes[0][2];
    newValue = changes[0][3];
    correspondingValue = changes[0][4];
    cell = changes[0][5];
    date = changes[0][6];
    for(i = 0; i < days.length; i++)
    {
      if(date == days[i])
      {
        date = i+3;
      }
    }

    if(changeType == "Person")
    {
      ui.alert("Person");
      var oldPerson = oldValue;
      var newPerson = newValue;
      var shift = correspondingValue;

      for(i = 0; i < employeeNames.length; i++)
      {
        if(employeeNames[i][0] == oldPerson)
        {
          oldPerson = employeeNames[i][1];
        }
        if(employeeNames[i][0] == newPerson)
        {
          newPerson = employeeNames[i][1];
        }
      }
      ui.alert(oldPerson + ", " + newPerson);

      //delete shift from old person and assign shift from new person 
      var oldPersonFound = false;
      var newPersonFound = false;
      for(i = 1; i < schedule.length && !(oldPersonFound && newPersonFound); i++)
      {
        if(!oldPersonFound && oldPerson == schedule[i][0])
        {
          scheduleSheet.getRange(i+1,date).setValue("");
          oldPersonFound = true;
        }
        if(!newPersonFound && newPerson == schedule[i][0])
        {
          scheduleSheet.getRange(i+1,date).setValue(shift);
          newPersonFound = true;
        }
      }    
    }
    
    if(changeType == "Shift")
    {
      ui.alert("Shift");
      var newShift = newValue;
      var person = correspondingValue;

      for(i = 0; i < employeeNames.length; i++)
      {
        if(employeeNames[i][0] == person)
        {
          person = employeeNames[i][1];
        }
      }

      var personFound = false;
      for(i = 1; i < schedule.length && !personFound; i++)
      {
        if(schedule[i][0] == person)
        {
          scheduleSheet.getRange(i+1,date).setValue(newShift);
          personFound = true;
        }
      }
    }
  }
}