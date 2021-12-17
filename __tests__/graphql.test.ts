import { validate } from "@octokit/graphql-schema"
import config from '../config/graphql_config'

const get_open_pulls = config.GET_OPEN_PULLS
const get_pull = config.GET_PULL
const get_issue = config.GET_ISSUE
const get_day_issues = config.GET_DAY_ISSUES
const get_issues = config.GET_ISSUES
const get_open_pulls_timelines = config.GET_OPEN_PULLS_TIMELINES
const get_pulls_timelines = config.GET_PULLS_TIMELINES
const get_pull_timeline = config.GET_PULL_TIMELINE

describe('validate GitHub GraphQL Queries', () => {

  test('get open pulls', () => {
    const errors = validate(get_open_pulls('name', 'owner', 50))
    expect(errors.length).toEqual(0)
  })

  test('get a pull', () => {
    const errors = validate(get_pull('name', 'owner', 3000))
    expect(errors.length).toEqual(0)
  })

  test('get issues', () => {
    const errors = validate(get_issues('name', 'owner'))
    expect(errors.length).toEqual(0)
  })

  test('get an issue', () => {
    const errors = validate(get_issue('name', 'owner', 3000))
    expect(errors.length).toEqual(0)
  })
  test('get day issues', () => {
    const errors = validate(get_day_issues('name', 'owner', 50, '2021-11-24 15:10:37 -08:00'))
    expect(errors.length).toEqual(0)
  })

  test('get open pulls with timeline', () => {
    const errors = validate(get_open_pulls_timelines('name', 'owner', 50))
    expect(errors.length).toEqual(0)
  })

   test('get pulls with timeline', () => {
      const errors = validate(get_pulls_timelines('name', 'owner', 50))
    expect(errors.length).toEqual(0)
   })
  
   test('get a pull with timeline', () => {
      const errors = validate(get_pull_timeline('name', 'owner',3000))
    expect(errors.length).toEqual(0)
  })
})