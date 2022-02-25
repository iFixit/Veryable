import { IssueComment } from "@octokit/graphql-schema";
import { parseComment, isQAed, isDevBlocked, isInteracted } from "../controllers/comment_controller";

describe('Validate Parsing of Signatures in a Comment', () => {
  describe('Validate QA Stamp Signatures', () => {
    test('No QA Stamp in Comment', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'mcTestyFace' },
        bodyText: "I don't know about this comment",
        createdAt: '2021-12-01T18:58:53Z'
      }
      expect(isQAed(comment as IssueComment)).toBe(false)
    })

    test('QA Stamp in Comment', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'ardelato' },
        bodyText: 'QA 🎬\n' +
          'Creating orders with custom items:\n' +
          '\n' +
          "Doesn't trigger any exceptions\n" +
          "Don't save to the database",
        createdAt: '2021-12-01T18:58:53Z',
      }
      expect(isQAed(comment as IssueComment)).toBe(true)
    })
  })

  describe('Validate Dev Block Stamp Signatures', () => {
    test('No Dev Stamp in Comment', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'deltuh-vee' },
        bodyText: 'QA 🎬\n' +
          'Creating orders with custom items:\n' +
          '\n' +
          "Doesn't trigger any exceptions\n" +
          "Don't save to the database",
        createdAt: '2021-12-01T18:58:53Z'
      }
      expect(isDevBlocked(comment as IssueComment)).toBe(null)
    })

    test('Dev Block Stamp in Comment', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'ardelato' },
        bodyText: 'dev_block 🦚\n',
        createdAt: '2021-12-01T18:58:53Z',
      }
      expect(isDevBlocked(comment as IssueComment)).toBe(true)
    })

     test('Un Dev Block Stamp in Comment', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'ardelato' },
        bodyText: 'Thanks for the feedback! un_dev_block ✌🏻\n' ,
        createdAt: '2021-12-01T18:58:53Z',
      }
     expect(isDevBlocked(comment as IssueComment)).toBe(false)
    })
  })

  describe('Validate Interaction Comment', () => {
    test('Interacted by QA Team Member', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'ardelato' },
        bodyText: 'Im just leaving a comment' ,
        createdAt: '2021-12-01T18:58:53Z',
      }

      expect(isInteracted(comment as IssueComment,'mcTestyFace')).toBe(true)
    })

    test('Interacted by non-QA Team Member', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'mcTestyFace' },
        bodyText: 'Im just leaving a comment' ,
        createdAt: '2021-12-01T18:58:53Z',
      }

      expect(isInteracted(comment as IssueComment,'tester')).toBe(false)
    })

     test('Interacted by QA Team member but is Pull Author', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'ardelato' },
        bodyText: 'Im just leaving a comment' ,
        createdAt: '2021-12-01T18:58:53Z',
      }

      expect(isInteracted(comment as IssueComment,'ardelato')).toBe(false)
    })
  })

  test('Validate Signature Object', () => {
    const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'deltuh-vee' },
        bodyText: 'QA 🎬\n' +
          'Creating orders with custom items:\n' +
          '\n' +
          "Doesn't trigger any exceptions\n" +
          "Don't save to the database",
        createdAt: '2021-12-01T18:58:53Z'
    }
    const signatures = parseComment(comment as IssueComment, 'mcTestyFace')
    expect(signatures).toMatchObject({
      qaed: expect.any(Boolean),
      dev_block: null,
      interacted: expect.any(Boolean),
    })
  })
})