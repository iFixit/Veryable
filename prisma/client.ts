import { PrismaClient } from '@prisma/client'

import path from 'path';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const env = dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`) });
dotenvExpand(env)

const prisma = new PrismaClient();

export default prisma