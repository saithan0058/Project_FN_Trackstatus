const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");
const dbConfig = require("./db");

const app = express();

// Serve static files
app.use("/public", express.static(path.join(__dirname, "/public")));
app.use("/pages", express.static(path.join(__dirname, "/pages")));
app.use("/layouts", express.static(path.join(__dirname, "/layouts")));
app.use("/jason", express.static(path.join(__dirname, "/jason")));

// Root
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "/pages/login/login.html"));
});

// เพิ่มหน้าเพจต่างๆ
app.get("/search", function(req, res) {
    res.sendFile(path.join(__dirname, "/pages/staff/search.html"));
});

app.get("/listadvisor", function(req, res) {
    res.sendFile(path.join(__dirname, "/pages/advisor/listadvisor.html"));
});

app.get("/liststaff", function(req, res) {
    res.sendFile(path.join(__dirname, "/pages/staff/list.html"));
});

app.get("/profile", function(req, res) {
    res.sendFile(path.join(__dirname, "/pages/student/profile.html"));
});

app.get("/dashboard", function(req, res) {
    res.sendFile(path.join(__dirname, "/pages/staff/dashboard.html"));
});

app.get("/timeline", function(req, res) {
    res.sendFile(path.join(__dirname, "/pages/staff/timeline.html"));
});

app.get("/layout1", function(req, res) {
    res.sendFile(path.join(__dirname, "/layouts/layout1.html"));
});

app.get("/layout2", function(req, res) {
    res.sendFile(path.join(__dirname, "/layouts/layoutprofile.html"));
});

app.get("/loadlayout1", function(req, res) {
    res.sendFile(path.join(__dirname, "/jason/loadlayout1.js"));
});

app.get("/loadlayout2", function(req, res) {
    res.sendFile(path.join(__dirname, "/jason/loadlayoutprofile.js"));
});

// API for getting user and research data
app.get('/getuser/:id', async function (req, res) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get user data
        const [userResults] = await connection.execute(
            'SELECT * FROM users_data_table WHERE USERNAME = ?',
            [req.params.id]
        );

        if (userResults.length === 0) {
            res.json({ status: 'error', message: 'User not found' });
            return;
        }

        const user = userResults[0];
        const userId = user.ID;

        // Get research data
        const [researchResults] = await connection.execute(
            'SELECT STATUS FROM research_data_table WHERE USER_ID = ?',
            [userId]
        );

        const researchStatus = researchResults.length > 0 ? researchResults[0].STATUS : null;

        await connection.end();
        
        res.json({ status: 'success', user: user, researchStatus: researchStatus });
    } catch (err) {
        console.error('Database error:', err);
        res.json({ status: 'error', message: 'Database server error', error: err.message });
    }
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
