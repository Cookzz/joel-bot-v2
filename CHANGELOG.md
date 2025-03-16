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