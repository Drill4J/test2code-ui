## For development

npm: https://www.npmjs.com/package/@drill4j/test2code-ui

For development you need a [node.js](https://nodejs.org).

To launch the development environment, follow these steps:

1. open console from the project root
2. run the command `npm install`
3. run the command `npm run start`
4. clone [admin-ui-root-config repo](https://github.com/Drill4J/admin-ui)
5. use guide from admin-ui-root-config repo to run it 
6. open admin-ui-root-config application and test2code will load to it   
7. enjoy the development.

## Notes
 
### Be sure that port 8080 is available

If port 8080 is unavailable you should change port in `start` script. Open `use-plugin-urls.ts` file in admin-ui-root-config repo and update url t test2code in the `devModePaths` pbject
