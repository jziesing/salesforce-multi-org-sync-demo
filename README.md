# Simple Multi Salesforce Org sync Demo

### This project demos a simple way to synchronize Salesforce orgs together using Heroku, Postgres, Heroku Connect, and Postgres triggers

## Prerequisites
1. Signup for 2 free demo Salesforce orgs [link to signup](https://developer.salesforce.com/signup)
2. Signup for a Heroku account [link to Heroku signup](https://signup.heroku.com)

## Getting it running
1. Deploy this app to Heroku [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
2. Set config vars SCHEMA_A and SCHEMA_B to the names you want to use for each orgs postgres schema name
3. Click deploy app
4. Configure both Heroku Connect for each org. Map the contact object. Make sure to include the email field, phone field, check Accelerate Polling, and check the checkbox that enables updates back to Salesforce.
5. From the admin screen on the Heroku App, click Open App, then click Make Database Triggers
6. Now when you change the phone number on a contact in 1 Salesforce org, the contact with the same email in the second org will be updated with the new phone number from the other org.
