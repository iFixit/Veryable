import prisma from "../prisma/client";

export default async function teardown()
{
  console.log('Executing teardown...')
  await prisma.day.deleteMany()
  await prisma.pullRequest.deleteMany()
  await prisma.$disconnect();
}