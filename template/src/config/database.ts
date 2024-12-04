import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  const prisma = new PrismaClient();

  // Add Prisma Client Extensions
  const extendedPrisma = prisma.$extends({
    query: {
      user: {
        async create({ args, query }) {
          if (args.data.email) {
            args.data.email = args.data.email.toLowerCase();
          }
          return query(args);
        },
        async update({ args, query }) {
          if (args.data.email) {
            args.data.email = args.data.email.toString().toLowerCase();
          }
          return query(args);
        },
      },
    },
  });

  return extendedPrisma;
};

declare const globalThis: {
  prismaGlobal?: ReturnType<typeof prismaClientSingleton>;
};

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();



export default prisma;
