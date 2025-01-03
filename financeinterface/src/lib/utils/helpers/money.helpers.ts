export const formatMoney = (amount: number): string => {
	return amount.toLocaleString('en-US', {
		style: 'currency',
		currency: 'USD',
		currencyDisplay: 'narrowSymbol'
	});
};
