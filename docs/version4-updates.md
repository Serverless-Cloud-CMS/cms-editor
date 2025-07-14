# # Overview
The Editor is a content creation tool for the CMS Architecture.  The Editor currently creates posts,edits, saves posts and publishes posts as core functionaility.

See [version3-req.md](version3-req.md) for the last requirements of the Editor application updates that these changes are related.

# Updates
The next version is to fix the way the Editor publishes and releases a post.  The editor will no longer send an event to the Event Bridge API when a post is published.  Instead, the Editor will have a separate button in the Toolbar UX for releasing a post.  The release process will poll for updated meta-data after a post is published and provide the user with a link to the post in the CMS using the preview URI.

# Requirements
- Editor needs a separate button in the Toolbar UX for Releasing a Post
- The Release Post triggered event by the button polls for updated Meta-data.
- Remove the Event being sent in the publish HTML button process.
- The publication process still needs to poll for the meta-data after a post is published.
- The Editor should display in the UX the post is published and if it is released and the meta-data is available.
  - Provide the user with a link to the post in the CMS using the preview URI.
- Polling should be done every 5 seconds for no more than a minute

