"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient();
};
const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
exports.default = prisma;
//# sourceMappingURL=database.js.map