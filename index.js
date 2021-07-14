require("dotenv").config();

import { graphql } from "@octokit/graphql";
import ProgressBar from "progress";
import { subtract } from "date-and-time";
import { join } from "path";
import { Low, JSONFile } from "lowdb";

import { repos } from "./config.json";
import { signatures } from "./config.json";

const file = path.join(__dirname, "db.json");
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Initialize JSON Database
await db.read();
db.data ||= [];

// Get Today's date
let today = date.format(new Date(), "MM-DD-YYYY");
let yesterday = date.addDays(today, -1);

// This is to add some flare and show the rate of which we are iterating through repos
const bar = new ProgressBar("repos parsed [:bar] :percent", {
  width: 100,
  total: repos.length,
});
const timer = setInterval(function () {
  bar.tick();
  if (bar.complete) {
    console.log("\ncomplete\n");
    clearInterval(timer);
  }
}, 100);

// Sets Auth token for all future requests
const ghqlAuthed = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});

/* Strucutre
 * @state => Pull Status (OPEN, CLOSED, MERGED)
 * @bodyText => Pull Description (Holds the qa_req_# argument)
 * @commits => Pull commits array (has date commit was made and build status--i.e. CI status)
 * @comments => Pull comments array (has up to the latest 50 comments from a pull)
 */

const PULL_INFO = `
    state,
    bodyText,
    commits(last: 1){
        nodes{
            commit{
                pushedDate,
                status{
                    state
                }
            }
        }
    },
    comments(last:50){
        nodes{
            bodyText,
            createdAt
        }
    },
`;

const GET_OPEN_PULLS = (repo, owner, limitsize) => `
    {
        repository(name: "${repo}", owner: "${owner}") {
            pullRequests(states: OPEN, first: ${limitsize}, orderBy: {field: CREATED_AT, direction: DESC} ) {
                nodes {
                   ${PULL_INFO}
                }
            }
        }
    }
`;

// Automatically run script repeatedly
(async () => {
  main();
  setInterval(main, 60 * 1000);
})();

async function main() {
  let previous_pull_total = db.data[today] || db.data[yesterday] || 0;
  let running_pull_total = 0;
  let day_pull_count = 0;
  console.log("Running script...");

  // Iterate through the list of repos declared in the config.json file
  for (repo of repos) {
    console.log("\tGetting pulls for " + repo.name);
    const all_open_pulls = await ghqlAuthed(
      GET_OPEN_PULLS(repo.name, repo.owner, 50) //Limiting it to 50 open pulls
    );
    running_pull_total += parsePulls(
      all_open_pulls.repository.pullRequests.nodes
    );
  }

  day_pull_count += abs(running_pull_total - previous_pull_total);
  previous_pull_total = running_pull_total;
  console.log("Finished script...");
}

function parsePulls(github_pulls) {
  let current_repo_pulls = 0;
  for (pull of github_pulls) {
    current_repo_pulls += isQAReady(pull);
  }
  return current_repo_pulls;
}

// Iteratres through the Pull Object and retrieves the appropriate base properties
function isQAReady(pull) {
  let build_status = pull.commits.nodes[0].commit.status
    ? pull.commits.nodes[0].commit.status.state
    : "EXPECTED";

  // Want to skip pulls that are failing CI
  if (build_status !== "EXPECTED" || build_status !== "SUCCESS") {
    return 0;
  }

  // Want to skip pulls that are dev_block and already QA'd
  let tags = getTags(pull);
  if (tags.includes("dev_block") || tags.includes("QA")) {
    return 0;
  }

  // Want to skip pulls that are marked as qa_req_0
  let qa_req = qaRequired(pull);
  if (!qa_req) {
    return 0;
  }
  return 1;
}

// Get Signaturse/Stamps
function getTags(pull) {
  let latest_commit_date = new Date(pull.commits.nodes[0].commit.pushedDate);
  let current_tags = [];

  for (comment of pull.comments.nodes) {
    let comment_date = new Date(comment.createdAt);
    // Only get tags associated with the latest commit
    if (subtract(latest_commit_date, comment_date).toDays() <= 0) {
      hasTags(comment.bodyText, current_tags);
    }
  }
  return current_tags;
}

function hasTags(comment, tags) {
  signatures.tags.forEach((tag) => {
    let regex = new RegExp(tag.regex + signatures.emoji, "i");
    if (regex.test(comment)) {
      tags.push(tag.name);
    }
  });
}

// Check if the Pull requires QAing
function qaRequired(pull) {
  let body = pull.bodyText;
  let qa_regex = new RegExp(signatures.qa_req, "i");

  return qa_regex.test(body);
}
