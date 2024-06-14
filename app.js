const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const bcrypt = require("bcrypt");
const dbConfig = require("./db");
const mysql = require("mysql2/promise");

const app = express();

app.use("/public", express.static(path.join(__dirname, "/public")));

app.get("/user", async (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).send("No user info");
  }
});

// Middleware สำหรับตรวจสอบสถานะการเข้าสู่ระบบ
function requireLogin(req, res, next) {
  // ตรวจสอบว่ามี session ที่มีข้อมูลของผู้ใช้หรือไม่
  if (req.session && req.session.user) {
    // ถ้าผู้ใช้เข้าสู่ระบบแล้ว ไปต่อไป
    return next();
  } else {
    // ถ้าไม่ได้เข้าสู่ระบบ ให้เปลี่ยนทางไปที่หน้า login
    return res.redirect("/");
  }
}

//root
app.get("/login", function (req, res) {
  res.sendFile(path.join(__dirname, "/pages/login/login.html"));
});

//  เพิ่มpage ตรงนี้เลยจ้า
app.get("/search", function (req, res) {
  res.sendFile(path.join(__dirname, "/pages/staff/search.html"));
});

app.get("/listadvisor", function (req, res) {
  res.sendFile(path.join(__dirname, "/pages/advisor/listadvisor.html"));
});

app.get("/liststaff", function (req, res) {
  res.sendFile(path.join(__dirname, "/pages/staff/list.html"));
});

app.get("/profile", function (req, res) {
  res.sendFile(path.join(__dirname, "/pages/student/profile.html"));
});

app.get("/layout1", function (req, res) {
  res.sendFile(path.join(__dirname, "/layouts/layout1.html"));
});

app.get("/layout2", function (req, res) {
  res.sendFile(path.join(__dirname, "/layouts/layoutprofile.html"));
});

app.get("/loadlayout1", function (req, res) {
  res.sendFile(path.join(__dirname, "/jason/loadlayout1.js"));
});

app.get("/loadlayout2", function (req, res) {
  res.sendFile(path.join(__dirname, "/jason/loadlayoutprofile.js"));
});

// หน้า login
app.post("/login", async (req, res) => {
  const { USERNAME, PASSWORD } = req.body;

  try {
    const user = await getUserByUsername(USERNAME);

    if (user) {
      if (PASSWORD === user.PASSWORD) {
        // เปรียบเทียบรหัสผ่านในรูปแบบที่ไม่ได้เข้ารหัส
        const token = jwt.sign({ USERNAME, ROLE_ID: user.ROLE_ID }, "gmis", {
          expiresIn: "1h",
        });

        req.session.user = user; // ตั้งค่า session

        // ตรวจสอบบทบาทของผู้ใช้และส่งโทเค็นและข้อมูลเพิ่มเติมกลับไป
        switch (user.ROLE_ID) {
          case "1":
            return res.json({ redirect: "/admint", token, ...user });
          case "2":
            return res.json({ redirect: "/advisert", token, ...user });
          case "3":
            return res.json({ redirect: "/profile", token, ...user });
          case "4":
            return res.json({ redirect: "/advisert", token, ...user });
          case "5":
            return res.json({ redirect: "/stafft", token, ...user });
          default:
            return res.status(200).json({ token, ...user });
        }
      } else {
        return res.status(401).json({ error: "Invalid email or password" });
      }
    } else {
      return res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) {
    console.log("Server error during login", err);
    return res.status(500).json({ error: "Server error during login" });
  }
});

//  test james
app.use("/pages", express.static(path.join(__dirname, "/pages")));
app.use("/layouts", express.static(path.join(__dirname, "/layouts")));
app.use("/jason", express.static(path.join(__dirname, "/jason")));

app.get("/dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "/pages/staff/dashboard.html"));
});

app.get("/timeline", function (req, res) {
  res.sendFile(path.join(__dirname, "/pages/staff/timeline.html"));
});

app.get("/getuser/:id", async function (req, res) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Get user data
    const [userResults] = await connection.execute(
      "SELECT * FROM users_data_table WHERE USERNAME = ?",
      [req.params.id]
    );

    if (userResults.length === 0) {
      res.json({ status: "error", message: "User not found" });
      return;
    }

    const user = userResults[0];
    const userId = user.ID;

    // Get research data
    const [researchResults] = await connection.execute(
      "SELECT STATUS FROM research_data_table WHERE USER_ID = ?",
      [userId]
    );

    const researchStatus =
      researchResults.length > 0 ? researchResults[0].STATUS : null;

    await connection.end();

    res.json({ status: "success", user: user, researchStatus: researchStatus });
  } catch (err) {
    console.error("Database error:", err);
    res.json({
      status: "error",
      message: "Database server error",
      error: err.message,
    });
  }
});

// API for getting statistics data for specific programs
app.get("/statistics", async function (req, res) {
  try {
    const programIds = [487111020, 487111000, 595170203];
    const connection = await mysql.createConnection(dbConfig);

    // Create a query string with placeholders for each program ID
    const placeholders = programIds.map(() => "?").join(",");
    const query = `
        SELECT PROGRAM, SUM(TOTAL) AS TOTAL, SUM(CANDIDATE) AS CANDIDATE, SUM(GRADUATE) AS GRADUATE, SUM(RETRY) AS RETRY, SUM(NORMAL) AS NORMAL
        FROM statistic_report_data_table
        WHERE PROGRAM IN (${placeholders})
        GROUP BY PROGRAM
      `;

    const [results] = await connection.execute(query, programIds);

    await connection.end();

    if (results.length === 0) {
      res.json({ status: "error", message: "Programs not found" });
      return;
    }

    res.json({ status: "success", data: results });
  } catch (err) {
    console.error("Database error:", err);
    res.json({
      status: "error",
      message: "Database server error",
      error: err.message,
    });
  }
});

//   end


// หน้า profile
app.get("/dataprofile/:USER_ID/:RESEARCH_ID", async (req, res) => {
  const USER_ID = req.params.USER_ID;
  const RESEARCH_ID = req.params.RESEARCH_ID;

  // Define queries with parameters
  const queries = {
    adviserData: {
      query:
        "SELECT USER_ID,STATUS,NAME_EN, ADVISER_LEVEL FROM adviser_data_table WHERE RESEARCH_ID = ?",
      params: [RESEARCH_ID],
    },
    examData: {
      query: "SELECT ID FROM exam_data_table WHERE RESEARCH_ID = ?",
      params: [RESEARCH_ID],
    },
    committeeData: {
        query: `SELECT committeeData.USER_ID, committeeData.NAME_EN, 
                committeeData.COMMITTEE_LEVEL 
                FROM committee_data_table committeeData 
                INNER JOIN exam_data_table examData 
                ON committeeData.EXAM_ID = examData.ID 
                WHERE examData.RESEARCH_ID = ?
                GROUP BY committeeData.NAME_EN, committeeData.COMMITTEE_LEVEL`,
        params: [RESEARCH_ID],
      },
      
    userData: {
      query: "SELECT ID,STATUS,USERNAME,ROLE_ID,PICTURE FROM users_data_table WHERE ID = ?",
      params: [USER_ID],
    },
    inneradviserData: {
      query: `SELECT inneradviserData.USER_ID, inneradviserData.PHONE, inneradviserData.EMAIL  
                    FROM innerteacher_data_table inneradviserData
                    INNER JOIN adviser_data_table adviserData ON inneradviserData.USER_ID = adviserData.USER_ID
                    WHERE adviserData.RESEARCH_ID = ?`,
      params: [RESEARCH_ID],
    },
    innercommitteeData: {
      query: `SELECT DISTINCT 
                innercommitteeData.USER_ID,
                innercommitteeData.PHONE, 
                innercommitteeData.EMAIL
              FROM 
                committee_data_table committeeData
              JOIN 
                exam_data_table examData ON committeeData.EXAM_ID = examData.ID
              JOIN 
                innerteacher_data_table innercommitteeData ON committeeData.USER_ID = innercommitteeData.USER_ID
              WHERE 
                examData.RESEARCH_ID = ?`,
      params: [RESEARCH_ID],
    },   
    studentData: {
      query: `SELECT USER_ID,NAME_EN, EMAIL, MOBILE, PLAN_VERSION, START_TERM, START_YEAR, 
                    ETHICS_TYPE, ETHICS_TRAIN_DATE, ET_TYPE, ET_DATE, ET_MORE_DETAIL, 
                    ET_SCORE, ET_TERM, ET_YEAR , ET_TRANSFER_TYPE
                    FROM student_data_table WHERE USER_ID = ?`,
      params: [USER_ID],
    },
    researchData: {
      query: "SELECT TITLE_EN FROM research_data_table WHERE USER_ID = ?",
      params: [USER_ID],
    },
    researchPublishingData: {
      query: "SELECT PUBLISHING_NO FROM research_publishing_data_table WHERE USER_ID = ?",
      params: [USER_ID],
    },
    extadviserData: {
      query: `SELECT extadviserData.USER_ID, extadviserData.MOBILE, extadviserData.EMAIL  
                    FROM profile_data_table extadviserData
                    INNER JOIN adviser_data_table adviserData ON extadviserData.USER_ID = adviserData.USER_ID
                    WHERE adviserData.RESEARCH_ID = ?`,
      params: [RESEARCH_ID],
    },
    extcommitteeData: {
      query: `SELECT DISTINCT extcommitteeData.USER_ID, extcommitteeData.MOBILE, extcommitteeData.EMAIL  
              FROM profile_data_table extcommitteeData
              INNER JOIN committee_data_table committeeData ON extcommitteeData.USER_ID = committeeData.USER_ID
              INNER JOIN exam_data_table examData ON committeeData.EXAM_ID = examData.ID
              WHERE examData.RESEARCH_ID = ?`,
      params: [RESEARCH_ID],
    },
    
    
  };

  try {
    // Establish a connection to the database
    const connection = await mysql.createConnection(dbConfig);

    // Helper function to execute a query
    const queryDatabase = async ({ query, params }) => {
      const [result] = await connection.execute(query, params);
      return result;
    };

    // Execute all queries simultaneously
    const results = await Promise.all(
      Object.values(queries).map(queryDatabase)
    );

    // Close the connection
    await connection.end();

    // Create a response object with all the data
    const response = {
      adviserData: results[0],
      examData: results[1],
      committeeData: results[2],
      userData: results[3],
      inneradviserData: results[4],
      innercommitteeData: results[5],
      studentData: results[6],
      researchData: results[7],
      researchPublishingData: results[8],
      extadviserData: results[9],
      extcommitteeData: results[10],
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



// หน้า list advisor
app.get("/datalistadviser/:USER_ID", async (req, res) => {
  const USER_ID = req.params.USER_ID;

  // Define query for adviserData with placeholder for parameters
  const adviserQuery = "SELECT USER_ID, STATUS, NAME_EN, RESEARCH_ID FROM adviser_data_table WHERE USER_ID = ?";

  try {
    // Establish a connection to the database
    const connection = await mysql.createConnection(dbConfig);

    // Fetch adviserData
    const [adviserData] = await connection.execute(adviserQuery, [USER_ID]);

    // Check if adviserData exists
    if (adviserData.length === 0) {
      res.status(404).json({ error: "Adviser not found" });
      await connection.end();
      return;
    }

    // Extract all RESEARCH_IDs from adviserData
    const researchIds = adviserData.map(adviser => adviser.RESEARCH_ID);

    // If no research IDs, return empty data
    if (researchIds.length === 0) {
      res.status(200).json({
        adviserData,
        researchsData: [],
        studentData: [],
        userData: []
      });
      await connection.end();
      return;
    }

    // Dynamically construct query placeholders for RESEARCH_ID
    const placeholders = researchIds.map(() => '?').join(', ');
    const researchsQuery = `SELECT ID, USER_ID, TITLE_EN, STATUS FROM research_data_table WHERE ID IN (${placeholders})`;

    // Fetch researchsData using dynamic placeholders
    const [researchsData] = await connection.execute(researchsQuery, researchIds);

    // Extract USER_IDs from researchsData
    const researchUserIds = researchsData.map(research => research.USER_ID);

    // Remove duplicate USER_IDs
    const uniqueResearchUserIds = [...new Set(researchUserIds)];

    // If no unique USER_IDs, return early with empty studentData and userData
    if (uniqueResearchUserIds.length === 0) {
      res.status(200).json({
        adviserData,
        researchsData,
        studentData: [],
        userData: []
      });
      await connection.end();
      return;
    }

    // Define query for studentData based on USER_IDs
    const studentPlaceholders = uniqueResearchUserIds.map(() => '?').join(', ');
    const studentDataQuery = `SELECT USER_ID,NAME_EN, PLAN_VERSION, REMARK FROM student_data_table WHERE USER_ID IN (${studentPlaceholders})`;

    // Fetch studentData using USER_IDs
    const [studentData] = await connection.execute(studentDataQuery, uniqueResearchUserIds);

    // Define query for userData based on USER_IDs
    const userPlaceholders = uniqueResearchUserIds.map(() => '?').join(', ');
    const userDataQuery = `SELECT ID, STATUS, USERNAME FROM users_data_table WHERE ID IN (${userPlaceholders})`;

    // Fetch userData using USER_IDs
    const [userData] = await connection.execute(userDataQuery, uniqueResearchUserIds);

    // Close the connection
    await connection.end();

    // Create a response object with all the data
    const response = {
      adviserData,
      researchsData,
      studentData,
      userData
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// หน้า list staff
app.get("/dataliststaff", async (req, res) => {
  try {
    // Establish a connection to the database
    const connection = await mysql.createConnection(dbConfig);

    // Define query for adviserData
    const adviserQuery = `
      SELECT 
        adviser.USER_ID AS ADVISER_USER_ID, 
        adviser.STATUS AS ADVISER_STATUS, 
        adviser.NAME_EN AS ADVISER_NAME, 
        adviser.RESEARCH_ID,
        research.ID AS RESEARCH_ID,
        research.TITLE_EN AS RESEARCH_TITLE,
        research.STATUS AS RESEARCH_STATUS,
        student.USER_ID AS STUDENT_USER_ID,
        student.NAME_EN AS STUDENT_NAME,
        student.PLAN_VERSION,
        student.REMARK,
        users.ID AS USER_ID,
        users.STATUS AS USER_STATUS,
        users.USERNAME
      FROM adviser_data_table AS adviser
      LEFT JOIN research_data_table AS research ON adviser.RESEARCH_ID = research.ID
      LEFT JOIN student_data_table AS student ON research.USER_ID = student.USER_ID
      LEFT JOIN users_data_table AS users ON research.USER_ID = users.ID
    `;

    // Fetch adviserData with all related data
    const [adviserData] = await connection.execute(adviserQuery);

    // Close the connection
    await connection.end();

    // Check if adviserData exists
    if (adviserData.length === 0) {
      return res.status(404).json({ error: "No data found" });
    }

    // Create a response object with all the data
    const response = {
      adviserData
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});





const port = 3000;
app.listen(port, function () {
  console.log("Server is ready at " + port);
});
