import {
	ActionRowBuilder,
	ButtonBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { Command } from "../../types";
import { createEmbed } from "../../util/embeds";

const Poll: Command = {
	data: new SlashCommandBuilder()
		.setName("poll")
		.setDescription("Ask others about your questions!")
		.addStringOption((option) =>
			option
				.setName("question")
				.setDescription("The question you want to ask")
				.setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName("abstainable")
				.setDescription(
					"Whether or not your want to allow people to abstain from voting (true by default)"
				)
				.setRequired(false)
		) as SlashCommandBuilder,
	async execute(interaction) {
		const question = interaction.options.getString("question");
		const abstainable =
			interaction.options.getBoolean("abstainable") ?? true;

		const yes = new ButtonBuilder()
			.setStyle(1)
			.setCustomId("yes")
			.setLabel("Yes")
			.setEmoji("✅");
		const no = new ButtonBuilder()
			.setStyle(1)
			.setCustomId("no")
			.setLabel("No")
			.setEmoji("❌");
		const abstain = new ButtonBuilder()
			.setStyle(1)
			.setCustomId("abstain")
			.setLabel("Abstain")
			.setEmoji("🤷‍♂️")
			.setDisabled(!abstainable);

		await interaction.editReply({
			embeds: [
				createEmbed(
					"Poll by " + interaction.member?.user.username,
					question ?? "No question provided.",
					[0, 255, 0]
				),
			],
			components: [
				new ActionRowBuilder<ButtonBuilder>().addComponents([
					yes,
					no,
					abstain,
				]),
			],
		});
	},
};

export default Poll;
