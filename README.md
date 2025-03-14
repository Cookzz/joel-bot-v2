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
- **move**: Get currently playing song or any of the selected queued songs.
  - Usage: `/move <song no.> <to position>`

# Upcoming features
- [ ] Support playlists
- [X] Move songs (for example, from position 5 to 2)
- [X] Remove songs from queue
- [X] Get details of currently playing song
- [X] Show queue list
- [ ] Add loop feature
- [ ] Leave voice call
 
# TODO
- Basic player function like search, pause/resume, skip, repeat, etc.
- Implement worker threads (multi-threading) so that playlists can be processed independently
- Further refactoring (i have a headache just from my own code even though i'm the one who wrote it)

# Notes
- As of 22nd Feb, running on node v21.7.3 without any issues. Recommended node version but you can use any version you'd like, can't guarantee it works though.
- Requires the `bun` package to run. Make sure you have it installed (https://bun.sh/).
- You can leave binaries folder alone. In index.ts, we are downloading automatically to that folder for the required binaries, so if you want to use a different binary, just replace the ones in there with your own.
- Leave tmp folder alone, its just used to store music temp files

