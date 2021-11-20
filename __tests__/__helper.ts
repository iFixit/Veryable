import { Pull } from "@prisma/client"
import prisma from '../prisma/client';


export async function seed_pulls() {
  const pulls: Pull[] = [
    {
        repo: 'iFixit/ifixit',
        pull_number: 39126,
        state: 'CLOSED',
        title:
          'Shopify Hotfix: Add order method to get customer email and use it in return emails',
        head_ref: '1a76cf540ec175ba6874cc3b4915955c40dab2da',
        qa_req: 1,
        created_at: 1628024709,
        updated_at: 1628024709,
        closed_at: 1628024709,
        merged_at: 1628024709,
        closes: null,
        interacted: true,
        interacted_count: 3,
        qa_ready: true,
        qa_ready_count: 5,
      },
      {
        repo: 'iFixit/ifixit',
        pull_number: 35543,
        state: 'MERGED',
        title: 'Stores: extract list provider',
        head_ref: '39f17dd5b7401541bbb98a302787324c3a1b3d3f',
        qa_req: 0,
        created_at: 1608252518,
        updated_at: 1628024709,
        closed_at: 1628024709,
        merged_at: 1628024709,
        closes: null,
        interacted: false,
        interacted_count: 0,
        qa_ready: false,
        qa_ready_count: 0,
      },
      {
        repo: 'iFixit/ifixit',
        pull_number: 38898,
        state: 'OPEN',
        title: 'Polish Community Landing Page',
        head_ref: '718a7bbba843149d06e864d6b9e9b2e89f13100b',
        qa_req: 1,
        created_at: 1627508542,
        updated_at: 1628024709,
        closed_at: 0,
        merged_at: 0,
        closes: null,
        interacted: true,
        interacted_count: 2,
        qa_ready: false,
        qa_ready_count: 4,
      },
      {
        repo: 'iFixit/ifixit',
        pull_number: 38997,
        state: 'OPEN',
        title: 'Correctly delete work log handoffs before deleting work logs',
        head_ref: 'e8f3e4a340d28a0c1e4bd4c786879acf440bcabc',
        qa_req: 1,
        created_at: 1628024709,
        updated_at: 1628024709,
        closed_at: 0,
        merged_at: 0,
        closes: null,
        interacted: false,
        interacted_count: 0,
        qa_ready: false,
        qa_ready_count: 0,
      },
      {
        repo: 'iFixit/valkyrie',
        pull_number: 532,
        state: 'OPEN',
        title: 'Fix translation strings for all categories',
        head_ref: '7ed298440cba90fb4055027feb661d9fa5401c75',
        qa_req: 1,
        created_at: 1628024709,
        updated_at: 1628024709,
        closed_at: 0,
        merged_at: 0,
        closes: 531,
        interacted: false,
        interacted_count: 1,
        qa_ready: true,
        qa_ready_count: 1,
    },
  ]

 try {
    for (const pull of pulls) {
      await prisma.pull.upsert({
        create: pull,
        update: pull,
        where: {
          repo_pull_number: {
            repo: pull.repo,
            pull_number: pull.pull_number,
          }
        }
      })
    }
  } finally {
    prisma.$disconnect
  }
}