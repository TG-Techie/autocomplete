/* eslint-disable */
interface FilepathsOptions {
  extensions?: string[];
  includes?: string;
  equals?: string | string[];
  match?: RegExp;
  acceptFolders?: boolean;
  priorities?: {
    folder?: number;
    files?: number;
  };
  icons?: {
    folder?: string;
    files?: string;
  };
}

/**
 * Syntactic sugar over `filepaths + filterTemplateSugestions` template
 * @param param0
 * @returns
 */
export function filepaths(options: FilepathsOptions): Fig.Generator {
  const {
    extensions = [],
    includes,
    equals = [],
    match,
    acceptFolders,
    priorities,
    icons,
  } = options;
  const extensionsSet = new Set(extensions);
  const equalsSet = new Set(equals);
  return {
    template: "filepaths",
    filterTemplateSuggestions: (suggestions) => {
      const filtered = suggestions.filter(({ name, type }) => {
        if (
          typeof acceptFolders !== undefined &&
          acceptFolders === (type === "folder")
        ) {
          return true;
        }
        if (equalsSet.has(name)) return true;
        if (match && match.test(name)) return true;
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
