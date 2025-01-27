import Article from '$lib/components/icons/Article.svelte';
import Comments from '$lib/components/icons/Comments.svelte';
import Bold from '$lib/components/icons/editor/Bold.svelte';
import Italic from '$lib/components/icons/editor/Italic.svelte';
import Followers from '$lib/components/icons/Followers.svelte';
import Hearts from '$lib/components/icons/Hearts.svelte';
import Location from '$lib/components/icons/Location.svelte';
import Repo from '$lib/components/icons/Repo.svelte';
import GitHub from '$lib/components/icons/GitHub.svelte';
import Task from '$lib/components/icons/editor/Task.svelte';
import Link from '$lib/components/icons/editor/Link.svelte';
import Code from '$lib/components/icons/editor/Code.svelte';
import UploadImage from '$lib/components/icons/editor/UploadImage.svelte';
import UnorderedList from '$lib/components/icons/editor/UnorderedList.svelte';
import OrderedList from '$lib/components/icons/editor/OrderedList.svelte';
import Quote from '$lib/components/icons/editor/Quote.svelte';
import Heading from '$lib/components/icons/editor/Heading.svelte';
import Table from '$lib/components/icons/editor/Table.svelte';
import CodeBlock from '$lib/components/icons/editor/CodeBlock.svelte';
import Note from '$lib/components/icons/editor/Note.svelte';
import Tip from '$lib/components/icons/editor/Tip.svelte';
import Warning from '$lib/components/icons/editor/Warning.svelte';
import Articles from '$lib/components/icons/Articles.svelte';
import Seen from '$lib/components/icons/Seen.svelte';
import Tags from '$lib/components/icons/Tags.svelte';
import Stacks from '$lib/components/icons/Stacks.svelte';
import ArticlesIcon from '$lib/components/icons/Articles.svelte';
import ResumeIcon from '$lib/components/icons/Resume.svelte';
import ProfileIcon from '$lib/components/icons/ProfileIcon.svelte';
import Platform from '$lib/components/icons/Platform.svelte';

export const icons = {
	repo: Repo,
	followers: Followers,
	location: Location,
	articles: Article,
	reactions: Hearts,
	comments: Comments
} as const;

export const EditorIcons = {
	bold: Bold,
	italize: Italic,
	link: Link,
	code: Code,
	uploadimage: UploadImage,
	unorderedlist: UnorderedList,
	orderedlist: OrderedList,
	blockquote: Quote,
	heading: Heading,
	table: Table,
	task: Task,
	codeblock: CodeBlock,
	github: GitHub,
	note: Note,
	tip: Tip,
	warning: Warning
} as const;

export const MetricsIcons = {
	totalReactions: Hearts,
	totalArticles: Articles,
	totalViews: Seen,
	totalTags: Tags,
	totalSeries: Stacks
} as const;

export const SectionIcons = {
	Home: ProfileIcon,
	Resume: ResumeIcon,
	Articles: ArticlesIcon,
	Platform: Platform,
	Repos: Repo
} as const;
