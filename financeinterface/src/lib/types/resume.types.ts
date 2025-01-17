interface Experience {
	role: string;
	company: string;
	companyDescription: string;
	period: string;
	description: string;
	techStack: string[];
	achievements: string[];
}

interface Education {
	degree: string;
	school: string;
	location: string;
	period: string;
	description: string;
}

type SkillCategories =
	| 'Programming Languages'
	| 'Frontend'
	| 'Backend'
	| 'Database'
	| 'Cloud & DevOps';

type Skills = {
	[K in SkillCategories]: string[];
};

export type { Experience, Education, Skills, SkillCategories };
