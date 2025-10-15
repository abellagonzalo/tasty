# Ship PR (Skip Local Tests)

Automate the PR workflow WITHOUT running local tests (useful when CI will catch issues):

1. **Check git status**:
   - Run `git status` to see current changes
   - Ensure there are changes to commit
   - Check if already on a feature branch or on master

2. **Create or verify branch**:
   - If on master, ask the user for a branch name and create it using git worktrees:
     - Use `git worktree add -b <branch-name> ../<branch-name>` to create the branch in a new worktree
     - This creates the branch in a sibling directory, keeping the main workspace clean
   - If already on a feature branch, continue with that branch

3. **Commit changes**:
   - Show the user a summary of all changes (git diff and git status)
   - Ask the user for a commit message (or infer one from the changes)
   - Commit all changes with the provided/inferred message
   - Include the standard footer:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

4. **Create pull request**:
   - Push the branch to remote
   - Create a PR using `gh pr create` with:
     - A descriptive title based on the changes
     - A body with Summary, Changes, and Test plan sections
     - Include the standard footer in the PR body
   - Save and display the PR URL

5. **Wait for CI checks**:
   - Monitor PR checks using `gh pr checks`
   - Poll every 30 seconds until all checks pass or fail
   - Show status updates to the user
   - If any checks fail, stop and report which checks failed

6. **Merge PR**:
   - Once all checks are green, use `gh pr merge --squash --auto` to squash and merge
   - Confirm the merge was successful
   - Display the final merge commit

**Important notes**:
- This skips local test execution and relies on CI
- Stop at any step if there are errors and report them to the user
- Always show the user what actions you're taking at each step
- Use the TodoWrite tool to track progress through all steps
- Be explicit about waiting times when polling for CI checks
