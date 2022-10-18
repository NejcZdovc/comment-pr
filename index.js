import { context, getOctokit } from '@actions/github'
const core = require('@actions/core')
const { promises: fs } = require('fs')
const path = require('path')

const getInputs = () => ({
  message: core.getInput('message'),
  file: core.getInput('file'),
  singleComment: core.getInput('single_comment') === 'true',
  identifier: core.getInput('identifier'),
  githubToken: core.getInput('github_token') || process.env.GITHUB_TOKEN
})

const getIdentifier = () => {
  const { identifier } = getInputs()
  if (!identifier) {
    throw new Error('Identifier should not be an empty string, identifier is optional.')
  }
  return `<!-- ${identifier} -->`
}

const getFileContent = async () => {
  const { file } = getInputs()

  if (!file) {
    return null
  }

  const filePath = path.resolve(process.cwd(), `.github/workflows/${file}`)
  const content = await fs.readFile(filePath, 'utf8')
  if (!content) {
    return null
  }

  return content.replace(/{\w+}/g, (key) => {
    const envKey = key.substring(1, key.length - 1)
    if (process.env[envKey]) {
      return process.env[envKey]
    }

    return key
  })
}

const getMessage = async () => {
  const { message } = getInputs()

  let body
  if (!message) {
    body = await getFileContent()
  } else {
    body = message
  }

  if (!body) {
    throw new Error('You need to provide message or file input')
  }

  return `${getIdentifier()}\n${body}`
}

const findComment = async (client) => {
  const comments = await client.rest.issues
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
    throw new Error('This is not a PR or commenting is disabled.')
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

  const body = await getMessage()
  if (commentId) {
    await client.rest.issues
      .updateComment({
        owner: context.issue.owner,
        repo: context.issue.repo,
        comment_id: commentId,
        body
      })
    core.setOutput('commented', 'true')
    return
  }

  await client.rest.issues
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
