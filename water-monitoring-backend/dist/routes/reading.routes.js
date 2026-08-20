"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reading_controller_1 = require("../controllers/reading.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Endpoint untuk frontend (dilindungi JWT)
router.use(auth_middleware_1.authenticate);
// Admin dan Operator boleh melihat riwayat
router.get('/', (0, role_middleware_1.authorize)(['ADMIN', 'OPERATOR']), reading_controller_1.getHistory);
exports.default = router;
