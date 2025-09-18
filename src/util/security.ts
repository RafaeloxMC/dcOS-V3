export function generateSecurityToken() {
	const chars =
		"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+=-[]{}|;:,./<>?";
	let result = "";
	for (let i = 8; i > 0; --i)
		result += chars[Math.floor(Math.random() * chars.length)];
	return result;
}
