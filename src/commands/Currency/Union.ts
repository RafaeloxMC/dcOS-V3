import {
	Message,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";
import { Command } from "../../types";
import {
	createEmbed,
	createErrorEmbed,
	createSuccessEmbed,
	createWarningEmbed,
} from "../../util/embeds";
import UnionSchema from "../../database/schemas/Union";
import { generateSecurityToken } from "../../util/security";

const Union: Command = {
	data: new SlashCommandBuilder()
		.setName("union")
		.setDescription("Manage your servers' union!")
		.addSubcommand((subcommand) =>
			subcommand
				.setName("create")
				.setDescription("Create a new union")
				.addStringOption((option) =>
					option
						.setName("currency")
						.setDescription(
							'The currency your union will use (e.g. "dcOS Coin")'
						)
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("tag")
						.setDescription('The tag of the union (e.g. "dcOS")')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName("description")
						.setDescription("A short description of your union")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("info")
				.setDescription("Get information about a union")
				.addStringOption((option) =>
					option
						.setName("nameortag")
						.setDescription("The name of the union or its' tag")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("list").setDescription("List the top 10 unions")
		)
		.addSubcommand((subcommand) =>
			subcommand.setName("leave").setDescription("Leave a union")
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("kick")
				.setDescription("Kick a server from your union")
				.addStringOption((option) =>
					option
						.setName("id")
						.setDescription("The target server ID")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("invite")
				.setDescription(
					"Invite a server to your union (target has to use dcOS)"
				)
				.addStringOption((option) =>
					option
						.setName("id")
						.setDescription("The target server ID")
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("delete")
				.setDescription(
					"Delete your union. WARNING: this is not reversible!"
				)
		),
	async execute(interaction, client, ...args) {
		const isAdmin = interaction.memberPermissions?.has(
			PermissionFlagsBits.Administrator
		);
		const subcommand = interaction.options.getSubcommand();
		if (
			(subcommand === "create" ||
				subcommand === "kick" ||
				subcommand === "leave" ||
				subcommand === "invite" ||
				subcommand === "delete") &&
			!isAdmin
		) {
			return interaction.editReply({
				embeds: [
					createErrorEmbed(
						"Permission denied! You need the permission ADMINISTRATOR."
					),
				],
			});
		}

		if (subcommand === "create") {
			const currency = interaction.options.getString("currency");
			const short = interaction.options.getString("tag");
			const description = interaction.options.getString("description");

			const union = await UnionSchema.findOne({ name: currency });

			if (union) {
				return interaction.editReply({
					embeds: [
						createErrorEmbed(
							"A union with this currency already exists!"
						),
					],
				});
			} else {
				const unions = await UnionSchema.find({ short: short });
				const maxDiscrim =
					unions.length > 0
						? Math.max(
								...unions.map(
									(u) => Number(u.short_discrim) || 0
								)
						  )
						: 0;
				const newDiscrim = maxDiscrim + 1;

				const newUnion = await UnionSchema.create({
					name: currency,
					short: short,
					short_discrim: newDiscrim.toString(),
					description: description,
					guild_id: interaction.guildId,
					members: [interaction.guildId],
				});

				if (newUnion) {
					return await interaction.editReply({
						embeds: [
							createSuccessEmbed(
								"Union has been created successfully!"
							),
						],
					});
				} else {
					return await interaction.editReply({
						embeds: [
							createErrorEmbed("Error while creating union!"),
						],
					});
				}
			}
		} else if (subcommand === "delete") {
			const code = generateSecurityToken();
			const union = await UnionSchema.findOne({
				guild_id: interaction.guildId,
			});
			if (!union) {
				return await interaction.editReply({
					embeds: [
						createErrorEmbed("This server does not own a union!"),
					],
				});
			} else {
				let filter = (m: Message) =>
					m.author.id === interaction.user.id;

				await interaction.editReply({
					embeds: [
						createEmbed(
							"Are you sure?",
							"Are you sure you want to delete the union " +
								union.name +
								"? This will clear all data associated with the union and cannot be undone. \nIf you want to continue, please enter this code: `" +
								code +
								"`\nIf you want to cancel, type `cancel`!\n\n**This command will be automatically cancelled in 60 seconds.**",
							[255, 255, 0]
						),
					],
				});

				await (interaction.channel as TextChannel)
					.awaitMessages({
						filter: filter,
						max: 1,
						time: 60000,
						errors: ["time"],
					})
					.then(async (messages) => {
						const message = messages.first();
						if (message?.content.toUpperCase() == "CANCEL") {
							return await message.reply({
								embeds: [
									createSuccessEmbed(
										"*Sigh.* The operation was successfully cancelled!"
									),
								],
							});
						}
						if (message?.content == code) {
							await UnionSchema.deleteOne({
								_id: union._id,
								name: union.name,
								short: union.short,
								short_discrim: union.short_discrim,
							});
							await message.reply({
								embeds: [
									createSuccessEmbed(
										"Union deleted successfully!"
									),
								],
							});
						} else {
							await message?.reply({
								embeds: [
									createErrorEmbed(
										"Operation cancelled! You have entered a wrong code."
									),
								],
							});
						}
					})
					.catch(async () => {
						await interaction.followUp({
							embeds: [createErrorEmbed("Operation timed out.")],
						});
					});
			}
		} else if (subcommand === "info") {
			const nameortag = interaction.options.getString("nameortag");
			let union;
			if (nameortag?.includes("#")) {
				union = await UnionSchema.findOne({
					short: nameortag.split("#")[0],
					short_discrim: nameortag.split("#")[1],
				});
			} else {
				union = await UnionSchema.findOne({
					name: nameortag,
				});
			}

			if (!union) {
				return interaction.editReply({
					embeds: [
						createErrorEmbed(
							"Could not find union with this name or tag!"
						),
					],
				});
			} else {
				return interaction.editReply({
					embeds: [
						createSuccessEmbed(
							`Requested information:\nName: ${
								union.name ?? "N/A"
							}\nTag: ${union.short ?? "N/A"}#${
								union.short_discrim ?? "0"
							}\nDescription: ${
								union.description ?? "No description."
							}\nMembers: ${union.members.length ?? 0}`
						),
					],
				});
			}
		} else if (subcommand === "list") {
			const unions = await UnionSchema.find()
				.sort({ members: -1 })
				.limit(10);

			if (unions.length === 0) {
				return interaction.editReply({
					embeds: [createErrorEmbed("No unions found!")],
				});
			}

			const unionList = unions
				.map(
					(union, index) =>
						`${index + 1}. **${union.name}** (${union.short}#${
							union.short_discrim
						}) - ${union.members.length} members`
				)
				.join("\n");

			return interaction.editReply({
				embeds: [createSuccessEmbed("Top 10 Unions:\n" + unionList)],
			});
		} else if (subcommand === "leave") {
			interaction.editReply({
				embeds: [
					createWarningEmbed("Not implemented yet! Coming soon..."),
				],
			});
		} else if (subcommand === "kick") {
			interaction.editReply({
				embeds: [
					createWarningEmbed("Not implemented yet! Coming soon..."),
				],
			});
		} else if (subcommand === "invite") {
			interaction.editReply({
				embeds: [
					createWarningEmbed("Not implemented yet! Coming soon..."),
				],
			});
		}
	},
};
