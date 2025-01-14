export const decodeEmail = (encoded: string): string => {
	return atob(encoded);
};

export const encodeEmail = (email: string): string => {
	if (!email || !email.includes('@')) {
		throw new Error('Invalid email address');
	}
	return btoa(email);
};
