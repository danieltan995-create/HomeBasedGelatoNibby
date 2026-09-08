# Nibby assets and third-party logos

The Nibby illustrations in the table below are original concept art created for this project. They are **not confirmed packaging or product photographs**, and do not document an actual product. The illustrated 140 ml size is a provisional design detail, not a verified container specification. Ingredient doodles are visual flavour cues, not verified ingredient or allergen declarations. Social-platform logos are third-party assets documented separately below.

| Asset | Canvas | Concept |
| --- | --- | --- |
| [Lemon Almond Nibs](illustrations/lemon-almond-nibs.svg) | 480 × 480, transparent | Muted lemon-yellow paper tub, hovering lid, gelato folds, lemon and almond doodles. |
| [Dark Chocolate](illustrations/dark-chocolate.svg) | 480 × 480, transparent | Cocoa-brown paper tub with ivory lettering, hovering lid, chocolate folds and cocoa doodles. |
| [Pistachio My Love](illustrations/pistachio-my-love.svg) | 480 × 480, transparent | Pistachio-green paper tub, hovering lid, gelato folds and pistachio doodles. |
| [Favicon](favicon.svg) | 64 × 64 | Ivory lowercase n on green, with a small yellow sparkle. |
| [Social card](social-card.svg) | 1200 × 630 | Cream-and-chocolate typography, proposed tagline and an abstract lidded gelato cup. |

## Construction and usage

- Original vector paths, ellipses, text and subtle gradients only. No external images, embedded photographs, scripts, font downloads, traced packaging or third-party artwork.
- Lettering uses locally available Georgia and Arial with generic serif and sans-serif fallbacks. No font files are included; letterforms can vary by system.
- Every SVG includes a descriptive title and description. For use through an HTML image element, supply appropriate alt text separately; SVG descriptions are not a substitute for the visible concept note in the surrounding UI.
- Cup canvases are transparent, with light ground shadows intended for cream or green backgrounds. The favicon and social card have their own coloured backgrounds.
- Keep visible product/packaging concept disclosure alongside illustrations in the interface. Confirm packaging, volume, flavour details and brand copy with the owner before replacing these drafts with production assets.
- The social artwork is an editable SVG master. Some social preview services require a separately exported PNG or JPEG; no raster export is included here.

## Social-platform logos

[SocialIcon.astro](../src/components/SocialIcon.astro) vendors only three unmodified 24 × 24 path definitions from **Simple Icons 12.4.0**, rendered inline with a monochrome fill. This avoids an entire icon-library dependency, font download, CDN call or runtime social SDK. Visible platform names label each card; the redundant SVGs are hidden from assistive technology.

- [Instagram source](https://github.com/simple-icons/simple-icons/blob/12.4.0/icons/instagram.svg)
- [REDnote / Xiaohongshu source](https://github.com/simple-icons/simple-icons/blob/12.4.0/icons/xiaohongshu.svg)
- [Facebook source](https://github.com/simple-icons/simple-icons/blob/12.4.0/icons/facebook.svg)
- [Simple Icons CC0 1.0 Universal license](https://github.com/simple-icons/simple-icons/blob/12.4.0/LICENSE.md)

These are not original Nibby artwork. Brand names and logos remain trademarks of their respective owners; CC0 does not grant trademark rights. Use them only to identify the business's profiles on those platforms, without suggesting partnership or endorsement, and review each platform's current brand guidelines before launch.