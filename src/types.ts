import { ChatInputCommandInteraction, Client, ClientOptions, Interaction, SlashCommandBuilder } from 'discord.js';
import { Collection } from 'discord.js';

export class dcOSClient<Ready extends boolean = boolean> extends Client {
    public constructor(options: ClientOptions) {
        super(options);
        this.commands = new Collection();
        this.commandArray = [];
        this.handleEvents = async (eventFiles: string[], path: string) => {};
        this.handleCommands = async (commandFolders: string[], path: string) => {};
    }
    handleEvents: (eventFiles: string[], path: string) => Promise<void>;
    handleCommands: (commandFolders: string[], path: string) => Promise<void>;
    commands: Collection<string, any>;
    commandArray: any[];
}

export interface Event {
    name: string;
    once: boolean;
    execute: (client: dcOSClient, ...args: any[]) => any;
}

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction, client: dcOSClient, ...args: any[]) => any;
}