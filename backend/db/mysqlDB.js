import mysql2 from 'mysql2';

//Creating a connection
const db = mysql2.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

//Connecting to MySQL DB
function connectSQL () {
    db.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL:', err);
            return;
        }
        console.log('Connected to MySQL database');
    });
}

export {db, connectSQL};