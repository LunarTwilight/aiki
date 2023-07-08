"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = void 0;
const database_1 = __importDefault(require("./database"));
const makeRow = database_1.default.prepare('INSERT INTO channelPositions (guildId, channelId, position) VALUES (?, ?, ?)');
function execute(interaction) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        (_a = interaction.guild) === null || _a === void 0 ? void 0 : _a.channels.cache.each(channel => {
            if (channel.isThread()) {
                return;
            }
            makeRow.run(interaction.guildId, channel.id, channel.position);
        });
        interaction.editReply('done');
    });
}
exports.execute = execute;
//# sourceMappingURL=generateDBTable.js.map