# 🎥 Local Videos Folder

## How to Use This Folder

Place your video files here to serve them locally instead of using Google Drive.

### Supported Formats:
- ✅ MP4 (H.264 codec) - Recommended
- ✅ WebM
- ✅ MOV
- ✅ OGG

### Example Structure:
```
videos/
  ├── intro.mp4
  ├── lesson1.mp4
  ├── lesson2.mp4
  └── final-project.mp4
```

### Usage in Course Data:

After adding videos here, update your `backend/seed.js`:

```javascript
{
  title: 'Introduction',
  videoUrl: 'http://localhost:5000/videos/intro.mp4',
  description: 'Getting started with the course',
  duration: '10:30',
  order: 1
}
```

### Testing:

1. Add video to this folder
2. Run backend: `npm start`
3. Test video URL: `http://localhost:5000/videos/intro.mp4`
4. If you see the video, it's working!

### Tips:

- Keep file names simple (no spaces)
- Use lowercase names
- Compress videos for web (use FFmpeg)
- Keep files under 100MB for better performance

### Alternative: Google Drive

Don't want to manage local files? Use Google Drive instead:
1. Upload video to Google Drive
2. Share → "Anyone with link"
3. Copy link
4. Use directly in videoUrl

Both methods work perfectly! 🎉
