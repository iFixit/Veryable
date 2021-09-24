import { PrismaClient } from '@prisma/client'

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(`.env.${process.env.NODE_ENV || 'dev'}`) });

const prisma = new PrismaClient();


export default prisma