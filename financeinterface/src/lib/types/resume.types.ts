interface Experience {
	role: string;
	company: string;
	location?: string;
	companyDescription: string;
	period: string;
	techStack: string[];
	achievements: string[];
}

interface Education {
	degree: string;
	school: string;
	location: string;
	period: string;
	schoolDescription: string;
	achievements?: string[];
}

type SkillCategories =
	| 'Programming Languages'
	| 'Frontend'
	| 'Backend'
	| 'Database'
	| 'Cloud & DevOps'
	| 'Others';

type Skills = {
	[K in SkillCategories]: string[];
};

export type { Experience, Education, Skills, SkillCategories };
