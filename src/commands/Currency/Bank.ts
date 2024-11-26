import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";

const Bank: Command = {
	data: new SlashCommandBuilder()
		.setName("bank")
		.setDescription("Check your bank balance.")
		.addSubcommand((subcommand) => subcommand.setName("balance").setDescription("Check your bank balance."))
		.addSubcommand((subcommand) =>
			subcommand
				.setName("deposit")
				.setDescription("Deposit money to your bank.")
				.addIntegerOption((option) => option.setName("amount").setDescription("The amount of money you want to deposit.").setRequired(true)),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("withdraw")
				.setDescription("Withdraw money from your bank.")
				.addIntegerOption((option) => option.setName("amount").setDescription("The amount of money you want to withdraw.").setRequired(true)),
		)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("transfer")
                .setDescription("Transfer money to another user.")
                .addUserOption((option) => option.setName("user").setDescription("The user you want to transfer money to.").setRequired(true))
                .addIntegerOption((option) => option.setName("amount").setDescription("The amount of money you want to transfer.").setRequired(true)),
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("top")
                .setDescription("Check the richest people in the union."),
        ),
    async execute(interaction, client) {
        await interaction.editReply("This command is still under development.");
        // TODO: IMPLEMENT
    }
};
