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

Once you have the green light, you can go ahead and create a PR from your issue. 

We recommend first building your template in Node.js, as this is the most popular runtime in Appwrite and will allow you to get feedback before continuing to other runtimes.

Let's build a basic Node.js template that prints "Hello World" to the console.

1. Create a new folder in the `node` directory with the name of your template. In this case, we'll call it `hello-world`.

2. Copy an existing `.gitignore`, and `package.json` file from the `node/starter` template into the new folder.

3. Update the `package.json` file, changing the `name` and `description` fields to match your template.

4. Create a new file at `node/hello-world/src/main.js` file in the new folder. This is where the template logic will be reside.

> Tip: Other runtimes have a similar structure, but may have additional files. Be sure to view and understand the starter template for the runtime you're working with.

### 3. Building the Template Logic

Now that the template is setup, we can write the template logic.

Update the `main.js` file with your template logic. 
Here's a basic function that prints "Hello, World!" to the console.

```javascript
export default function ({log}) {
    log("Hello, World!");
};
```

If you're unsure about how to write your template logic, you can use the other templates as a guide, we recommend starting with the `node/starter` template.

> Tip: All function templates should be easy to use and understand. If you find yourself writing a lot of code, consider breaking it up into multiple modules.

### 4. Writing the Template Documentation

Now that the template logic is complete, we can write the template documentation.

Use the `_README_TEMPLATE.md` file as a guide for writing your template documentation. Be sure to fill out all the fields, and remove any fields that are not relevant to your template.

Don't worry about updating the `README.md` file in the root of the repository, this will be done automatically when the template is merged.


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