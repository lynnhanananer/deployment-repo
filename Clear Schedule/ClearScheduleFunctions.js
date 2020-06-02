function clearScheduleUi()
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var sheets = spreadsheet.getSheets(); //an array of the sheets in the current spreadsheet
  var ui = SpreadsheetApp.getUi(); //the spreadsheet ui object

  
  if(sheets[0].getSheetName().search('Monday') >= 0 &&
     sheets[1].getSheetName().search('Tuesday') >= 0 &&
     sheets[2].getSheetName().search('Wednesday') >= 0 &&
     sheets[3].getSheetName().search('Thursday') >= 0 &&
     sheets[4].getSheetName().search('Friday') >= 0 &&
     sheets[5].getSheetName().search('Saturday') >= 0 &&
     sheets[6].getSheetName().search('Sunday') >= 0 &&
     sheets[7].getSheetName().search('Schedule') >= 0 &&
     sheets[8].getSheetName().search('Data') >= 0)
  {
    var html = HtmlService.createHtmlOutputFromFile('ClearScheduleSidebar').setTitle('Clear Schedule');
    SpreadsheetApp.getUi().showSidebar(html);
  }
}

function clearSchedule(names)
{
  var miliTime1 = new Date();
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var sheets = spreadsheet.getSheets(); //an array of the sheets in the current spreadsheet
  var ui = SpreadsheetApp.getUi(); //the spreadsheet ui object
  var i = 0, j = 0, k = 0, l = 0;
  var deploymentValues = [];
  var namedRanges = [];
  var employeeNames = [];
  var dataSheet;
  var openingValues = [];
  
  if(names.length > 0)
  {  
    //convert schedule names into deployment names
    dataSheet = spreadsheet.getSheetByName("Employee Data");
    namedRanges = dataSheet.getNamedRanges();
    for(i = 0; i < namedRanges.length; i++)
    {
      if(namedRanges[i].getName() == "Names")
      {
        //ui.alert("Found Names");
        employeeNames = namedRanges[i].getRange().getValues();
      }
    }
    
    for(i = 0; i < names.length; i++)
    {
      for(j = 0; j < employeeNames.length; j++)
      {
        if(names[i] === employeeNames[j][1])
          names[i] = employeeNames[j][0];
      }
    }  
    
    for(i = 0; i < 8; i++)
    {
      deploymentValues = sheets[i].getRange('C10:D55').getValues();
      openingValues = sheets[i].getRange('C4:H6').getValues();
      for(j = 0; j < deploymentValues.length; j++)
      {
        for(k = 0; k < names.length; k++)
        {
          if(deploymentValues[j][0] === names[k])
          {
            deploymentValues[j][0] = "Blank";
          }
          else if(deploymentValues[j][0].indexOf(names[k]) >= 0)
          {
            //ui.alert(deploymentValues[j][0]);
            if(deploymentValues[j][0].indexOf(names[k]) > 0)
            {
              if(deploymentValues[j][0].indexOf("train") >= 0)              
              {
                deploymentValues[j][0] = deploymentValues[j][0].replace(names[k],"Blank");   
                sheets[i].getRange(j+10,3).setFontColor("red");
              }
              else if(deploymentValues[j][0].indexOf("/") >= 0)     
              {
                deploymentValues[j][0] = deploymentValues[j][0].replace(names[k],"Blank");   
                sheets[i].getRange(j+10,3).setFontColor("red");
              }                            
            }
            if(deploymentValues[j][0].indexOf(names[k]) == 0)
            {
              if(deploymentValues[j][0].indexOf("train") >= 0)
              {
                deploymentValues[j][0] = deploymentValues[j][0].replace(names[k],"Blank");  
                sheets[i].getRange(j+10,3).setFontColor("red");
              }
              else if(deploymentValues[j][0].indexOf("/") >= 0)        
              {
                deploymentValues[j][0] = deploymentValues[j][0].replace(names[k],"Blank");  
                sheets[i].getRange(j+10,3).setFontColor("red");
              } 
            }
          }
        }
      }
      for(j = 0; j < openingValues.length; j++)
      {
        for(k = 0; k < openingValues[0].length; k++)
        {
          for(l = 0; l < names.length; l++)
          {
            if(openingValues[j][k] === names[l])
            {
              openingValues[j][k] = "Blank";
              sheets[i].getRange(j+4,k+3).setFontColor("red");
            }
          }          
        }
      }
      sheets[i].getRange('C4:H6').setValues(openingValues);
      sheets[i].getRange('C10:D55').setValues(deploymentValues);
    }
  }
  else
  {
    ui.alert("All names were selected.");
  }
  var miliTime2 = new Date();
  ui.alert(miliTime2-miliTime1);
}
