export interface ExtensionConfig {
	/** Command will execute even when only 1 line is selected.  */
	workOnSingleLine: boolean;
	/** Outdent lines even if one of them reached column 0 (gutter). */
	cramReversed: boolean;
	/** Indent only when range is on either side has only whitespace characters and further - line boundaries. */
	onlyCompleteRange: boolean;
}
