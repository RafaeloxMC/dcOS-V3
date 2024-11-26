import { SlashCommandBuilder } from "discord.js";
import { Command } from "../../types";
import { validateServerUnion } from "../../util/union";
import { createUnionErrorEmbed } from "../../util/embeds";
import { claimDaily } from "../../util/bank";

const Daily: Command = {
    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily reward."),
    async execute(interaction, client) {
        let union = await validateServerUnion(interaction.guildId || "");
        if(!union) {
            return await interaction.editReply({
                embeds: [
                    createUnionErrorEmbed()
                ]
            })
        }

        await interaction.editReply({
            embeds: [
                await claimDaily(interaction.user.id, union.short + "#" + union.short_discrim)
            ]
        })
    }
}

export default Daily;