export const truncateText = (text: string, maxLength = 25) => {
	return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};
