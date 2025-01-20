export const formatMoney = (amount: number | null | undefined): string => {
	const validAmount = amount || 0;
	return validAmount.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
		currencyDisplay: 'narrowSymbol'
	});
};
