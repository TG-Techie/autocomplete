/* eslint-disable */
interface FilepathsOptions {
  /** Show suggestions with any of these extensions */
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
   * Set the priorities of the kinds of suggestions. If unset,
   * the default priority for that suggestion is used.
   */
  priorities?: {
    /** Folder suggestions will have this priority */
    folder?: number;
    /** File suggestions will have this priority */
    files?: number;
  };
  /**
   * Set the icons for the different kinds of suggestions.
   * If unset, the default icon for that suggestion is used.
   */
  icons?: {
    /** The icon for folders */
    folder?: string;
    /** The icon for files */
    files?: string;
  };
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
    priorities,
    icons,
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
        // TODO: multiple dots
        return extensionsSet.has(name.substring(name.lastIndexOf(".") + 1));
      });
      if (!priorities && !icons) return filtered;

      return filtered.map((suggestion) => {
        return {
          ...suggestion,
          priority:
            suggestion.type === "folder"
              ? priorities?.folder
              : priorities?.files,
          icon: suggestion.type === "folder" ? icons?.folder : icons?.files,
        };
      });
    },
  };
}
