"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reading_controller_1 = require("../controllers/reading.controller");
const router = (0, express_1.Router)();
// Endpoint ini akan dipanggil oleh NodeMCU / ESP32
// router.post('/readings', verifyDeviceToken, receiveIoTData);
router.post('/readings', reading_controller_1.receiveIoTData);
exports.default = router;
