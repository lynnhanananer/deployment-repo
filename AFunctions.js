function onOpen(e)
{
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Deployment Menu')
  .addItem('Build Schedule','buildSchedule')
  .addItem('Show Sidebar', 'showSidebar')  
  .addItem('Clear Schedule','clearScheduleUi')
  .addItem("Employee Editor","showDialog")  
  .addSeparator()
  .addSubMenu(ui.createMenu("Deployment Functions")
    .addItem('Fill Roles','fillRoles')
    .addSeparator()
    .addItem("Swap Shifts","SwapValue2")
    .addItem("Separate Shift",'separateShift')
    .addItem("Combine Shifts",'combineShiftsDialog'))
  .addSubMenu(ui.createMenu("Schedule Functions")
    .addItem('Sort By Day','sortByStartInput')
    .addItem('Change View','changeViewInput')
    .addItem('Filter Managers','filterManagers')
    .addItem('Filter Crew Chiefs','filterCrewChiefs')
    .addItem('Clear Filter','clearFilter')
    .addItem('Update Schedule Test','updateSchedule'))
  .addSubMenu(ui.createMenu("Schedule Comparer")
    .addItem('Copy Schedule','copySchedule')
    .addItem('Format RedPrairie','formatRedPrairie')
    .addItem('Compare Schedules','compareSchedules')
    .addItem('Clear Formatting','clearFormatting'))
  .addSubMenu(ui.createMenu("Availability Functions")
    .addItem("Get Available","getAvailable")
    .addItem("Availability Dialog","availabilityDialog"))
  .addToUi();   
}

function setUp()
{
  var spreadsheet = SpreadsheetApp.getActive();
  var triggers = ScriptApp.getProjectTriggers();
  if(triggers.length = 0)
  {
    ScriptApp.newTrigger("showSidebar").forSpreadsheet(spreadsheet).onOpen().create();
  }
  else
  {
    SpreadsheetApp.getUi().alert("Your spreadsheet has already been set up!");
  }
}

function showSidebar() {
  var html = HtmlService.createTemplateFromFile('Sidebar/NewSidebar').evaluate();
  html.setTitle("Sidebar");
  SpreadsheetApp.getUi().showSidebar(html);
}

function getScheduleNames()
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var sheets = spreadsheet.getSheets(); //an array of the sheets in the current spreadsheet
  var ui = SpreadsheetApp.getUi(); //the spreadsheet ui object
  var scheduleSheet; 
  var numNames = 0;
  var nameValues = [];
  var names = [];
  var i;
  
  if(sheets[7].getSheetName().search("Schedule") >= 0 && sheets[7].getFilter())
  {
    scheduleSheet = sheets[7];
    numNames = scheduleSheet.getFilter().getRange().getNumRows() - 1;
    //ui.alert(numNames);
    
    nameValues = scheduleSheet.getRange(2, 1, numNames).getDisplayValues();
    for(i = 0; i < nameValues.length; i++)
    {
      names[i] = nameValues[i][0];
    }
    //ui.alert(names);
    return names;
  }
}

function getNames()
{
  var spreadsheet = SpreadsheetApp.getActive();
  var namesRange = spreadsheet.getRangeByName("Names").getDisplayValues();
  var i;
  var names = [];
  for(i = 0; i < namesRange.length; i++)
  {
    names.push(namesRange[i][1]);
  }
  return names;
}

function getEmployeeShifts(employee)
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var sheets = spreadsheet.getSheets(); //an array of the sheets in the current spreadsheet
  var ui = SpreadsheetApp.getUi(); //the spreadsheet ui object
  var scheduleSheet; 
  var numNames = 0;
  var nameValues = [];
  var nameIndex = -1;
  var employeeSheetData = [];
  var employeeData = [];
  var tempData;
  if(sheets[7].getSheetName().search("Schedule") >= 0 && sheets[7].getFilter())
  {
    scheduleSheet = sheets[7];
    numNames = scheduleSheet.getFilter().getRange().getNumRows() - 1;
    //ui.alert(numNames);
    
    nameValues = scheduleSheet.getRange(2, 1, numNames).getDisplayValues();
    for(i = 0; i < nameValues.length; i++)
    {
      if(nameValues[i] == employee)
      {
        nameIndex = i;
        //ui.alert(employee + " found!");
      }
    }
    if(nameIndex >= 0)
    {
      employeeSheetData = scheduleSheet.getRange(nameIndex+2,1,1,9).getDisplayValues();
      //ui.alert(employeeSheetData);
      employeeData[0] = employeeSheetData[0][0];
      for(i = 2; i < employeeSheetData[0].length; i++)
      {
        employeeData[i-1] = employeeSheetData[0][i];
      }
      employeeData[i-1] = employeeSheetData[0][1];
      return employeeData;
    }    
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

function include(filename)
{
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSheetCategory()
{
  var activeSheet = SpreadsheetApp.getActiveSheet();
  if(activeSheet.getIndex() < 8)
  {
    return "Deployment";
  }
  else if(activeSheet.getSheetName() == "Schedule")
  {
    return "Schedule";
  }
  else if(activeSheet.getSheetName() == "Schedule Comparer")
  {
    return "Schedule Comparer";
  }
  else
  {
    return "Other";
  }
}

function showDialog() {
  var html = HtmlService.createTemplateFromFile('EmployeeDialog').evaluate();
  html.setWidth(792).setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Employee Editor');
}
