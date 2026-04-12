# Automatic Deployment Setup

This repository is a submodule of the main [helmyl.com](https://github.com/elskow/helmyl.com) repository.

## How It Works

When you push changes to this repository, the `trigger-deploy.yml` workflow automatically:

1. 🚀 Triggers the main repository deployment workflow
2. 📦 Updates the content submodule in the main repo
3. 🔨 Rebuilds the entire website
4. 🌐 Deploys to Cloudflare Pages

## Setup Required

### One-Time Setup: Add PAT Token

1. **Create a Personal Access Token (PAT)**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo` ✓ and `workflow` ✓
   - Generate and copy the token

2. **Add Token to This Repository**:
   - Go to: https://github.com/elskow/site-contents/settings/secrets/actions
   - Click "New repository secret"
   - Name: `PAT_TOKEN`
   - Value: [paste your token]
   - Click "Add secret"

3. **Add the Same Token to Main Repository**:
   - Go to: https://github.com/elskow/helmyl.com/settings/secrets/actions
   - Click "New repository secret"
   - Name: `PAT_TOKEN`
   - Value: [paste the same token]
   - Click "Add secret"

### That's It!

Now whenever you push to this repository, your site will automatically update! 🎉

## Testing

After setup, test it:

```bash
# Make any change
echo "test" >> test.md

# Commit and push
git add test.md
git commit -m "test: trigger auto deploy"
git push
```

Then check:
- ✅ [Actions tab here](https://github.com/elskow/site-contents/actions) - "Trigger Main Site Deployment"
- ✅ [Actions tab in main repo](https://github.com/elskow/helmyl.com/actions) - "Update Content and Redeploy"
- ✅ Your live site at https://helmyl.com

## Manual Trigger

You can also manually trigger deployment:

1. Go to: https://github.com/elskow/site-contents/actions
2. Click "Trigger Main Site Deployment"
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Troubleshooting

### ❌ Workflow Not Running

**Check PAT_TOKEN Secret**:
- Make sure `PAT_TOKEN` exists in [repository secrets](https://github.com/elskow/site-contents/settings/secrets/actions)
- Verify the token hasn't expired
- Ensure token has `repo` and `workflow` permissions

### ❌ Main Site Not Updating

**Check Main Repository**:
- Go to [main repo actions](https://github.com/elskow/helmyl.com/actions)
- Look for "Update Content and Redeploy" workflow
- Check logs for any errors
- Verify `PAT_TOKEN` is also set in main repo

### ❌ Build Errors

**Content Format Issues**:
- Ensure markdown files have correct frontmatter
- Check that dates are in correct format (YYYY-MM-DD)
- Verify image paths are correct
- Test locally in main repo: `cd apps && pnpm build`

## Security Notes

⚠️ **Important**:
- Keep `PAT_TOKEN` secret - never commit it to git
- Rotate the token every 60-90 days for security
- The token gives access to trigger workflows - use with care

## Content Structure

```
apps/contents/
├── .github/
│   └── workflows/
│       └── trigger-deploy.yml  ← This triggers deployment
├── posts/           ← Blog posts
├── projects/        ← Project descriptions  
├── about.md         ← About page
└── uses.md          ← Uses page
```

## Writing Content

### Blog Posts (`posts/`)
```markdown
---
title: Your Post Title
date: 2024-01-01
image: ./optional-image.png
---

Your content here...
```

### Projects (`projects/`)
```markdown
---
name: Project Name
description: Short description
github: https://github.com/user/repo
stacks: [Tech1, Tech2, Tech3]
date: 2024-01-01
priority: 1
---

Detailed project description...
```

## Need Help?

- 📖 [Full documentation](https://github.com/elskow/helmyl.com/blob/master/.github/CONTENT_DEPLOYMENT_SETUP.md)
- 🐛 [Report issues](https://github.com/elskow/helmyl.com/issues)
- 💬 Contact repository owner

---

Happy writing! ✍️
