"""
GitHub service module to handle GitHub interactions.
"""

import os
import json
import hashlib
import hmac
from github import Github


class GitHubService:
    """
    Service class to interact with GitHub's Webhook.
    """

    def __init__(self):
        self.github = Github(os.environ["GITHUB_TOKEN"])

    def verify_webhook(self, context):
        """
        Verify that the payload was sent from GitHub by validating SHA256.

        :param context: The Appwrite function execution context
        :return: True if signature is valid, False otherwise
        """
        signature_header = context.req.headers.get("x-hub-signature-256")
        
        if not signature_header or not isinstance(signature_header, str):
            return False

        secret_token = os.environ["GITHUB_WEBHOOK_SECRET"]
        
        payload_body = context.req.body

        if not payload_body:
             return False
        
        if isinstance(payload_body, dict):
            payload_bytes = json.dumps(payload_body, separators=(',', ':')).encode('utf-8')
        elif isinstance(payload_body, str):
            payload_bytes = payload_body.encode('utf-8')
        else:
            payload_bytes = payload_body
        
        hash_object = hmac.new(
            secret_token.encode('utf-8'), 
            msg=payload_bytes, 
            digestmod=hashlib.sha256
        )
        
        expected_signature = "sha256=" + hash_object.hexdigest()
        
        return hmac.compare_digest(expected_signature, signature_header)

    def is_issue_opened_event(self, context):
        """
        Checks if the event is an issue opened event.
        
        :param context: The Appwrite function execution context
        :return: True if it is an issue opened event, False otherwise
        """
        headers = context.req.headers
        if isinstance(context.req.body, str):
            body = json.loads(context.req.body)
        else:
            body = context.req.body

        return (
            headers.get("x-github-event") == "issues" and
            body.get("issue") is not None and
            body.get("action") == "opened"
        )

    def post_comment(self, repository, issue, comment):
        """
        Post a comment on a GitHub issue.
        
        :param repository: The repository object from the webhook payload
        :param issue: The issue object from the webhook payload
        :param comment: The comment body to post
        """
        owner = repository.get("owner", {}).get("login")
        repo_name = repository.get("name")
        issue_number = issue.get("number")
        
        if not owner or not repo_name or not issue_number:
            print("Missing repository or issue information")
            return

        repo = self.github.get_repo(f"{owner}/{repo_name}")
        gh_issue = repo.get_issue(issue_number)
        gh_issue.create_comment(comment)

