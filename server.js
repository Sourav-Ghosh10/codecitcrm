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

const allowedOrigins = ['https://nrnsttech.online', 'http://localhost:5000', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1 && !origin.endsWith('.vercel.app')) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('Database connection failed during request', err);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
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
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}

module.exports = app;
module.exports.connectDB = connectDB;

