# Gift Cards v18.2 navigation fix

- Removed the legacy `/gift-cards` redirect that sent the new first-party gift card route back to `/` when `site.external.giftCards` was unset.
- Promoted Gift Cards into `primaryNav` so it renders directly in the desktop navigation.
- Because mobile navigation also renders `primaryNav`, Gift Cards is now visible there as well.
- Footer still includes Gift Cards through the shared primary navigation list.
