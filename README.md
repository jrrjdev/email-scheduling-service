# email-service-full-stack
This project is a email service for scheduling emails. It is designed as a public web app which can be used to send an email to a specified email address at an arbitrary time.
  
Live demo: https://the-email-service.appspot.com

## Scheduling Mechanism
1. The worker pulls emails which are ready to be sent from the database by a GET api call
2. The worker sends one email at a time
3. The worker marks the email as sent in the database
4. The worker processes all the emails received from that GET api call
5. The worker does this cycle again

## API endpoints (JSON)
- `POST /api/scheduled-emails`
  - `body: { "scheduledDateTime": "", "toEmailAddress": "", "subject": "", "text": "" }`
- `GET /private-api/scheduled-emails`
  - `query: { "filterType": "readyToSend", "apiKey": "" }`
- `PATCH /private-api/scheduled-emails/:scheduledEmailId`
  - `query: { "apiKey": "" }`
  - `body: { "patchType": "markSent", "sentDateTime": "" }`

ps. all DateTime field should be in format of YYYY-MM-DDTHH:mm:ssZ, eg. 2018-12-30T18:50:33Z

- Success response: `{ "data": {} }`
  - 200 OK
- Fail response: `{ "error": {} }`
  - 400 Bad Request
  - 401 Unauthorized
  - 500 Internal Server Error

- Scheduled Email Object: `{Id: number, Sent: boolean, ScheduledDateTime: Date, ToEmailAddress: string, Subject: string, Text: string, SentDateTime: Date, CreatedDateTime: Date}
`

## Architecture
There are four components:
- Single-page website (front-end) - allows users to submit scheduled emails to the back-end
- Restful API (back-end) - allows all microservices to communicate
- Remote database (back-end) - stores details of scheduled emails remotely
- Non-stop worker (back-end) - processes and sends scheduled emails
  
### Single-page website (front-end)
- Language: TypeScript
- Framework: [Angular 7](https://angular.io/)
- Key library: [Moment.js](http://momentjs.com/) - standardize timestamp and timezone
- Technical choice reasoning:
  - As the website is relatively small, I picked the front-end framework which I am the most familiar with which is Angular.
  - As different browsers handle timestamp differenetly, Moment.js standardize Date-type object and datetime-local input with consistent timezone across Chrome, Safari and Firefox.

### Restful API (back-end)
- Language: JavaScript
- Framework: [Express](https://expressjs.com/) for [Node](https://nodejs.org/en/)
- Key library: [Mysql.js](https://github.com/mysqljs/mysql) - a node.js driver for mysql
- Technical choice reasoning:
  - Express framework allows me to quickly develop an API with clear routing and powerful middleware.
  - Node's asynchronous nature is great for handling parallel API requests and responses.

### Remote database (back-end)
- RDBMS: MySQL 5.7
- Technical choice reasoning:
  - If transactions were needed in the future, MySQL can still handle that.

### Non-stop worker (back-end)
- Language: JavaScript
- 3rd-party email api providers: Mailgun and Sendgrid
- Guarantee to run 24/7: A shell script and a cron job ensure the worker restarts itself within 1 minute after crashing.
- Technical choice reasoning:
  - As the API is written in JavaScript, It is quite natural to use JavaScript here to reuse some codes and libraries.
  - 3rd-party email api providers generally provide JavaScript library to access their api.

## Deployed at
All components are deployed at GCP:
- App Engine: website and API
- Cloud SQL: database
- Compute Engine: worker

## Deploy yourself
- update all environment.js and environment.prod.js files to fit your settings
- update app.yaml for /app-engine/default and /app-engine/api to deploy the services to your App Engine project

## Robustness
The scheduled emails are handled and sent by a non-stop worker which pulls the emails which are ready to be sent from the database. This pulling mechanism ensures that every scheduled email would be sent at least once. A scheduled email may be sent twice if the worker crashed just before marking the email as sent in the database or the back-end API was down. However, as the worker handles errors and exceptions properly, the chance of worker crashing is very low (similar workers are proven to be able to run continuously without crashing in years). Also, when the API was down, the worker could not pull any data from it and would not send any emails. To further reduce the chance, local cache can be an effective solution (discussed in the Possible improvement section below).

There is an abstraction between two different email service providers. If one of the services goes down, the worker can quickly failover to a different provider. More email service providers can be added to increase the availability of calling email api.

Due to the synchronous nature of the worker, scheduled emails are pulled first and being sent one after one. It may introduce a delay, and the amount of delay depends on the number of pending emails. The delay may add up to an undesired level when the number of pending emails continuously exceeds the throughput of the worker. For the moment, a relatively low volume of scheduled emails is assumed. To scale this service, a system of parallel asynchronous workers is almost a must (discussed in the Possible improvement section below).

Given the average response time of 3rd-party email services api is ~1s:

| pending emails in 1 cycle | incremental delay |
| ------------- | ------------- |
| 60 | ~1 min |
| 120 | ~2 mins |
| 60 * n | ~n mins |

## Security
### Database
- An api user was added with only required privileges: INSERT, SELECT and UPDATE.
- Only secured connections with SSL encryption are allowed to connect to the database.

### API
- Only the api user is used to execute queries in the database.
- All user inputs are validated before going into queries.
- All queries are parameterized to prevent SQL injection.
- Public routes are rate limited. For demonstration purpose, the limit is set to be 2 per minute.
- Private routes require an strong api key for authentication and authorization.

### Website
- All traffic is served through HTTPS only.

### Worker
- The program is running in a secure virtual machine.

## Scalability
### API
App Engine allows us to scale out the API simply by changing configurations of app.yaml.

### Worker
Not scalable in current design. Only one worker can work at a time.

### Database
MySQL and Cloud SQL allows us to add multiple read replicas and a failover replica.

## Testing
The API and the worker are tested by automated tests using [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/).
### API
All url endpoints and database querying functions are covered with unit tests.
### Worker
All api calling and email sending functions are covered with unit tests and integration tests.
### Website
No automated test right now.

## Possible improvement
- Local cache for worker: records the scheduled emails in local storage, eg. sqlite, and update them in the remote database on restart after crashing.
- A system of parallel asynchronous workers: split the workload to multiple workers, but we have to make sure to lock the scheduled email when sending and unlock it if failed to send. A good way is to wrap the process in a MySQL transaction: lock the row of a scheduled email and check the status of it before sending the email and updating its status. Commit the transaction if successfully sent, rollback the transaction if failed to send. In a result, a scheduled email will be sent once and only once. More importantly, pending emails can be sent properly in parallel by multiple workers.
- A work queues using RabbitMQ: distribute email-sending tasks among multiple workers with a powerful message broker instead of creating a custom one for this web app.
- Paginate the API response: avoid sending too many records in one single response.
- NoSQL database instead of RDBMS: NoSQL databases, eg. MongoDB, are more flexible to design data storage model, faster to develop api and easier to scale out. Also, MongoDB 4.0 supports multi-document ACID transactions.
- More thorough testing: add more cases of unit tests and integration tests to test the correctness of both success and failure handling in different circumstances.
