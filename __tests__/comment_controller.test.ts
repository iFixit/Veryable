import { IssueComment } from "@octokit/graphql-schema";
import { parseComment, isQAed, isDevBlocked, isInteracted } from "../controllers/comment_controller";
import { GitHubMocks } from "./fixtures";

describe('Validate Parsing of Signatures in a Comment', () => {
  describe('Validate QA Stamp Signatures', () => {
    test('No QA Stamp in Comment', () => {
      expect(isQAed(GitHubMocks.Comment.no_signatures as IssueComment)).toBe(false)
    })

    test('QA Stamp in Comment', () => {
      expect(isQAed(GitHubMocks.Comment.qaed as IssueComment)).toBe(true)
    })
  })

  describe('Validate Dev Block Stamp Signatures', () => {
    test('No Dev Stamp in Comment', () => {
      expect(isDevBlocked(GitHubMocks.Comment.no_signatures as IssueComment)).toBe(null)
    })

    test('Dev Block Stamp in Comment', () => {
      expect(isDevBlocked(GitHubMocks.Comment.dev_blocked as IssueComment)).toBe(true)
    })

     test('Un Dev Block Stamp in Comment', () => {
     expect(isDevBlocked(GitHubMocks.Comment.un_dev_blocked as IssueComment)).toBe(false)
    })
  })

  describe('Validate Interaction Comment', () => {
    test('Interacted by QA Team Member', () => {
      expect(isInteracted(GitHubMocks.Comment.interacted as IssueComment,'mcTestyFace')).toBe(true)
    })

    test('Interacted by non-QA Team Member', () => {
      expect(isInteracted(GitHubMocks.Comment.no_signatures as IssueComment,'tester')).toBe(false)
    })

    test('Interacted by QA Team member but is Pull Author', () => {
      expect(isInteracted(GitHubMocks.Comment.interacted as IssueComment,'ardelato')).toBe(false)
    })
  })

  test('Validate Signature Object', () => {
    const signatures = parseComment(GitHubMocks.Comment.no_signatures as IssueComment, 'mcTestyFace')
    expect(signatures).toMatchObject({
      qaed: expect.any(Boolean),
      dev_block: null,
      interacted: expect.any(Boolean),
    })
  })
})