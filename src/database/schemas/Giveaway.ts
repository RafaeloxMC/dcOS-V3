import { model, Schema } from "mongoose";

const Giveaway = new Schema({
	message_id: String,
	channel_id: String,
	end_time: Date,
	winners: [String],
	prize: String,
	ended: Boolean,
});

export default model("giveaway", Giveaway);