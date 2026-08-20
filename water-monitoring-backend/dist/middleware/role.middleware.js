"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Anda tidak memiliki hak akses untuk resource ini.'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
