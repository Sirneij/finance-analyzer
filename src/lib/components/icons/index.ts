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
