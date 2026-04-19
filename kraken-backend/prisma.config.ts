import { defineConfig } from 'prisma/config';
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/uni_jira?schema=public',
  },
});

// import { defineConfig } from 'prisma/config';
// export default defineConfig({
//   schema: 'prisma/schema.prisma',
//   migrations: {
//     path: 'prisma/migrations',
//   },
//   datasource: {
//     url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/uni_jira?schema=public',
//   },
// });
