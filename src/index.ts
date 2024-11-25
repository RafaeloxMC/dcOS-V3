import { Collection, GatewayIntentBits, Partials } from "discord.js";
import "fs";
import { readdirSync } from "fs";
import dotenv from "dotenv";
import { connect } from "./database/db";
import { dcOSClient } from "./types";

dotenv.config();

export const { TOKEN, VERSION, INVITE, MONGO_URI, AUTHOR, AVATAR, CLIENT_ID, SUPPORT_SERVER_URL } = process.env;

if(!TOKEN) {
    console.log("No token provided. Please provide a token in the .env file.");
    process.exit(1);
}

if(!MONGO_URI) {
    console.log("No MongoDB URI provided. Please provide a MongoDB URI in the .env file.");
    process.exit(1);
}

export const config = {
    TOKEN,
    VERSION,
    INVITE,
    MONGO_URI,
    AUTHOR,
    AVATAR,
    CLIENT_ID,
    SUPPORT_SERVER_URL
}

export const client = new dcOSClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

const functions = readdirSync("./src/functions").filter((file) =>
    file.endsWith(".js") || file.endsWith(".ts")
);

const events = readdirSync("./src/events").filter((file) =>
    file.endsWith(".js") || file.endsWith(".ts")
);

console.log(events)

const commandCategories = readdirSync("./src/commands")

process.on("unhandledRejection", async (reason, promise) => {
	console.log("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", async (err) => {
	console.log("Uncaught Exception:", err);
});

process.on("uncaughtExceptionMonitor", async (err, origin) => {
	console.log("Uncaught Exception Monitor:", err, origin);
});

console.log("Starting...");

(async () => {
    console.log("Loading functions...");
    for(let file of functions) {
        const func = await import(`./functions/${file}`);
        await func.default(client);
    }

    console.log("Connecting...");
    await connect().then((conn) => {
        if(conn) {
            console.log("Connected to MongoDB.");
            console.log("Loading events...");
            client.handleEvents(events, "./events");
            console.log("Loading commands...");
            client.handleCommands(commandCategories, "./src/commands");
            console.log("Logging in...");
            client.login(config.TOKEN);
        }
    }).catch((err) => {
        console.log(err);
    });
})();