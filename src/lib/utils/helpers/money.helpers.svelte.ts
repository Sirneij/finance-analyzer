export const formatCurrency = (amount: number | null | undefined): string => {
	const validAmount = amount || 0;
	// Use the user's locale
	const locale = navigator?.language || 'en-US';
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
		currencyDisplay: 'narrowSymbol'
	}).format(validAmount);
};
