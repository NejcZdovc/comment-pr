# Add comments to a PR with Github Actions

Simple action that allows you to add comments to the PR in your workflow.

You can do multiple comments during the workflow execution via different identifiers. See example [bellow](example).

## Inputs

| Name | Description | Required | Default |
| ---- | ----------- | -------- | ------- |
| message | Message that you want in the comment (markdown supported) | yes | |
| single_comment | Would you like to update existing comment (if exists) instead of creating new one every time? | no | true |
| identifier | Identifier that we put as comment in the comment, so that we can identify them | no | `GITHUB_ACTION_COMMENT_PR` |
| github_token | Github token that we use to create/update commit | yes | |

## Output

| Name | Description | Return |
| ---- | ----------- | ------------ |
| commented | Reports status on comment creation | `'true'` / `'false'` |

## Usage

### Simple comment
```yaml
uses: NejcZdovc/comment-pr@v1
with:
  message: "Hello world"
env:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```


### Multiple comments
With specifying different `identifier` per step we will now track two different comments, and they will be updated accordingly.
```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v2
  - name: Comment Checkout
    uses: NejcZdovc/comment-pr@v1
    with:
      message: "Checkout completed!"
      identifier: "GITHUB_COMMENT_CHECKOUT"
    env:
      GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
  - name: Get time
    uses: actions/github-script@v3
    id: get-time
    with:
        script: return new Date().toString()
        result-encoding: string
  - name: Comment time
    uses: NejcZdovc/comment-pr@v1
    with:
      message: "Execution time: `${{steps.get-time.outputs.result}}`"
      identifier: "GITHUB_COMMENT_SCRIPT"
    env:
      GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```


## Github token

You can pass github token two ways:

#### Via input
```yaml
uses: NejcZdovc/comment-pr@v1
with:
  message: "Hello world"
  github_token: ${{secrets.GITHUB_TOKEN}}
```

#### Via environment variable  
```yaml
uses: NejcZdovc/comment-pr@v1
with:
  message: "Hello world"
env:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

## Bugs
Please file an issue for bugs, missing documentation, or unexpected behavior.

## LICENSE

[MIT](license)

[license]: https://github.com/NejcZdovc/comment-pr/blob/master/LICENSE
[example]: https://github.com/NejcZdovc/comment-pr#multiple-comments
