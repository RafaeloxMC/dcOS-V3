# dcOS (v3)

A small, multi-purpose Discord bot with basic moderation, community and currency features.

Documentation can be found at: https://dcos.xvcf.dev/

Invite the bot: https://discord.com/oauth2/authorize?client_id=961632552148402218&permissions=8&scope=bot%20applications.commands

Features

-   Moderation: purge channels — see [`Purge`](src/commands/Moderation/Purge.ts)
-   Community: polls — see [`Poll`](src/commands/Community/Poll.ts)
-   Currency: unions, bank and daily rewards — see [`Union`](src/commands/Currency/Union.ts), [`Bank`](src/commands/Currency/Bank.ts) and [`Daily`](src/commands/Currency/Daily.ts)
-   Utility: ping & about info — see [`Ping`](src/commands/General/Ping.ts) and [`About`](src/commands/General/About.ts)
-   Dev: simple database test — see [`DatabaseTest`](src/commands/Other/DatabaseTest.ts)

Invite

-   Invite URL is configured via the bot config (see [`config`](src/index.ts)) — set the INVITE in your .env

Docs / Support

-   Support / docs link is configured via [`config.SUPPORT_SERVER_URL`](src/index.ts)

Quick links

-   Source: [src/index.ts](src/index.ts)
-   Package: [package.json](package.json)
