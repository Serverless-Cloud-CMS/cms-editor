# Version 2 Requirements
The Editor needs to be expanded to support the concept of publishing a JSON export that will be used other services to transform the data into other formats. The following requirements are needed to support this:

The following fields need to be created by the Editor per a Post:
- `id`: A unique identifier for the post.
- `template`: The template used for the post.
- `title`: The title of the post.
- `category`: The category of the post.
- `published`: A boolean indicating if the post is published.
- `postInfo`: An object containing:
  - `author`: The author of the post.
  - `posted`: The date the post was created.
- `content`: An object containing:
  - `type`: The type of content (e.g., "html").
  - `body`: The body of the content.  This should be a string containing the HTML content of the Editor post as an HTML fragment.
- `media`: An array of media objects, each containing:
  - `name`: The name of the media.
  - `description`: A description of the media.
  - `type`: The type of media (e.g., "image").
  - `order`: The order of the media in the post.
  - `tags`: An array of tags associated with the media.
  - `key`: A key or path to the media file.
- `postKey`: A key for the post, used for referencing.
- `src`: The source path for the post data that the Editor is working with.
- `published_data`: An object containing:
  - `id`: A unique identifier for the published data.
  - `key`: The key or path to the published data file.
- `srcVersion`: A version identifier for the source data.  This will come from the S3 versioning system.
- `key`: The key or path to the published data file.

This JSON export should replace the handlePublishAsHtml function in the Editor as the new Publish method. The function should be updated to create a JSON object with the above structure and save it to the specified path.

The editor should have a way to generate a unique `id` for each post, which can be done using a UUID generator or similar method. The `src` field should point to the current working file in the Editor that is where it saves, and the `published_data` should reflect the final published state of the post.

The Publish button should only be active if the post has been saved.  Also, update the Editor Save process to use the ID, Title and Author if the Post has already been saved to avoid duplicating posts.

Here is the shape of the JSON data:
```json
{
  "id": "d6619cb1-5f29-4ce1-b590-f137167ff252",
  "template": "basic",
  "title": "Editor Updates",
  "category": "general",
  "published": true,
  "postInfo": {
    "author": "JR",
    "posted": "2025-01-30"
  },
  "content": {
    "type": "html",
    "body": "<p>Local test of updates.</p>"
  },
  "media": [
    {
      "name": "Image 1",
      "description": "Description 1",
      "type": "image",
      "order": 1,
      "tags": ["tag1"],
      "key": "path/to/image1.jpg"
    }
  ],
  "postKey": "EditorKey",
  "src": "stage/EditorKey.json",
  "published_data": {
    "id": "1fd19540-d98e-4dc2-97cd-574455873d29",
    "key": "published/EditorKey.1fd19540-d98e-4dc2-97cd-574455873d29.json"
  },
  "srcVersion": "Gb5OTgYmGpUrcu2SYek_dMsIHGEyI.vh",
  "key": "published/EditorKey.1fd19540-d98e-4dc2-97cd-574455873d29.json",


}
```