# Group Meal Signups
## Overview
Group Meal Signups is a Javascript project that works with Google APIs to allow a team signup mechanism for meals.
First, a Google Calendar is set up that will contain all team meals.
Using Google Forms, the group organizer can create meals in the calendar.
An empty meal form has a date, type (lunch or dinner), start time, number of people to feed, special description, color, and, most importantly, a URL to sign up for that meal. If the organizer accidentally creates two of the same meal, the event will not be added to the calendar and a conflict email will be sent.
When the calendar event is clicked on, the description displays all that information.
The URL brings the user to a Google Form.

![Signup Calendar](SignupCalendar.jpg)  
Calendar meal with link for signup

In the Google Form, the prospective volunteer enters their name, contact info, student name (for chaperoning parents), meal chosen (clicked URL  filled in by default), a description of the food to bring, and allergen alerts. The volunteer doesn't have the option of signing up for a meal that has been signed up for already. Once submitted, the description and color on the Google Calendar will change to reflect the submitted information.

When a volunteer signs up for a meal, they will immediately receive a confirmation email. This will reiterate the information they just entered into the form. In addition, the volunteer will receive an email reminder with the same information before their scheduled meal time (2 days by default). In the rare case that a conflict arises due to code overload from simultaneously-submitted forms, the volunteer will receive a conflict email.

All the data is stored in one Google Sheet. That sheet has a checkbox that updates the calendar with any new information in case the owner wants to clean it up. The spreadsheet, except for deleting events, should not need to be used after set-up is complete.

## Necessary Setup
1. Have (1) meal organizer complete all the following steps
2. Create a Google Sheet (for master data). Name it something to recognize it as the master data set
3. Create a Google Form and name it "(Organization) Group Meal Entry" (name not critical).  
    **Order is important**  
    a. Add a *REQUIRED* date field titled "Date"  
    b. Add a *REQUIRED* multiple choice question titled "Meal Options" with desired meal types (Ex. Lunch, Dinner)    
    c. Add a *REQUIRED* time field titled "Approximate Delivery Time"  
    d. Add a *REQUIRED* short-answer question titled "People to Feed Estimate"  
    e. Add a short-answer question titled "Special Details"  
    f. Add a *REQUIRED* short-answer question titled "Email Address"  
    g. Click on Settings. Check "Edit after submit"  
    h. Go to RESPONSES, click on green and white Sheets logo  
    i. Link the form to the Sheet created in Step (2)  
4. In Google Sheet, rename the new response sheet "Group Meal Creation" by right-clicking it on the bottom of the screen  
5. Delete Sheet1 (default sheet) by right-clicking it on the bottom of the screen  
6. Create a Google Form and name it "(Organization) Group Meal Signup"  
   **Order is important**  
   a. Add a title and description with title "Contact Info" and subtitle "Reminders will be sent to email"  
   b. Add a *REQUIRED* short-answer question titled "Name"  
   c. Add a *REQUIRED* short-answer question titled "Email"  
   d. Add a short-answer question titled "Phone Number"  
   e. Add a short-answer question titled "Student Name" (or other affiliation identifier)  
   f. Add a label with title "Volunteering Details"  
   g. Add a *REQUIRED* multiple choice question titled "Meal Options (choose "No Change" if editing response)"  
      i. The options will be filled in by the program, so add no options to start  
   h. Add a paragraph question titled "Food Description"  
   i. Add a paragraph question titled "Allergen Alerts"  
   j. Click on Settings. Check "Edit after submit"  
   k. Go to RESPONSES, click on green and white Sheets logo  
   l. Link the form to the Sheet created in Step (2)  
7. In Google Sheet, rename the new response sheet "Group Meal Signup" by right-clicking it on the bottom of the screen  
8. Click Add Sheet button (+) in bottom left of Google Sheet  
   a. Name sheet "Group Meal Master"  
   b. Fill A1 with "Date"  
   c. Fill B1 with "Meal"  
   d. Fill C1 with "Approximate Delivery Time"  
   e. Fill D1 with "People to Feed Estimate"  
   f. Fill E1 with "Special Details"  
   g. Fill F1 with "Provider Name"  
   h. Fill G1 with "Provider Email"  
   i. Fill H1 with "Provider Phone"  
   j. Fill I1 with "Provider Student Name" (or other affiliation identifier)  
   k. Fill J1 with "Food Description"  
   l. Fill K1 with "Allergen Alerts"  
   m. Fill L1 with "Event ID"  
   n. Fill M1 with "Trigger ID"  
   o. Fill N1 with "Form ID"  
   p. Fill O1 with "Check Right to Update"  
   q. Click on P1. Click on Insert-> Checkbox  
9. Ensure the sheets are in order. If not drag to reorder. From left to right:  
   1. "Group Meal Signup"  
   2. "Group Meal Creation"  
   3. "Group Meal Master"  
10. Open Google Calendar  
   a. Ensure you are logged in with the same account used for the Sheet and Forms  
   b. Click on Other Calendars -> Create new calendar  
   c. Name the calendar something relevant (name not critical)   
   d. Open Calendar settings  
   e. Make available to public  
   f. Click "Get shareable link" and record for future use or share with specific people  
11. In Sheet, click on Tools-> Script Editor  
12. Create new Script File called "Group Meal Addition"  
13. Copy contents from "GroupMealAddition.js" in this repository and paste into script file  
14. Add IDs to script file  
   a. In master Sheet, copy URL from after "/spreadsheets/d/" to "/edit" (not inclusive). This is the Sheet ID  
   b. On Lines 14, 19, 24, 39, 44, and 49 in script file, paste inside single quotes  
   c. In Group Meal Signup Form, copy URL from after "/forms/d" to "/edit" (not inclusive). This is the Form ID  
   d. On Line 29 in script file, paste inside single quotes  
   e. In Group Meal Creation Form, copy URL from after "/forms/d" to "edit" (not inclusive)  
   f. On Line 30 in script file, paste inside single quotes  
   g. In Calendar, open Settings and Sharing. Scroll down to "Calendar ID" and copy  
   h. On Line 11 in script file, paste inside single quotes
   i. Save script file
   j. Hover over Run -> Run Function. Scroll toward the bottom and click on "printMealOptionsID"  
   k. Click on View -> Logs. Copy the number after the ID  
   l. On Line 134 in script file, paste inside parentheses after "getItemsByID"  
15. Specify email reminders  
   a. On Line 8 in script file, type organization name inside single quotes (replace None)  
   b. Open Group Meal Signup Form. Click on "Preview" (eye). Copy whole URL  
   c. On Line 276 in script file, paste URL to replace series of underscores  
   d. On Line 651 and 863 in script file, paste URL to replace first series of underscores  
   e. On Lines 341 and 362 in script file, replace first underscores with primary meal location  
   f. Open Group Meal Signup Form. Click on three dots in corner then "Get pre-filled link"  
   g. For Meal Options, choose "No Change." Click "Get Link"
   h. Click "Copy Link" near bottom left. Paste in a notepad or new tab. Copy the number toward the end after "&entry." before "=No+Change"  
   i. On Lines 347, 368, 651, and 863 in script file, replace underscores after "&entry." with the copied number  
   j. Open Group Meal Creation Form. Click on "Preview" (eye). Copy whole URL  
   k. On Line 597, replace series of underscores with copied URL  
16. Create triggers for running  
   a. Save script file. Hover over Run -> Run Function. Scroll down and click "makeCreationTrigger"  
   b. Hover over Run -> Run Function. Scroll down and click "makeSignupTrigger"  
   c. On script file, click Edit -> Current project triggers  
   d. Click "Add Trigger" in bottom right  
   e. For "Choose which function to run," choose "updateSignupFormMealOptions." For "Select event source," choose "From spreadsheet." For "Select event type," select "On change." Click "Save"  
   f. Click "Add Trigger" in bottom right  
   g. For "Choose which function to run," choose "onSpreadsheetChange." For "Select event source," choose "From spreadsheet." For "Select event type," select "On change." Click "Save"  

## Additional Settings Options: Setup  
**Google Calendar Event Colors**  
   * Default available meal is red. Default claimed meal is pale red  
   * Colors are corresponded with a number: https://developers.google.com/apps-script/reference/calendar/event-color  
   * Available meal numbers can have numbers replaced in script file on lines 658, 860, and 861  
   * Claimed meals can have numbers replaced in script file on lines 316, 317, and 924  
**Google Calendar Notifications/Automatic Emails** (allows guarantee in large-scale use)  
   * Allows guaranteed email reminders in program since only 46 programmed reminder emails can be queued at any time  
   * Downside: Everybody gets an email reminder, not just the people signing up  
   * Open Google Calendar.  
   * Open Calendar "Settings and sharing"  
   * Scroll down to "Event notifications." Add either email or notification for specific amount of time before  
   * "General notifications" can also be changed just below "Event notifications"  
**Reminder Email Time**  
   * Time before meal to send reminder email can be modified. Default is 2 days  
   * On Line 7 in script file, change number of days  
**Meal Duration on Calendar**  
   * On Line 6 in script file, change duration of meals in minutes  

## User Use  

## Limitations  
   * Only 50 triggers can be active at once, and 4 are already reserved. Therefore, only 46 reminder emails can be queued at any given time  
   * To delete an event, it must be manually deleted from the Calendar. There is no built-in email reminder if an event is deleted. However, this is a general setting for the Calendar  
   * There is no function to generate a meal weekly or monthly. The initial entering of meals will therefore be time-consuming  
   * Functions take a few seconds to run. If forms are submitted within seconds of each other, the signup conflict logic may not have run yet. If this happens, there is a chance that no indication of two people signing up for same day will occur  
