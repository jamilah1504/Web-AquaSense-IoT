"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reading_controller_1 = require("../controllers/reading.controller");
const iot_auth_middleware_1 = require("../middleware/iot-auth.middleware");
const router = (0, express_1.Router)();
// Endpoint ini akan dipanggil oleh NodeMCU / ESP32
router.post('/readings', iot_auth_middleware_1.verifyDeviceToken, reading_controller_1.receiveIoTData);
// router.post('/readings', receiveIoTData);
exports.default = router;
