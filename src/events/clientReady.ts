import { Event } from "../types";

const clientReady: Event = {
	name: "clientReady",
	once: true,
	execute(client) {
		console.log(`Logged in as ${client.user?.tag}`);
	},
};

export default clientReady;
