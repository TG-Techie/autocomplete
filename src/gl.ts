// create a template for gitless branch format

import {completionSpec as gitCompletionSpec} from "src/git";

// console.error(gitCompletionSpec.subcommands.branch.subcommands[0].args[0].generators);

const testGenerator: Fig.Generator = {
  script: ["echo", "test"],
  postProcess: (output) => {
    console.log(output);
    return [
      {
        name: "test",
        description: "test",
      },
    ];
  },
};

// a generator for gitless branch format to autsuggest local branches and remote repo names
const localBranches: Fig.Generator = {
  script: ["gl", "branch"],
  postProcess: (output) => {
    console.log("!?");
    if (output.startsWith("fatal:")) {
      return [];
    }

    const processed = output
      .split("\n")
      .filter(
        (branch) =>
          branch.trim().length > 0 &&
          !(branch.trim().startsWith("➜") || branch === "List of branches:")
      )
      .map((branch) => {
        return {
          name:  branch.replace("*", "").split("(")[0].trim(),
          description: "Branch",
        };
      });
      console.log(processed);
      return processed;
  },
};

const localRemotes = (suffix: string): Fig.Generator => {
  return {
    script: ["gl", "remote"],
    postProcess: (output) => {
      console.log("!?");
      if (output.startsWith("fatal:")) {
        return [];
      }

      const processed = output
        .split("\n")
        .filter(
          (remote) =>
            remote.trim().length > 0 &&
            !(remote.trim().startsWith("➜") || remote === "List of remotes:")
        )
        .map((remote) => {
          return {
            name: remote.split("(")[0].trim() + suffix,
            description: "Remote",
          };
        });
        console.log(processed);
        return processed;
    },
  };
};

// the core completion spec
const completionSpec: Fig.Spec = {
  name: "gl",
  description: "Gitless: a simple version control system",
  options: [
    {
      name: ["-h", "--help"],
      description: "List the options and subcommands for `gl` and exit",
    },
    {
      name: "--version",
      description: "Show program's version number and exit",
    },
  ],
  subcommands: [
    {
      name: "branch",
      description: "List, create, delete, or edit branches",
      args: {}, // gl branch without any options is a valid command, this is the default
      options: [
        {
          name: ["-h", "--help"],
          description: "List the options for `gl branch`",
        },
        {
          name: ["-r", "--remote"],
          description: "List remote branches in addition to local branches",
        },
        {
          name: ["-v", "--verbose"],
          description: "Be verbose, will output the head of each branch",
        },
      ],
      subcommands: [
        {
          name: ["-c", "--create"],
          description: "Create branch(es)",
          args: [
            {
              name: "branch",
              isOptional: false,
            },
            {
              name: "branches",
              isVariadic: true,
              isOptional: true,
            },
          ],
          options: [
            {
              name: "",
              args: { name: "branch" },
            },
            {
              name: ["-dp", "--divergent-point"],
              description:
                "The commit from where to 'branch out' (only relevant if a new branch is created; defaults to HEAD)",
              args: {
                name: "DP",
                generators: [localBranches, localRemotes("/")],
              },
            },
          ],
        },
        {
          name: ["-d", "--delete"],
          description: "Delete branch(es)",
          args: [
            {
              name: "branch",
              generators: localBranches,
            },
            {
              name: "branches",
              generators: localBranches,
              isVariadic: true,
              isOptional: true,
            },
          ],
        },
        {
          name: ["-sh", "--set-head"],
          description: "Set the head of the current branch",
          args: { name: "commit_id" },
        },
        {
          // TODO: MAYBE add a generator for this first remote branches but that may be
          // a bit too much as it could make a network call for each remote
          name: ["-su", "--set-upstream branch"],
          description: "Set the upstream branch of the current branch",
          args: {
            name: "branch",
            isOptional: false,
            generators: localRemotes("/"),
          },
        },
        {
          name: ["-uu", "--unset-upstream"],
          description: "Unset the upstream branch of the current branch",
        },
      ],
    },
    {
      name: "switch",
      description: "Switch branches",
      // TODO: add a generator to suggest the names fo local branches
      args: [
          {
          name: "branch",
          description: "The branch to switch to",
          generators: [localBranches],
          // generators: gitCompletionSpec.subcommands.branch.subcommands[0].args[0].generators,
          isOptional: false,
        }
      ],
      options: [
        {
          name: ["-h", "--help"],
          description: "List the args and options for `gl switch`",
        },
        {
          name: ["-mo", "--move-over"],
          description:
            "Move uncomitted changes made in the current branch to the destination branch",
        },
      ],
    },
    {
      name: "commit",
      description:
        "Save changes to the local repository. By default all tracked modified files are committed. To customize the set of files to be committed use the only, exclude, and include flags",
      options: [
        {
          name: ["-h", "--help"],
          description: "List the args and options for `gl commit`",
        },
        {
          name: ["-m", "--message"],
          description: "With commit message",
          args: { name: '"Commit message."' },
        },
        {
          name: ["-p", "--partial"],
          description: "Interactively select segments of files to commit",
        },
        {
          name: ["-e", " --exclude"],
          description: "Exclude tracked files given",
          args: {
            name: "files",
            isVariadic: true,
          },
        },
        {
          name: ["-i", " --include"],
          description: "Include untracked files given",
          args: {
            name: "files",
            isVariadic: true,
          },
        },
      ],
    },
    {
      name: "publish",
      description: "Publish commits upstream",
      args: {
        name: "dst",
        isOptional: true,
        description:
          "The branch where to publish commits, defaults to the current upstream branch",
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the args and options for `gl publish`",
        },
      ],
    },
    {
      name: "track",
      description: "Start tracking changes to files",
      args: {
        name: "files",
        isVariadic: true,
        description: "The file(s) to track",
        template: "filepaths",
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the args and options for `gl track`",
        },
      ],
    },
    {
      name: "untrack",
      description: "Stop tracking changes to files",
      args: {
        name: "files",
        isVariadic: true,
        description: "The file(s) to track",
        template: "filepaths",
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the args and options for `gl untrack`",
        },
      ],
    },
    {
      name: "status",
      description: "Show status of the repo",
      options: [
        {
          name: ["-h", "--help"],
          description: "List the options for `gl status`",
        },
      ],
    },
    {
      name: "diff",
      description:
        "Show changes to files. By default all tracked modified files are diffed. To customize the set of files to diff use the only, exclude, and include flags",
      args: {
        name: "files",
        isVariadic: true,
        description: "Use only these files (must be tracked)",
        template: "filepaths",
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the args and options for `gl diff`",
        },
        {
          name: ["-e", " --exclude"],
          description: "Exclude these files (must be tracked)",
          args: {
            name: "files",
            isVariadic: true,
            description: "The file(s) to exclude",
            template: "filepaths",
          },
        },
        {
          name: ["-i", " --include"],
          description: "Include these files (must be tracked)",
          args: {
            name: "files",
            isVariadic: true,
            description: "The file(s) to include",
            template: "filepaths",
          },
        },
      ],
    },
    {
      name: "merge",
      description: "Merge the divergent changes of one branch onto another",
      args: {
        name: "src",
        description: "The source branch to read changes from",
        generators: [localRemotes("/"), localBranches],
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the args and options for `gl merge`",
        },
        {
          name: ["-a", "--abort"],
          description: "Abort the merge in progress",
        },
      ],
    },
    {
      name: "fuse",
      description:
        "Fuse the divergent changes of a branch onto the current branch. By default all divergent changes from the given source branch are fused. Tocustomize the set of commits to fuse use the only and exclude flags",
      args: {
        name: "src",
        isOptional: true,
        description:
          "The source branch to fuse changes from, defaults to upstream",
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the options for `gl fuse`",
        },
        {
          name: ["-o", "--only"],
          description: "Only fuse these commits",
          args: {
            name: "commit_id",
            isVariadic: true,
          },
        },
        {
          name: ["-e", " --exclude"],
          description: "Exclude these commits",
          args: {
            name: "commit_id",
            isVariadic: true,
          },
        },
        {
          name: ["-ip", "--insertion-point"],
          description: "Insert the divergent canges after this commit",
        },
        {
          name: ["-a", "--abort"],
          description: "Abort the fuse in progress",
        },
      ],
    },
    {
      name: "resolve",
      description: "Mark files with conflicts as resolved",
      args: {
        name: "files",
        isVariadic: true,
        description: "The file(s) to resolve",
        template: "filepaths",
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the options for `gl resolve`",
        },
      ],
    },
    {
      name: "remote",
      description: "List, create, edit or delete remotes",
      args: {},
      options: [
        {
          name: ["-h", "--help"],
          description: "List the options for `gl remote`",
        },
        {
          name: ["-c", "--create"],
          description: "Create a new remote",
          args: [
            {
              name: "remote-name",
              description: "The name of the new remote",
              generators: localRemotes(""),
            },
            {
              name: "remote-url",
              description: "The url of the new remote",
            },
          ],
        },
        {
          name: ["-d", "--delete"],
          description: "Delete a remote",
          args: {
            name: "remote",
            isVariadic: true,
            description: "The name of the remote(s) to delete",
            generators: localRemotes(""),
          },
        },
      ],
    },
    {
      name: "init",
      description: "Create an empty or clone a remote git repo",
      args: {
        name: "repo",
        isOptional: true,
        description: "The remote repo to clone",
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the args and options for `gl init`",
        },
      ],
    },
    {
      name: "history",
      description: "Show commit history",
      options: [
        {
          name: ["-h", "--help"],
          description: "List the options for `gl history`",
        },
        {
          name: ["-v", "--verbose"],
          description: "Be verbose, will output the diffs of the commit",
        },
        {
          name: ["-l", "--limit"],
          description: "Limit number of commits displayed",
          args: {
            name: "LIMIT",
          },
        },
        {
          name: ["-c", "--compact"],
          description: "Output history in a compact format",
        },
        {
          name: ["-b", "--branch"],
          description:
            "The branch to show history of, defaults to current branch",
        },
      ],
    },
    {
      name: "tag",
      description: "List, create, or delete tags",
      args: {},
      options: [
        {
          name: ["-h", "--help"],
          description: "List the options for `gl tag`",
        },
        {
          name: ["-r", "--remote"],
          description: "List remote tags in addition to local tags",
        },
        {
          name: ["-c", "--create"],
          description: "Create new tag(s)",
          args: {
            name: "tag",
            isVariadic: true,
          },
        },
        {
          name: ["-ci", "--commit"],
          description: "Add new tags to this commit",
        },
        {
          name: ["-d", "--delete"],
          description: "Delete tag(s)",
          args: {
            name: "tag",
            isVariadic: true,
            // TODO: add generator for the current present tag names
          },
        },
      ],
    },
    {
      name: "checkout",
      description: "Checkout committed versions of files",
      args: {
        name: "file",
        isVariadic: true,
        description: "The file(s) to checkout",
        template: "filepaths",
      },
      options: [
        {
          name: ["-h", "--help"],
          description: "List the options for `gl checkout`",
        },
        {
          name: ["-cp", "--commit-point"],
          description:
            "The commit point to checkout the files at. Defaults to HEAD",
          args: {
            name: "CP",
          },
        },
      ],
    },
  ],
};

export default completionSpec;
