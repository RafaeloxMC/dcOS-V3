export function validateAmount(amount: number) {
	if (typeof amount !== "number" || isNaN(amount)) return "Invalid amount";
	if (amount <= 0) return "Amount must be greater than 0";
	if (!Number.isInteger(amount)) return "Amount must not have decimal places";
	if (amount > Number.MAX_SAFE_INTEGER) return "Amount too large";
	return null;
}
