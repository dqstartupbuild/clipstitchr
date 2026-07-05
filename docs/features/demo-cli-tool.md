# Demo CLI Tool Scope

Use **one command**:

```bash
clipstitchr
```

That should open an interactive CLI where the user can go from zero to finished imported Demo without knowing subcommands.

`npx` is not a requirement. It is only one install/run path. You can support all of these:

```bash
npx clipstitchr
npm install -g clipstitchr
brew install clipstitchr
clipstitchr
```

The npm package can expose a binary named `clipstitchr`, so after install the user just types `clipstitchr`.

**Recommended CLI Shape**

Default interactive mode:

```bash
clipstitchr
```

Then inside:

```text
Welcome to ClipStitchr

/login      Connect your ClipStitchr account
/init       Set up this app
/scan       Find demo-worthy flows
/record     Make a demo
/upload     Send demo to ClipStitchr
/products   Pick a product
/settings   Change recording settings
/help       Show commands
/exit
```

But the user should not need to type those first. The default flow should guide them:

```text
What do you want to do?

1. Make a product demo
2. Upload an existing demo
3. Connect this repo to ClipStitchr
4. Change settings
```

If they choose “Make a product demo,” the CLI walks them through:

1. Detect app type: web, iOS, Android, React Native, Expo, Electron.
2. Ask or infer start command.
3. Ask which ClipStitchr product to use.
4. Scan for likely flows.
5. Generate demo recipe.
6. Let user approve/edit.
7. Record.
8. Export vertical MP4.
9. Upload to Demo library.

**Still Keep Direct Commands**

For power users and CI:

```bash
clipstitchr login
clipstitchr init
clipstitchr scan
clipstitchr demo make
clipstitchr demo upload ./demo.mp4
clipstitchr products list
```

So the mental model is:

- `clipstitchr` = friendly guided app
- `clipstitchr demo make` = scriptable direct action

**Best First-Run Experience**

```bash
clipstitchr
```

CLI says:

```text
No ClipStitchr account connected.

Press Enter to connect your account.
```

It opens the browser, user signs in with Clerk, authorizes the machine, returns to CLI.

Then:

```text
Which product is this demo for?
> LaunchKit
```

Then:

```text
I found a Next.js app.

Start command:
> npm run dev

Local URL:
> http://localhost:3000
```

Then:

```text
I found 4 possible demo flows.

1. Sign up and create first project
2. Upload a clip
3. Build a stitch
4. Export a video

Record all, choose some, or write your own?
```

**Config File**

The CLI can save a local config:

```yaml
productId: prod_123
target:
  type: web
  start: npm run dev
  url: http://localhost:3000
recording:
  format: vertical
  durationLimitSeconds: 60
```

But the user should not have to touch it.

**My Strong Recommendation**

Name the CLI package `clipstitchr`, expose the binary `clipstitchr`, and make the bare command the whole product experience.

`npx clipstitchr` is just the “try it without installing” path. The real UX should be:

```bash
clipstitchr
```

From there, slash commands plus guided prompts can take a user all the way to a finished Demo imported into ClipStitchr.