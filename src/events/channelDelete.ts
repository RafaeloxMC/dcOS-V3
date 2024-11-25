import Votes from "../database/schemas/Vote";
import { Event } from "../types";
import { GuildChannel } from "discord.js";

const channelDelete: Event = {
    name: "channelDelete",
    once: false,
	async execute(client, channel: GuildChannel) {
		await Votes.findOne({ channel_id: channel.id }).then((data) => {
			if (data) {
				Votes.deleteMany({ channel_id: channel.id }).then(() => {
					console.log("Deleted all votes for channel " + channel.id);
				});
			}
		});
	},
}

export default channelDelete;