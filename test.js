// const express = require("express");
// const session = require('express-session');
// const cors = require("cors");
// const path = require("path");
// const jwt = require("jsonwebtoken");
// const bodyParser = require("body-parser");
// const jsonParser = bodyParser.json();
// const bcrypt = require("bcrypt");
// const saltRounds = 10;
// const dbConnection = require("./db");

//  const app = express();



// app.use("/public", express.static(path.join(__dirname, "/public")));

// app.get("/user", async (req, res) => {
//     if (req.session.user) {
//         res.json(req.session.user);
//     } else {
//         res.status(401).send("No user info");
//     }
// });


// // Middleware สำหรับตรวจสอบสถานะการเข้าสู่ระบบ
// function requireLogin(req, res, next) {
//     // ตรวจสอบว่ามี session ที่มีข้อมูลของผู้ใช้หรือไม่
//     if (req.session && req.session.user) {
//         // ถ้าผู้ใช้เข้าสู่ระบบแล้ว ไปต่อไป
//         return next();
//     } else {
//         // ถ้าไม่ได้เข้าสู่ระบบ ให้เปลี่ยนทางไปที่หน้า login
//         return res.redirect('/');
//     }
// }


//  //root
//  app.get("/login", function(req, res) {
//  res.sendFile(path.join(__dirname, "/pages/login/login.html"));
//  });

// //  เพิ่มpage ตรงนี้เลยจ้า
//  app.get("/search", function(req, res) {
//     res.sendFile(path.join(__dirname, "/pages/staff/search.html"));
//     });

// app.get("/listadvisor", function(req, res) {
//         res.sendFile(path.join(__dirname, "/pages/advisor/listadvisor.html"));
//         });

// app.get("/liststaff", function(req, res) {
//             res.sendFile(path.join(__dirname, "/pages/staff/list.html"));
//             });

// app.get("/profile", function(req, res) {
//                 res.sendFile(path.join(__dirname, "/pages/student/profile.html"));
// });

// app.get("/layout1", function(req, res) {
//     res.sendFile(path.join(__dirname, "/layouts/layout1.html"));
// });

// app.get("/layout2", function(req, res) {
//     res.sendFile(path.join(__dirname, "/layouts/layoutprofile.html"));
// });

// app.get("/loadlayout1", function(req, res) {
//     res.sendFile(path.join(__dirname, "/jason/loadlayout1.js"));
// });

// app.get("/loadlayout2", function(req, res) {
//     res.sendFile(path.join(__dirname, "/jason/loadlayoutprofile.js"));
// });

// // หน้า login
// app.post("/login", async (req, res) => {
//     const { USERNAME, PASSWORD } = req.body;

//     try {
//         const user = await new Promise((resolve, reject) => {
//             dbConnection.query(
//                 "SELECT * FROM users_data_table WHERE USERNAME = ?",
//                 [USERNAME],
//                 (err, result, fields) => {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(result.length > 0 ? result[0] : null);
//                     }
//                 }
//             );
//         });

//         if (user) {
//             const passwordMatch = await bcrypt.compare(PASSWORD, user.PASSWORD);
//             if (passwordMatch) {
//                 const token = jwt.sign({ USERNAME, ROLE_ID: user.ROLE_ID }, "gmis", {
//                     expiresIn: "1h",
//                 });

//                 // ตั้งค่า session หลังจาก login
//                 req.session.user = { USERNAME, ID: USER_ID, ROLE_ID: USER_ROLE_ID, STATUS: USER_STATUS,PICTURE:USER_PICTURE };

//                 // ตรวจสอบ ROLE_ID เพื่อเปลี่ยนเส้นทาง
//                 switch (user.ROLE_ID) {
//                     case "1":
//                         return res.json({ redirect: "/admint", token, ROLE_ID: USER_ROLE_ID, STATUS: USER_STATUS,PICTURE:USER_PICTURE });
//                     case "2":
//                         return res.json({ redirect: "/advisert", token, ROLE_ID: USER_ROLE_ID, STATUS: USER_STATUS,PICTURE:USER_PICTURE });
//                     case "3":
//                         return res.json({ redirect: "/profile", token, ROLE_ID: USER_ROLE_ID, STATUS: USER_STATUS,PICTURE:USER_PICTURE });
//                     case "4":
//                         return res.json({ redirect: "/advisert", token, ROLE_ID: USER_ROLE_ID, STATUS: USER_STATUS,PICTURE:USER_PICTURE });
//                     case "5":
//                         return res.json({ redirect: "/stafft", token, ROLE_ID: USER_ROLE_ID, STATUS: USER_STATUS,PICTURE:USER_PICTURE });
//                     default:
//                         return res.status(200).json({ token, ROLE_ID: USER_ROLE_ID, STATUS: USER_STATUS,PICTURE:USER_PICTURE });
//                 }
//             } else {
//                 return res.status(401).json({ error: "Invalid email or password" });
//             }
//         } else {
//             return res.status(401).json({ error: "Invalid email or password" });
//         }
//     } catch (err) {
//         console.log("Server error during login", err);
//         return res.status(500).json({ error: "Server error during login" });
//     }
// });

// // หน้า profile
// app.get("/profile/:USER_ID/:RESEARCH_ID", async (req, res) => {
//     const USER_ID = req.params.USER_ID;
//     const RESEARCH_ID = req.params.RESEARCH_ID;

//     try {
//         // Define queries with parameters
//         const queries = {
//             adviserData: {
//                 query: "SELECT NAME_EN, ADVISER_LEVEL FROM adviser_data_table WHERE RESEARCH_ID = ?",
//                 params: [RESEARCH_ID]
//             },
//             userData: {
//                 query: "SELECT PICTURE FROM users_data_table WHERE ID = ?",
//                 params: [USER_ID]
//             },
//             committeeData: {
//                 query: "SELECT NAME_EN, COMMITTEE_LEVEL FROM committee_data_table WHERE USER_ID = ?",
//                 params: [USER_ID]
//             },
//             studentData: {
//                 query: `SELECT NAME_EN, EMAIL, MOBILE, PLAN_VERSION, START_TERM, START_YEAR, 
//                         ETHICS_TYPE, ETHICS_TRAIN_DATE, ET_TYPE, ET_DATE, ET_MORE_DETAIL, 
//                         ET_SCORE, ET_TERM, ET_YEAR 
//                         FROM student_data_table WHERE USER_ID = ?`,
//                 params: [USER_ID]
//             },
//             researchData: {
//                 query: "SELECT TITLE_EN FROM research_data_table WHERE USER_ID = ?",
//                 params: [USER_ID]
//             },
//             researchPublishingData: {
//                 query: "SELECT PUBLISHING_NO FROM research_publishing_data_table WHERE USER_ID = ?",
//                 params: [USER_ID]
//             },
//             lookupData: {
//                 query: "SELECT KEY_1, KEY_2 FROM lookup_data_table WHERE KEY_1 = 'englishtest' AND KEY_2 = 'transfer'"
//             }
//         };

//         // Promise function to query the database
//         const queryDatabase = ({ query, params }) => {
//             return new Promise((resolve, reject) => {
//                 dbConnection.query(query, params || [], (err, result) => {
//                     if (err) {
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 });
//             });
//         };

//         // Execute all queries simultaneously
//         const results = await Promise.all(Object.values(queries).map(queryDatabase));

//         // Create a response object with all the data
//         const response = {
//             adviserData: results[0],
//             userData: results[1],
//             committeeData: results[2],
//             studentData: results[3],
//             researchData: results[4],
//             researchPublishingData: results[5],
//             lookupData: results[6]
//         };

//         res.status(200).json(response);

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });






//  const port = 3000;
//  app.listen(port, function() {
//  console.log("Server is ready at " + port);
//  });