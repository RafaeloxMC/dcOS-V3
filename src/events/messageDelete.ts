import Giveaway from "../database/schemas/Giveaway";
import GiveawayMember from "../database/schemas/GiveawayMember";
import Votes from "../database/schemas/Vote";
import { Event } from "../types";
import { Message } from "discord.js";

const messageDelete: Event = {
    name: "messageDelete",
    once: false,
    async execute(client, message: Message) {
        await Votes.findOne({ message_id: message.id }).then((data) => {
			if (data) {
				Votes.deleteMany({ message_id: message.id }).then(() => {
					console.log("Deleted all votes for message " + message.id);
				});
			}
		});
		await Giveaway.findOne({ message_id: message.id }).then((data) => {
			if (data) {
				Giveaway.deleteMany({ message_id: message.id }).then(() => {
					console.log("Deleted giveaway " + message.id);
				});
			}
		});
		await GiveawayMember.findOne({ message_id: message.id }).then(
			(data) => {
				if (data) {
					GiveawayMember.deleteMany({ message_id: message.id }).then(
						() => {
							console.log(
								"Deleted giveaway member " + message.id
							);
						}
					);
				}
			}
		);
    },
}

export default messageDelete;