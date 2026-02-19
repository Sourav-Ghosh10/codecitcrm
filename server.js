const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');
dotenv.config();

const app = express();
const userRoutes = require("./routes/user");
const eventRoutes = require("./routes/event");
const ticketRoutes = require("./routes/ticket");
const attendanceRoutes = require("./routes/attendance");
const roleRoutes = require("./routes/role");
const leaveRoutes = require("./routes/leave");
const holidayRoutes = require("./routes/holiday");
const payrollRoutes = require("./routes/payroll");
const departmentRoutes = require("./routes/department");
const employeeRoutes = require("./routes/employee");
const designationRoutes = require("./routes/designation");
const performaceRoutes = require("./routes/performance");
const menuRoutes = require("./routes/menu");
const assignmentRoutes = require("./routes/assignment");
const noticeRoutes = require("./routes/notice");
const sala = require("./routes/salaryDeductionRules");
const CompanyRoutes = require('./routes/company');
const CountryRoutes = require('./routes/countryRoutes')
const rosterRoutes = require("./routes/roster");
const salaryDeductionRule = require("./routes/salaryDeductionRules");
const eodReportRoutes = require("./routes/eodReports");

app.use(cors());

app.options(/.*/, (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  return res.sendStatus(200);
});
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to ensure DB is connected (Critical for Vercel/Serverless)
app.use(async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed during request:", err.message);
    return res.status(503).json({
      error: "Database connection failed",
      message: err.message
    });
  }
});

app.use("/api/V1/auth", userRoutes);
app.use("/api/V1/attendance", attendanceRoutes);
app.use("/api/V1/menu", menuRoutes);
app.use("/api/V1/role", roleRoutes);
app.use("/api/V1/employee", employeeRoutes);
app.use("/api/V1/departments", departmentRoutes);
app.use("/api/V1/designations", designationRoutes);
app.use("/api/V1/holidays", holidayRoutes);
app.use("/api/V1/leave", leaveRoutes);
app.use("/api/V1/assignments", assignmentRoutes);
app.use("/api/V1/events", eventRoutes);
app.use("/api/V1/company", CompanyRoutes);
app.use("/api/V1/countries", CountryRoutes);
app.use("/api/V1/notices", noticeRoutes);
app.use("/api/V1/payrolls", payrollRoutes);
app.use("/api/V1/eod-reports", eodReportRoutes);
app.use("/api/V1/roster", rosterRoutes);
app.use("/api/V1/salary-deductions", salaryDeductionRule);


const PORT = process.env.PORT || 5000;
let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  console.log("Connecting to MongoDB...");
  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  }).then(conn => {
    console.log("MongoDB Connected Successfully");
    connectionPromise = null; // Reset promise so it can reconnect if connection drops later
    return conn;
  }).catch(err => {
    console.error("MongoDB connection error details:", err.message);
    connectionPromise = null; // Reset on error so we can try again
    throw err;
  });

  return connectionPromise;
};

if (require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("Initial MongoDB connection failed. Server will still start but DB operations will fail until connection is established.");
      app.listen(PORT, () => console.log(`Server running on port ${PORT} (Waiting for DB...)`));
    });
}

module.exports = app;
module.exports.connectDB = connectDB;