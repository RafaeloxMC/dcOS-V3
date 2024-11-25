import { model, Schema } from "mongoose";

const Greeter = new Schema({
	guild_id: String,
	channel_id: String,
	message: String,
	enabled: Boolean,
	roles: Array,
});

export default model("greeter", Greeter);