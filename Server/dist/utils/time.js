"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcToIST = exports.istToUTC = exports.nowUTC = void 0;
// Always use this instead of new Date()
const nowUTC = () => new Date();
exports.nowUTC = nowUTC;
// Frontend must send ISO string
const istToUTC = (istISOString) => {
    return new Date(istISOString);
};
exports.istToUTC = istToUTC;
// For display only
const utcToIST = (utcDate) => {
    return new Date(utcDate.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
    }));
};
exports.utcToIST = utcToIST;
