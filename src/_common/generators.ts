/* eslint-disable */
interface FilepathsOptions {
  /** Show suggestions with any of these extensions. Do not include the leading dot. */
  extensions?: string[];
  /** Show suggestions that include this string */
  includes?: string;
  /** Show suggestions where the name exactly matches one of these strings */
  equals?: string | string[];
  /** Show suggestions where the name matches this expression */
  matches?: RegExp;
  /**
   * Defines how folders are suggested.
   *
   * - **Default:** `filter` will treat folders like files, filtering based on the name.
   * - `always` will always suggest folders.
   * - `never` will never suggest folders.
   */
  suggestFolders?: "filter" | "always" | "never";
  /**
   * Set properties of suggestions of type "file".
   */
  editFileSuggestions?: Omit<Fig.Suggestion, "name" | "type">;
  /**
   * Set properties of suggestions of type "folder".
   */
  editFolderSuggestions?: Omit<Fig.Suggestion, "name" | "type">;
}

/**
 * Sugar over using the `filepaths` template with `filterTemplateSuggestions`. If any of the
 * conditions match, the suggestion will be accepted.
 *
 * Basic filepath filters can be replaced with this generator.
 *
 * @example
 * ```
 * // inside a `Fig.Arg`...
 * generators: filepaths({ extensions: ["mjs", "js", "json"] });
 * ```
 */
export function filepaths(options: FilepathsOptions): Fig.Generator {
  const {
    extensions = [],
    includes,
    equals = [],
    matches,
    suggestFolders = "filter",
    editFileSuggestions,
    editFolderSuggestions,
  } = options;
  const extensionsSet = new Set(extensions);
  const equalsSet = new Set(equals);
  return {
    template: "filepaths",
    filterTemplateSuggestions: (suggestions) => {
      const filtered = suggestions.filter(({ name, type }) => {
        if (suggestFolders !== "filter" && type === "folder") {
          return suggestFolders === "always";
        }
        if (equalsSet.has(name)) return true;
        if (matches && matches.test(name)) return true;
        if (includes && name.includes(includes)) return true;
        // handle extensions
        const [_, ...extensions] = name.split(".");
        if (extensions.length >= 1) {
          let stackedExtensions = "";
          for (let i = 0; i < extensions.length; i++) {
            stackedExtensions = extensions[i] + stackedExtensions;
            if (extensionsSet.has(stackedExtensions)) {
              return true;
            }
          }
        }
        return false;
      });
      if (!editFileSuggestions && !editFolderSuggestions) return filtered;

      return filtered.map((suggestion) => {
        return {
          ...suggestion,
          ...((suggestion.type === "file"
            ? editFileSuggestions
            : editFolderSuggestions) || {}),
        };
      });
    },
  };
}
