import { model, Schema } from "mongoose";

const GlobalBan = new Schema({
	user_id: String,
	reason: String,
});

export default model("globalban", GlobalBan);