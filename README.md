# Group Meal Signups
## Overview
Group Meal Signups is a Javascript project that works with Google APIs to allow a team signup mechanism for meals.
First, a Google Calendar is set up that will contain all team meals.
Using Google Forms, the group organizer can create meals in the calendar.
An empty meal form has a date, type (lunch or dinner), start time, number of people to feed, special description, color, and, most importantly, a URL to sign up for that meal. If the organizer accidentally creates two of the same meal, the event will not be added to the calendar and a conflict email will be sent.
When the calendar event is clicked on, the description displays all that information.
The URL brings the user to a Google Form.

In the Google Form, the prospective volunteer enters their name, contact info, student name (for chaperoning parents), meal chosen (clicked URL  filled in by default), a description of the food to bring, and allergen alerts. The volunteer doesn't have the option of signing up for a meal that has been signed up for already (except in rare circumstance that forms for same meal submitted within seconds of each other). Once submitted, the description and color on the Google Calendar will change to reflect the submitted information.

When a volunteer signs up for a meal, they will immediately receive a confirmation email. This will reiterate the information they just put into the form. In addition, the volunteer will receive an email reminder with the same information before their scheduled meal time (2 days by default). In the rare case that a conflict arises due to code overload from simultaneous submitted forms, the volunteer will receive a conflict email.

## Necessary Setup
1. Have (1) meal organizer complete all the following steps
2. Create a Google Sheet.
3. 

## Setup Extra Options
Google Calendar colors
Google Calendar notifications/auto-emails (guaranteed in large-scale use)
Reminder email time before
Breakfast, snack

## User Use

## Limitations
Size if email reminder important due to triggers
Manual deletion of event necessary, no email reminder if event deleted
Initial entry time-consuming
Real-time email conflict signup buggy
Triggers could add up, needs to be cleaned occasionally
