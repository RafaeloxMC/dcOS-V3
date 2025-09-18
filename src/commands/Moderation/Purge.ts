import {
	GuildChannel,
	Message,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextBasedChannel,
	TextChannel,
} from "discord.js";
import { Command } from "../../types";
import {
	createEmbed,
	createErrorEmbed,
	createSuccessEmbed,
	createWarningEmbed,
} from "../../util/embeds";
import { generateSecurityToken } from "../../util/security";

const Purge: Command = {
	data: new SlashCommandBuilder()
		.setName("purge")
		.setDescription(
			"Clear a whole channel. WARNING: This will delete all bot settings from a channel, not just from dcOS!"
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction, client, ...args) {
		if (
			!interaction.memberPermissions?.has(
				PermissionFlagsBits.Administrator
			)
		) {
			await interaction.editReply({
				embeds: [createErrorEmbed("Permission denied!")],
			});
			return;
		}
		const code = generateSecurityToken();
		const filter = (m: Message) =>
			m.author.id === interaction.member?.user.id;

		await interaction.editReply({
			embeds: [
				createEmbed(
					"Are you sure?",
					"Are you sure you want to delete all messages in this channel? This will reset the whole channel and cannot be undone. If bots use the channels ID, you may have to reconfigure them for this channel.\nIf you want to continue, please enter the following code: `" +
						code +
						"`\nIf you want to cancel, type `cancel`!\n\n**This command will be automatically cancelled in 60 seconds.**",
					[255, 255, 0]
				),
			],
		});

		const channel = interaction.channel as TextChannel;
		await channel
			?.awaitMessages({
				filter: filter,
				max: 1,
				time: 60000,
				errors: ["time"],
			})
			.then((msg) => {
				const message = msg.first();
				if (message?.content == code) {
					clearAllMessagesByCloning(
						interaction.channel as GuildChannel
					);
				} else if (message?.content.toUpperCase() == "CANCEL") {
					return message.reply({
						embeds: [
							createSuccessEmbed(
								"*sigh.* The deletion has been cancelled!"
							),
						],
					});
				} else {
					return message?.reply({
						embeds: [
							createErrorEmbed(
								"Invalid code! The operation has been cancelled!"
							),
						],
					});
				}
			})
			.catch((_collected) => {
				(interaction.channel as TextChannel).send({
					embeds: [
						createWarningEmbed(
							"No security code was entered. The operation timed out"
						),
					],
				});
			});
	},
};

async function clearAllMessagesByCloning(channel: GuildChannel) {
	let perms = channel.permissionOverwrites.cache;
	let parent = channel.parent;
	let position = channel.position;
	const newChannel = await channel.clone({ permissionOverwrites: perms });

	channel.delete();
	newChannel.setParent(parent);
	newChannel.setPosition(position + 1);
	newChannel.permissionOverwrites.set(perms);
	await (newChannel as TextChannel).send({
		embeds: [createSuccessEmbed("Channel has been nuked!")],
	});
}

export default Purge;
