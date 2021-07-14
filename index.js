const { graphql } = require("@octokit/graphql");
const ProgressBar = require("progress");
const date = require("date-and-time");

require("dotenv").config();

const repos = require("./config.json").repos;
const signatures = require("./config.json").signatures;

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

const PULL_INFO = `
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
                totalCount
                nodes {
                   ${PULL_INFO}
                }
            }
        }
    }
`;

(async () => {
    main();
    setInterval(main, 60 * 1000);
})();

async function main() {
    console.log("Running script...");

    for (repo of repos) {
        console.log("\tGetting pulls for " + repo.name);
        const all_open_pulls = await ghqlAuthed(
            GET_OPEN_PULLS(repo.name, repo.owner, 50) //Limiting it to 50 open pulls
        );
        await parsePulls(all_open_pulls.repository.pullRequests.nodes);
        // bar.tick();
        // if (bar.complete) {
        //   console.log("\ncomplete\n");
        // }
    }
    console.log("Finished script...");
}

async function parsePulls(github_pulls) {
    for (pull of github_pulls) {
        getBaseProperties(pull);
    }
}

function getBaseProperties(pull) {
    let build_status = pull.commits.nodes[0].commit.status
        ? pull.commits.nodes[0].commit.status.state
        : "EXPECTED";
    if (build_status !== "EXPECTED" || build_status !== "SUCCESS") {
        return;
    }


    let tags = getTags(pull);
    if(tags.includes('dev_block')){
        return;
    }

    
}

// Get Signaturse or Stamps
function getTags(pull) {
    let latest_commit_date = new Date(pull.commits.nodes[0].commit.pushedDate);
    let current_tags = [];

    for (comment of pull.comments.nodes) {
        let comment_date = new Date(comment.createdAt);
        if (date.subtract(latest_commit_date, comment_date).toDays() <= 0) {
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
