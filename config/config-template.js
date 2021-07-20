export default {
  // List all repos you want to iterate through
  "repos": [
    {
      "owner": "repo_owner", // name of the owner for the repo,
      "repo": "repo_name", //name of the repo
    }
  ],
  "signatures": {
    "cr_req": "(?:cr_req )(?<cr_req>[0-9]+)", //Regex for Code Reviews required
    "qa_req": "(?:qa_req )(?<qa_req>[0-9]+)", //Regex for the QA Checks required
    "QA": "\\bQA ", //Regex for QA stamped
    "tags": [
      {
        "name": "dev_block",
        "regex": "\\bdev_block ",
        "state": true
      },
      {
        "name": "un_dev_block",
        "regex": "\\bun_dev_block ",
        "state": false
      },
    ],
    "emoji": "((:[^n:]+)|(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]))" //Regex for emoji unicodes
  }
}