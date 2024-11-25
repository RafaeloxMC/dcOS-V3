import { model, Schema } from "mongoose";

const Vote = new Schema({
	message_id: String,
	user_id: String,
	channel_id: String,
});

export default model("votes", Vote);