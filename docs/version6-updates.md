# # Overview
The Editor is a content creation tool for the CMS Architecture.  The Editor currently creates posts,edits, saves posts and publishes posts as core functionaility.

See [version5-req.md](version5-req.md) for the last requirements of the Editor application updates that these changes are related.

# Updates
The next version is to enhance the Editor with more HTML element types to be created and managed. 

# Requirements
- Editor needs the ability to add Hyperlinks to text.
- The Save button needs to be updated to show the Save Modal for previous saved items, to allow Title to be updated.

## Hyperlinks UX
As a user of the Editor, I would like a Hyperlink create button which does one of two things:
- If text is selected, the Hyperlink button will create a hyperlink for the selected text.
- If no text is selected, the Hyperlink button will create a hyperlink for the current cursor position.
- The Hyperlink button will open a modal to enter the URL and link text.
- The modal will have a field for the URL and a field for the link text.
- The modal will have a button to create the hyperlink.
- The modal will have a button to cancel the hyperlink creation.
- The modal will have a button to remove the hyperlink if it already exists.
- The modal will have a button to close the modal.
- The modal will have a button to save the hyperlink.

## Save Modal UX
As a user of the Editor, I would like the Save button to open a modal that allows me to:
- Update the Title of the Current Post

