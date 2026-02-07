import os
import json
from .utils import throw_if_missing
from .github import GitHubService


def main(context):
    try:
        throw_if_missing(os.environ, ["GITHUB_WEBHOOK_SECRET", "GITHUB_TOKEN"])
    except ValueError as e:
        return context.res.json({"ok": False, "error": str(e)}, 500)

    github = GitHubService()

    if not github.verify_webhook(context):
        context.error("Invalid signature")
        return context.res.json({"ok": False, "error": "Invalid signature"}, 401)

    if not github.is_issue_opened_event(context):
        context.log("Received non-issue event - ignoring")
        return context.res.json({"ok": True})

    if isinstance(context.req.body, str):
        payload = json.loads(context.req.body)
    else:
        payload = context.req.body
    
    # Post a comment on the new issue
    try:
        github.post_comment(
            payload["repository"],
            payload["issue"],
            f"Thanks for the issue report @{payload['issue']['user']['login']}! We will look into it as soon as possible."
        )
    except Exception as e:
        context.error(f"Failed to post comment: {e}")
        return context.res.json({"ok": False, "error": "Failed to post comment"}, 500)

    return context.res.json({"ok": True})
