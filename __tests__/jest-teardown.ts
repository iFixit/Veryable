import prisma from "../prisma/client";

export default async function teardown()
{
  console.log('Executing teardown...')
  await prisma.day.deleteMany()
  await prisma.pull.deleteMany()
  await prisma.$disconnect();
}