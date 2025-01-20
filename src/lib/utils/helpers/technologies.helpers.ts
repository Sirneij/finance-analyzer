import {
	NAME_OF_TOOLS_ON_DEVICON_ON_PLAIN,
	NAME_OF_TOOLS_ON_DEVICON_TO_EXCLUDE,
	NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE,
	NAME_OF_TOOLS_ON_DEVICON_WITH_EXTRA
} from '$lib/utils/contants';
export const normalizeTechnologyNameAndGetIcon = (technology: string): string => {
	// Turn the technology to lowercase and remove everything in parentheses
	let normalizedTechnology = technology.toLowerCase().replace(/\(.*\)/, '');

	// If it's more than one word, pick the first word
	normalizedTechnology = normalizedTechnology.split(' ')[0];

	// Remove any periods in the technology name
	normalizedTechnology = normalizedTechnology.replace(/\./g, '');

	// If the technology is in the list of technologies to include, use the value of `NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE`
	if (
		NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE[
			normalizedTechnology as keyof typeof NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE
		]
	) {
		normalizedTechnology =
			NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE[
				normalizedTechnology as keyof typeof NAME_OF_TOOLS_ON_DEVICON_TO_INCLUDE
			];
	}

	// If the technology is in the list of technologies to exclude, return an empty string
	if (NAME_OF_TOOLS_ON_DEVICON_TO_EXCLUDE.includes(normalizedTechnology)) {
		return '';
	}

	let icon = `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${normalizedTechnology}/${normalizedTechnology}-original.svg`;

	// If technology is in NAME_OF_TOOLS_ON_DEVICON_ON_PLAIN, use `-plain` version of the icon
	if (NAME_OF_TOOLS_ON_DEVICON_ON_PLAIN.includes(normalizedTechnology)) {
		icon = icon.replace('-original', '-plain');
	}

	// If technology is in NAME_OF_TOOLS_ON_DEVICON_WITH_EXTRA, use `-original-wordmark` version of the icon
	if (NAME_OF_TOOLS_ON_DEVICON_WITH_EXTRA.includes(normalizedTechnology)) {
		icon = icon.replace('-original', '-original-wordmark');
	}

	return icon;
};

export const stripOffCGPAFronDegree = (degree: string): string => {
	// From `;` to the end of the string, remove everything
	return degree.replace(/;.*/, '');
};
