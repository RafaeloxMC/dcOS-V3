import { EmbedBuilder } from "discord.js";
import Bank from "../database/schemas/Bank";
import Union from "../database/schemas/Union";
import { createErrorEmbed, createSuccessEmbed, createWarningEmbed } from "./embeds";

async function withdraw(user_id: string, currency_short: string, amount: number): Promise<EmbedBuilder> {
	if (amount <= 0) {
		return createErrorEmbed("Amount must be geater than 0.");
	}

    if(amount % 1 !== 0) {
        return createErrorEmbed("Amount must not have decimal places.");
    }

    if(!currency_short || !currency_short.includes("#")) {
        return createErrorEmbed("Invalid currency.");
    }

    let currency = currency_short.split("#");

    if(currency.length === 2) {
        return await Union.findOne({ short: currency[0], short_discrim: currency[1] }).then(async (data) => {
            if (data) {
                return await Bank.findOne({ user_id: user_id, currency_short: currency_short }).then(async (data) => {
                    if(data) {
                        if(!data.on_bank) {
                            return createErrorEmbed("You don't have a bank account. Withdraw cancelled.");
                        }

                        if(!data.on_hand) {
                            return createErrorEmbed("You don't have a wallet on you. Withdraw cancelled.");
                        }

                        if(data.on_bank < amount) {
                            return createErrorEmbed("You don't have enough money in your bank account. Withdraw cancelled.");
                        }

                        data.on_bank -= amount;
                        data.on_hand += amount;
                        await data.save();

                        return createSuccessEmbed(`Successfully withdrew ${amount} ${currency_short} from your bank.`);
                    } else {
                        return createWarningEmbed("Bank account not found. Creating one for you...\n\nStatus: " + await createAccount(user_id, currency_short));
                    }
                });
            } else {
                return createErrorEmbed("Currency not found.");
            }
        });
    } else {
        return createErrorEmbed("Invalid currency.");
    }
}

async function deposit(user_id: string, currency_short: string, amount: number) {
    if (amount <= 0) {
        return createErrorEmbed("Amount must be geater than 0.");
    }

    if(amount % 1 !== 0) {
        return createErrorEmbed("Amount must not have decimal places.");
    }

    if(!currency_short || !currency_short.includes("#")) {
        return createErrorEmbed("Invalid currency.");
    }

    let currency = currency_short.split("#");

    if(currency.length === 2) {
        return await Union.findOne({ short: currency[0], short_discrim: currency[1] }).then(async (data) => {
            if (data) {
                return await Bank.findOne({ user_id: user_id, currency_short: currency_short }).then(async (data) => {
                    if(data) {
                        if(!data.on_hand) {
                            return createErrorEmbed("You don't have a wallet on you. Deposit cancelled.");
                        }

                        if(!data.on_bank) {
                            return createErrorEmbed("You don't have a bank account. Deposit cancelled.");
                        }

                        if(data.on_hand < amount) {
                            return createErrorEmbed("You don't have enough money in your wallet. Deposit cancelled.");
                        }

                        data.on_hand -= amount;
                        data.on_bank += amount;
                        await data.save();

                        return createSuccessEmbed(`Successfully deposited ${amount} ${currency_short} to your bank.`);
                    } else {
                        return createWarningEmbed("Bank account not found. Creating one for you...\n\nStatus: " + await createAccount(user_id, currency_short));
                    }
                });
            } else {
                return createErrorEmbed("Currency not found.");
            }
        });
    } else {
        return createErrorEmbed("Invalid currency.");
    }

}

async function transfer(sender_id: string, receiver_id: string, currency_short: string, amount: number) {
    if (amount <= 0) {
        return createErrorEmbed("Amount must be geater than 0.");
    }

    if(amount % 1 !== 0) {
        return createErrorEmbed("Amount must not have decimal places.");
    }

    if(!currency_short || !currency_short.includes("#")) {
        return createErrorEmbed("Invalid currency.");
    }

    let currency = currency_short.split("#");

    if(currency.length === 2) {
        return await Union.findOne({ short: currency[0], short_discrim: currency[1] }).then(async (data) => {
            if (data) {
                return await Bank.findOne({ user_id: sender_id, currency_short: currency_short }).then(async (sender_data) => {
                    if(sender_data) {
                        return await Bank.findOne({ user_id: receiver_id, currency_short: currency_short }).then(async (receiver_data) => {
                            if(receiver_data) {
                                if(!sender_data.on_bank) {
                                    return createErrorEmbed("You don't have a bank account. Transfer cancelled.");
                                }

                                if(sender_data.on_bank < amount) {
                                    return createErrorEmbed("You don't have enough money in your wallet. Transfer cancelled.");
                                }

                                if(!receiver_data.on_bank) {
                                    return createErrorEmbed("Receiver doesn't have a bank account. Transfer cancelled.");
                                }

                                sender_data.on_bank -= amount;
                                receiver_data.on_bank += amount;

                                await sender_data.save();
                                await receiver_data.save();

                                return createSuccessEmbed(`Successfully transferred ${amount} ${currency_short} to <@${receiver_id}>.`);
                            } else {
                                return createErrorEmbed("Receiver doesn't have a bank account. Transfer cancelled.");
                            }
                        });
                    } else {
                        return createWarningEmbed("You don't have a bank account. Creating one for you...\n\nStatus: " + await createAccount(sender_id, currency_short));
                    }
                });
            } else {
                return createErrorEmbed("Currency not found.");
            }
        });
    } else {
        return createErrorEmbed("Invalid currency.");
    }
}

async function claimDaily(user_id: string, currency_short: string): Promise<EmbedBuilder> {
    if(!currency_short || !currency_short.includes("#")) {
        return createErrorEmbed("Invalid currency.");
    }

    let currency = currency_short.split("#");

    if(currency.length === 2) {
        return await Union.findOne({ short: currency[0], short_discrim: currency[1] }).then(async (data) => {
            if (data) {
                return await Bank.findOne({ user_id: user_id, currency_short: currency_short }).then(async (data) => {
                    if(data) {
                        if(!data.on_hand) {
                            return createErrorEmbed("You don't have a wallet on you. Claim cancelled.");
                        }

                        data.on_hand += 100;
                        await data.save();

                        return createSuccessEmbed("Successfully claimed 100 " + currency_short.split("#")[0] + ". You now have " + data.on_hand + " " + currency_short.split("#")[0] + " in your wallet.");
                    } else {
                        return createWarningEmbed("Bank account not found. Creating one for you...\n\nStatus: " + await createAccount(user_id, currency_short));
                    }
                });
            } else {
                return createErrorEmbed("Currency not found.");
            }
        });
    } else {
        return createErrorEmbed("Invalid currency.");
    }
}

async function createAccount(user_id: string, currency_short: string) {
    if(!currency_short || !currency_short.includes("#")) {
        return "Invalid currency.";
    }

    let currency = currency_short.split("#");

    if(currency.length === 2) {
        await Union.findOne({ short: currency[0], short_discrim: currency[1] }).then(async (data) => {
            if (data) {
                await Bank.findOne({ user_id: user_id, currency_short: currency_short }).then(async (data) => {
                    if(data) {
                        return "Account already exists.";
                    } else {
                        Bank.create({
                            user_id: user_id,
                            currency_short: currency_short,
                            on_hand: 0,
                            on_bank: 0,
                        });

                        return "Account created.";
                    }
                });
            } else {
                return "Currency not found.";
            }
        });
    } else {
        return "Invalid currency.";
    }
}

export { withdraw, deposit, transfer, claimDaily, createAccount };
