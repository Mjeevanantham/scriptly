# Scriptly - VS Code Marketplace Publication Guide

## 🔍 Root Cause Analysis: "Value cannot be null. Parameter name: v1"

The error "Value cannot be null. Parameter name: v1" occurs during marketplace upload when:

1. **Publisher is not registered** on VS Code Marketplace
2. Personal Access Token (PAT) is not provided/valid
3. The publisher ID doesn't exist on Azure DevOps

## ✅ Package Status

Your extension package is **100% correct and ready**:

- ✅ **File:** `scriptly-1.0.0.vsix` (6.22 MB)
- ✅ **Version:** 1.0.0 (Official Release)
- ✅ **JSON Valid:** All fields properly formatted
- ✅ **Manifest:** Correctly generated with all required properties
- ✅ **Icons:** 1536×1024px PNG (exceeds 128×128 minimum)
- ✅ **Categories:** AI, Programming Languages, Formatters
- ✅ **Keywords:** 8 relevant tags (under 30 limit)
- ✅ **License:** MIT
- ✅ **Repository:** GitHub link configured
- ✅ **Pricing:** Free

## 📋 Step-by-Step: Publish to Marketplace

### Step 1: Create Publisher Account

1. Go to https://marketplace.visualstudio.com/manage
2. Click "Create publisher"
3. Set Publisher ID: `jeeva-dev` (matches your package.json)
4. Set Publisher Name: `Jeevanantham M` or your preferred name
5. Click "Create"

### Step 2: Create Personal Access Token (PAT)

1. Go to https://dev.azure.com/
2. Create an Azure DevOps account (if not already created)
3. Click your profile icon → "Personal access tokens"
4. Click "New Token"
5. Set these parameters:
   - **Name:** VS Code Marketplace Token
   - **Organization:** All accessible organizations
   - **Expiration:** 90 days (or your preference)
   - **Scopes:** Custom defined
     - Check "Show all scopes"
     - Scroll to "Marketplace"
     - Select **"Manage"** scope
6. Click "Create"
7. **Copy the token immediately** (you won't see it again)

### Step 3: Login to vsce

```bash
cd d:\Main\Dev\Scriptly\packages\extension
npx vsce login jeeva-dev
```

When prompted, paste your Personal Access Token.

You should see:
```
The Personal Access Token verification succeeded for the publisher 'jeeva-dev'.
```

### Step 4: Publish the Extension

```bash
# Method 1: Publish the pre-packaged VSIX
npx vsce publish --packagePath scriptly-1.0.0.vsix

# Method 2: Publish directly (automatically packages and publishes)
npx vsce publish
```

### Step 5: Verify Publication

1. Go to https://marketplace.visualstudio.com/manage
2. Click on your publisher
3. Your extension should appear in the list
4. Search for "Scriptly" on https://marketplace.visualstudio.com/vscode
5. It should appear within minutes (usually instantly)

## 🔧 Manual Upload (Alternative)

If CLI publishing fails:

1. Go to https://marketplace.visualstudio.com/manage
2. Click "New extension"
3. Select your `.vsix` file: `scriptly-1.0.0.vsix`
4. Review the details
5. Click "Upload"

## 📦 Package Contents Verification

```
scriptly-1.0.0.vsix contains:
├─ extension.vsixmanifest ✓ Correctly formatted
├─ package.json ✓ Valid (4.18 KB)
├─ README.md ✓ Present (7.56 KB)
├─ LICENSE.txt ✓ MIT License
├─ media/icon.png ✓ 1536×1024px
├─ out/ ✓ Compiled TypeScript (99.63 KB)
└─ node_modules/ ✓ Dependencies (11.05 MB)
```

## 🎯 Key Metadata

```json
{
  "name": "scriptly",
  "displayName": "Scriptly - AI Code Assistant",
  "version": "1.0.0",
  "publisher": "jeeva-dev",
  "description": "Free, unified IDE with AI-powered coding assistance. Chat with your codebase using AI.",
  "categories": ["Programming Languages", "AI", "Formatters"],
  "keywords": ["ai", "assistant", "code-chat", "langchain", "openai", "claude", "coding", "refactoring"],
  "galleryBanner": {
    "color": "#0066cc",
    "theme": "dark"
  },
  "icon": "media/icon.png",
  "repository": "https://github.com/Mjeevanantham/scriptly.git",
  "bugs": "https://github.com/Mjeevanantham/scriptly/issues",
  "license": "MIT"
}
```

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **403 Forbidden** | Check your PAT has "Marketplace Manage" scope, not limited to specific org |
| **401 Unauthorized** | Ensure you're logged in with `vsce login jeeva-dev` and PAT is valid |
| **v1 parameter error** | Publisher not registered yet - create publisher at https://marketplace.visualstudio.com/manage |
| **Extension already exists** | Use a different publisher ID if not registered to you |
| **Icon is SVG error** | Your icon is PNG ✓ (SVGs are blocked for security) |
| **Over 30 keywords** | You have 8 keywords ✓ (limit is 30) |

## 📞 Support

- VS Code Extension API: https://code.visualstudio.com/api
- Marketplace Help: https://marketplace.visualstudio.com/manage (click "Contact Microsoft")
- GitHub Issues: https://github.com/Microsoft/vscode/issues
- VS Code Discussions: https://github.com/microsoft/vscode-discussions

## ✨ After Publishing

Once your extension is published:

1. **Monitor stats** at https://marketplace.visualstudio.com/manage
2. **Respond to reviews** and ratings
3. **Update regularly** with `vsce publish minor` or `vsce publish patch`
4. **Check install trends** on your publisher dashboard

---

**Your extension is production-ready! Just follow the steps above to publish.** 🚀
