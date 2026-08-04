const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

async function initDatabase() {
    const dbName = process.env.DB_NAME || "organizemfg";
    console.log(`Starting database initialization for database: ${dbName}...`);

    let connection;
    try {
        // Connect to MySQL server without database first to ensure the database exists
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: Number(process.env.DB_PORT) || 3306,
            multipleStatements: true // Critical for executing whole schema script
        });

        console.log("Connected to MySQL server successfully.");

        // Create database if it doesn't exist
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        console.log(`Database \`${dbName}\` created or already exists.`);

        // Switch to the target database
        await connection.query(`USE \`${dbName}\`;`);
        console.log(`Using database \`${dbName}\`.`);

        // Read schema file
        const schemaPath = path.join(__dirname, "schema_manufacturing.sql");
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }
        
        const schemaSql = fs.readFileSync(schemaPath, "utf8");
        console.log("Reading schema SQL file...");

        // Execute the schema SQL
        await connection.query(schemaSql);
        console.log("Schema applied successfully! All tables created.");

    } catch (error) {
        console.error("Database initialization failed:", error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log("Database connection closed.");
        }
    }
}

initDatabase();
