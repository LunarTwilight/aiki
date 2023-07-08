"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const path_1 = __importDefault(require("path"));
exports.default = new better_sqlite3_1.default(path_1.default.join(__dirname, '..', 'db.sqlite'), {
    fileMustExist: true
});
//# sourceMappingURL=database.js.map