"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.utcToIST = exports.istToUTC = exports.nowUTC = void 0;
const nowUTC = () => new Date();
exports.nowUTC = nowUTC;
const istToUTC = (istISOString) => {
    return new Date(istISOString);
};
exports.istToUTC = istToUTC;
const utcToIST = (utcDate) => {
    return new Date(utcDate.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
    }));
};
exports.utcToIST = utcToIST;
