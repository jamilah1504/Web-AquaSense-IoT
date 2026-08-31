"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware"); // Import middleware-nya
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
// Tambahkan dua baris ini:
router.put('/profile', auth_middleware_1.authenticate, auth_controller_1.updateProfile);
router.put('/password', auth_middleware_1.authenticate, auth_controller_1.updatePassword);
exports.default = router;
