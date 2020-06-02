//places at the beginning of the files to that it can be run first
class Shift {
  //weekday number corresponds with the weekday of the shift starting at 0 for monday to 6 for sunday
  constructor(deploymentName = 'none', deploymentShift = "", weekday = -1, row = -1, multiDeployment = false, deploymentPair = "", timeSplit = false, timePair = "", pairNumber = 0, midShift = false, midShiftPairs = []) { //if changing this constructor you must update the fetchShifts function and the employeeSchedule constructor
    this.deploymentName = deploymentName; //the name as listed on the deployment sheet
    this.deploymentShift = deploymentShift // this shift as list on the deployment sheet

    this.weekday = weekday; //the weekday of the shift, starting at 0 for Monday through 6 for Sunday
    this.row = row; //the row of the shift on the deployment shift NOTE: +10 will give the corresponding row on the deployment sheet

    this.multiDeployment = multiDeployment; //if the shift is deployed with another person
    this.deploymentPair = deploymentPair; //the other person deployed in the shift with the multi deployment

    this.timeSplit = timeSplit; //if the shift time is split with another person
    this.timePair = timePair; //the other person's shift time

    this.pairNumber = pairNumber; //the shift pair is 0 if it is first or 1 if it is second

    this.midShift = midShift; //if the shift is deployed between lunch and dinner
    this.midShiftPairs = midShiftPairs; //the location of the other shift
  }

  toString() {
    return `${this.deploymentName}, ${this.deploymentShift}, ${this.weekday}, ${this.row}`;
  }

  get shiftLength() {
    var time1, time2;
    var timeSplit = [];
    if (this.deploymentShift == "")
      return 0;

    if (this.deploymentName == "Dori")
      return 0;

    var shiftSplit = this.deploymentShift.split("--");
    if (shiftSplit[0].indexOf(":") > 0) {
      timeSplit = shiftSplit[0].split(":");
      time1 = Number(timeSplit[0]) + (Number(timeSplit[1]) / 60);
    }
    else {
      time1 = Number(shiftSplit[0]);
    }

    if (shiftSplit[1].indexOf(":") > 0) {
      timeSplit = shiftSplit[1].split(":");
      time2 = Number(timeSplit[0]) + (Number(timeSplit[1]) / 60);
    }
    else {
      time2 = Number(shiftSplit[1]);
    }

    if (shiftSplit[1] === "CL") {
      time2 = 10.75;
      if (this.weekday == 4 || this.weekday == 5) {
        time2 = 11.75;
      }
    }
    else {
      time2 = Number(shiftSplit[1]);
    }

    if (shiftSplit[1] == "CL" && (time1 > 12 || time1 == 7)) {
      time1 += 12;
    }
    if (time1 < 7) {
      time1 += 12;
    }
    if (time1 > (time2 - 3)) {
      time2 += 12;
    }

    //checks to see if the times are not numbers  
    if (isNaN(time1) || isNaN(time2)) {
      return -1;
    }
    return time2 - time1;
  }

  get startTime() {
    var time1, time2;
    var timeSplit = [];
    if (this.deploymentShift == "")
      return 0;

    var shiftSplit = this.deploymentShift.split("--");
    if (shiftSplit[0].indexOf(":") > 0) {
      timeSplit = shiftSplit[0].split(":");
      time1 = Number(timeSplit[0]) + (Number(timeSplit[1]) / 60);
    }
    else {
      time1 = Number(shiftSplit[0]);
    }

    if (shiftSplit[1].indexOf(":") > 0) {
      timeSplit = shiftSplit[1].split(":");
      time2 = Number(timeSplit[0]) + (Number(timeSplit[1]) / 60);
    }
    else {
      time2 = Number(shiftSplit[1]);
    }

    if (shiftSplit[1] === "CL") {
      time2 = 10.75;
      if (this.weekday == 5 || this.weekday == 6) {
        time2 = 11.75;
      }
    }
    else {
      time2 = Number(shiftSplit[1]);
    }

    if (shiftSplit[1] == "CL" && (time1 > 12 || time1 == 7)) {
      time1 += 12;
    }
    if (time1 < 7) {
      time1 += 12;
    }
    if (time1 > (time2 - 3)) {
      time2 += 12;
    }

    //checks to see if the times are not numbers  
    if (isNaN(time1) || isNaN(time2)) {
      return -1;
    }
    return time1;
  }

  get endTime() {
    var time1, time2;
    var timeSplit = [];
    if (this.deploymentShift == "")
      return 0;

    var shiftSplit = this.deploymentShift.split("--");
    if (shiftSplit[0].indexOf(":") > 0) {
      timeSplit = shiftSplit[0].split(":");
      time1 = Number(timeSplit[0]) + (Number(timeSplit[1]) / 60);
    }
    else {
      time1 = Number(shiftSplit[0]);
    }

    if (shiftSplit[1].indexOf(":") > 0) {
      timeSplit = shiftSplit[1].split(":");
      time2 = Number(timeSplit[0]) + (Number(timeSplit[1]) / 60);
    }
    else {
      time2 = Number(shiftSplit[1]);
    }

    if (shiftSplit[1] === "CL") {
      time2 = 10.75;
      if (this.weekday == 5 || this.weekday == 6) {
        time2 = 11.75;
      }
    }
    else {
      time2 = Number(shiftSplit[1]);
    }

    if (shiftSplit[1] == "CL" && (time1 > 12 || time1 == 7)) {
      time1 += 12;
    }
    if (time1 < 7) {
      time1 += 12;
    }
    if (time1 > (time2 - 3)) {
      time2 += 12;
    }

    //checks to see if the times are not numbers  
    if (isNaN(time1) || isNaN(time2)) {
      return -1;
    }
    return time2;
  }
}

class EmployeeSchedule {
  constructor(deploymentName, scheduleName, inputShifts, errors = "") {
    this.deploymentName = deploymentName; //deployment name - self explanatory
    this.errors = errors; //any errors in the employees shifts
    this.shifts = [new Shift(), new Shift(), new Shift(), new Shift(), new Shift(), new Shift(), new Shift()] //shifts is an array of shift objects that starts on weekday 0 as monday through weekday 6 as sunday
    this.hours = 0;
    this.scheduleName = scheduleName;
    var i;
    var currShiftLength;
    var iSW

    if (Array.isArray(inputShifts)) {
      for (i = 0; i < inputShifts.length; i++) {
        iSW = inputShifts[i].weekday //iSW means input shifts weekday
        if (inputShifts[i].weekday == -1) {
          continue;
        }
        if (this.shifts[iSW].weekday == -1) { //if a shift doesnt already exist on that weekday, it is added
          this.shifts[iSW].deploymentName = inputShifts[i].deploymentName;
          this.shifts[iSW].deploymentShift = inputShifts[i].deploymentShift;

          this.shifts[iSW].weekday = inputShifts[i].weekday;
          this.shifts[iSW].row = inputShifts[i].row;

          this.shifts[iSW].multiDeployment = inputShifts[i].multiDeployment;
          this.shifts[iSW].deploymentPair = inputShifts[i].deploymentPair;

          this.shifts[iSW].timeSplit = inputShifts[i].timeSplit;
          this.shifts[iSW].timePair = inputShifts[i].timePair;
          
          this.shifts[iSW].pairNumber = inputShifts[i].pairNumber;

          this.shifts[iSW].midShift = inputShifts[i].midShift;
        }
        else { //if a shift does exist, we check to make sure that the shifts match and have the same times
          if (this.shifts[iSW].deploymentShift != inputShifts[i].deploymentShift) {
            const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]; //used for the alert system
            let ui = SpreadsheetApp.getUi();

            let alertButton = ui.alert("Unmatching shift time error", `${this.shifts[iSW].deploymentName} is deployed for ${this.shifts[iSW].deploymentShift} and ${inputShifts[i].deploymentShift} on ${weekdays[this.shifts[iSW].weekday]}\nPress Yes if you would like to schedule for ${this.shifts[iSW].deploymentShift} on row ${this.shifts[iSW].row + 10},\nPress No if you would like to schedule for ${inputShifts[i].deploymentShift} on row ${inputShifts[i].row + 10}.`, ui.ButtonSet.YES_NO);

            if (alertButton = ui.Button.YES) { //the existing shift is selected
              alertButton = ui.alert("Change shifts to match", `Would you like to change ${this.shifts[iSW].deploymentName}'s shift on\n${weekdays[this.shifts[iSW].weekday]} at row ${this.shifts[iSW].row + 10} and ${inputShifts[i].row + 10} to both be ${this.shifts[iSW].deploymentShift}?`, ui.ButtonSet.YES_NO);
            }
            else if (alertButton = ui.Button.NO) { //the other shift is selected
              alertButton = ui.alert("Change shifts to match", `Would you like to change ${this.shifts[iSW].deploymentName}'s shift on\n${weekdays[this.shifts[iSW].weekday]} at row ${this.shifts[iSW].row + 10} and ${inputShifts[i].row + 10} to both be ${inputShifts[i].deploymentShift}?`, ui.ButtonSet.YES_NO);
            }
            else { //cancel is selected and no changes are made to the shifts, an error tag is added to the shifts
              this.errors += `Unmatching shift error on day ${inputShifts[i].weekday} at ${this.shifts[iSW].row + 10} and ${inputShifts[i].row + 10}`;
            }
          }
          else {
            this.shifts[iSW].midShift = true;
          }
        }
      }
      for (i = 0; i < 7; i++) {
        currShiftLength = this.shifts[i].shiftLength;
        if (currShiftLength == -1) {
          this.errors += `Shift time error on day ${inputShifts[i].weekday}`;
        }
        else {
          this.hours += currShiftLength;
        }
      }
    }
    else {
      SpreadsheetApp.getActive().toast(`${this.deploymentName} schedule did not contain an array in the constructor input.`);
    }
  }

  toString() {
    let i = 0;
    return `${this.deploymentName}, ${this.hours}, ${this.shifts[i++].deploymentShift}, ${this.shifts[i++].deploymentShift}, ${this.shifts[i++].deploymentShift}, ${this.shifts[i++].deploymentShift}, ${this.shifts[i++].deploymentShift}, ${this.shifts[i++].deploymentShift}, ${this.shifts[i++].deploymentShift}, \n${this.errors}`;
  }

  setShift(shift) {
    if (shift.weekday < 0 || shift.weekday > 7) {
      SpreadsheetApp.getActive().toast("Failed to add shift to employee schedule: Invalid shift weekday.", "Update Shift Error");
      return;
    }
    if (this.deploymentName != shift.deploymentName) {
      SpreadsheetApp.getActive().toast("Failed to add shift to employee schedule: Deployment names did not match.", "Update Shift Error");
      return;
    }
    this.shifts[shift.weekday] = new Shift(shift.deploymentName, shift.weekday, shift.weekday, shift.location);
    this.hours = 0;
    let i = 0, currShiftLength;
    for (i = 0; i < 7; i++) {
      currShiftLength = this.shifts[i].shiftLength;
      if (currShiftLength == -1) {
        this.error += `Shift time error on day ${inputShifts[i].weekday}\n`;
      }
      else {
        this.hours += currShiftLength;
      }
    }
    return;
  }

  deleteShift(weekday) {
    //updates the hours
    this.hours -= this.shifts[weekday].shiftLength;

    //gets the deleted shift as a return value
    let deletedShift = this.shifts[weekday];

    //sets the shift for the weekday to a new shift
    this.shifts[weekday] = new Shift();

    //returns the deleted shift
    return deletedShift;
  }

  modifyShift(weekday, newShift) {
    //subtract the shift length from total hours
    this.hours -= this.shifts[weekday].shiftLength;

    //sets the deployment shift for the modified shift to the new shift
    this.shifts[weekday].deploymentShift = newShift;

    //add the new shift time to the hours
    this.hours += this.shifts[weekday].shiftLength;

    return this.shifts[weekday];
  }

  get scheduleArray() {
    let scheduleArray = [this.scheduleName, this.hours];
    for (let shift of this.shifts) {
      if (shift.weekday != -1) {
        scheduleArray.push(shift.deploymentShift);
      }
      else {
        scheduleArray.push("");
      }
    }
    scheduleArray.push("");
    scheduleArray.push(this.errors);
    return scheduleArray;
  }
}

class Schedule {
  constructor(employeeSchedules, dateString) {
    this.totalHours = 0;
    this.weekdayHours = [0, 0, 0, 0, 0, 0, 0];
    this.weekdayHeader = ["", "", "", "", "", "", ""];
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.employeeSchedules = [];
    this.dateString = dateString;
    let date = new Date(dateString);

    let i, j, currentShifts;
    if (Array.isArray(employeeSchedules)) {
      for (i = 0; i < employeeSchedules.length; i++) {
        this.employeeSchedules.push(new EmployeeSchedule(employeeSchedules[i].deploymentName, employeeSchedules[i].scheduleName, employeeSchedules[i].shifts, employeeSchedules[i].errors));
        currentShifts = this.employeeSchedules[i].shifts;
        for (j = 0; j < 7; j++) {
          this.weekdayHours[j] += currentShifts[j].shiftLength;
        }
      }
    }
    this.totalHours = this.weekdayHours.reduce(function (a, b) { return a + b; }, 0);
    for (i = 0; i < 7; i++) {
      let dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() % 100}`;
      this.weekdayHeader[i] = `${weekdays[date.getDay()]}\n${dateString}\n${this.weekdayHours[i]}`;
      date.setDate(date.getDate() + 1);
    }
  }

  // toString() {
  //   let i = 0;
  //   return `${this.weekdayHeader[i++]}\n${this.weekdayHeader[i++]}\n${this.weekdayHeader[i++]}\n${this.weekdayHeader[i++]}\n${this.weekdayHeader[i++]}\n${this.weekdayHeader[i++]}\n${this.weekdayHeader[i++]}\n`;
  // }

  getEmployeeScheduleDName(deploymentName) {
    return this.employeeSchedules.find(function (element) {
      return element.deploymentName == deploymentName;
    });
  }

  getEmployeeScheduleSName(scheduleName) {
    return this.employeeSchedules.find(function (element) {
      return element.scheduleName == scheduleName;
    });
  }

  deleteShiftFromSName(scheduleName, weekday) {
    //first find the employee schedule from the schedule name
    let deleteScheduleIndex = this.employeeSchedules.findIndex(function (element) {
      return element.scheduleName == scheduleName;
    });

    if (deleteScheduleIndex != undefined) {
      //first get the employee schedule object that needs to be changed, then run the delete schedule class function and then set the index location back to the employee schedule in the schedule object
      let deleteSchedule = this.employeeSchedules[deleteScheduleIndex];
      let deletedShift = deleteSchedule.deleteShift(weekday);
      this.employeeSchedules[deleteScheduleIndex] = deleteSchedule;

      //update the hours for the weekday and schedule
      let oldWeekdayHours = this.weekdayHours[weekday];
      this.weekdayHours[weekday] -= deletedShift.shiftLength;
      this.totalHours -= deletedShift.shiftLength;

      //update the weekday header
      this.weekdayHeader[weekday] = this.weekdayHeader[weekday].replace(oldWeekdayHours, this.weekdayHours[weekday]);

      //update the multi deployment shift if it exists
      if (deletedShift.multiDeployment) {
        let updateMultiIndex = this.employeeSchedules.findIndex(function (element) {
          return element.shifts[weekday].row == deletedShift.row;
        });

        if (updateMultiIndex != undefined) { //set the multi deployment to false of the pairing shift
          this.employeeSchedules[updateMultiIndex].shifts[weekday].multiDeployment = false;
          this.employeeSchedules[updateMultiIndex].shifts[weekday].deploymentPair = "";
          // SpreadsheetApp.getActive().toast(`${this.employeeSchedules[updateMultiIndex].shifts[weekday]} is no longer a multi deployment`);
          if (deletedShift.timeSplit) { //set the time split to false of the pairing shift
            this.employeeSchedules[updateMultiIndex].shifts[weekday].timeSplit = false;
            this.employeeSchedules[updateMultiIndex].shifts[weekday].timePair = "";
            // SpreadsheetApp.getActive().toast(`${this.employeeSchedules[updateMultiIndex].shifts[weekday]} is no longer a time split`);
          }
        }
      }
      return deleteScheduleIndex;
    }
    else {
      SpreadsheetApp.getActive().toast(`Unable to find employee schedule for ${scheduleName}`);
      return;
    }
  }

  modifyShiftFromSName(scheduleName, newShift, weekday) {
    let modifiedScheduleIndex = this.employeeSchedules.findIndex(function (element) {
      return element.scheduleName == scheduleName;
    });

    if (modifiedScheduleIndex != undefined) {
      //first get the employee schedule that needs to be modified and the hours of the employee schedule that needs to be modified
      let modifiedSchedule = this.employeeSchedules[modifiedScheduleIndex];
      let oldScheduleHours = this.employeeSchedules[modifiedScheduleIndex].hours;
      let modifiedShift = modifiedSchedule.modifyShift(weekday, newShift);

      //update the weekday hours
      let oldWeekdayHours = this.weekdayHours[weekday];
      this.weekdayHours[weekday] -= oldScheduleHours;
      this.weekdayHours[weekday] += modifiedSchedule.hours;

      //update the total schedule hours
      this.totalHours -= oldScheduleHours;
      this.totalHours += modifiedSchedule.hours;

      //update the weekday header
      this.weekdayHeader[weekday] = this.weekdayHeader[weekday].replace(oldWeekdayHours, this.weekdayHours[weekday]);

      if (modifiedShift.timeSplit) {
        let updateMultiIndex = this.employeeSchedules.findIndex(function (element) {
          return element.shifts[weekday].row == modifiedShift.row;
        });
        if (updateMultiIndex != undefined) { //set the time split to of the pairing shift to match the modified shift
          //TODO: the shift needs to be made into a time split and the pairing shift needs to be made into a time split
          //if the time pair is the same as the multi then they both need to looose their time split
          //otherwise, they need to both become time splits as a result of one of the shifts being changed 
          this.employeeSchedules[updateMultiIndex].shifts[weekday].timePair = modifiedShift.deploymentShift;
          this.employeeSchedules[updateMultiIndex].shifts[weekday].timeSplit = true;
          SpreadsheetApp.getActive().toast(`${this.employeeSchedules[updateMultiIndex].shifts[weekday]} has been updated to match`);
        }
      }
    return modifiedScheduleIndex;
    }
    else {
      SpreadsheetApp.getActive().toast(`Unable to find employee schedule for ${scheduleName}`);

      return;
    }
  }

    // setEmployeeShift(shift) {
    //   let employeeScheduleIndex = this.employeeSchedules.find(function (element) {
    //     return element.deploymentName == shift.deploymentName;
    //   });
    //   if (employeeScheduleIndex != undefined) {
    //     this.employeeSchedules[employeeScheduleIndex].setShift(shift);
    //   }
    //   else {
    //     SpreadsheetApp.getActive().toast("Failed to add shift to employee schedule: Unable to find employee.", "Update Shift Error");
    //   }
    // }

    // updateWeekdayHours(weekday) {
    //   let newHours;
    //   let oldHours;
    //   if(weekday > -1 && weekday < 7) {
    //     oldHours = this.weekdayHours[weekday];
    //     for(let employeeSchedule of this.employeeSchedules) {
    //       if(employeeSchedule.shifts[weekday].weekday != -1) {
    //         newHours += employeeSchedule.shifts[weekday].shiftLength;
    //       }
    //     }

    //     this.totalHours += (newHours - oldHours);
    //   }
    // }

    addShift(shift) {
      //find the employee schedule for the shift using the deployment name
      let employeeScheduleIndex = this.employeeSchedules.find(function (element) {
        return element.deploymentName == shift.deploymentName;
      });

      let foundEmployeeSchedule;
      if (employeeScheduleIndex == undefined) {
        SpreadsheetApp.getActive().toast("Unable to find deployment name for added shift");
      }
      else {
        foundEmployeeSchedule = this.employeeSchedules[employeeScheduleIndex];
        if (foundEmployeeSchedule.shifts[shift.weekday].weekday == -1) {

        }
      }

    }

    deleteShift(shift) {

    }

    getWeekdayShifts(weekday) {
      let weekdayShifts = [];
      for (let employeeSchedule of this.employeeSchedules) {
        if (employeeSchedule.shifts[weekday].weekday == weekday) {
          weekdayShifts.push(employeeSchedule.shifts[weekday]);
        }
      }

      if (weekdayShifts.length != 0) {
        return weekdayShifts;
      }
      else {
        SpreadsheetApp.getActive().toast(`No shifts found for weekday: ${weekday}`);
        return undefined;
      }
    }
  }

class Employee {
  constructor(deploymentName, scheduleName, birthday, age, hireDate, phoneNumber, availability, maxShifts, maxHours, positionRanks, house) {
    this.deploymentName = deploymentName;
    this.scheduleName = scheduleName;
    this.birthday = birthday;
    this.hireDate = hireDate;
    this.phoneNumber = phoneNumber;
    this.availability = availability;
    this.maxShifts = maxShifts;
    this.maxHours = maxHours;
    this.positionRanks = positionRanks;
    this.house = house;
  }
}