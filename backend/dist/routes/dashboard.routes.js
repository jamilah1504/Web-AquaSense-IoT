"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Wajib login untuk melihat dashboard
router.use(auth_middleware_1.authenticate);
// Endpoint utama: GET /api/dashboard
router.get('/', dashboard_controller_1.getDashboard);
exports.default = router;
