# Introduction

Joel is a strong bot now.

It can play youtube music with hacky workarounds.
I can make it work in windows but since I want to get this running on a raspberry pi, I'm planning to prepare a binary for linux as well.

We want to be independent from youtube's api token, so we might remove that soon.

# How to use

Setup a config.json file.
```json
{
    "TOKEN": "YOUR_BOT_TOKEN",
    "YOUTUBE_API_KEY": "YOUR_YOUTUBE_API_KEY",
    "CLIENT_ID": "YOUR_BOT_CLIENT_ID"

}
```

Then run the bot with `bun run start`.

Voila, you can now play music in your Discord server! 🎉

# Commands
- **play**: Plays a song from YouTube (link only for now).
  - Usage: `/play <youtube link>`

# TODO
- Basic player function like search, pause/resume, skip, repeat, etc.
- Further refactoring (i have a headache just from my own code even though i'm the one who wrote it)

# Notes
- As of 22nd Feb, running on node v21.7.3 without any issues. Recommended node version but you can use any version you'd like, can't guarantee it works though.
- Requires the `bun` package to run. Make sure you have it installed (https://bun.sh/).
- You can leave binaries folder alone. In index.ts, we are downloading automatically to that folder for the required binaries, so if you want to use a different binary, just replace the ones in there with your own.

