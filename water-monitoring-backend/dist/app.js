"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const auth_routes_1 = __importDefault(require("./routes/auth.routes")); // <-- Import route
const device_routes_1 = __importDefault(require("./routes/device.routes")); // <-- Import route
const iot_routes_1 = __importDefault(require("./routes/iot.routes"));
const reading_routes_1 = __importDefault(require("./routes/reading.routes")); // <-- Import route
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes")); // <-- Import route
const threshold_routes_1 = __importDefault(require("./routes/threshold.routes"));
const app = (0, express_1.default)();
// 1. MIDDLEWARE WAJIB (Harus paling atas!)
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.env.FRONTEND_URL, credentials: true }));
// 👇 INI YANG PALING PENTING 👇
app.use(express_1.default.json()); // Membaca req.body berformat JSON
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev', {
    stream: { write: (message) => logger_1.logger.info(message.trim()) }
}));
// 2. ROUTES
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'OK' });
});
// Pastikan route ini berada DI BAWAH app.use(express.json())
app.use('/api/auth', auth_routes_1.default);
app.use('/api/devices', device_routes_1.default);
app.use('/api/iot', iot_routes_1.default);
app.use('/api/readings', reading_routes_1.default); // <-- Tambahkan route ini
app.use('/api/dashboard', dashboard_routes_1.default); // <-- Tambahkan route ini
app.use('/api/thresholds', threshold_routes_1.default); // <-- Tambahkan route ini
// 3. FALLBACK ROUTE
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint not found' });
});
exports.default = app;
