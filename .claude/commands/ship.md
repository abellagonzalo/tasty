# Ship PR

Automate the complete workflow to ship a pull request:

1. **Run minimum tests locally**:
   - Run frontend tests: `cd frontend && npm test`
   - Run backend tests: `cd backend && npm test`
   - If any tests fail, stop and report the failures

2. **Check git status**:
   - Run `git status` to see current changes
   - Ensure there are changes to commit
   - Check if already on a feature branch or on master

3. **Create or verify branch**:
   - If on master, ask the user for a branch name and create it using git worktrees:
     - Use `git worktree add -b <branch-name> ../<branch-name>` to create the branch in a new worktree
     - This creates the branch in a sibling directory, keeping the main workspace clean
   - If already on a feature branch, continue with that branch

4. **Commit changes**:
   - Show the user a summary of all changes (git diff and git status)
   - Ask the user for a commit message (or infer one from the changes)
   - Commit all changes with the provided/inferred message
   - Include the standard footer:
     ```
     🤖 Generated with [Claude Code](https://claude.com/claude-code)

     Co-Authored-By: Claude <noreply@anthropic.com>
     ```

5. **Create pull request**:
   - Push the branch to remote
   - Create a PR using `gh pr create` with:
     - A descriptive title based on the changes
     - A body with Summary, Changes, and Test plan sections
     - Include the standard footer in the PR body
   - Save and display the PR URL

6. **Wait for CI checks**:
   - Monitor PR checks using `gh pr checks`
   - Poll every 30 seconds until all checks pass or fail
   - Show status updates to the user
   - If any checks fail, stop and report which checks failed

7. **Merge PR**:
   - Once all checks are green, use `gh pr merge --squash --auto` to squash and merge
   - Confirm the merge was successful
   - Display the final merge commit

**Important notes**:
- Stop at any step if there are errors and report them to the user
- Always show the user what actions you're taking at each step
- Use the TodoWrite tool to track progress through all steps
- Be explicit about waiting times when polling for CI checks
