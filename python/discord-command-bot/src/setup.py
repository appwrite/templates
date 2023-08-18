import requests, os
from utils import throw_if_missing


def setup():
    throw_if_missing(
        os.environ,
        [
            "DISCORD_PUBLIC_KEY",
            "DISCORD_APPLICATION_ID",
            "DISCORD_TOKEN",
        ],
    )

    REGISTER_API = f'https://discord.com/api/v9/applications/{os.environ["DISCORD_APPLICATION_ID"]}/commands'

    response = requests.post(
        REGISTER_API,
        data={
            "name": "hello",
            "description": "Hello World Command",
        },
        headers={
            "Authorization": f'Bot {os.environ["DISCORD_TOKEN"]}',
            "Content-Type": "application/json",
        },
    )

    if not response.ok:
        raise Exception(f"Failed to register command")

    print("Successfully registered command")


setup()
