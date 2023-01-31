# Eversity

## Description
The Eversity Web Application is a web-based implementation of a given university’s postings of events. Students are able to register using their first name, last name, university affiliated email, and a secure password of their choosing. Afterwards, the student will be able to login using their registered email and password. Upon creating a university, a super admin can provide the university’s email domain. This way, there are no complications with non-existent
university affiliated names. When logged in, users are sent to the dashboard page, where they can see recent events, upcoming events, and super admins are able to see pending events in addition to the other displays. Our web application has a useful navigation bar at the top of the user’s screen that gives them the option to view the dashboard page, event listing page, RSO listing page, and the option to logout if they so choose.


## Live Site
[https://eversity.glitch.me](https://eversity.glitch.me)

Since this web application is made ideally for the University domain styled emails, we've created a mock university for all Gmail users. So if you'd like to test this web app, I'd recommend registering with your Gmail account to check out what we have!

## Development
We use a local [.env](https://www.npmjs.com/package/dotenv) file to access our PostgreSQL database (hosted by [ElephantSQL](https://www.elephantsql.com/)), to hold the signature of our [JSON Web Token](https://jwt.io/), and to access our API Key for accessing [Open Cage Data](https://opencagedata.com/)'s Geocoding service.

## Authors
[Exdol Davy](https://www.linkedin.com/in/exdol-davy/) and [Matthew Sing](https://www.linkedin.com/in/matthewnsingh/)
