# Tooling

This project uses typescript, built using vite, deployed on github pages, eslint for linting, and jest for some limited unit testing.

After cloning this repo, run `npm install` to get all dependencies. To build a local version of the site, run `npm run dev`. To run unit tests, run `npm run test`. For a full list of commands, see the package.json.

When you try to commit any changes eslint and jest will run to pre-check changes. If eslint raises any errors, or any of the unit tests fail, then the commit cannot be pushed. Once a change is pushed, a workflow is used to build and deploy the website automatically.

Always make sure that the deployment was successful. There are times when the deployment will fail for one reason or another.