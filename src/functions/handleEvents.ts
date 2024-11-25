import { dcOSClient, Event } from "../types";

export default async function handleEvents(client: dcOSClient) {
	console.log("Event handler loaded.");
	client.handleEvents = async (eventFiles, path) => {
		for (let file of eventFiles) {
			try {
				const eventModule = await import(`../${path}/${file}`);
				const event: Event = eventModule.default;
				if (!event || !event.name) {
					console.error(`Event name is missing in file: ${file}`);
					continue;
				}
				console.log(`Event loaded: ${event.name}`);
				if (event.once) {
					client.once(event.name, (...args) => event.execute(client, ...args, client));
				} else {
					client.on(event.name, (...args) => event.execute(client, ...args, client));
				}
			} catch (error) {
				console.error(`Failed to load event from file: ${file}`, error);
			}
		}
	};
}
