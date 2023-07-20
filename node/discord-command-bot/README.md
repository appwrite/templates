# Discord Command Bot

This function allows you to implement a simple command-interaction for a Discord bot using Discord Interactions. This bot is able to verify requests and handle them. In its current implementation, it responds to the '/hello' command with a message.

## Environment Variables

To ensure the function operates as intended, ensure the following variable is set:

- **DISCORD_PUBLIC_KEY**: This is the public key of your Discord bot.

## Discord Setup

Before you can use this function, you need to have a bot set up on the Discord Developer Portal. You can create a new bot on the [Discord Developer Portal](https://discord.com/developers/applications) and navigate to the Bot section under the settings page of your application. Here, you can click the 'Add Bot' button.

## Discord API & Interactions

This function utilizes the Discord Interactions API. Interactions are the foundation upon which commands, components, and future user-input features are built. Discord provides a range of interaction types like `APPLICATION_COMMAND` which we use for our '/hello' command.

To add an interaction to your bot, you need to define it first in the Discord Developer Portal under your application settings. Go to the 'Interactions' section and add a new command. In this case, you would add a command named 'hello'. 

## Usage

This function supports the interaction of command type coming from Discord:

1. **Executing the '/hello' command**

   - **Interaction Type:** APPLICATION_COMMAND
   - **Command:** '/hello'
   - **Response:** 
     - On success, the function will respond with "Hello from Appwrite 👋".
     - If the command is not '/hello', the function will respond with a simple acknowledgement (PONG).

## Error Handling

In case of any error during interaction handling, the function will return a 500 error with the message "Failed to process interaction".