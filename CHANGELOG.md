## 0.3.0 (2026-10-22)
* feature: add multithreading support ([b04b2e8](https://github.com/Cookzz/joel-bot-v2/commit/b04b2e81b90961e51a8609c379011a261b41b0ae))
* fix: overwriting audio player breaks disconnect listener ([2d9cd3a](https://github.com/Cookzz/joel-bot-v2/commit/2d9cd3a33a583979a51d51b1eb293e78ddb87233))
* chore: remove ky, changed sodium package to native ([719f3d0](https://github.com/Cookzz/joel-bot-v2/commit/719f3d023c740cf443047bbb901fec862f754d92))
* chore: remove check for connection when song is empty ([c603631](https://github.com/Cookzz/joel-bot-v2/commit/c60363194a6e9a6ff1e56eab83718ea6ff2023b8))
* fix: search crash due to flipped options ([3c259e5](https://github.com/Cookzz/joel-bot-v2/commit/3c259e574337cfcc910eddabc488ef68c22c17e5))
* feature: deprecate ytdl-core for youtubei.js ([d656304](https://github.com/Cookzz/joel-bot-v2/commit/d65630410cfad3d6a6547a3e9f74390f6ee20c78))
* bugfix: fetching video info causing crashes ([e274bbb](https://github.com/Cookzz/joel-bot-v2/commit/e274bbb0c00a4d69ad29b7589de2fa5dc66bcf17))
* chore: improve type definition in codebase ([38fc244](https://github.com/Cookzz/joel-bot-v2/commit/38fc244a60789f79d701736b94b13ec778afc56a))
* bugfix: upgrade @discordjs/voice to 0.19.0 ([45a2fd0](https://github.com/Cookzz/joel-bot-v2/commit/45a2fd09a211cac36e4666ea1eb19442da81c6f4))
* chore: upgrade to typescript 7 ([254c10b](https://github.com/Cookzz/joel-bot-v2/commit/254c10beb135593f6eda86ee8fea9caaa254d996))
* feature: leave if no user is in channel ([6315fe7](https://github.com/Cookzz/joel-bot-v2/commit/6315fe7863222a72af488752ae6ae985b2a19052))
* fix: crash when leaving mid-playing music ([2c44c4a](https://github.com/Cookzz/joel-bot-v2/commit/2c44c4a6baa2a3c5542fd24efb3b1565bcbfbc2b))
* feature: include support for playlist ([5404085](https://github.com/Cookzz/joel-bot-v2/commit/5404085c5756230ac39abf0baf6973debae3baa2))
* fix: youtubei module cache issue ([f7ebd30](https://github.com/Cookzz/joel-bot-v2/commit/f7ebd3031b454249f781ae096eb6bb043bc1c045))
* chore: include worker file into build ([71b2212](https://github.com/Cookzz/joel-bot-v2/commit/71b2212e1e6443130caee3ec429e0ce43b7f0c0d))
* chore: change to opusscript ([40e5ad6](https://github.com/Cookzz/joel-bot-v2/commit/40e5ad6bd4e3d872e11ab0851c987782479873f7))


## 0.2.2 (2025-03-30)

* fix: incorrect input validation ([0157987](https://github.com/Cookzz/joel-bot-v2/commit/01579872338af734782fed811832cde44a2284cb))
* Updated @distube/ytdl-core to 4.16.5 & bun to 1.2.8 ([958e7cb](https://github.com/Cookzz/joel-bot-v2/commit/958e7cbe8bde6c81c6ca0682c7094678953a2c86), [560489a](https://github.com/Cookzz/joel-bot-v2/commit/560489a7752989f0e4d276440a4e35d97ea6e1f0))
* Removed "--minify" from linux build due to breaking discordjs ([96276ba](https://github.com/Cookzz/joel-bot-v2/commit/96276ba11493ef9da6407c4cf5f08a790ccf40cc))
* chore: add custom try-catch handler ([da0fac8](https://github.com/Cookzz/joel-bot-v2/commit/da0fac8f785896bb4aac39508d2c1f824cc2cc6c))
* fix: crash due to unable to fetch song info with ytdlCore ([bb4b6dc](https://github.com/Cookzz/joel-bot-v2/commit/bb4b6dcc9160d9d27c81184520497edc4b2de838))
* fix: wrong splicing when moving ([76f3e7e](https://github.com/Cookzz/joel-bot-v2/commit/76f3e7eb6d09c1457f608629821fed0e8de3b138))


## 0.2.1 (2025-03-16) - HOTFIX

* Fixed yt-dlp binary typo ([2a830e2](https://github.com/Cookzz/joel-bot-v2/commit/2a830e2b199ab68616f6bd6319f646169f8b00f2))
* Fixed incorrect wrong yt-dlp binary extension ([5f04017](https://github.com/Cookzz/joel-bot-v2/commit/5f0401767c4c7a0fbb9e2a7c4d96c418d85d56fa))

## 0.2.0 (2025-03-16)

First release - windows-only support

* feature: add check song details function ([cc7ba30](https://github.com/Cookzz/joel-bot-v2/commit/cc7ba30730d493ab95ca67f8bf5a2cfe874f0e6d))
* feature: queue list ([f1be767](https://github.com/Cookzz/joel-bot-v2/commit/f1be7672fcc919c1fa41ec5d728d54d427271e99))
* feature: add remove song ([59eff70](https://github.com/Cookzz/joel-bot-v2/commit/59eff703db902d31726dbcf4a45d8ef35f057cb1), [f26feb9](https://github.com/Cookzz/joel-bot-v2/commit/f26feb9a3e756ecdc42814dce57fd35a160e9aa3), [c491617](https://github.com/Cookzz/joel-bot-v2/commit/c4916175804608c0eb37a6bcc058249ab56dfdf7))
* feature: add function to move song position ([ef14e57](https://github.com/Cookzz/joel-bot-v2/commit/ef14e57495ecbed161fe803be6acae84ea897bc0))
* feature: add help command ([55283ab](https://github.com/Cookzz/joel-bot-v2/commit/55283abcd4f2df82d599d9cd21178aa77aa9f944))
* feature: add loop function ([97b02ed](https://github.com/Cookzz/joel-bot-v2/commit/97b02ed03dc584cec6be9c91da36ac1762a8fd0e))
* feature: add leave function ([7cc89fe](https://github.com/Cookzz/joel-bot-v2/commit/7cc89fea9730eacd96850f72ff9b4c01d4f3a66b))
* feature: add clear queue function ([4be04bb](https://github.com/Cookzz/joel-bot-v2/commit/4be04bb7daf4da5cc563b7ea96be6a2d1161097d))
* fixed crashes ([3cae422](https://github.com/Cookzz/joel-bot-v2/commit/3cae422cf82a5c95bc856e2df533d9be141bd511), [486babe](https://github.com/Cookzz/joel-bot-v2/commit/486babef7879c3c00a7f6f9d3a99c7b111c31410))
* fixed event listenenr memory leak ([59a194d](https://github.com/Cookzz/joel-bot-v2/commit/59a194d17b5dd6b17cd143fb42578fb7e58c02be))
* chore: added binary check & download ([2a166c2](https://github.com/Cookzz/joel-bot-v2/commit/2a166c23ebacf8cfe6ce20a7c906f584adf7a77a))
* Bug fixes & improvements (refer to commit list)
* Updated @types/bun: 1.2.4 -> 1.2.5
* Updated typescript: 5.7.4 -> 5.8.2


## 0.1.0 (2025-02-23)

Initial release (but not an actual release yet)

([PR Changes](https://github.com/Cookzz/joel-bot-v2/pull/1))
* Updated to latest discord.js v14 from v12
* Moved to Bun from nodejs/npm
* Removed node_modules (why do we keep this in the repo??)
* Almost full code change to work with the latest discordjs functions/api
* Kept a few of the old files/classes as they logically still work
* Updated from plain JavaScript to TypeScript
* Removed socket.io
* chore: remove unnecessary tmp files ([a7ab520](https://github.com/Cookzz/joel-bot-v2/commit/a7ab520b9cfc853fd050d9d50d7566f706a13900))
* chore: updated dependencies ([bb2aa21](https://github.com/Cookzz/joel-bot-v2/commit/bb2aa217b002be413b39f381e4403d191e0e255b), [6409055](https://github.com/Cookzz/joel-bot-v2/commit/6409055c22e016d46e84e749d46f296dc4376985))
* chore: remove dependencies that we don't need ([1edda8d](https://github.com/Cookzz/joel-bot-v2/commit/1edda8d3f4cbf2261b0e29a815afed816df0b97c))
* feature: added play music function ([0956452](https://github.com/Cookzz/joel-bot-v2/commit/09564520666a65f6424e0fe0788b28cf9c5c7657))
* feature: added music skip function ([b62b55f](https://github.com/Cookzz/joel-bot-v2/commit/b62b55f17678f2883c1fddb7b59b3e9adc34bdd5))
* feature: added music search function ([687a184](https://github.com/Cookzz/joel-bot-v2/commit/687a184fb153bbb4562b81376473b4d971cb94c5))
* feature: added pause & resume music function ([dd2c07c](https://github.com/Cookzz/joel-bot-v2/commit/dd2c07cedd03bf65225544c9a91446b6633f7d2c))
* chore: initial release 0.1.0 ([5a319ae](https://github.com/Cookzz/joel-bot-v2/commit/5a319ae944282db888ed3adbcd0a12b6715bb62f))
