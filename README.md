# Bay Area Professional Counseling Site

Redesign staging site for **Bay Area Professional Counseling**, a counseling practice in Mobile, Alabama serving Gulf Coast communities.

This repository began as a localized copy of the existing Squarespace site, but the `redesign` branch is now a custom static site with a soft Southern coastal visual direction: earthtone colors, watercolor/sketched foliage and marsh imagery, rounded content panels, therapist profiles, an interactive practice gallery, and an appointment-request preview.

## Current Status

| Item | Current value |
| --- | --- |
| Redesign branch | `redesign` |
| Published staging site | <https://jcsweatt.github.io/Bay-Area-Professional-Counseling-Site/> |
| GitHub Pages source | `redesign` branch, repository root (`/`) |
| HTTPS | Enforced by GitHub Pages |
| Live/original practice site | <https://www.bayareaprofessionalcounseling.com/> |
| Production status | Staging mockup only; not yet a replacement for the live site |

The staging site is intentionally blocked from search indexing in `robots.txt` until a production decision is made.

## Technology

The redesign is intentionally lightweight:

- GitHub Pages with Jekyll/Liquid includes.
- Static HTML pages with YAML front matter.
- One primary stylesheet: `assets/redesign.css`.
- Vanilla JavaScript for the after-hours notice, gallery interaction, and therapist filtering.
- Locally stored images and illustration assets in `assets/`.
- Google Analytics and Google Search Console verification included in the shared document head.

There is no JavaScript build system, application framework, database, or server-side form handler in this repository.

## Deployment

GitHub Pages publishes the repository root from the `redesign` branch. A push to `redesign` updates the staging URL after GitHub Pages builds the Jekyll/Liquid templates.

`_config.yml` defines the GitHub Pages project-site path:

```yml
url: "https://jcsweatt.github.io"
baseurl: "/Bay-Area-Professional-Counseling-Site"
```

Internal navigation should use Jekyll's `relative_url` filter, as implemented in `_includes/header.html`, so links work correctly under the project subdirectory.

Do not reintroduce client-side URL rewriting for project paths. The published HTML should contain correct URLs before JavaScript runs.

## Site Structure

### Shared Components

| File | Purpose |
| --- | --- |
| `_includes/head.html` | Analytics, Search Console verification option, metadata output, favicon, stylesheet, and global/page-specific scripts |
| `_includes/header.html` | Site logo and primary navigation |
| `_includes/footer.html` | Office contact block, design credit, and copyright |
| `_config.yml` | GitHub Pages `url` and `baseurl` configuration |

Each public page contains front matter that controls its page-specific metadata and navigation state:

```yml
---
nav_current: staff
title: Our Therapists | Bay Area Professional Counseling
description: Meet the counselors at Bay Area Professional Counseling in Mobile, Alabama.
script: therapist-filter
---
```

Supported optional front-matter settings currently include:

- `nav_current`: highlights the relevant navigation destination.
- `title`: sets the document title through `_includes/head.html`.
- `description`: sets the page meta description.
- `google_site_verification: true`: currently enabled only on the homepage.
- `script: therapist-filter`: loads the therapist-directory interaction.
- `script: gallery-experience`: loads the interactive gallery behavior.

### Public Pages

| Path | Purpose |
| --- | --- |
| `/` | Homepage and primary practice introduction |
| `/about/` | Draft About page mockup with practice story, values, and timeline sections |
| `/our-staff/` | Therapist directory with specialty filters |
| `/gallery/` | Interactive practice/team photo gallery |
| `/request-an-appointment/` | Appointment/contact page with disabled staging form preview |
| `/alexa/`, `/lacey/`, `/cindy/`, `/virginia/`, `/lanya/` | Therapist profile pages |
| `/kayla/`, `/leigh/`, `/deena/`, `/tifani/`, `/madison/` | Therapist profile pages |

Therapist routes use first-name URLs for clarity and consistency.

## Design Assets

Custom redesign artwork is kept in `assets/`, including:

| Asset | Usage |
| --- | --- |
| `redesign-hero-coastal-porch.jpg` | Homepage hero illustration |
| `redesign-footer-marsh.jpg` | Full-width illustrated footer scene |
| `redesign-moss-corner.jpg` | Homepage content-panel accent |
| `redesign-contact-growth.jpg` | Appointment page banner accent |
| `redesign-gallery-succulents.jpg` | Gallery page banner accent |
| `redesign-therapists-succulents.jpg` | Therapist directory banner accent |
| `redesign-profile-grass.jpg` | Therapist profile header texture |

Therapist and gallery photographs are actual practice photos. Decorative non-staff imagery may be illustrated.

### Inherited Asset Cleanup

The repository still contains many localized assets inherited from the original Squarespace scrape, including unused script/style bundles and duplicate image variants. At the time of this documentation update, `assets/` contains hundreds of tracked files and is significantly larger than the custom redesign requires.

A future maintenance pass should identify actively referenced assets, remove unused inherited files, and optimize large images for mobile performance without changing visible quality.

## Client-Side Features

| File | Behavior |
| --- | --- |
| `assets/after-hours-banner.js` | Displays an after-hours crisis-support banner outside general office hours |
| `assets/therapist-filter.js` | Filters and smoothly rearranges therapist cards by area of support |
| `assets/gallery-experience.js` | Controls the interactive photo tour, captions, thumbnails, and keyboard navigation |

### After-Hours Notice

The after-hours banner uses:

- Time zone: `America/Chicago`, matching Mobile, Alabama.
- General office hours: Monday through Friday, `8:00 AM` through `5:00 PM`.
- Closures: standard observed U.S. federal holidays currently encoded in JavaScript.
- Message: emergency guidance to call `911` and crisis-support guidance to call or text `988`.

Before production launch, the practice should confirm that the holiday list and general-office-hours policy match actual office operations.

## Analytics And Verification

The shared head currently includes:

- Google Analytics tag ID: `G-7HQSVYSK66`.
- Google Search Console HTML meta verification on the homepage.
- Google Search Console HTML verification file: `google856eaa8101249a05.html`.
- Sitemap: `sitemap.xml`.
- Staging robots policy: `robots.txt`.

Important: `robots.txt` currently contains `Disallow: /` because this is a staging redesign. If this repository becomes the public production site, review indexing, sitemap URLs, canonical URLs, Search Console ownership, analytics destination, and any final domain or Cloudflare configuration before launch.

## Appointment Form And Privacy

`/request-an-appointment/` contains a designed form preview with fields for:

- Client name, callback phone number, and date of birth.
- Insurance type and member/policy number.
- Preferred therapist selections.
- Areas of support.
- An additional message.

All form controls are intentionally disabled. The page states that secure online submission must be connected before personal information can be accepted.

Before production use:

1. Select and implement a secure intake or patient-management destination approved by the practice.
2. Confirm what protected or sensitive information should be collected online.
3. Review privacy language and submission behavior with the practice.
4. Enable the form only after secure submission is in place and tested.

The contact phone/email actions currently advise visitors not to send sensitive health information until a secure intake method is available.

## Content Verification Before Launch

Before approving a production replacement, confirm with the practice:

- Therapist names, credentials, supervision details, biographies, specialties, and profile photos.
- Specialty-filter associations on `/our-staff/`.
- Insurance and self-pay statements.
- New-client and weekend-availability statements.
- Office phone, email, address, business hours, and holiday closures.
- Gallery captions and permission to publish practice/staff photos.
- Consistent geographic wording for Mobile, Alabama and Gulf Coast service areas.

The open project item `Confirm Bios` is intended to track clinical/profile content review.

## Local Review

Because pages use Jekyll includes and Liquid filters, opening the raw HTML files or serving the repository with a basic static file server does **not** render the complete templated site.

The authoritative preview is the GitHub Pages deployment from `redesign`:

<https://jcsweatt.github.io/Bay-Area-Professional-Counseling-Site/>

For future local rendering, add a supported Jekyll development setup (for example, a `Gemfile` and documented `bundle exec jekyll serve` workflow) rather than relying on an unrendered static-file preview.

## GitHub Project Workflow

The GitHub Project **Bay Area Professional Counseling Site** is the work tracker for this redesign.

For each implemented site update:

1. Create a separate GitHub issue/project item before implementation.
2. Assign it to `jcsweatt`.
3. Label it `enhancement` for improvements or `new development` for new capabilities.
4. Record development against the `redesign` branch. GitHub linked branches create new branches, so when continuing on the established shared `redesign` branch, name it in the issue and commit history rather than creating a duplicate branch.
5. Place the project item in `In progress` while work is active.
6. Validate the change and push it to `redesign` when publishing is requested.
7. Move the item to `Done` and close the issue once the work is complete.

Discussion, planning, and reviews that do not alter the site do not require project items.

## Launch Checklist

The most important remaining production-readiness work is:

1. Connect the appointment form to a secure approved intake destination.
2. Complete therapist biography, specialty, insurance, and availability review.
3. Decide the final production domain and deployment path.
4. Replace the staging robots policy and add final SEO/canonical/social metadata as appropriate.
5. Verify analytics and Search Console against the final public site.
6. Confirm holiday and after-hours banner rules with the practice.
7. Audit and remove unused scraped assets; optimize active images.
8. Add a custom `404` page and consider redirects if renamed profile URLs have been shared publicly.

## Copyright

The site footer currently displays:

`&copy; 2026 Bay Area Professional Counseling. All rights reserved.`
