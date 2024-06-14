const mysql = require('mysql2/promise');

// MySQL connection configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gmis',
    port: '3306'
};

// dbConfig.connect((error) => {
//   if (error) {
//     console.log(error, "db connect erro")
//   } else {
//     console.log("connect..")
//   }
// })
// Export the database configuration
module.exports = dbConfig;
