import { model, Schema } from "mongoose";

const BankSchema = new Schema({
	user_id: String,
	currency_short: String,
	on_hand: Number,
	on_bank: Number,
	daily_cooldown: Date,
});

export default model("bank", BankSchema);
