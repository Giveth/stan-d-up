# Standup Bot

A Discord bot that automates daily standups with GitHub integration. It DMs contributors at a scheduled time to collect updates, then compiles and posts them to a designated channel.

## Features

- **Scheduled DM prompts** — Automatically DMs all members with a configured role at a set time (CET, weekdays)
- **Update collection** — Contributors reply via DM with text updates, supporting multiple messages
- **Compiled standup posts** — All updates are formatted and posted to an output channel at standup time
- **GitHub link detection** — Recognizes `owner/repo#123` shorthand and full GitHub URLs, enriches them with title/state via the API
- **GitHub activity summary** — Includes open PRs and recent issues from connected repos in the standup post
- **`/github-issue` slash command** — Search and reference GitHub issues directly from Discord with autocomplete

## Prerequisites

- Node.js 20+ (22 recommended)
- A Discord bot application (see setup below)
- A GitHub personal access token (for GitHub features)

## Discord Developer Setup

### 1. Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** in the top right
3. Give it a name (e.g. "Standup Bot") and click **Create**

### 2. Create the Bot User

1. In your application, go to the **Bot** tab in the left sidebar
2. Click **"Reset Token"** to generate a bot token
3. **Copy the token** — you'll need it for `DISCORD_TOKEN` in your `.env`
4. You will only see this token once. If you lose it, you'll need to reset it again.

### 3. Configure Bot Permissions & Intents

Still on the **Bot** tab:

1. Scroll down to **"Privileged Gateway Intents"**
2. Enable **all three** intents:
   - **Presence Intent** — not strictly required, but useful for future features
   - **Server Members Intent** — **required** to fetch members by role
   - **Message Content Intent** — **required** to read DM message content

### 4. Generate the Invite URL

1. Go to the **OAuth2** tab in the left sidebar
2. Under **OAuth2 URL Generator**, select the following scopes:
   - `bot`
   - `applications.commands`
3. Under **Bot Permissions**, select:
   - **Send Messages**
   - **Send Messages in Threads**
   - **Embed Links**
   - **Read Message History**
   - **Use Slash Commands**
4. Copy the generated URL at the bottom and open it in your browser
5. Select your server and click **Authorize**
6. The generated URL should be: https://discord.com/oauth2/authorize?client_id=1483136003450601744&permissions=277025474560&integration_type=0&scope=bot+applications.commands

### 5. Get Your Server and Channel IDs

To get Discord IDs, you need to enable **Developer Mode**:

1. Open Discord Settings > **Advanced** > Enable **Developer Mode**
2. **Server ID**: Right-click your server name in the sidebar > **Copy Server ID**
3. **Channel ID**: Right-click the channel you want standup posts in > **Copy Channel ID**
4. **Role ID**: Go to Server Settings > Roles > right-click the role > **Copy Role ID**

## GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Click **"Generate new token"**
3. Give it a descriptive name (e.g. "standup-bot")
4. Set the expiration as needed
5. Under **Repository access**, select the repos you want the bot to access
6. Under **Permissions > Repository permissions**, grant:
   - **Issues**: Read
   - **Pull requests**: Read
7. Click **Generate token** and copy it for `GITHUB_TOKEN` in your `.env`

## Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd standup-bot

# Install dependencies
npm install

# Copy the example env and fill in your values
cp .env.example .env
```

## Configuration

Edit `.env` with your values:

```env
# Discord Bot
DISCORD_TOKEN=your-bot-token-here
DISCORD_SERVER_ID=123456789012345678
DISCORD_ROLE_ID=123456789012345678
DISCORD_OUTPUT_CHANNEL_ID=123456789012345678
ADMIN_USER_ID=123456789012345678

# Schedule (HH:mm in CET)
DM_TIME=09:00
STANDUP_TIME=12:00
STANDUP_DAYS=MON,TUE,WED,THU,FRI

# GitHub
GITHUB_TOKEN=ghp_your-token-here
GITHUB_REPOS=your-org/repo1,your-org/repo2
```

| Variable                    | Description                                                       |
| --------------------------- | ----------------------------------------------------------------- |
| `DISCORD_TOKEN`             | Bot token from the Discord Developer Portal                       |
| `DISCORD_SERVER_ID`         | The guild (server) ID where the bot operates                      |
| `DISCORD_ROLE_ID`           | The role ID — members with this role will be prompted for updates |
| `DISCORD_OUTPUT_CHANNEL_ID` | The channel where compiled standups are posted                    |
| `ADMIN_USER_ID`             | Your Discord user ID — only this user can run admin commands       |
| `DM_TIME`                   | Time to DM contributors (HH:mm, CET timezone)                     |
| `STANDUP_TIME`              | Time to post the compiled standup (HH:mm, CET timezone)            |
| `STANDUP_DAYS`              | Comma-separated days to run: `MON,TUE,WED,THU,FRI` (default: weekdays) |
| `GITHUB_TOKEN`              | GitHub personal access token for API access                       |
| `GITHUB_REPOS`              | Comma-separated list of `owner/repo` to track                     |

## Usage

```bash
# Development (hot reload)
npm run dev

# Production
npm start

# Build to JavaScript
npm run build
npm run start:prod
```

## How It Works

1. **At `DM_TIME`** (weekdays) — the bot DMs every member with the configured role, asking for their standup update
2. **Contributors reply via DM** — they can send multiple messages, reference GitHub issues (`owner/repo#123` or full URLs), and mention other contributors
3. **At `STANDUP_TIME`** — all collected updates are compiled into a formatted embed and posted to the output channel, with GitHub references enriched (title, state) and an activity summary of open PRs/issues

### Slash Commands

| Command            | Description                                                                                                    |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `/github-issue`    | Browse and reference GitHub issues from connected repos. Has autocomplete for repo selection and issue search. |
| `/test-prompt`     | Manually trigger the DM standup prompt (admin only)                                                            |
| `/test-standup`    | Manually trigger the compiled standup post (admin only)                                                        |
| `/standup-status`  | Show current cycle status: who was prompted, who responded, who's pending (admin only)                         |

### Testing the Bot

The admin commands above let you test the full cycle without waiting for cron:

1. Run `npm run dev` to start the bot
2. Use `/test-prompt` in Discord — this sends DM prompts to all role members immediately
3. Reply to the bot's DM with a test update (try including `owner/repo#1` to test GitHub refs)
4. Use `/standup-status` to verify your response was collected
5. Use `/test-standup` to trigger the compiled standup post to the output channel

## Project Structure

```
src/
├── index.ts              # Entry point
├── config.ts             # Environment config loader
├── types.ts              # Shared TypeScript interfaces
├── bot.ts                # Discord.js client setup
├── store.ts              # In-memory update store
├── cron/                 # Scheduled jobs
│   ├── index.ts          # Cron registration
│   ├── dmPrompt.ts       # DM prompt sender
│   └── standupPost.ts    # Standup compiler & poster
├── collectors/
│   └── dmCollector.ts    # DM reply handler
├── github/               # GitHub integration
│   ├── client.ts         # Octokit instance
│   ├── links.ts          # Link detection & enrichment
│   ├── issues.ts         # Issue search & fetch
│   └── activity.ts       # PR/issue activity summary
├── commands/             # Slash commands
│   ├── register.ts       # Command registration
│   ├── handler.ts        # Interaction router
│   └── githubIssue.ts    # /github-issue command
└── formatters/           # Discord embed builders
    ├── standupEmbed.ts   # Standup embed formatter
    └── githubEmbed.ts    # Issue/PR embed formatter
```

## License

This project is licensed under the GNU General Public License v3.0. See [LICENSE](LICENSE) for details.
