export function normalize(s: string): string {
	return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim().replace(/\s+/g, ' ');
}

/**
 * Best-effort match of the registry's free-text model name against a site's
 * own model list (ponytail: only exact/unambiguous-prefix matches are used,
 * never a guess — a wrong model filter is worse than none).
 */
export function matchModell(
	options: { id: number; name: string }[] | undefined,
	make: string,
	modelText: string
): number | null {
	if (!options || !modelText.trim()) return null;

	let target = normalize(modelText);
	const normMake = normalize(make);
	if (normMake && target.startsWith(normMake + ' ')) target = target.slice(normMake.length + 1);
	if (!target) return null;

	const firstToken = target.split(' ')[0];

	const exact = options.find((o) => normalize(o.name) === target);
	if (exact) return exact.id;

	const tokenMatch = options.find((o) => normalize(o.name) === firstToken);
	if (tokenMatch) return tokenMatch.id;

	// "525I" / "430D" style registry codes vs a bare "525" / "430" site entry
	const tokenPrefixMatches = options.filter(
		(o) => o.name.length >= 2 && firstToken.startsWith(normalize(o.name))
	);
	if (tokenPrefixMatches.length === 1) return tokenPrefixMatches[0].id;

	// "A4 AVANT" / "A4 LIMOUSINE" style trims vs a bare "A4" site entry
	const wordPrefixMatches = options.filter((o) => target.startsWith(normalize(o.name) + ' '));
	if (wordPrefixMatches.length === 1) return wordPrefixMatches[0].id;

	return null;
}

export function parseDisplacementCc(displacement: string): number | null {
	const digits = displacement.replace(/\D/g, '');
	if (!digits) return null;
	const cc = parseInt(digits, 10);
	return cc > 0 ? cc : null;
}
