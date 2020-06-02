function fillRoles()
{
  var spreadsheet = SpreadsheetApp.getActive(); //the current spreadsheet object
  var sheets = spreadsheet.getSheets(); //an array of the sheets in the current spreadsheet
  var ui = SpreadsheetApp.getUi(); //the spreadsheet ui object
  var activeSheet = spreadsheet.getActiveSheet(); //the active sheet
  var isOnDaySheet = false; //the boolean value for checking if the user is on a daily deployment sheet

  var lunchValues = []; //the values for the current lunch shift
  var dinnerValues = []; //the values for the current dinner shift
  var openers = [], earlyOpeners = []; //lists for the two different times of openers
  var closers = []; //list for the closers
  var rank, index, temp, promptResult, alertResult; //used in the role searching and assignment algorithm

  var yesterdaySheet; //yesterday's deployment sheet
  var yesterdayDinnerValues = []; //yesterday's dinner values
  var yesterdayClosers = []; //yesterday's closers

  var porter = "", custard = "", diningRoom = "", kitchen = "", managerOpen = "", managerClose = ""; //the strings for the roles
  var porterList = [], custardList = [], diningRoomList = [], kitchenList = [], managerOpenList = [], managerCloseList = []; //the list of the people trained to complete each role
  var custardRange, kitchenRange, diningRoomRange, managerOpenRange, porterRange, managerCloseRange; //the ranges of the named ranges for each role

  var i = 0, j = 0; //iterable values


  for(i = 0; i < 7; i++)
  {
    if(sheets[i].getSheetName() == activeSheet.getSheetName())
    {
      isOnDaySheet = true;
    }
  }
  
  if(isOnDaySheet)
  {
    //#region Spreadsheet Data Acquisition
    //gets named ranges for lists of opening duties, opening manager and closing manager
    porterList = spreadsheet.getRangeByName("PorterList").getDisplayValues();
    custardList = spreadsheet.getRangeByName("CustardList").getDisplayValues();
    diningRoomList = spreadsheet.getRangeByName("DiningRoomList").getDisplayValues();
    kitchenList = spreadsheet.getRangeByName("KitchenList").getDisplayValues();
    managerOpenList = spreadsheet.getRangeByName("ManagerOpenList").getDisplayValues();
    managerCloseList = spreadsheet.getRangeByName("ManagerCloseList").getDisplayValues();    
    
    lunchValues = activeSheet.getRange('C10:D19').getDisplayValues();
    lunchValues = lunchValues.concat(activeSheet.getRange('C21:D23').getDisplayValues(),                                     activeSheet.getRange('C25:D30').getDisplayValues());
    
    dinnerValues = activeSheet.getRange('C35:D44').getDisplayValues();
    dinnerValues = dinnerValues.concat(activeSheet.getRange('C46:D48').getDisplayValues(),                                      activeSheet.getRange('C50:D55').getDisplayValues());
    //#endregion

    //does not search for training within a split shift

    //#region Opening Roles Assignment
    /*
    this loop adds the names of the people deployed during the lunch shift to two lists:
    1. if their shift starts at 9 they are added to the openers list which includes the kitchen, custard and dining room openers
    2. if their shift starts at 7 they are added to the early openers list which includes the opening manager and porter
    otherwise they are not considered an opener and are not added to either lists
    */
    for(i = 0; i < lunchValues.length; i++)
    {
      if(lunchValues[i][1].charAt(0) == "9")
      {
        openers.push(lunchValues[i][0]);
      }
      if(lunchValues[i][1].charAt(0) == "7")
      {
        earlyOpeners.push(lunchValues[i][0]);
      }
    }

    //this section contains the comments for the role searching and assignment algorithm
    //searches the list of openers to find matches
    //custard
    rank = custardList.length;
    index = openers.length;
    for(i = 0; i < openers.length; i++)
    {
      for(j = 0; j < custardList.length; j++)
      {
        /*
        if a match is found and the rank of the match is better than the rank of the previous match
        the match is assigned as the opener, the rank of the opener is set and the index of the opener
        in the openers array is set.
        */
        if(openers[i] == custardList[j] && rank > j)
        {
          custard = openers[i];
          rank = j;
          index = i;
        }
      }
    }
    if(index != openers.length) //if an opener is found, they are removed from the list
    {
      temp = openers[openers.length-1];
      openers[openers.length-1] = openers[index];
      openers[index] = temp;
      openers.pop();
    }
    else //if the opener is not found, the user can choose to enter the opener
    {
      promptResult = ui.prompt("Missing Custard Opener","There is no custard opener deployed, please enter" + 
                               "\nthe custard opener or press cancel to decline.",ui.ButtonSet.OK_CANCEL);
      if(promptResult.getSelectedButton() == ui.Button.OK && promptResult.getResponseText() != "")
      {
        //if the user enters an opener, it is assigned and the user can opt to add the entered opener to the list of openers for the role
        custard = promptResult.getResponseText();
        alertResult = ui.alert("Add to list?","Would you like to add " + custard + " to the list of custard openers?",ui.ButtonSet.YES_NO);
        if(alertResult == ui.Button.YES)
        {
          //if the users chooses to add the entered opener to the list, it is added to the cell and the named range is reassigned
          custardRange = spreadsheet.getRangeByName("CustardList");
          spreadsheet.getSheetByName("Settings").getRange(custardRange.getLastRow()+1,custardRange.getColumn()).setValue(custard);
          spreadsheet.setNamedRange("CustardList",spreadsheet.getSheetByName("Settings").getRange(custardRange.getRow(),custardRange.getColumn(),custardRange.getNumRows()+1,custardRange.getNumColumns()));  
        }        
      }
      else
      {
        custard = "Blank";
      }
    }
    
    //kitchen
    rank = kitchenList.length;
    index = openers.length;
    for(i = 0; i < openers.length; i++)
    {
      for(j = 0; j < kitchenList.length; j++)
      {
        if(openers[i] == kitchenList[j] && rank > j)
        {
          kitchen = openers[i];
          rank = j;
          index = i;
        }
      }
    }
    if(index != openers.length)
    {
      temp = openers[openers.length-1];
      openers[openers.length-1] = openers[index];
      openers[index] = temp;
      openers.pop();
    }
    else
    {
      promptResult = ui.prompt("Missing Kitchen Opener","There is no kitchen opener deployed, please enter" + 
                               "\nthe kitchen opener or press cancel to decline.",ui.ButtonSet.OK_CANCEL);
      if(promptResult.getSelectedButton() == ui.Button.OK && promptResult.getResponseText() != "")
      {
        kitchen = promptResult.getResponseText();
        alertResult = ui.alert("Add to list?","Would you like to add " + kitchen + " to the list of kitchen openers?",ui.ButtonSet.YES_NO);
        if(alertResult == ui.Button.YES)
        {
          kitchenRange = spreadsheet.getRangeByName("KitchenList");
          spreadsheet.getSheetByName("Settings").getRange(kitchenRange.getLastRow()+1,kitchenRange.getColumn()).setValue(kitchen);
          spreadsheet.setNamedRange("KitchenList",spreadsheet.getSheetByName("Settings").getRange(kitchenRange.getRow(),kitchenRange.getColumn(),kitchenRange.getNumRows()+1,kitchenRange.getNumColumns()));
        }        
      }
      else
      {
        kitchen = "Blank";
      }
    }

    //diningRoom
    rank = diningRoomList.length;
    index = openers.length;
    for(i = 0; i < openers.length; i++)
    {
      for(j = 0; j < diningRoomList.length; j++)
      {
        if(openers[i] == diningRoomList[j] && rank > j)
        {
          diningRoom = openers[i];
          rank = j;
          index = i;
        }
      }
    }
    if(index != openers.length)
    {
      temp = openers[openers.length-1];
      openers[openers.length-1] = openers[index];
      openers[index] = temp;
      openers.pop();
    }
    else
    {
      promptResult = ui.prompt("Missing Dining Room Opener","There is no dining room opener deployed, please enter" +  
                               "\nthe dining room opener or press cancel to decline.",ui.ButtonSet.OK_CANCEL);
      if(promptResult.getSelectedButton() == ui.Button.OK && promptResult.getResponseText() != "")
      {
        diningRoom = promptResult.getResponseText();
        alertResult = ui.alert("Add to list?","Would you like to add " + diningRoom + " to the list of dining room openers?",ui.ButtonSet.YES_NO);
        if(alertResult == ui.Button.YES)
        {
          diningRoomRange = spreadsheet.getRangeByName("DiningRoomList");
          spreadsheet.getSheetByName("Settings").getRange(diningRoomRange.getLastRow()+1,diningRoomRange.getColumn()).setValue(diningRoom);
          spreadsheet.setNamedRange("DiningRoomList",spreadsheet.getSheetByName("Settings").getRange(diningRoomRange.getRow(),diningRoomRange.getColumn(),diningRoomRange.getNumRows()+1,diningRoomRange.getNumColumns()));
        }        
      }
      else
      {
        diningRoom = "Blank";
      }
    }
    
    //opening manager
    rank = managerOpenList.length;
    index = earlyOpeners.length;
    for(i = 0; i < earlyOpeners.length; i++)
    {
      for(j = 0; j < managerOpenList.length; j++)
      {
        if(earlyOpeners[i] == managerOpenList[j] && rank > j)
        {
          managerOpen = earlyOpeners[i];
          rank = j;
          index = i;
        }
      }
    }
    if(index != earlyOpeners.length)
    {
      temp = earlyOpeners[earlyOpeners.length-1];
      earlyOpeners[earlyOpeners.length-1] = earlyOpeners[index];
      earlyOpeners[index] = temp;
      earlyOpeners.pop();
    }
    else
    {
      promptResult = ui.prompt("Missing Opening Manager","There is no opening manager deployed, please enter" +  
                               "\nthe opening manager or press cancel to decline.",ui.ButtonSet.OK_CANCEL);
      if(promptResult.getSelectedButton() == ui.Button.OK && promptResult.getResponseText() != "")
      {
        managerOpen = promptResult.getResponseText();
        alertResult = ui.alert("Add to list?","Would you like to add " + managerOpen + " to the list of opening managers?",ui.ButtonSet.YES_NO);
        if(alertResult == ui.Button.YES)
        {
          managerOpenRange = spreadsheet.getRangeByName("ManagerOpenList");
          spreadsheet.getSheetByName("Settings").getRange(managerOpenRange.getLastRow()+1,managerOpenRange.getColumn()).setValue(managerOpen);
          spreadsheet.setNamedRange("ManagerOpenList",spreadsheet.getSheetByName("Settings").getRange(managerOpenRange.getRow(),managerOpenRange.getColumn(),managerOpenRange.getNumRows()+1,managerOpenRange.getNumColumns()));
        }        
      }
      else
      {
        managerOpen = "Blank";
      }
    }

    //porter
    rank = porterList.length;
    index = earlyOpeners.length;
    for(i = 0; i < earlyOpeners.length; i++)
    {
      for(j = 0; j < porterList.length; j++)
      {
        if(earlyOpeners[i] == porterList[j] && rank > j)
        {
          porter = earlyOpeners[i];
          rank = j;
          index = i;
        }
      }
    }
    if(index != earlyOpeners.length)
    {
      temp = earlyOpeners[earlyOpeners.length-1];
      earlyOpeners[earlyOpeners.length-1] = earlyOpeners[index];
      earlyOpeners[index] = temp;
      earlyOpeners.pop();
    }    
    else
    {        
      //this section deviates from the other parts because the porter duties can be completed the night before instead of the morning
      //the user is prompted if the porter duties are completed the night before      
      alertResult = ui.alert("Missing Porter","The deployment date is " + activeSheet.getSheetName() + " were\nthe porter duties completed last night?",ui.ButtonSet.YES_NO);
      if(alertResult == ui.Button.YES)
      {
        //if the user states that the porter duties were completed the night before it first checks that the day before is not the Sunday of the previous week, as at this time we cannot pull data from last week's deployment sheet
        if(activeSheet.getSheetName() == "Monday")
        {
          ui.alert("Error","Cannot pull sheet data from previous day.",ui.ButtonSet.OK_CANCEL);
        }
        else
        {
          //this gets the night shifts deployed on the previous day
          yesterdaySheet = sheets[activeSheet.getIndex()-2];
          yesterdayDinnerValues = yesterdaySheet.getRange('C35:D44').getDisplayValues();
          yesterdayDinnerValues = yesterdayDinnerValues.concat(yesterdaySheet.getRange('C46:D48').getDisplayValues(),yesterdaySheet.getRange('C50:D55').getDisplayValues());
          
          //like the openers assignment this checks if the night shift shifts are closers and then adds them to the closers list if they close
          for(i = 0; i < yesterdayDinnerValues.length; i++)
          {
            if(yesterdayDinnerValues[i][1].charAt(yesterdayDinnerValues[i][1].length-1) == "L")
            {
              yesterdayClosers.push(yesterdayDinnerValues[i][0]);
            }
          }

          //this section behaves exactly like the role assignment and ranking algorithm used previously
          rank = porterList.length;
          index = yesterdayClosers.length;
          for(i = 0; i < yesterdayClosers.length; i++)
          {
            for(j = 0; j < porterList.length; j++)
            {
              if(yesterdayClosers[i] == porterList[j] && rank > j)
              {
                //as the porter duties are completed the night before " (night before)" is added to the end of the name
                porter = yesterdayClosers[i] + " (night before)";
                rank = j;
                index = i;
              }
            }
          }
          /*
          because we only have one role to fill with the yesterdays closers, we dont need to remove their name from the closers list
          and instead we can skip right to checking if a porter was found from yesterday's closers
          */
          if(index == yesterdayClosers.length)
          {
            //this part behaves exactly like the missing role assignment and user interaction
            promptResult = ui.prompt("Missing Porter","There is no porter deployed last night, please enter\nthe porter or press cancel to decline.",ui.ButtonSet.OK_CANCEL);
            if(promptResult.getSelectedButton() == ui.Button.OK && promptResult.getResponseText() != "")
            {
              porter = promptResult.getResponseText();
              alertResult = ui.alert("Add to list?","Would you like to add " + porter + " to the list of porters?",ui.ButtonSet.YES_NO);
              if(alertResult == ui.Button.YES)
              {
                porterRange = spreadsheet.getRangeByName("porterList");
                spreadsheet.getSheetByName("Settings").getRange(porterRange.getLastRow()+1,porterRange.getColumn()).setValue(porter);
                spreadsheet.setNamedRange("PorterList",spreadsheet.getSheetByName("Settings").getRange(porterRange.getRow(),porterRange.getColumn(),porterRange.getNumRows()+1,porterRange.getNumColumns()));
              }
              porter += " (night before)";//"(night before)" is added after the name is added to list because the shift name does not include "(night before)"       
            }
            else
            {
              porter = "Blank";
            }
          }
        }
      }      
      //if the user selects that the porter duties were not completed the night before the normal missing role assignment and user interaction takes place      
      else
      {
        promptResult = ui.prompt("Missing Porter","There is no porter deployed, please enter\nthe porter or press cancel to decline.",ui.ButtonSet.OK_CANCEL);
        if(promptResult.getSelectedButton() == ui.Button.OK && promptResult.getResponseText() != "")
        {
          porter = promptResult.getResponseText();
          alertResult = ui.alert("Add to list?","Would you like to add " + porter + " to the list of porters?",ui.ButtonSet.YES_NO);
          if(alertResult == ui.Button.YES)
          {
            porterRange = spreadsheet.getRangeByName("porterList");
            spreadsheet.getSheetByName("Settings").getRange(porterRange.getLastRow()+1,porterRange.getColumn()).setValue(porter);
            spreadsheet.setNamedRange("PorterList",spreadsheet.getSheetByName("Settings").getRange(porterRange.getRow(),porterRange.getColumn(),porterRange.getNumRows()+1,porterRange.getNumColumns()));
          }        
        }
        else
        {
          porter = "Blank";
        }
      } 
    }
    //#endregion
    //#region Closing Manager Assignment
    //the closing manager assigment algorithm works exactly like the opening roles assignment
    for(i = 0; i < dinnerValues.length; i++)
    {
      if(dinnerValues[i][1].charAt(dinnerValues[i][1].length-1) == "L")
      {
        closers.push(dinnerValues[i][0]);
      }
    }
    rank = managerCloseList.length;
    index = closers.length;
    for(i = 0; i < closers.length; i++)
    {
      for(j = 0; j < managerCloseList.length; j++)
      {
        if(closers[i] == managerCloseList[j] && rank > j)
        {
          managerClose = closers[i];
          rank = j;
          index = i;
        }
      }
    }
    if(index == closers.length)    
    {
      promptResult = ui.prompt("Missing Closing Manager","There is no closing Manager deployed, please enter\nthe closing manager or press cancel to decline.",ui.ButtonSet.OK_CANCEL);
      if(promptResult.getSelectedButton() == ui.Button.OK && promptResult.getResponseText() != "")
      {
        managerClose = promptResult.getResponseText();
        alertResult = ui.alert("Add to list?","Would you like to add " + managerClose + " to the list of closing managers?",ui.ButtonSet.YES_NO);
        if(alertResult == ui.Button.YES)
        {
          managerCloseRange = spreadsheet.getRangeByName("ManagerCloseList");
          spreadsheet.getSheetByName("Settings").getRange(managerCloseRange.getLastRow()+1,managerCloseRange.getColumn()).setValue(managerClose);
          spreadsheet.setNamedRange("ManagerCloseList",spreadsheet.getSheetByName("Settings").getRange(managerCloseRange.getRow(),managerCloseRange.getColumn(),managerCloseRange.getNumRows()+1,managerCloseRange.getNumColumns()));  
        }        
      }
      else
      {
        managerClose = "Blank";
      }
    }
    //#endregion
    //#region Deployment Sheet Value Setting
    activeSheet.getRange("C4").setValue(porter);
    activeSheet.getRange("C5").setValue(managerOpen);
    activeSheet.getRange("C6").setValue(custard);
    activeSheet.getRange("F4:F5").setValue(kitchen);
    activeSheet.getRange("F6").setValue(diningRoom);
    activeSheet.getRange("H4:H5").setValue(diningRoom);
    activeSheet.getRange("C32").setValue(managerClose);
    //#endregion

  }
  else
  {
    ui.alert("You are not on the correct sheet for this function.");
  }
}

function SwapValue2() {
  var spreadSheet = SpreadsheetApp.getActive();
  var ranges = spreadSheet.getActiveRangeList().getRanges();
  var ui = SpreadsheetApp.getUi();
  var sheet = spreadSheet.getActiveSheet();
  
  if(ranges.length==2 && (ranges[0].getHeight()==ranges[1].getHeight() && ranges[0].getWidth()==ranges[1].getWidth()))
  {   
    var values0 = sheet.getRange(ranges[0].getRow(), 3, 1, 2).getValues();
    var values1 = sheet.getRange(ranges[1].getRow(), 3, 1, 2).getValues();
    
    sheet.getRange(ranges[0].getRow(), 3, 1, 2).setValues(values1);
    sheet.getRange(ranges[1].getRow(), 3, 1, 2).setValues(values0);
  }
  else if(ranges.length==1 && (ranges[0].getHeight()==2 && ranges[0].getWidth() < 3))
  {
    var values0 = sheet.getRange(ranges[0].getRow(), 3, 1, 2).getValues();
    var values1 = sheet.getRange(ranges[0].getRow()+1, 3, 1, 2).getValues();
    
    sheet.getRange(ranges[0].getRow(), 3, 1, 2).setValues(values1);
    sheet.getRange(ranges[0].getRow()+1, 3, 1, 2).setValues(values0);
  }
  else
  {
    ui.alert("Incorrect ranges Selected");
  }
}

function separateShift()
{
  var spreadsheet = SpreadsheetApp.getActive();
  var sheet = spreadsheet.getActiveSheet();
  var selection
  var selectionRow
  var ui = SpreadsheetApp.getUi();
  var ranges = spreadsheet.getActiveRangeList().getRanges();
  var shiftSplitter;
  var shift1, shift2;
  var name1, name2;
  var shiftRegionRange, shiftRegionValues;
  var i;
  var foundBlank = false;
  var values;
  if(ranges.length == 1)
  {
    selection = sheet.getActiveCell();
    selectionRow = selection.getRow();

    if(selectionRow > 9  && selectionRow!=20 && selectionRow!=24 && !(selectionRow > 30 && selectionRow < 35) && selectionRow!=45 && selectionRow != 49)
    {    
      values = sheet.getRange(selectionRow,3,1,2).getDisplayValues();
      if(values[0][0].indexOf(" train ") > 0 || values[0][0].indexOf("/") > 0)
      {
        //get the names and shifts
        if(values[0][0].indexOf("/") > 0)
          shiftSplitter = "/";
        if(values[0][0].indexOf(" train ") > 0)
          shiftSplitter = " train ";

        name1 = values[0][0].substring(0, values[0][0].indexOf(shiftSplitter));
        name2 = values[0][0].substring(values[0][0].indexOf(shiftSplitter)+shiftSplitter.length);

        name1 = name1.trim();
        name2 = name2.trim();

        if(values[0][1].indexOf("/") > 0)   
        {               
          shift1 = values[0][1].substring(0, values[0][1].indexOf("/"));
          shift2 = values[0][1].substring(values[0][1].indexOf("/")+1);
        }
        else
        {
          shift1 = values[0][1];
          shift2 = values[0][1];
        }

        //finding the next spot
        if(sheet.getRange(selectionRow+1,3).getDisplayValue() == "" && selectionRow!=19 && selectionRow!=23 && selectionRow!=30 && selectionRow!=44 && selectionRow!=48 && selectionRow!=55)
        {
          //if next spot is empty and is not a border row
          sheet.getRange(selectionRow,3,1,2).setValues([[name1,shift1]]);
          sheet.getRange(selectionRow+1,3,1,2).setValues([[name2,shift2]]);
        }
        else
        {
          //if the next row is a border row or the next one is blank, then the second half of the shift gets placed in the same region in the next available spot, starting with below the selection row and then working from the top
          if(selectionRow > 9 && selectionRow < 20)
          {
            shiftRegionRange = sheet.getRange(10,3,10,2); //lunch foh
          }
          else if(selectionRow > 20 && selectionRow < 24)
          {
            shiftRegionRange = sheet.getRange(21,3,3,2); //lunch drive
          }
          else if(selectionRow > 24 && selectionRow < 31)
          {
            shiftRegionRange = sheet.getRange(25,3,6,2); //lunch kitchen
          }
          else if(selectionRow > 34 && selectionRow < 45)
          {
            shiftRegionRange = sheet.getRange(35,3,10,2); //dinner foh
          }
          else if(selectionRow > 45 && selectionRow < 49)
          {
            shiftRegionRange = sheet.getRange(46,3,3,2); //dinner drive
          }
          else if(selectionRow > 49 && selectionRow < 56)
          {
            shiftRegionRange = sheet.getRange(50,3,6,2); //dinner kitchen          
          }
          else
          {
            ui.alert("You did not select a valid shift. \nPlease select a shift on the deployment.");
          }
          if(shiftRegionRange)
          {
            shiftRegionValues = shiftRegionRange.getValues(); //selectionRow-shiftRegionRange.getRow() = row of array starting at index 0
            selectionIndex = selectionRow-shiftRegionRange.getRow();
            //this searches starting at the selectionIndex of the values array for blanks
            for(i = selectionIndex; (i < shiftRegionValues.length && !foundBlank); i++)
            {
              if(shiftRegionValues[i][0] == "")
              {
                shiftRegionValues[i][0] = name2;
                shiftRegionValues[i][1] = shift2;
                foundBlank = true;
              }
            }
            //if a blank is not found after the selection index, it starts from the top to find a blank to break to
            if(!foundBlank)
            {
              for(i = 0; (i < shiftRegionValues.length && !foundBlank); i++)
              {
                if(shiftRegionValues[i][0] == "")
                {
                  shiftRegionValues[i][0] = name2;
                  shiftRegionValues[i][1] = shift2;
                  foundBlank = true;
                }
              }
            }
            //when the blank is found the first name and shift replace the split shift and the region is repasted
            if(foundBlank)
            {
              shiftRegionValues[selectionIndex][0] = name1;
              shiftRegionValues[selectionIndex][1] = shift1;
              shiftRegionRange.setValues(shiftRegionValues);
            }
            else
            {
              ui.alert("No blank spaces were found to split the shift.");
            }
          }
        }
      }
      else
      {
        ui.alert("This shift cannot be split.");
      }
    }
    else
    {
      ui.alert("Invalid Row Selected");
    }
  }
  else if(ranges.length == 2 && ranges[0].getHeight() == 1 && ranges[1].getHeight() == 1)
  {
    selection = ranges[0];
    selectionRow = ranges[0].getRow();
    splitRow = ranges[1].getRow();

    if((selectionRow > 9  && selectionRow!=20 && selectionRow!=24 && !(selectionRow > 30 && selectionRow < 35) && selectionRow!=45 && selectionRow != 49) && (splitRow > 9  && splitRow!=20 && splitRow!=24 && !(splitRow > 30 && splitRow < 35) && splitRow!=45 && splitRow != 49))
    {
      values = sheet.getRange(selectionRow,3,1,2).getDisplayValues();
      if(values[0][0].indexOf(" train ") > 0 || values[0][0].indexOf("/") > 0)
      {
        //get the names and shifts
        if(values[0][0].indexOf("/") > 0)
          shiftSplitter = "/";
        if(values[0][0].indexOf(" train ") > 0)
          shiftSplitter = " train ";

        name1 = values[0][0].substring(0, values[0][0].indexOf(shiftSplitter));
        name2 = values[0][0].substring(values[0][0].indexOf(shiftSplitter)+shiftSplitter.length);

        name1 = name1.trim();
        name2 = name2.trim();

        if(values[0][1].indexOf("/") > 0)   
        {               
          shift1 = values[0][1].substring(0, values[0][1].indexOf("/"));
          shift2 = values[0][1].substring(values[0][1].indexOf("/")+1);
        }
        else
        {
          shift1 = values[0][1];
          shift2 = values[0][1];
        }

        //splits shift to other selected range
        sheet.getRange(selectionRow,3,1,2).setValues([[name1,shift1]]);
        sheet.getRange(splitRow,3,1,2).setValues([[name2,shift2]]);
      }
      else
      {
        ui.alert("This shift cannot be split.");
      }  
    }
    else
    {
      ui.alert("Invalid Row Selected");
    }
  }
  else if(ranges.length > 2)
  {
    ui.alert("Invalid Ranges Selected");
  }
  else
  {
    ui.alert("Invalid Range Selected");
  }
}

function combineShiftsDialog()
{
  var spreadsheet = SpreadsheetApp.getActive();
  var ui = SpreadsheetApp.getUi();
  var ranges = spreadsheet.getActiveRangeList().getRanges();
  var shift1, shift2;
  var name1, name2;
  var values0, values1, values;

  if(ranges.length==2 && (ranges[0].getHeight()==ranges[1].getHeight() && ranges[0].getWidth()==ranges[1].getWidth()))
  {
    values0 = ranges[0].getDisplayValues();
    values1 = ranges[1].getDisplayValues();

    name1 = values0[0][0];
    name2 = values1[0][0];
    shift1 = values0[0][1];
    shift2 = values1[0][1];
  }
  else if(ranges.length == 1 && ranges[0].getWidth() == 2 && ranges[0].getHeight() == 2)
  {
    values = ranges[0].getDisplayValues();
    name1 = values[0][0];
    name2 = values[1][0];
    shift1 = values[0][1];
    shift2 = values[1][1];
  }

  if(name1 == "" || name2 == "" || shift1 == "" || shift2 == "")
  {
    ui.alert("One or more shifts selected are empty.");
  }
  else if(name1 == undefined || name2 == undefined || shift1 == undefined || shift2 == undefined)
  {
    ui.alert("You did not select a valid range.")
  }
  else
  {
    var html = HtmlService.createHtmlOutputFromFile('CombineShifts')
      .setWidth(200)
      .setHeight(71);
    SpreadsheetApp.getUi()
      .showModalDialog(html, 'Combine Shifts');
  }
}

function combineShifts(selectedText)
{
  var spreadsheet = SpreadsheetApp.getActive();
  var ui = SpreadsheetApp.getUi();
  var ranges = spreadsheet.getActiveRangeList().getRanges();
  var shift1, shift2;
  var name1, name2;
  var values0, values1, values;

  if(selectedText != "Select an option")
  {
    //gets the names and shifts in the ranges
    if(ranges.length == 2)
    {
      values0 = ranges[0].getDisplayValues();
      values1 = ranges[1].getDisplayValues();

      name1 = values0[0][0];
      name2 = values1[0][0];
      shift1 = values0[0][1];
      shift2 = values1[0][1];
    } 
    else if(ranges.length == 1)
    {
      values = ranges[0].getDisplayValues();
      name1 = values[0][0];
      name2 = values[1][0];
      shift1 = values[0][1];
      shift2 = values[1][1];
    }
    //combines the names with the shift splitter
    if(selectedText == "Combine with \" train \"")
    {
      name1 = (name1 + " train " + name2);
    }
    else if(selectedText == "Combine with \"/\"")
    {
      name1 = (name1 + "/" + name2);    
    }

    //checks to see if the shifts are different, if they are, a / is put between them
    if(shift1 != shift2)
    {
      shift1 = (shift1 + "/" + shift2);
    }

    //set values for shifts and names depending on the number of ranges selected
    if(ranges.length == 2)
    {      
      values0[0][0] = name1;
      values0[0][1] = shift1;
      values1[0][0] = "";
      values1[0][1] = "";
      ranges[0].setValues(values0);
      ranges[1].setValues(values1);
    }
    else if(ranges.length == 1)
    {
      values[0][0] = name1;
      values[0][1] = shift1;
      values[1][0] = "";
      values[1][1] = "";
      ranges[0].setValues(values);
    }
  }
  else
  {
    ui.alert("You didn't select an option.");
  }
}