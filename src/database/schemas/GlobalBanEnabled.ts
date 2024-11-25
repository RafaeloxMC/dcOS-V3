import { model, Schema } from "mongoose";

const GlobalBanEnabled = new Schema({
	guild_id: String,
	enabled: Boolean,
});

export default model("globalbanenabled", GlobalBanEnabled);
