/*
  This e2e test is meant to ensure the user experience of:

    1. Scaffolding a LoopBack 4 app
    2. Creating a Prisma Schema
    3. Installing the LoopBack 4 Prisma package
      3a. Leveraging Prisma postinstall script to genrate the TypeScript typings
    4. Running basic DML queries against the database
*/

// describe('ML e2e', () => {
//   const sandbox = new TestSandbox('../../.sandbox');
//   const prismaSchemaPath = path.relative(
//     sandbox.path,
//     '../fixtures/schema.prisma',
//   );
//   // const app = new Application();

//   before(() => {
//     execSync(`npx prisma generate --schema=${prismaSchemaPath}`, {
//       cwd: sandbox.path,
//     });
//   });
//   after(() => sandbox.delete());

//   step('creates ');
// });
