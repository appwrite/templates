# Contributing

We would ❤️ you to contribute to Appwrite and help make it better! We want contributing to Appwrite to be fun, enjoyable, and educational for anyone and everyone. All contributions are welcome, including issues, and new docs, as well as updates and tweaks, blog posts, workshops, and more.

## How to Start?

If you are worried or don’t know where to start, check out the next section that explains what kind of help we could use and where you can get involved. You can send your questions to [@appwrite](https://twitter.com/appwrite) on Twitter or to anyone from the [Appwrite team on Discord](https://appwrite.io/discord). You can also submit an issue, and a maintainer can guide you!

## Code of Conduct

Help us keep Appwrite open and inclusive. Please read and follow our [Code of Conduct](https://github.com/appwrite/.github/blob/main/CODE_OF_CONDUCT.md).

## Submit a Pull Request 🚀

Branch naming convention is as following

`TYPE-ISSUE_ID-DESCRIPTION`

example:

```
doc-548-submit-a-pull-request-section-to-contribution-guide
```

When `TYPE` can be:

- **feat** - a new feature
- **doc** - documentation only changes
- **cicd** - changes related to CI/CD system
- **fix** - a bug fix
- **refactor** - code change that neither fixes a bug nor adds a feature

**All PRs must include a commit message with the description of the changes made!**

For the initial start, fork the project and use git clone command to download the repository to your computer. A standard procedure for working on an issue would be to:

1. `git pull`, before creating a new branch, pull the changes from upstream. Your master needs to be up to date.

```
$ git pull
```

2. Create a new branch from `master` like: `doc-548-submit-a-pull-request-section-to-contribution-guide`.<br/>

```
$ git checkout -b [name_of_your_new_branch]
```

3. Work - commit - repeat (make sure you're on the correct branch!)

4. Push changes to GitHub.

```
$ git push origin [name_of_your_new_branch]
```

5. Submit your changes for review
   If you go to your repository on GitHub, you'll see a `Compare & pull request` button. Click on that button.
6. Start a Pull Request
   Now submit the pull request and click on `Create pull request`.
7. Get a code review approval/reject.
8. After approval, merge your PR.
9. GitHub will automatically delete the branch after the merge is done. (they can still be restored).

### File Structure

```bash
.
├── node # Runtime name
│   ├── starter # Template name
│   │   ├── ... # Runtime & template specific files
│   │   └── README.md # Template documentation
│   └── ... # More templates
├── ... # More runtimes
├── _README_TEMPLATE.md # README template to use for new templates
└── ... # License and documentation
```

## Coding Standards

All code in templates should be formatted. Use formatter that is most common in runtime for which you are developing the template. If there isn't popular one in a runtime, you can use [Prettier](https://prettier.io/).

## Security and Privacy

Security and privacy are extremely important to Appwrite, developers, and users alike. Make sure to follow the best industry standards and practices.

## Dependencies

Usage of dependencies is welcomed for purpose of simplifying template code. Please only use libraries that are well-known, and popular.

## Introducing New Templates

### 1. Starting a Discussion

We would 💖 you to contribute to Appwrite, but we also want to ensure Appwrite is loyal to its vision and mission statement 🙏.

For us to find the right balance, please open an issue explaining your template idea before introducing a new pull request.

This will allow the Appwrite community to sufficiently discuss the new template value.

### 2. Preparing the Template

Once you have the go-ahead, you can proceed to create a PR from your issue.

The preparation process is largely dependent on the runtime environment you choose to work with. We recommend starting with Node.JS and then moving on to other runtimes, after receiving feedback. Here's a generic process that could be applied to most runtimes:

1. **Create a new folder** in the directory for your specific runtime with the name of your template.

2. **Initialize your project**. In Node.js for example, you could run `npm init` in the new folder.

3. **Add a `.gitignore` file** to the new directory, to ignore files and directories that don't need to be version controlled.

4. **Add configuration files specific to your runtime**. This may include formatter configurations, lockfiles or others.

5. **Install necessary dependencies**. Using Node.js as an example, you could run `npm install <package-name>`.

6. **Create an entry point in the `src` folder**. This will be the main file where the template logic resides.

> Tip: Be sure to take a look at `starter` templates templates to get a better understanding of how they are structured.

### 3. Building the Template Logic

With the template setup, you can proceed to writing the template logic in the entry point file.

The writing process should focus more on readability, maintainability and simplicity. It's essential to write code that tells a story. If the logic begins to look complex, consider breaking it down into smaller, manageable files or re-using services from existing templates where applicable.

> Tip: Be sure to look at some of the existing templates to understand how we expect the code

### 4. Writing the Template Documentation

After completing the template logic, the next step is to document the template. This will be very useful to anyone who wants to understand or use your template in the future.

The `_README_TEMPLATE.md` file serves as a guide for writing your template documentation. Ensure you complete all the fields and remove any that are not relevant to your template.



> Note: You don't need to update the table within the `README.md` file in the root of the repository. This will be done automatically once the template is merged.

Once all the steps are completed, you can submit your PR for review. Make sure to include any necessary details in the PR description. This makes it easier for the reviewers to understand the context and provide constructive feedback.

## Other Ways to Help

Pull requests are great, but there are many other ways you can help Appwrite.

### Blogging & Speaking

Blogging, speaking about, or creating tutorials about one of Appwrite’s many features are great ways to get the word out about Appwrite. Mention [@appwrite](https://twitter.com/appwrite) on Twitter and/or [email team@appwrite.io](mailto:team@appwrite.io) so we can give pointers and tips and help you spread the word by promoting your content on the different Appwrite communication channels. Please add your blog posts and videos of talks to our [Awesome Appwrite](https://github.com/appwrite/awesome-appwrite) repo on GitHub.

### Presenting at Meetups

We encourage our contributors to present at meetups and conferences about your Appwrite projects. Your unique challenges and successes in building things with Appwrite can provide great speaking material. We’d love to review your talk abstract/CFP, so get in touch with us if you’d like some help!

### Sending Feedbacks and Reporting Bugs

Sending feedback is a great way for us to understand your different use cases of Appwrite better. If you had any issues, bugs, or want to share your experience, feel free to do so on our GitHub issues page or at our [Discord channel](https://discord.gg/GSeTUeA).

### Submitting New Ideas

If you think Appwrite could use a new feature, please open an issue on our GitHub repository, stating as much information as you have about your new idea and its implications. We would also use this issue to gather more information, get more feedback from the community, and have a proper discussion about the new feature.

### Improving Documentation

Submitting documentation updates, enhancements, designs, or bug fixes, as well as spelling or grammar fixes is much appreciated.

### Helping Someone

Consider searching for Appwrite on Discord, GitHub, or StackOverflow to help someone who needs help. You can also help by teaching others how to contribute to Appwrite's repo!
