const express = require("express");
 const path = require("path");

 const app = express();
app.use("/public", express.static(path.join(__dirname, "/public")));


 //root
 app.get("/", function(req, res) {
 res.sendFile(path.join(__dirname, "/pages/login/login.html"));
 });

//  เพิ่มpage ตรงนี้เลยจ้า
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



        


 const port = 3000;
 app.listen(port, function() {
 console.log("Server is ready at " + port);
 });