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
  if (!identifier) {
    throw new Error('Identifier is should not be empty string, identifier is optional.')
  }
  return `<!-- ${identifier} -->`
}

const getMessage = () => {
  const { message } = getInputs()
  return `${getIdentifier()}\n${message}`
}

const findComment = async (client) => {
  const comments = await client.issues
    .listComments({
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

const getClient = () => {
  const { githubToken } = getInputs()
  if (!githubToken) {
    throw new Error('No github token provided')
  }

  if (!context.issue.number) {
    throw new Error('This is not PR or commenting is disabled.')
  }

  const client = getOctokit(githubToken)
  if (!client) {
    throw new Error('Client couldn\'t be created, make sure that token is correct.')
  }

  return client
}

const comment = async (client) => {
  const { singleComment } = getInputs()
  let commentId = null
  if (singleComment) {
    commentId = await findComment(client)
  }

  console.log(commentId)

  const body = getMessage()
  if (commentId) {
    await client.issues
      .updateComment({
        owner: context.issue.owner,
        repo: context.issue.repo,
        comment_id: commentId,
        body
      })
    core.setOutput('commented', 'true')
    return
  }

  await client.issues
    .createComment({
      issue_number: context.issue.number,
      owner: context.repo.owner,
      repo: context.repo.repo,
      body
    })
}

const run = async () => {
  try {
    await comment(getClient())
    core.setOutput('commented', 'true')
  } catch (error) {
    core.setOutput('commented', 'false')
    core.setFailed(error.message)
  }
}

run()
