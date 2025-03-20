const express=require("express");
const app=express();
const path=require("path");
const { google } = require('googleapis');
require("dotenv").config();

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.urlencoded({ extended: true })); // Middleware to parse form data

app.listen("3000",()=>{
    console.log("Server listening on port 3000");
});


const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_CREDENTIALS,
  scopes: ['https://www.googleapis.com/auth/calendar'],
});


const calendar = google.calendar({ version: "v3", auth });

// Your calendar ID (Use 'primary' if it's your personal calendar)
const CALENDAR_ID = process.env.CALENDAR_ID; // Replace with your shared calendar ID

app.get("/", async (req, res) => {
  try {
    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    res.render("calendar", { events: response.data.items });
  } catch (error) {
    res.status(500).send("Error fetching events: " + error.message);
  }
});

// 📌 Route to Show Event Creation Form
app.get("/create", (req, res) => {
  res.render("create-event");
});

// 📌 Route to Handle Event Creation
app.post("/create", async (req, res) => {
  try {
    const { title, date, time } = req.body;

    console.log(req.body)
    const event = {
      summary: title,
      start: {
        dateTime: time ? `${date}T${time}:00` : date,
        timeZone: "UTC",
      },
      end: {
        dateTime: time ? `${date}T${time}:00` : date,
        timeZone: "UTC",
      },
    };

    await calendar.events.insert({ calendarId: CALENDAR_ID, resource: event });
    res.redirect("/");
  } catch (error) {
    res.status(500).send("Error creating event: " + error.message);
  }
});