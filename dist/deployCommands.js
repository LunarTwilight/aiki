"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const fs_1 = __importDefault(require("fs"));
const discord_js_1 = require("discord.js");
const config_json_1 = require("./config.json");
function execute(interaction) {
    return __awaiter(this, void 0, void 0, function* () {
        const commands = [];
        const commandFiles = fs_1.default.readdirSync('./commands').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = yield Promise.resolve(`${`./commands/${file}`}`).then(s => __importStar(require(s)));
            commands.push(command.data.toJSON());
        }
        const rest = new discord_js_1.REST({
            version: '10'
        }).setToken(config_json_1.token);
        let type;
        const location = interaction.options.getString('location');
        if (location === 'global') {
            type = discord_js_1.Routes.applicationCommands(config_json_1.clientId);
        }
        else {
            type = discord_js_1.Routes.applicationGuildCommands(config_json_1.clientId, location || '');
        }
        rest.put(type, {
            body: commands
        })
            .then(() => {
            interaction.editReply('Commands have been deployed.');
        })
            .catch(err => {
            console.error(err);
            interaction.editReply('Something went wrong!');
        });
    });
}
exports.execute = execute;
//# sourceMappingURL=deployCommands.js.map