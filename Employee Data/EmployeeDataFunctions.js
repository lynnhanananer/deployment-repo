function getEmployeeData(employee) //updated
{
  var spreadsheet = SpreadsheetApp.getActive();
  var employeeData = spreadsheet.getRangeByName("EmployeeData").getDisplayValues();
  var i;

  for(i = 0; i < employeeData.length; i++)
  {
    if(employee == employeeData[i][1])
    {
      return employeeData[i];
    }
  }
}

function updateEmployeeData(employeeData) //updated for house
{
  var spreadsheet = SpreadsheetApp.getActive();
  var employeeData1 = [];
  employeeData1.push([employeeData[0]]);
  for(i = 1; i < 3; i++)
  {
    employeeData1[0].push(employeeData[i]);
  }
  var hireDate = employeeData[3];
  var employeeData2 = [];
  employeeData2.push([employeeData[4]])
  for(i = 5; i < employeeData.length-1; i++)
  {
    employeeData2[0].push(employeeData[i]);
  }
  var names = spreadsheet.getRangeByName("Names").getDisplayValues();
  var employeeRow = 0;
  for(i = 0; i < names.length; i++)
  {
    if(names[i][1] == employeeData[employeeData.length-1])
    {
      employeeRow = i+2;
    }
  } 
  if(employeeRow == 0)
  {
    spreadsheet.toast("Error: Employee " + employeeData[employeeData.length-1] + " Could Not Be Found");
  }
  else
  {
    var dataSheet = spreadsheet.getSheetByName("Employee Data");
    dataSheet.getRange(employeeRow,1,1,3).setValues(employeeData1);
    dataSheet.getRange(employeeRow,4).setFormula("=DATEDIF(OFFSET($A$1,ROW()-1,2),RIGHT(Monday!$F$2,LEN(Monday!$F$2)-6)+1,\"y\")");
    dataSheet.getRange(employeeRow,5).setValue(hireDate);
    dataSheet.getRange(employeeRow,6).setFormula("=IF(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"d\")<90,DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"m\")&\"m, \"&TEXT(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"md\"),\"00\")&\"d (\"&TEXT(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"d\"),\"00\")&\")\",DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"y\")&\"y, \"&TEXT(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"ym\"),\"00\")&\"m, \"&TEXT(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"md\"),\"00\")&\"d\")");
    dataSheet.getRange(employeeRow,7,1,employeeData2[0].length).setValues(employeeData2);
  }
}

function addNewEmployee(employeeData) //updated for house
{
  var spreadsheet = SpreadsheetApp.getActive();
  var dataSheet = spreadsheet.getSheetByName("Employee Data");
  var employeeData1 = [];
  employeeData1.push([employeeData[0]]);
  for(i = 1; i < 3; i++)
  {
    employeeData1[0].push(employeeData[i]);
  }
  var hireDate = employeeData[3];
  var employeeData2 = [];
  employeeData2.push([employeeData[4]])
  for(i = 5; i < employeeData.length; i++)
  {
    employeeData2[0].push(employeeData[i]);
  }

  namedRanges = dataSheet.getNamedRanges();
  for(i = 0; i < namedRanges.length; i++)
  {
    if(namedRanges[i].getName() == "Names")
    {
      var names = namedRanges[i];
    }
    if(namedRanges[i].getName() == "EmployeeData")
    {
      var employeeDataRange = namedRanges[i];
    }
  }
  var namesRange = names.getRange();
  dataSheet.getRange(namesRange.getNumRows()+2,1,1,3).setValues(employeeData1);
  dataSheet.getRange(namesRange.getNumRows()+2,4).setFormula("=DATEDIF(OFFSET($A$1,ROW()-1,2),RIGHT(Monday!$F$2,LEN(Monday!$F$2)-6)+1,\"y\")");
  dataSheet.getRange(namesRange.getNumRows()+2,5).setValue(hireDate);
  dataSheet.getRange(namesRange.getNumRows()+2,6).setFormula("=IF(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"d\")<90,DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"m\")&\"m, \"&TEXT(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"md\"),\"00\")&\"d (\"&TEXT(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"d\"),\"00\")&\")\",DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"y\")&\"y, \"&TEXT(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"ym\"),\"00\")&\"m, \"&TEXT(DATEDIF(OFFSET($A$1,ROW()-1,4),TODAY(),\"md\"),\"00\")&\"d\")");
  dataSheet.getRange(namesRange.getNumRows()+2,7,1,employeeData2[0].length).setValues(employeeData2);
  names.setRange(dataSheet.getRange(2,1,namesRange.getNumRows()+1,2));
  employeeDataRange.setRange(dataSheet.getRange(2,1,namesRange.getNumRows()+1,26));

  dataSheet.getRange(1, 1, namesRange.getNumRows()+2, 26).createFilter(); 
  dataSheet.getFilter().sort(2, true);
  dataSheet.getFilter().remove();
}

function deleteEmployee(employee)
{
  var spreadsheet = SpreadsheetApp.getActive();
  var dataSheet = spreadsheet.getSheetByName("Employee Data");
  var namedRanges = dataSheet.getNamedRanges();
  var i = 0;
  for(i = 0; i < namedRanges.length; i++)
  {
    if(namedRanges[i].getName() == "EmployeeData")
    {
      var employeeDataRange = namedRanges[i];
    }
  }

  var employeeData = employeeDataRange.getRange().getDisplayValues();
  var nameIndex;
  for(i = 0; i < employeeData.length; i++)
  {
    if(employee == employeeData[i][1])
    {
      nameIndex = i;
      break;
    }
  }
  dataSheet.getRange(nameIndex+2,1,1,employeeData[0].length).deleteCells(SpreadsheetApp.Dimension.ROWS);
}