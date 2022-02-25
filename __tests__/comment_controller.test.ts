import { IssueComment } from "@octokit/graphql-schema";
import { parseComment } from "../controllers/comment_controller";

describe('Validate Parsing of Signatures in a Comment', () => {
  describe('Validate QA Stamp Signatures', () => {
    test('No QA Stamp in Comment', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'mcTestyFace' },
        bodyText: "I don't know about this comment",
        createdAt: '2021-12-01T18:58:53Z'
      }
      const signatures = parseComment(comment as IssueComment, 'mcTestyFace')
      expect(signatures.qaed).toBe(false)
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
      const signatures = parseComment(comment as IssueComment, 'mcTestyFace')
      expect(signatures.qaed).toBe(true)
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
      const signatures = parseComment(comment as IssueComment, 'mcTestyFace')
      expect(signatures.dev_block).toBe(null)
    })

    test('Dev Block Stamp in Comment', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'ardelato' },
        bodyText: 'dev_block 🦚\n',
        createdAt: '2021-12-01T18:58:53Z',
      }
      const signatures = parseComment(comment as IssueComment, 'mcTestyFace')
       expect(signatures.dev_block).toBe(true)
    })

     test('Un Dev Block Stamp in Comment', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'ardelato' },
        bodyText: 'Thanks for the feedback! un_dev_block ✌🏻\n' ,
        createdAt: '2021-12-01T18:58:53Z',
      }
      const signatures = parseComment(comment as IssueComment, 'mcTestyFace')
       expect(signatures.dev_block).toBe(false)
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

      const signatures = parseComment(comment as IssueComment, 'mcTestyFace')
      expect(signatures.interacted).toBe(true)
    })

    test('Interacted by non-QA Team Member', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'mcTestyFace' },
        bodyText: 'Im just leaving a comment' ,
        createdAt: '2021-12-01T18:58:53Z',
      }

      const signatures = parseComment(comment as IssueComment, 'tester')
      expect(signatures.interacted).toBe(false)
    })

     test('Interacted by QA Team member but is Pull Author', () => {
      const comment: RecursivePartial<IssueComment> = {
        id: 'IC_kwDOAldSuM46phLj',
        author: { login: 'ardelato' },
        bodyText: 'Im just leaving a comment' ,
        createdAt: '2021-12-01T18:58:53Z',
      }

      const signatures = parseComment(comment as IssueComment, 'ardelato')
      expect(signatures.interacted).toBe(false)
    })
  })
})