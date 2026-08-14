import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simple hash function (must match the one in route.ts)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

async function main() {
  const defaultPassword = "123456";
  const hashedPassword = simpleHash(defaultPassword);

  const admin = await prisma.user.upsert({
    where: { id: "admin-default" },
    update: {},
    create: {
      id: "admin-default",
      name: "System Admin",
      email: "admin@asrgroup.com",
      password: hashedPassword,
      phone: "+8801700000000",
      employeeId: "ADM001",
      department: "Information Technology",
      branch: "Head Office",
      role: "Admin",
      status: "Active",
    },
  });

  console.log("✅ Default admin user seeded:");
  console.log("   Email: admin@asrgroup.com");
  console.log("   Password: 123456");
  console.log("   Role: Admin");
  console.log("   ID:", admin.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
