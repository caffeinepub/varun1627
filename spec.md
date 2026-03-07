# Varun1627 - Video Editor Portfolio

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full portfolio website for video editor "Varun 1627"
- Animated dark gradient wave background (interactive/touch-responsive)
- Hero section with brand name "Varun 1627" and placeholder tagline (editable)
- Video showcase section with category-based filtering grid
- About Me section with placeholder bio (editable)
- Contact section with Instagram, email, phone (placeholder, editable)
- Admin panel with secure login (authorization component)
- Admin: manage all site text content (hero, about, contact, headings, descriptions)
- Admin: create/edit/delete video categories
- Admin: add videos via YouTube link paste
- Admin: add videos via direct upload (blob-storage component)
- Admin: upload/change thumbnail images
- Smooth scroll animations throughout
- Fully responsive (mobile, tablet, desktop)

### Modify
- Nothing (new project)

### Remove
- Nothing (new project)

## Implementation Plan

### Backend (Motoko)
- `SiteContent` store: key-value map for all editable text (hero title, tagline, about bio, contact fields, section headings)
- `Category` entity: id, name, order
- `Video` entity: id, title, description, categoryId, type (youtube | upload), youtubeUrl, blobId, thumbnailBlobId, createdAt
- CRUD APIs for categories
- CRUD APIs for videos
- Get/set APIs for site content
- Authorization: admin-only mutations, public reads
- Blob storage integration for video uploads and thumbnail images

### Frontend
- Animated gradient wave background (CSS/canvas, dark palette, touch/mouse responsive)
- Public portfolio site:
  - Navbar with smooth scroll navigation
  - Hero section: brand name + tagline (from site content)
  - Video grid with category filter tabs
  - YouTube embed player + uploaded video player
  - About Me section (from site content)
  - Contact section: Instagram, email, phone links (from site content)
  - Smooth scroll reveal animations (Intersection Observer)
- Admin dashboard (behind auth):
  - Site content editor (all text fields)
  - Category manager (add/edit/delete)
  - Video manager (add YouTube link, upload video, set thumbnail, assign category)
  - Thumbnail image uploader
