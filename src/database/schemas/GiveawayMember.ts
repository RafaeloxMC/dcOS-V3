import { model, Schema } from "mongoose";

const GiveawayMember = new Schema({
	user_id: String,
	message_id: String,
});

export default model("giveawaymember", GiveawayMember);