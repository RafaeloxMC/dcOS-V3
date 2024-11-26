import { APIEmbedField, EmbedBuilder, GuildMember, RGBTuple } from "discord.js";
import { config } from "..";

export function createEmbed(title: string, description: string, color: number | RGBTuple | null, fields: APIEmbedField[], thumbnailUrl: string): EmbedBuilder {
	let embed = new EmbedBuilder();

	if (title) embed.setTitle(title);
	if (description) embed.setDescription(description);
	if (color) embed.setColor(color);
	if (fields) embed.addFields(fields);
	if (thumbnailUrl) embed.setThumbnail(thumbnailUrl);

	embed.setTimestamp();
	embed.setFooter({ text: `Made with ❤️ by ${config.AUTHOR} in Germany`, iconURL: config.AVATAR });
	return embed;
}

export function createErrorEmbed(description: string): EmbedBuilder {
    return createEmbed("Error", description, [255, 0, 0], [], "");
}

export function createSuccessEmbed(description: string): EmbedBuilder {
    return createEmbed("Success", description, [0, 255, 0], [], "");
}

export function createWarningEmbed(description: string): EmbedBuilder {
    return createEmbed("Warning", description, [255, 255, 0], [], "");
}

export function createInfoEmbed(description: string): EmbedBuilder {
    return createEmbed("Info", description, [0, 0, 255], [], "");
}

export function createMemberColorEmbed(member: GuildMember, title: string, description: string, fields: APIEmbedField[], thumbnailUrl: string): EmbedBuilder {
    return createEmbed(title, description, member.displayColor, fields, thumbnailUrl);
}

export function createUnionErrorEmbed() {
	return createErrorEmbed("This server has not created or joined a union yet! Please ask the sever's administrators to set this feature up.");
}