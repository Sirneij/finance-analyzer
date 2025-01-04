export const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	});
};

export const isSameDay = (dateOne: string, dateTwo: string | Date) => {
	const firstDate = new Date(dateOne);
	const secondDate = typeof dateTwo === 'string' ? new Date(dateTwo) : dateTwo;
	return (
		firstDate.getFullYear() === secondDate.getFullYear() &&
		firstDate.getMonth() === secondDate.getMonth() &&
		firstDate.getDate() === secondDate.getDate()
	);
};
