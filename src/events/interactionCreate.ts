import { Command, Event } from "../types";
import { ChatInputCommandInteraction, Interaction } from "discord.js";

const interactionCreate: Event = {
    name: "interactionCreate",
    once: false,
    async execute(client, interaction: Interaction) {
        if(interaction.isButton()) {

        } else if (interaction.isCommand()) {
            console.log("Command interaction detected.");
            console.log(interaction.commandName);
            console.log(JSON.stringify(client.commands.toJSON()))
            const command: Command = client.commands.get(interaction.commandName);

            if (!command) return console.log("Command not found.");

            const chatInputCommandInteraction: ChatInputCommandInteraction = interaction as ChatInputCommandInteraction; 

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
}

export default interactionCreate;