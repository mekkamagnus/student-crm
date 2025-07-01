Please analyze and fix the GitHub issue: $ARGUMENTS.

Follow these steps:

1. Use `gh issue view` to get the issue details
2. Understand the problem described in the issue
3. Ask clarifying questions if necessary
4. Understand the prior art for this issue
   - Search the scratchpads for previous thoughts related to the issue
   - Search PRs to see if you can find history on this issue
   - Search the codebase for relevant files
5. Think harder about how to break the issue down into a series of small, manageable tasks.
6. Document your plan in a new scratchpad
   - include the issue name in the filename
   - include a link to the issue in the scratchpad.
7. Create a new branch for the issue (e.g., `feature/issue-123-short-description`). All work for this issue should be done on this branch.
8. For each small, manageable task in your plan:
   a. Write a test that fails (Red step of TDD).
   b. Implement the necessary changes to make the test pass (Green step of TDD).
   c. Refactor the code if necessary (Refactor step of TDD).
   d. Commit the changes with a descriptive message.
9. Ensure code passes linting and type checking.
10. Create a descriptive commit message for the entire issue (if not already done incrementally).
11. Push the branch and create a Pull Request.

Remember to use the GitHub CLI (`gh`) for all GitHub-related tasks.