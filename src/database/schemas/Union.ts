import { model, Schema } from "mongoose";

const UnionSchema = new Schema({
	name: String,
	short: String,
	short_discrim: String,
	description: String,
	guild_id: String,
	members: Array,
});

export default model("union", UnionSchema);