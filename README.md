# Introduction

Joel is a strong bot now.

It can play youtube music with hacky workarounds.

# How to use

Setup a config.json file.
```json
{
    "TOKEN": "YOUR_BOT_TOKEN",
    "CLIENT_ID": "YOUR_BOT_CLIENT_ID"
}
```
Where to get: https://discord.com/developers/applications

Then run the bot with `bun run start`.

Voila, you can now play music in your Discord server! 🎉

# Commands
- **play**: Plays a song from YouTube (link and search supported, no playlist).
  - Usage: `/play <youtube link or name>`
- **skip**: Skip to the next song (if any).
  - Usage: `/skip`
- **pause**: Pause current song.
  - Usage: `/pause`
- **resume**: Resume currently paused song.
  - Usage: `/resume`
- **np**: Get currently playing song or any of the selected queued songs.
  - Usage: `/np <song number>`
- **queue**: Get currently playing song or any of the selected queued songs.
  - Usage: `/queue <page number>`
- **remove**: Get currently playing song or any of the selected queued songs.
  - Usage: `/remove <song no.>`
- **clear**: Clear all queued songs except currently playing one
  - Usage: `/clear`
- **move**: Get currently playing song or any of the selected queued songs.
  - Usage: `/move <song no.> <to position>`
- **loop**: Loop currently queued list of songs (and also caches the songs that were played before when its enabled)
  - Usage: `/loop`
- **leave**: Leave the current voice call
  - Usage: `/leave`
- **help**: Get a list of commands that this bot has
  - Usage: `/help`

# Features
- [X] Play songs via youtube link
- [X] Play songs via search with name
- [X] Supports other basic music bot functionality such as skip, pause, resume, etc.
- [ ] Support playlists
- [X] Move songs (for example, from position 5 to 2)
- [X] Remove songs from queue
- [X] Fully clear an entire queue including downloads (if loop isn't enabled, so cached ones are safe)
- [X] Get details of currently playing song
- [X] Show queue list
- [X] Add loop feature
- [X] Leave voice call
 
# TODO
- Have a proper working playlist support (previous attempts bricked the bot)
- Implement worker threads (multi-threading) so that playlists can be processed independently
- Further refactoring (i have a headache just from my own code even though i'm the one who wrote it)

# Notes
- As of 15 March 2025, running on node v21.7.3 & v23.10.0 without any issues. Recommended node version but you can use any version you'd like, can't guarantee it works though.
- Requires the `bun` package to run. Make sure you have it installed (https://bun.sh/).
- You can leave binaries folder alone. In index.ts, we are downloading automatically to that folder for the required binaries, so if you want to use a different binary, just replace the ones in there with your own.
- Leave tmp folder alone, its just used to store music temp files

