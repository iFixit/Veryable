import {addInteractionsByDay, addPullCountsByDay, addPullsAddedByDay, addUniquePullsAddedByDay} from "../controllers/day_controller"

import { prismaMock } from "./prismaMock"
import { interactions, interaction_day_counts, unique_pulls_added, unique_pulls_added_counts, pulls_added, pulls_added_counts, pull_counts, pull_counts_counts } from "./fixtures"

describe('Day Controller', () => {
  describe('Extract Counts from DB', () => {
   test('Add Interactions', async () => {
     prismaMock.pullRequestHistory.groupBy = jest.fn().mockResolvedValueOnce(interactions)

     const multi_day_metrics = {}
     await addInteractionsByDay(multi_day_metrics)
     expect(multi_day_metrics).toMatchObject(interaction_day_counts)
   })

    test('Add Unique Pulls', async () => {
    prismaMock.pullRequestHistory.findMany.mockResolvedValueOnce(unique_pulls_added)

      const multi_day_metrics = {}
      await addUniquePullsAddedByDay(multi_day_metrics)

      expect(multi_day_metrics).toMatchObject(unique_pulls_added_counts)
    })

    test('Add Pulls Added', async () => {
      prismaMock.pullRequestHistory.groupBy = jest.fn().mockResolvedValueOnce(pulls_added)

      const multi_day_metrics = {}
      await addPullsAddedByDay(multi_day_metrics)
      expect(multi_day_metrics).toMatchObject(pulls_added_counts)
    })

    test('Add Pull Counts', async () => {
      prismaMock.pullRequestHistory.findMany.mockResolvedValueOnce(pull_counts)

      const multi_day_metrics = {}
      await addPullCountsByDay(multi_day_metrics)
      expect(multi_day_metrics).toMatchObject(pull_counts_counts)
    })
 })
})