export const formatMoney = (amount: number | null | undefined): string => {
	const validAmount = amount ?? 0;
	const numberAmount = Number(validAmount);

	if (isNaN(numberAmount)) {
		return '$0.00';
	}

	return numberAmount.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
		currencyDisplay: 'narrowSymbol'
	});
};
