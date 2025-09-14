import Vote from "../database/schemas/Vote";
import { Command, Event } from "../types";
import {
	ActionRow,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonComponent,
	ChatInputCommandInteraction,
	ComponentEmojiResolvable,
	Interaction,
	MessageActionRowComponent,
	MessageComponent,
} from "discord.js";
import { createErrorEmbed } from "../util/embeds";

const interactionCreate: Event = {
	name: "interactionCreate",
	once: false,
	async execute(client, interaction: Interaction) {
		if (interaction.isButton()) {
			if (interaction.customId === "giveaway") {
			} else if (
				interaction.customId === "yes" ||
				interaction.customId === "no" ||
				interaction.customId === "obstain"
			) {
				const vote = await Vote.findOne({
					message_id: interaction.message.id,
					user_id: interaction.member?.user.id,
					channel_id: interaction.message.channel.id,
				});
				if (vote) {
					interaction.reply({
						embeds: [
							createErrorEmbed(
								"You have already voted on this poll. Your vote cannot be changed."
							),
						],
					});
				} else {
					const newVote = await Vote.create({
						message_id: interaction.message.id,
						user_id: interaction.member?.user.id,
						channel_id: interaction.message.channel.id,
					});
					newVote.save();

					const currentButton =
						interaction.component as ButtonComponent;
					let buttonName = currentButton.label ?? "0";

					if (
						buttonName === "Yes" ||
						buttonName === "No" ||
						buttonName === "Abstain"
					) {
						buttonName = "0";
					}

					const votes = parseInt(buttonName) + 1;

					const getEmojiForButton = (
						customId: string
					): ComponentEmojiResolvable => {
						switch (customId) {
							case "yes":
								return "✅";
							case "no":
								return "❌";
							case "obstain":
								return "🤷";
							default:
								return currentButton.emoji ?? "";
						}
					};

					const updatedButton = new ButtonBuilder()
						.setCustomId(currentButton.customId ?? "")
						.setLabel(votes.toString())
						.setStyle(currentButton.style)
						.setEmoji(
							getEmojiForButton(currentButton.customId ?? "")
						);

					const existingComponents = (
						interaction.message
							.components[0] as ActionRow<MessageActionRowComponent>
					).components;
					const buttonIndex = existingComponents.findIndex(
						(comp) => comp.customId === currentButton.customId
					);

					const updatedComponents = existingComponents.map(
						(comp, index) =>
							index === buttonIndex
								? updatedButton
								: ButtonBuilder.from(comp as ButtonComponent)
					);

					await interaction.update({
						components: [
							new ActionRowBuilder<ButtonBuilder>().addComponents(
								...updatedComponents
							),
						],
					});
				}
			}
		} else if (interaction.isCommand()) {
			console.log("Command interaction detected.");
			console.log(interaction.commandName);
			console.log(JSON.stringify(client.commands.toJSON()));
			const command: Command = client.commands.get(
				interaction.commandName
			);

			if (!command) return console.log("Command not found.");

			const chatInputCommandInteraction: ChatInputCommandInteraction =
				interaction as ChatInputCommandInteraction;

			try {
				await interaction.deferReply();
				await command.execute(chatInputCommandInteraction, client);
				console.log("Command executed.");
			} catch (error) {
				console.log(error);
				await interaction.reply({
					content: "There was an error while executing this command!",
					ephemeral: true,
				});
			}
		}
	},
};

export default interactionCreate;
