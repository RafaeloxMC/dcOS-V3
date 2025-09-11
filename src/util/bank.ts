import { EmbedBuilder } from "discord.js";
import Bank from "../database/schemas/Bank";
import Union from "../database/schemas/Union";
import {
	createErrorEmbed,
	createSuccessEmbed,
	createWarningEmbed,
} from "./embeds";
import mongoose from "mongoose";
import { validateAmount } from "./numbers";

async function withdraw(
	user_id: string,
	currency_short: string,
	amount: number
): Promise<EmbedBuilder> {
	const valid = validateAmount(amount);
	if (valid != null) {
		return createErrorEmbed(valid);
	}

	if (amount % 1 !== 0) {
		return createErrorEmbed("Amount must not have decimal places.");
	}

	if (!currency_short || !currency_short.includes("#")) {
		return createErrorEmbed("Invalid currency.");
	}

	let currency = currency_short.split("#");

	if (currency.length === 2) {
		const union_data = await Union.findOne({
			short: currency[0],
			short_discrim: currency[1],
		});
		if (union_data) {
			const bank_data = await Bank.findOne({
				user_id: user_id,
				currency_short: currency_short,
			});
			if (bank_data) {
				if (!bank_data.on_bank) {
					return createErrorEmbed(
						"You don't have a bank account. Withdraw cancelled."
					);
				}

				if (!bank_data.on_hand) {
					return createErrorEmbed(
						"You don't have a wallet on you. Withdraw cancelled."
					);
				}

				if (bank_data.on_bank < amount) {
					return createErrorEmbed(
						"You don't have enough money in your bank account. Withdraw cancelled."
					);
				}

				const result = await Bank.findOneAndUpdate(
					{ user_id, currency_short, on_bank: { $gte: amount } },
					{ $inc: { on_bank: -amount, on_hand: amount } },
					{ new: true }
				);

				if (!result) {
					return createErrorEmbed(
						"Insufficient funds or account not found"
					);
				}

				return createSuccessEmbed(
					`Successfully withdrew ${amount} ${currency_short} from your bank.`
				);
			} else {
				return createWarningEmbed(
					"Bank account not found. Creating one for you...\n\nStatus: " +
						(await createAccount(user_id, currency_short))
				);
			}
		} else {
			return createErrorEmbed("Currency not found.");
		}
	} else {
		return createErrorEmbed("Invalid currency.");
	}
}

async function deposit(
	user_id: string,
	currency_short: string,
	amount: number
) {
	const valid = validateAmount(amount);
	if (valid != null) {
		return createErrorEmbed(valid);
	}

	if (amount % 1 !== 0) {
		return createErrorEmbed("Amount must not have decimal places.");
	}

	if (!currency_short || !currency_short.includes("#")) {
		return createErrorEmbed("Invalid currency.");
	}

	let currency = currency_short.split("#");

	if (currency.length === 2) {
		const union_data = await Union.findOne({
			short: currency[0],
			short_discrim: currency[1],
		});
		if (union_data) {
			const bank_data = await Bank.findOne({
				user_id: user_id,
				currency_short: currency_short,
			});
			if (bank_data) {
				if (!bank_data.on_hand) {
					return createErrorEmbed(
						"You don't have a wallet on you. Deposit cancelled."
					);
				}

				if (!bank_data.on_bank) {
					return createErrorEmbed(
						"You don't have a bank account. Deposit cancelled."
					);
				}

				if (bank_data.on_hand < amount) {
					return createErrorEmbed(
						"You don't have enough money in your wallet. Deposit cancelled."
					);
				}

				const result = await Bank.findOneAndUpdate(
					{ user_id, currency_short, on_hand: { $gte: amount } },
					{ $inc: { on_bank: amount, on_hand: -amount } },
					{ new: true }
				);

				if (!result) {
					return createErrorEmbed(
						"Insufficient funds or account not found"
					);
				}

				return createSuccessEmbed(
					`Successfully deposited ${amount} ${currency_short} to your bank.`
				);
			} else {
				return createWarningEmbed(
					"Bank account not found. Creating one for you...\n\nStatus: " +
						(await createAccount(user_id, currency_short))
				);
			}
		} else {
			return createErrorEmbed("Currency not found.");
		}
	} else {
		return createErrorEmbed("Invalid currency.");
	}
}

async function transfer(
	sender_id: string,
	receiver_id: string,
	currency_short: string,
	amount: number
) {
	const valid = validateAmount(amount);
	if (valid != null) {
		return createErrorEmbed(valid);
	}

	if (amount % 1 !== 0) {
		return createErrorEmbed("Amount must not have decimal places.");
	}

	if (!currency_short || !currency_short.includes("#")) {
		return createErrorEmbed("Invalid currency.");
	}

	let currency = currency_short.split("#");

	if (currency.length === 2) {
		const union_data = await Union.findOne({
			short: currency[0],
			short_discrim: currency[1],
		});
		if (union_data) {
			const sender_data = await Bank.findOne({
				user_id: sender_id,
				currency_short: currency_short,
			});
			if (sender_data) {
				const receiver_data = await Bank.findOne({
					user_id: receiver_id,
					currency_short: currency_short,
				});
				if (receiver_data) {
					if (!sender_data.on_bank) {
						return createErrorEmbed(
							"You don't have a bank account. Transfer cancelled."
						);
					}

					if (sender_data.on_bank < amount) {
						return createErrorEmbed(
							"You don't have enough money in your wallet. Transfer cancelled."
						);
					}

					if (!receiver_data.on_bank) {
						return createErrorEmbed(
							"Receiver doesn't have a bank account. Transfer cancelled."
						);
					}

					sender_data.on_bank -= amount;
					receiver_data.on_bank += amount;

					const session = await mongoose.startSession();
					session.startTransaction();
					try {
						await sender_data.save({ session });
						await receiver_data.save({ session });
						await session.commitTransaction();
					} catch (error) {
						await session.abortTransaction();
						throw error;
					} finally {
						session.endSession();
					}

					return createSuccessEmbed(
						`Successfully transferred ${amount} ${currency_short} to <@${receiver_id}>.`
					);
				} else {
					return createErrorEmbed(
						"Receiver doesn't have a bank account. Transfer cancelled."
					);
				}
			} else {
				return createWarningEmbed(
					"You don't have a bank account. Creating one for you...\n\nStatus: " +
						(await createAccount(sender_id, currency_short))
				);
			}
		} else {
			return createErrorEmbed("Currency not found.");
		}
	} else {
		return createErrorEmbed("Invalid currency.");
	}
}

async function claimDaily(
	user_id: string,
	currency_short: string
): Promise<EmbedBuilder> {
	if (!currency_short || !currency_short.includes("#")) {
		return createErrorEmbed("Invalid currency.");
	}

	let currency = currency_short.split("#");

	if (currency.length === 2) {
		const union_data = await Union.findOne({
			short: currency[0],
			short_discrim: currency[1],
		});
		if (union_data) {
			const bank_data = await Bank.findOne({
				user_id: user_id,
				currency_short: currency_short,
			});
			if (bank_data) {
				if (!bank_data.on_hand) {
					return createErrorEmbed(
						"You don't have a wallet on you. Claim cancelled."
					);
				}

				bank_data.on_hand += 100;

				const session = await mongoose.startSession();
				session.startTransaction();
				try {
					await bank_data.save({ session });
				} catch (error) {
					await session.abortTransaction();
					throw error;
				} finally {
					session.endSession();
				}

				return createSuccessEmbed(
					"Successfully claimed 100 " +
						currency_short.split("#")[0] +
						". You now have " +
						bank_data.on_hand +
						" " +
						currency_short.split("#")[0] +
						" in your wallet."
				);
			} else {
				return createWarningEmbed(
					"Bank account not found. Creating one for you...\n\nStatus: " +
						(await createAccount(user_id, currency_short))
				);
			}
		} else {
			return createErrorEmbed("Currency not found.");
		}
	} else {
		return createErrorEmbed("Invalid currency.");
	}
}

async function createAccount(user_id: string, currency_short: string) {
	if (!currency_short || !currency_short.includes("#")) {
		return "Invalid currency.";
	}

	let currency = currency_short.split("#");

	if (currency.length === 2) {
		const union_data = await Union.findOne({
			short: currency[0],
			short_discrim: currency[1],
		});
		if (union_data) {
			const bank_data = await Bank.findOne({
				user_id: user_id,
				currency_short: currency_short,
			});
			if (bank_data) {
				return "Account already exists.";
			} else {
				const account = await Bank.create({
					user_id: user_id,
					currency_short: currency_short,
					on_hand: 0,
					on_bank: 0,
				});

				if (account != null) {
					return "Account created.";
				} else {
					return "Error while creating account.";
				}
			}
		} else {
			return "Currency not found.";
		}
	} else {
		return "Invalid currency.";
	}
}

export { withdraw, deposit, transfer, claimDaily, createAccount };
