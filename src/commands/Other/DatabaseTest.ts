import { PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";
import Test from "../../database/schemas/Test";

const DatabaseTest: Command = {
	data: new SlashCommandBuilder().setName("databasetest").setDescription("Test the database.").setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator),
	async execute(interaction, client) {
		if (interaction.member?.user.id !== "552166573826375700")
			return interaction.editReply({
				content: "You are not allowed to use this command!",
				options: { ephemeral: true },
			});
		await Test.findOne({
			GuildID: interaction.guild?.id,
			UserID: interaction.user.id,
		}).then((data) => {
			if (!data) {
				Test.create({
					GuildID: interaction.guild?.id,
					UserID: interaction.user.id,
				});
				interaction.editReply({
					content: "Added data to database!",
					options: { ephemeral: true },
				});
			} else if (data) {
				const user = data.UserID;
				const guild = data.GuildID;

				interaction.editReply({
					content: "Found data in database! Please see the console for more information.",
					options: { ephemeral: true },
				});

				console.log(`User: ${user}\nGuild: ${guild}`);
			}
		});
	},
};

export default DatabaseTest;