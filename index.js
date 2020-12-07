import { context, getOctokit } from '@actions/github'
const core = require('@actions/core')

const getInputs = () => ({
  message: core.getInput('message'),
  singleComment: core.getInput('single_comment') === 'true',
  identifier: core.getInput('identifier'),
  githubToken: core.getInput('github_token') || process.env.GITHUB_TOKEN
})

const getIdentifier = () => {
  const { identifier } = getInputs()
  return `<!-- ${identifier} -->`
}

const getMessage = () => {
  const { message } = getInputs()
  return `${getIdentifier}\n${message}`
}

const findComment = async (client) => {
  const comments = await client.issues.listComments({
    owner: context.issue.owner,
    repo: context.issue.repo,
    issue_number: context.issue.number
  })

  const identifier = getIdentifier()
  for (const comment of comments.data) {
    if (comment.body.startsWith(identifier)) {
      return comment.id
    }
  }

  return null
}

const run = async () => {
  const { githubToken, singleComment } = getInputs()
  if (!githubToken) {
    core.setOutput('commented', 'false')
    core.setFailed('no github token provided')
    return
  }

  if (!context.issue.number) {
    core.setOutput('commented', 'false')
    core.setFailed('This is not PR or commenting is disabled')
    return
  }

  const client = getOctokit(githubToken)
  if (!client) {
    core.setOutput('commented', 'false')
    core.setFailed('Client couldn\'t be created, make sure that token is correct')
    return
  }

  let commentId = null
  if (singleComment) {
    commentId = findComment(client)
  }

  const body = getMessage()
  if (commentId) {
    await client.issues.updateComment({
      owner: context.issue.owner,
      repo: context.issue.repo,
      comment_id: commentId,
      body
    })
    core.setOutput('commented', 'true')
    return
  }

  await client.issues.createComment({
    issue_number: context.issue.number,
    owner: context.repo.owner,
    repo: context.repo.repo,
    body
  })
  core.setOutput('commented', 'true')
}

try {
  run()
} catch (error) {
  core.setOutput('commented', 'false')
  core.setFailed(error.message)
}
