# Add comments to a PR with Github Actions

A simple action that allows you to add comments to the PR in your workflow.

You can do multiple comments during the workflow execution via different identifiers. See example [bellow](example).

![image](https://user-images.githubusercontent.com/9574457/101458359-14360080-3937-11eb-9e5c-dde50b2687c8.png)


## Inputs

| Name | Description | Required | Default |
| ---- | ----------- | -------- | ------- |
| message | Message that you want in the comment (markdown supported) | message or file | |
| file | Filename of the message (file needs to be placed in `.github/workflows/`) | message or file | |
| single_comment | Would you like to update the existing comment (if exists) instead of creating a new one every time? | no | true |
| identifier | Identifier that we put a comment in the comment so that we can identify them | no | `GITHUB_ACTION_COMMENT_PR` |
| github_token | GitHub token that we use to create/update commit | no | `process.env.GITHUB_TOKEN` |

It's required to provide `message` or `file` input. If both are provided `message` input will be used.

## Output

| Name | Description | Return |
| ---- | ----------- | ------------ |
| commented | Reports status on comment creation | `'true'` / `'false'` |

## Usage

### Simple comment
```yaml
uses: NejcZdovc/comment-pr@v2
with:
  message: "Hello world"
env:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

### Simple comment via file
```yaml
uses: NejcZdovc/comment-pr@v2
with:
  file: "comment.md"
env:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

The file should be placed in `.github/workflows` and it should be `.md`.

### Passing data in md file

```yaml
uses: NejcZdovc/comment-pr@v2
with:
  file: "comment.md"
env:
  GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
  DATA: 'year 2020'
```

When you need to pass data from the workflow info file you just define a new env variable.
That will be automatically replaced in the template.

Example of `comment.md` that uses `DATA` env variable.
```md
It's almost the end of {DATA}!
```

### Multiple comments
By specifying different `identifier` per step we will now track two different comments, and they will be updated accordingly.
```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v3
  - name: Comment Checkout
    uses: NejcZdovc/comment-pr@v2
    with:
      message: "Checkout completed!"
      identifier: "GITHUB_COMMENT_CHECKOUT"
    env:
      GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
  - name: Get time
    uses: actions/github-script@v6
    id: get-time
    with:
        script: return new Date().toString()
        result-encoding: string
  - name: Comment time
    uses: NejcZdovc/comment-pr@v2
    with:
      message: "Execution time: `${{steps.get-time.outputs.result}}`"
      identifier: "GITHUB_COMMENT_SCRIPT"
    env:
      GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

### In action
Checkout workflow in action in this repo, follow this [link](workflow).

## GitHub token

You can pass GitHub token two ways:

#### Via input
```yaml
uses: NejcZdovc/comment-pr@v2
with:
  message: "Hello world"
  github_token: ${{secrets.GITHUB_TOKEN}}
```

#### Via environment variable  
```yaml
uses: NejcZdovc/comment-pr@v2
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
[workflow]: https://github.com/NejcZdovc/comment-pr/blob/main/.github/workflows/example.yml
