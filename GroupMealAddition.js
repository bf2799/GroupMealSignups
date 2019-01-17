// Spreadsheet sheet numbers
var groupMealSignupSheetNum = 0;
var groupMealCreationSheetNum = 1;
var groupMealMasterSheetNum = 2;

// Minutes a meal lasts by default
var groupMealDurationMin = 30;
var reminderEmailDaysBefore = 2;

// Create reference to calendar
var groupMealCalendar = CalendarApp.getCalendarById('topt445mt3v3e7vqp1539bt0ug@group.calendar.google.com');

// Initialize signup sheet
var signupSheet = SpreadsheetApp.openById('1wL8nIwyHkSi1RMfowvF3ILaVRP_gwpWJnSKFObhCDYA').getSheets()[groupMealSignupSheetNum];
var signupRange = signupSheet.getDataRange();
var signupValues = signupRange.getValues();

// Initialize creation sheet
var creationSheet = SpreadsheetApp.openById('1wL8nIwyHkSi1RMfowvF3ILaVRP_gwpWJnSKFObhCDYA').getSheets()[groupMealCreationSheetNum];
var creationRange = creationSheet.getDataRange();
var creationValues = creationRange.getValues();

// Initialize master sheet
var masterSheet = SpreadsheetApp.openById('1wL8nIwyHkSi1RMfowvF3ILaVRP_gwpWJnSKFObhCDYA').getSheets()[groupMealMasterSheetNum];
var masterRange = masterSheet.getDataRange();
var masterValues = masterRange.getValues();

// Initialize form IDs
var signupForm = FormApp.openById('16g47LUedX6GT_k3DP_cBdukwNJ3Nc6DUTSY0V9VXyRM');
var creationForm = FormApp.openById('1vJYTNrqVoul_KHpamKExH8AlteK7RjtHYOV8kMqpOGs');

// Lines where conflicts/signup filling exist
var creationConflictLine = 0;
var signupFillLine = 0;

function updateSheets() {
  
  // Initialize signup sheet
  signupSheet = SpreadsheetApp.openById('1wL8nIwyHkSi1RMfowvF3ILaVRP_gwpWJnSKFObhCDYA').getSheets()[groupMealSignupSheetNum];
  signupRange = signupSheet.getDataRange();
  signupValues = signupRange.getValues();
  
  // Initialize creation sheet
  creationSheet = SpreadsheetApp.openById('1wL8nIwyHkSi1RMfowvF3ILaVRP_gwpWJnSKFObhCDYA').getSheets()[groupMealCreationSheetNum];
  creationRange = creationSheet.getDataRange();
  creationValues = creationRange.getValues();
  
  // Initialize master sheet
  masterSheet = SpreadsheetApp.openById('1wL8nIwyHkSi1RMfowvF3ILaVRP_gwpWJnSKFObhCDYA').getSheets()[groupMealMasterSheetNum];
  masterRange = masterSheet.getDataRange();
  masterValues = masterRange.getValues();
  
}

// Takes string and returns hours and minutes
function stringToTime(string) {
  
  var amPmFactor = 0; // An offset (either 0 or 12) to account for AM or PM in string
        
  // Implement the AM/PM Factor
  if (string.substring(string.indexOf('M') - 1, string.indexOf('M')) == 'P') {
    if (string.substring(0, 2) !== '12') {
      amPmFactor = 12;
    }
  } else {
    if (string.substring(0, 2) == '12') {
      amPmFactor = -12;
    }
  }
  
  var hours;
  var minutes;
  
  // Set the hours and minutes of the date
  if (string.substring(2, 3) !== ':') {
    hours = parseInt(string.substring(0, 1)) + amPmFactor;
    minutes = string.substring(2, 4);
  }
  else {
    hours = parseInt(string.substring(0, 2)) + amPmFactor;
    minutes = string.substring(3, 5);
  }
  
  return [hours, minutes];
  
}

////////////////////////////////////////
///////// SIGNUP OF GROUP MEAL /////////
////////////////////////////////////////

function updateSignupFormMealOptions() {
  
  // Create array of meal options
  var mealOptions = [];
  
  // For each row
  //  If there is no associated name
  //  Add meal info to meal options array
  for (var i = 1; i < masterValues.length; i++) {
    if (masterValues[i][5] == '') {
      var dateStr = '';
      if ((masterValues[i][0].getMonth() + 1) < 10) {
        dateStr += '0';
      }
      dateStr += (masterValues[i][0].getMonth() + 1) + '/';
      if (masterValues[i][0].getDate() < 10) {
        dateStr += '0';
      }
      dateStr += masterValues[i][0].getDate() + '/' + masterValues[i][0].getYear();
      var str = dateStr + ' ' + masterValues[i][1] + '. ' + masterValues[i][3] + ' people. ' + masterValues[i][2];
      mealOptions.push(str);
    }
  }
  
  // If there are no more options, say so
  if (mealOptions.length == 0) {
    mealOptions.push('No group meals currently available.');
  }
  
  // Sort the array values alphabetically, case-insensitive
  mealOptions.sort(
    function(a, b) {
      if (a.toLowerCase() < b.toLowerCase()) return -1;
      if (a.toLowerCase() > b.toLowerCase()) return 1;
      return 0;
    }
  );
  
  // Add option to not change (for editing previous response)
  mealOptions.unshift("No Change");
  
  // Uncomment for finding specific question ID to change on form
  /*var items = signupForm.getItems();
  for (i = 0; i < items.length; i++) {
    Logger.log("ID: " + items[i].getId(), ': ' + items[i].getType());
  }*/
  
  // Set choices on signup form itself
  signupForm.getItemById(1868456451).asListItem().setChoiceValues(mealOptions);
  
}

// Object created when a group meal has a new signup 
function SignupSubmission() {
  
  // Set row to one with latest timestamp
  var lastTimestamp = 0;
  var row = -1;
  
  for (var i = 1; i < signupValues.length; i++) {
    if (signupValues[i][0].getTime() > lastTimestamp) {
      lastTimestamp = signupValues[i][0].getTime();
      row = i;
    }
  }
  
  // Check to see if there are any signups (used to see if form was edited)
  var noSignUps = true;
  for (var i = 1; i < masterValues.length; i++) {
    if (masterValues[i][5] !== '') {
      noSignUps = false;
    }
  }
  
  // The signup response was an edit if the row wasn't the last one
  this.edited = row !== signupValues.length - 1 || !noSignUps;
  
  // Info from spreadsheet
  this.timestamp = signupValues[row][0];
  this.name = signupValues[row][1];
  this.email = signupValues[row][2];
  this.phone = signupValues[row][3];
  this.student = signupValues[row][4];
  this.mealOptions = signupValues[row][5];
  this.foodDescrip = signupValues[row][6];
  this.allergy = signupValues[row][7];
  
  // Create form ID from response
  this.formID = signupForm.getResponses(this.timestamp)[0].getEditResponseUrl();
  
  // If there are options
  if (this.mealOptions !== 'No group meals currently available.' && this.mealOptions !== 'No Change') {
  
    // Get date and meal from mealOptions string
    var dateEndIndex = this.mealOptions.indexOf('/', 3) + 4; // Find index of second slash in date then add 4
    this.dateString = this.mealOptions.substring(0, dateEndIndex + 1); // Get string of date in M/D/YYYY format
    
    // Remove leading 0s from spreadsheet
    if (this.dateString.substring(3, 4) == '0') {
      this.dateString = this.dateString.substring(0, 3) + this.dateString.substring(4, 10);
    }
    if (this.dateString.substring(0, 1) == '0') {
      this.dateString = this.dateString.substring(1, this.dateString.length);
    }
    
    var dateSplit = this.dateString.split('/');
    this.date = new Date(dateSplit[2], dateSplit[0] - 1, dateSplit[1]);
    
    var mealEndIndex = this.mealOptions.indexOf('.', dateEndIndex + 2);
    
    this.meal = this.mealOptions.substring(dateEndIndex + 2, mealEndIndex);
    
  } 
  
  // Otherwise (the form was edited and there were available meals)
  else if (this.mealOptions !== 'No group meals currently available.' && this.edited) {
    
    // Find the row of the signup on the master sheet
    var oldRow = -1;
    for (var i = 1; i < masterValues.length; i++) {
      if (this.formID == masterValues[i][13]) {
        oldRow = i;
      }
    }
    
    // Get date and meal from master sheet
    this.date = masterValues[oldRow][0];
    this.dateString = (this.date.getMonth() + 1) + '/' + this.date.getDate() + '/' + this.date.getYear();
    this.meal = masterValues[oldRow][1];
    
  }
  
  // Extrapolated info
  this.status;
  this.appDelivTime;
  this.peopToFeed;
  this.details;
  this.calendar = groupMealCalendar;
  this.eventID;
  return this;
  
}

function getSignupConflictInfo(signup) {
  
  // No conflict by default
  var conflict = 0;
  
  // If dates and meals are the same
  //   If there is no associated name
  //     Get information from master spreadsheet about signup
  //   Otherwise (there is associated name)
  //     Record where the conflict is
  for (var i = 1; i < masterValues.length; i++) {
    var dateString = (masterValues[i][0].getMonth() + 1) + '/' + masterValues[i][0].getDate() + '/' + masterValues[i][0].getYear();
    var meal = masterValues[i][1];
    if (dateString == signup.dateString && meal == signup.meal) {
      if (masterValues[i][5] == '') { // If there is no associated name
        signup.status = "Approved";   // The status is then approved
        signup.appDelivTime = masterValues[i][2]; // Get the time box on the sheet
        
        // Set date more specifically
        var times = stringToTime(signup.appDelivTime); 
        signup.date.setHours(times[0]);
        signup.date.setMinutes(times[1]);
        
        // Get other info from the spreadsheet
        signup.peopToFeed = masterValues[i][3];
        signup.details = masterValues[i][4];
        signup.eventID = masterValues[i][11];
      } else {
        signup.status = "Conflict";
        conflict = 1;
      }
      signupFillLine = i;
    }
  }
  
}

// Drafts an email of details of conflict of signing up for group meal
function draftSignupConflictEmail(signup) {
  
  return (
    '<!DOCTYPE html><html><head><base target="_top"></head>' + 
    '<body><h2>Conflict With New Nashoba Robotics ' + signup.meal + ' on ' + signup.dateString +
    "</h2><p> Sorry. Your offer to volunteer came just after someone else signed up for the same meal." + 
    "<br /> You offered to bring " + signup.foodDescrip + " with the following allergy concerns: " +
    "<br />" + signup.allergy +
    "<br /><br /> Please click the following link to sign up for your choice of remaining available meals." + 
    "<br /> https://docs.google.com/forms/d/e/1FAIpQLScg43LYIu0hOg7HawWbL0Sb3wETTNs9KJyUIkGZZe-vQoLpWw/viewform?usp=sf_link"
  );
  
}

// Sends email that creation of group meal failed
function sendSignupConflictEmail(signup) {
  MailApp.sendEmail({
    to: signup.email,
    subject: 'Robotics Group Meal Signup Conflict',
    htmlBody: draftSignupConflictEmail(signup)});
}

// Fill the master sheet with the signup information
function fillMasterWithSignup(signup, triggerID) {
  
  masterSheet.getRange(signupFillLine + 1, 6).setValue(signup.name);
  masterSheet.getRange(signupFillLine + 1, 7).setValue(signup.email);
  masterSheet.getRange(signupFillLine + 1, 8).setValue(signup.phone);
  masterSheet.getRange(signupFillLine + 1, 9).setValue(signup.student);
  masterSheet.getRange(signupFillLine + 1, 10).setValue(signup.foodDescrip);
  masterSheet.getRange(signupFillLine + 1, 11).setValue(signup.allergy);
  
  // Set triggerID in spreadsheet if it exists
  if (triggerID !== -1)
    masterSheet.getRange(signupFillLine + 1, 13).setValue(triggerID);
  
  // Set Form Edit Response URL in spreadsheet
  masterSheet.getRange(signupFillLine + 1, 14).setValue(signup.formID);
  
  masterRange = masterSheet.getDataRange();
  masterValues = masterRange.getValues();
  
}

// Update the calendar event with 
function updateCalendarSignup(signup) {
  
  var event = groupMealCalendar.getEventById(signup.eventID);
  
  if (event.getColor() !== "4")
    event.setColor("4"); // Set event color to pale red
  
  var description = 'Estimated people: ' + signup.peopToFeed + 
    '\nGraciously Provided By: ' + signup.name + 
      '\nContact Info: ' + signup.email + ', ' + signup.phone + 
        '\nStudent Name(s): ' + signup.student +
          '\nPlanned Food: ' + signup.foodDescrip + 
            '\nAllergen Alerts: ' + signup.allergy + 
              '\n\n' + signup.details;
  
  // Set calendar description
  if (event.getDescription() !== description)
    event.setDescription(description);
  
}

// Text of signup reminder email
function draftSignupReminderEmail(line) {
  
  var masterSheetDateString = (masterValues[line][0].getMonth() + 1) + '/' + masterValues[line][0].getDate() + '/' + masterValues[line][0].getYear();
  
  return (
   '<!DOCTYPE html><html><head><base target="_top"></head>' + 
    "<body><h2>Reminder: Nashoba Robotics " + masterValues[line][1] + ' on ' + masterSheetDateString +
    "</h2><p> You graciously volunteered to bring a group " + masterValues[line][1].toLowerCase() + " to the high school for the Nashoba Robotics team." + 
    "<br /> Date: " + masterSheetDateString + 
    "<br /> Time: " + masterValues[line][2] +  
    "<br /> People Expected: " + masterValues[line][3] + 
    "<br /> Your food: " + masterValues[line][9] +
    "<br /> Your allergen alerts included: " + masterValues[line][10] + 
    "<br /><br /> If you would like to edit your response, click the following link: <br />" + masterValues[line][13] + '&entry.397157629=No+Change' + 
    "<br /><br /> Thank you for volunteering!" +
    "<br /> - Nashoba Robotics #1768"
  );
  
}

// Text of signup confirmation email
function draftSignupConfirmationEmail(signup) {
  
  var dateString = (signup.date.getMonth() + 1) + '/' + signup.date.getDate() + '/' + signup.date.getYear();
  
  return (
   '<!DOCTYPE html><html><head><base target="_top"></head>' + 
    "<body><h2>Confirmation: Nashoba Robotics " + signup.meal + ' on ' + dateString +
    "</h2><p> You graciously volunteered to bring a group " + signup.meal.toLowerCase() + " to the high school for the Nashoba Robotics team." + 
    "<br /> Date: " + dateString + 
    "<br /> Time: " + signup.appDelivTime +  
    "<br /> People Expected: " + signup.peopToFeed + 
    "<br /> Your food: " + signup.foodDescrip +
    "<br /> Your allergen alerts included: " + signup.allergy + 
    "<br /><br /> If you would like to edit your response, click the following link: <br />" + signup.formID + '&entry.397157629=No+Change' + 
    "<br /><br /> Thank you for volunteering!" +
    "<br /> - Nashoba Robotics #1768"
  );
  
}

// Sends email to remind user of 
function sendSignupReminderEmail() {
  
  // Initialize line of info
  var infoLine = -1;
  
  // Loop through lines in master spreadsheet
  for (var i = 1; i < masterValues.length; i++) {
    
    var date = masterValues[i][0]; // The date box on the sheet
    
    var appDelivTime = masterValues[i][2]; // Get the time box on the sheet
        
    // Set date more specifically
    var times = stringToTime(signup.appDelivTime); 
    date.setHours(times[0]);
    date.setMinutes(times[1]);
    
    // If the time of this trigger + 15 minutes is within an hour period of the meal
    //   Record the current line as the correct one
    var timeScheduledMin = date.getTime() / 1000 / 60;
    var timeNowMin = (Date.now() + reminderEmailDaysBefore * 24 * 60 * 60 * 1000) / 1000 / 60;
    if (timeNowMin + 15 > timeScheduledMin - 15 && timeNowMin + 15 < timeScheduledMin + 45) {
      infoLine = i;
    }
    
  }
  
  // If a line that matched was found
  if (infoLine >= 0) {
    
    // Send email for reminder
    MailApp.sendEmail({
      to: masterValues[infoLine][6],
      subject: 'Robotics Group Meal Signup Reminder',
      htmlBody: draftSignupReminderEmail(infoLine)});
    
    // Delete trigger that caused this reminder
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
      if (allTriggers[i].getUniqueId() == masterValues[infoLine][12]) {
        ScriptApp.deleteTrigger(allTriggers[i]);
      }
    }
    
  }
}


// Confirms a signup
function confirmSignup(signup) {
  
  // Send email for confirmation
  MailApp.sendEmail({
    to: signup.email,
    subject: 'Robotics Group Meal Signup Confirmation',
    htmlBody: draftSignupConfirmationEmail(signup)});
  
  // Create trigger for 2 days before event if trigger not already created
  if (masterValues[signupFillLine][12] == '') {
    var sendDate = new Date(signup.date.getTime() - reminderEmailDaysBefore * 24 * 60 * 60 * 1000);
    var trigger = ScriptApp.newTrigger("sendSignupReminderEmail").timeBased().at(sendDate).create();
    return trigger.getUniqueId();
  }
  
  return -1;
}

// Run when signup form is entered
function onSignupChange(event) {
  
  // Update the spreadsheets
  updateSheets();
  
  // Create new Signup object
  var signup = new SignupSubmission();
  
  // Continue only if there were options available or if "No Change" was not chosen in the form
  if (signup.mealOptions !== 'No group meals currently available.' && !(signup.mealOptions == 'No Change' && !signup.edited)) {
    
    // If the signup form was edited
    if (signup.edited) {
      
      // Find the row of the signup on the master sheet
      var oldRow = -1;
      for (var i = 1; i < masterValues.length; i++) {
        if (signup.formID == masterValues[i][13]) {
          oldRow = i;
        }
      }
      
      // Delete all unnecessary info from old row no matter if change
      masterSheet.getRange(oldRow + 1, 6).setValue('');
      masterSheet.getRange(oldRow + 1, 7).setValue('');
      masterSheet.getRange(oldRow + 1, 8).setValue('');
      masterSheet.getRange(oldRow + 1, 9).setValue('');
      masterSheet.getRange(oldRow + 1, 10).setValue('');
      masterSheet.getRange(oldRow + 1, 11).setValue('');
      masterSheet.getRange(oldRow + 1, 13).setValue('');
      masterSheet.getRange(oldRow + 1, 14).setValue('');
      masterRange = masterSheet.getDataRange();
      masterValues = masterRange.getValues();
    }
    
    // Get information from spreadsheet and whether there are conflicts
    getSignupConflictInfo(signup);
    
    // If a conflict arose
    //   Send email that conflict arose
    if (signup.status == "Conflict") {
      sendSignupConflictEmail(signup);

    } 
    
    // Otherwise
    //   Confirm sign up and set trigger
    //   Fill the master sheet with signup information
    //   Update the group meal calendar
    else {
      
      var triggerID = confirmSignup(signup);
      fillMasterWithSignup(signup, triggerID);
      updateCalendarSignup(signup);
      
    }
    
  }
  
  // Update the signup form meal options
  updateSignupFormMealOptions();
  
  // If the for was edited and there was a change in dates (a different was deleted)
  //   Update the spreadsheet and check the box to do so
  if (signup.edited && signup.mealOptions !== 'No Change') {
    masterSheet.getRange(2, 15).setValue(true);
    masterRange = masterSheet.getDataRange();
    masterValues = masterRange.getValues();
    onSpreadsheetChange();
  }
  
}

//////////////////////////////////////////
///////// CREATION OF GROUP MEAL /////////
//////////////////////////////////////////

// Object created when a group meal is created
function CreationSubmission() {
  
  // Set row to one with latest timestamp
  var lastTimestamp = 0;
  var row = -1;
  
  for (var i = 1; i < creationValues.length; i++) {
    if (creationValues[i][0].getTime() > lastTimestamp) {
      lastTimestamp = creationValues[i][0].getTime();
      row = i;
    }
  }
  
  // Info from spreadsheet
  this.timestamp = creationValues[row][0];
  this.date = creationValues[row][1];
  this.meal = creationValues[row][2];
  this.appDelivTime = creationValues[row][3];
  this.peopToFeed = creationValues[row][4];
  this.details = creationValues[row][5];
  this.email = creationValues[row][6];
  
  this.status;
  this.dateString = (this.date.getMonth() + 1) + '/' + this.date.getDate() + '/' + this.date.getYear();
  this.appDelivTimeString = this.appDelivTime.toLocaleTimeString();
  this.date.setHours(this.appDelivTime.getHours());
  this.date.setMinutes(this.appDelivTime.getMinutes());
  this.calendar = groupMealCalendar;
  this.eventID;
  return this;
  
}

// Check to see if creation of event causes conflict
function getCreationConflicts(creation, omitLine) {
  
  // No conflict by default
  var conflict = 0;
  
  // Raise a conflict if dates and meals are the same
  for (var i = 1; i < masterValues.length; i++) {
    if (omitLine !== i) {
      var dateString = (masterValues[i][0].getMonth() + 1) + '/' + masterValues[i][0].getDate() + '/' + masterValues[i][0].getYear();
      var meal = masterValues[i][1];
      if (dateString == creation.dateString && meal == creation.meal) {
        conflict = 1;
        creationConflictLine = i;
      }
    }
  }
  
  // Set status of creation object accordingly
  if (conflict == 1) {
    creation.status = "Conflict";
  } else {
    creation.status = "Approved";
  }
  
}

// Drafts an email of details of conflict of creating group meal
function draftCreationConflictEmail(creation) {
  
  return (
    '<!DOCTYPE html><html><head><base target="_top"></head>' + 
    '<body><h2>Conflict With New Nashoba Robotics ' + creation.meal + ' on ' + creation.dateString +
    "</h2><p>The previous " + creation.dateString + " " + creation.meal.toLowerCase() + " had:" +
    "<br /> <b>-Approximate Delivery Time: </b>" + masterValues[creationConflictLine][3] +
    "<br /> <b>-People to Feed Estimate: </b>" + masterValues[creationConflictLine][4] +
    "<br /><br />" +
    "The failed " + creation.dateString + " " + creation.meal.toLowerCase() + " had:" +
    "<br /> <b>-Approximate Delivery Time: </b>" + creation.appDelivTimeString +
    "<br /> <b>-People to Feed Estimate: </b>" + creation.peopToFeed + 
    "<br /><br />" + 
    "Enter a new group meal event:" + "<br />" +
    "https://docs.google.com/forms/d/e/1FAIpQLSeTL8c5rqNMUpHgpqCJ5tICbaHj1fwRcXupvAWaNp9xLr6SKw/viewform?usp=sf_link" + 
    "<br /> Or, resolve the conflict manually in 1768 Parent Scheduling Group Meal Master spreadsheet.</p></body></html>"
    );
}

// Sends email that creation of group meal failed
function sendCreationEmail(creation) {
  MailApp.sendEmail({
    to: creation.email,
    subject: 'Robotics Meal Creation Conflict',
    htmlBody: draftCreationConflictEmail(creation)});
}

// Fills master sheet with info from event creation
function fillMasterWithCreation(creation) {
  
  var masterRow = masterSheet.getLastRow() + 1;
  
  // Fill sheet with creation values
  masterSheet.getRange(masterRow, 1).setValue(creation.dateString);
  masterSheet.getRange(masterRow, 2).setValue(creation.meal);
  masterSheet.getRange(masterRow, 3).setValue(creation.appDelivTimeString);
  masterSheet.getRange(masterRow, 4).setValue(creation.peopToFeed);
  masterSheet.getRange(masterRow, 5).setValue(creation.details);
  masterSheet.getRange(masterRow, 12).setValue(creation.eventID);
  masterRange = masterSheet.getDataRange();
  masterValues = masterRange.getValues();
}

// Create a new calendar event of the meal
function updateCalendarCreation(creation) {
  
  // Create new end time
  creation.endTime = new Date(creation.date);
  creation.endTime.setMinutes(creation.date.getMinutes() + groupMealDurationMin);
  
  var dateStr = '';
  if ((creation.date.getMonth() + 1) < 10) {
    dateStr += '0';
  }
  dateStr += (creation.date.getMonth() + 1) + '/';
  if (creation.date.getDate() < 10) {
    dateStr += '0';
  }
  dateStr += creation.date.getDate() + '/' + creation.date.getYear();
  var tempStr = dateStr + ' ' + creation.meal + '. ' + creation.peopToFeed + ' people. ' + creation.appDelivTimeString;
  var str = tempStr.split(' ').join('+');
  
  // Add event to Google Calendar API
  var event = creation.calendar.createEvent(
    'Group ' + creation.meal,
    creation.date,
    creation.endTime,
    {'description': 'Click link to sign up to bring ' + creation.meal.toLowerCase() + ' to feed ' + creation.peopToFeed + 
    '\nhttps://docs.google.com/forms/d/e/1FAIpQLScg43LYIu0hOg7HawWbL0Sb3wETTNs9KJyUIkGZZe-vQoLpWw/viewform?usp=sf_link&entry.397157629=' + str + '\n\n' + creation.details}
  );
  
  // Get event ID
  creation.eventID = event.getId();

  // Set event color to red
  event.setColor("11");//Red
}

// Run when creation form is entered
function onCreationChange(event) {
  
  // Update the spreadsheets
  updateSheets();
  
  // Make new creation object
  var creation = new CreationSubmission();
  
  // Check for conflicts with new creation
  getCreationConflicts(creation, -1);
  
  // If conflict,
  //   Send email that a conflict arose
  if (creation.status == "Conflict") {
    sendCreationEmail(creation);
  } 
  
  // Otherwise (no conflict),
  //   Fill the master spreadsheet with known info
  //   Update the calendar
  else {
    
    updateCalendarCreation(creation);
    fillMasterWithCreation(creation);
    
  }
  
  // Update the signup form meal options
  updateSignupFormMealOptions();
}

////////////////////////////////////////////////
///////// MANUAL CHANGE ON SPREADSHEET /////////
////////////////////////////////////////////////

// Get the lower priority of two lines in the master sheet in case of conflicts
function getLowerLinePriority(line1, line2) {
  
  // Initialize scores of the two lines
  var line1Score = 0;
  var line2Score = 0;
  
  // Add 10 if there is an ID for the line
  if (masterValues[line1][11].indexOf("@google.com") !== -1) {
    line1Score += 10;
  }
  if (masterValues[line2][11].indexOf("@google.com") !== -1) {
    line2Score += 10;
  }
  
  // Add 1 if a name is associated with the line
  if (masterValues[line1][5] !== '') {
    line1Score += 1;
  }
  if (masterValues[line2][5] !== '') {
    line2Score += 1;
  }
  
  // Keep higher-scoring line
  if (line1Score > line2Score) return line2;
  if (line2Score > line1Score) return line1;
  
  // If tied, keep the line that first appeared on the spreadsheet
  return Math.max(line1, line2);
  
}

// A group meal signup direcly on the spreadsheet
function SignupWriteIn(row) {
  
  // Info from spreadsheet
  this.date = masterValues[row][0];
  this.meal = masterValues[row][1];
  this.appDelivTime = masterValues[row][2];
  this.peopToFeed = masterValues[row][3];
  this.details = masterValues[row][4];
  this.name = masterValues[row][5];
  this.email = masterValues[row][6];
  this.phone = masterValues[row][7];
  this.student = masterValues[row][8];
  this.foodDescrip = masterValues[row][9];
  this.allergy = masterValues[row][10];
  
  // Set date more specifically
  var times = stringToTime(this.appDelivTime); 
  this.date.setHours(times[0]);
  this.date.setMinutes(times[1]);
  
  this.status;
  this.dateString = (this.date.getMonth() + 1) + '/' + this.date.getDate() + '/' + this.date.getYear();
  this.calendar = groupMealCalendar;
  this.eventID;
  this.formID;
  
  return this;
}

// A group meal creation directly on the spreadsheet
function CreationWriteIn(row) {
  
  // Info from spreadsheet
  this.date = masterValues[row][0];
  this.meal = masterValues[row][1];
  this.appDelivTime = masterValues[row][2];
  this.peopToFeed = masterValues[row][3];
  this.details = masterValues[row][4];
  
  // Set date more specifically
  var times = stringToTime(this.appDelivTime); 
  this.date.setHours(times[0]);
  this.date.setMinutes(times[1]);
  
  this.status;
  this.dateString = (this.date.getMonth() + 1) + '/' + this.date.getDate() + '/' + this.date.getYear();
  this.calendar = groupMealCalendar;
  this.eventID;
  return this;
  
}

// Updates calendar when spreadsheet changes
function updateSpreadsheetChangeCalendar(event) {
  
  var linesToRemove = [];
  
  // For each row in the master spreadsheet
  // Counting down so lines to remove loops deletes later lines first
  for (var i = masterValues.length - 1; i > 0; i--) {
    
    // Initialize writeIn
    var writeIn;
    
    // If the required fields are filled
    if (masterValues[i][0] !== '' && masterValues[i][1] !== '' && masterValues[i][2] !== '') {
      
      var keepLine = i;
      
      // If there isn't someone signed up for the entry
      if (masterValues[i][5] == '') {
        // Make new creation write in object
        writeIn = new CreationWriteIn(i);
      } 
      
      // Otherwise (someone signed up for the entry)
      else {
        // Make new signup write-in object
        writeIn = new SignupWriteIn(i);
      }
      
      // Check for conflicts
      getCreationConflicts(writeIn, i);
        
      // If there is a conflict
      //   Add the lower priority line to a list of ones to remove if it doesn't show up already
      if (writeIn.status == "Conflict") {
        var removeLine = getLowerLinePriority(i, creationConflictLine);
        if (removeLine == i) {
          keepLine = creationConflictLine;
          linesToRemove.push(removeLine);
        }
      }
        
      // Continue if the current line is still being kept
      if (keepLine == i) {
        
        // If there is an ID (event already created)
        if (groupMealCalendar.getEventById(masterValues[i][11]) !== null) {
          
          Logger.log("ID Detected");
          
          // Set the event ID and event
          writeIn.eventID = masterValues[i][11];
          var event = groupMealCalendar.getEventById(writeIn.eventID);
          
          // Reload the event time to the calendar
          writeIn.endTime = new Date(writeIn.date);
          writeIn.endTime.setMinutes(writeIn.date.getMinutes() + groupMealDurationMin);
          if (event.getStartTime().getTime() !== writeIn.date.getTime()) {
            event.setTime(writeIn.date, writeIn.endTime);
          }
          
          // Get date string to put in form prefill URL
          var dateStr = '';
          if ((writeIn.date.getMonth() + 1) < 10) {
            dateStr += '0';
          }
          dateStr += (writeIn.date.getMonth() + 1) + '/';
          if (writeIn.date.getDate() < 10) {
            dateStr += '0';
          }
          dateStr += writeIn.date.getDate() + '/' + writeIn.date.getYear();
          var tempStr = dateStr + ' ' + writeIn.meal + '. ' + writeIn.peopToFeed + ' people. ' + writeIn.appDelivTime;
          var str = tempStr.split(' ').join('+');
          
          // If nobody signed up
          //   Set color to red if not already
          //   Set description to open description if not already
          if (masterValues[i][5] == '') {
            if (event.getColor() !== "11")
              event.setColor("11"); // Red;
            var description = 'Click link to sign up to bring ' + writeIn.meal.toLowerCase() + ' to feed ' + 
              writeIn.peopToFeed + '\nhttps://docs.google.com/forms/d/e/1FAIpQLScg43LYIu0hOg7HawWbL0Sb3wETTNs9KJyUIkGZZe-vQoLpWw/viewform?usp=sf_link&entry.397157629=' + str + '\n\n' + writeIn.details;
            if (event.getDescription() !== description)
              event.setDescription(description);
          }
          
          // Otherwise (someone is signed up)
          //   Update the calendar as if a signup just occurred
          else {
            updateCalendarSignup(writeIn);
          }
          
        } 
          
        // Otherwise (no ID/ event not created)
        //   Update the calendar
        //   Add the event ID to the spreadsheet
        else {
          
          // If nobody signed up
          //   Update the calendar as if a new event was created
          //   Add the new event ID to the spreadsheet
          if (masterValues[i][5] == '') {
            updateCalendarCreation(writeIn);
            masterSheet.getRange(i + 1, 12).setValue(writeIn.eventID);
            masterRange = masterSheet.getDataRange();
            masterValues = masterRange.getValues();
          }
          
          // Otherwise (someone was signed up with no calendar event)
          else {
            
            // Create new end time
            writeIn.endTime = new Date(writeIn.date);
            writeIn.endTime.setMinutes(writeIn.date.getMinutes() + groupMealDurationMin);
            
            // Create description for event
            var description = 'Estimated people: ' + writeIn.peopToFeed + 
              '\nGraciously Provided By: ' + writeIn.name + 
                '\nContact Info: ' + writeIn.email + ', ' + writeIn.phone + 
                  '\nStudent Name(s): ' + writeIn.student +
                    '\nPlanned Food: ' + writeIn.foodDescrip + 
                      '\nAllergen Alerts: ' + writeIn.allergy + 
                        '\n\n' + writeIn.details;
            
            // Add event to Google Calendar API
            var event = writeIn.calendar.createEvent(
              'Group ' + writeIn.meal,
              writeIn.date,
              writeIn.endTime,
              {'description': description}
            );
          
            // Get event ID
            writeIn.eventID = event.getId();
            
            // Set event ID in sheet
            masterSheet.getRange(i + 1, 12).setValue(writeIn.eventID);
            masterRange = masterSheet.getDataRange();
            masterValues = masterRange.getValues();
            
            // Set event color to pale red
            event.setColor("4"); // Pale Red
          }
        
        }
        
        // If someone signed up but there is no trigger ID
        //   Create trigger for the signup
        //   Set the spreadsheet trigger ID in the right spot
        if (masterValues[i][5] !== '' && masterValues[i][12] == '') {
          var triggerID = confirmSignup(writeIn);
          masterSheet.getRange(i + 1, 13).setValue(triggerID);
          masterRange = masterSheet.getDataRange();
          masterValues = masterRange.getValues();
        }
        
      }
      
    }
    
    // Otherwise (required fields aren't filled)
    //   Add the line to be removed
    else {
      linesToRemove.push(i);
    }
    
  }
  
  // Sort linesToRemove in decreasing order in case something went wrong before
  linesToRemove.sort(function(a, b){return b - a});
  
  // Delete the lines to remove
  for (var i = 0; i < linesToRemove.length; i++) {
    masterSheet.deleteRow(linesToRemove[i]);
  }
  
}

// Updates calendar when spreadsheet changes
function onSpreadsheetChange(event) {
  
  // Update the spreadsheets
  updateSheets();
  
  // If the spreadsheet update box is true
  //   Update the calendar
  //   Set the box to false
  if (masterValues[1][14] == true) {
    updateSpreadsheetChangeCalendar(event);
    masterSheet.getRange(2, 15).setValue(false);
    masterRange = masterSheet.getDataRange();
    masterValues = masterRange.getValues();
  }
  
}

////////////////////////////////////
///////// TRIGGERS TO MAKE /////////
////////////////////////////////////

// Create a trigger to run creation change when form submitted
function makeCreationTrigger() {

  ScriptApp.newTrigger('onCreationChange').forForm(creationForm).onFormSubmit().create();
  
}

// Create a trigger to run signup change when form submitted
function makeSignupTrigger() {
  
  ScriptApp.newTrigger('onSignupChange').forForm(signupForm).onFormSubmit().create();
}

