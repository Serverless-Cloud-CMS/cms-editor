# # Overview
The Editor is a content creation tool for the CMS Architecture.  The Editor currently creates posts,edits, saves posts and publishes posts as core functionaility.

See [version6-req.md](version4-req.md) for the last requirements of the Editor application updates that these changes are related.

# Updates
The version 7 is to enhance the Editor with a Post thumbnail.  At this time, other services check the Post for any images, and if not it generates a AI image as a thumbnail for the article.  A thumbanail is basically an image to represent the post as a icon and is used in the CMS UI.


# Requirements
- Editor adds a new thumbnail attribute with the media details for the thumbnail.  This should be separate from the media details and items. 
- Current code, the thumbnail is generated from the first image in the post.  This should be changed to use the thumbnail attribute.
- When a post is loaded, if it does not have a thumbnail, the meta-data will be checked for an existing ai_generated_image and if it exists, use that as the thumbnail.  Keep existing logic that copies the meta-data media to Editor Media library.
- The thumbnail should be displayed in the Editor UI replacing the Avatar being displayed using the first media item found.
- The User should be able to select a new thumbnail from the media library.




