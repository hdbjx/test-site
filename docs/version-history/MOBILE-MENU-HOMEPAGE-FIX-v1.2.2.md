# v1.2.2 homepage mobile menu fix

Fixed homepage-only mobile navigation links not receiving taps/clicks.

Cause: `.home-header { pointer-events: none; }` intentionally lets the transparent fixed header pass clicks through to the hero, but the mobile menu panel is a sibling of `.home-nav-shell`. Only the shell had `pointer-events: auto`, so the opened mobile panel inherited the disabled pointer behavior on the homepage.

Fix: explicitly restore `pointer-events: auto` on `.home-header .mobile-menu-panel`.
