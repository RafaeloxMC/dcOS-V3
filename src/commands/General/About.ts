import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";
import { createEmbed } from "../../util/embeds";
import { config } from "../..";

const About: Command = {
	data: new SlashCommandBuilder().setName("about").setDescription("Get information about the bot."),
	async execute(interaction, client) {
		await interaction.editReply({
			embeds: [
				createEmbed(
					"About",
					"dcOS is a multi-purpose Discord bot that is designed to make your life easier. It has a lot of features that can help you manage your server and have fun with your friends. If you have any questions or need help, feel free to join the support server.",
					0x00ff00,
					[
						{ name: "Developer", value: config.AUTHOR || "", inline: true },
						{
							name: "Version",
							value: config.VERSION || "Not specified",
							inline: true,
						},
						{
							name: "Support Server",
							value: `[Click here!](${config.SUPPORT_SERVER_URL})`,
							inline: true,
						},
						{
							name: "Invite Link",
							value: `[Click here!](${config.INVITE})`,
							inline: true,
						},
						{
							name: "Uptime",
							value: `${Math.floor(interaction.client.uptime / 86400000)}d ${Math.floor(interaction.client.uptime / 3600000) % 24}h ${Math.floor(interaction.client.uptime / 60000) % 60}m ${Math.floor(interaction.client.uptime / 1000) % 60}s`,
							inline: true,
						},
						{
							name: "Servers",
							value: "" + interaction.client.guilds.cache.size,
							inline: true,
						},
						{
							name: "Users",
							value: "" + interaction.client.users.cache.size,
							inline: true,
						},
						{
							name: "Node.js Version",
							value: "" + process.version,
							inline: true,
						},
						{
							name: "Discord.js Version",
							value: "" + require("discord.js").version,
							inline: true,
						},
					],
					interaction.client.user.displayAvatarURL(),
				),
			],
			options: { ephemeral: true },
		});
	},
};

export default About;