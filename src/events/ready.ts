import { Event } from "../types";

const ready: Event = {
    name: "ready",
    once: true,
    execute(client) {
        console.log(`Logged in as ${client.user?.tag}`);
    }
}

export default ready;