Every Detail website recommender update

Replace the matching files in the website project with the files in this patch.

Changes:
- Rebuilds /get-a-quote as the three-step vehicle / condition / issues recommender.
- Carries over the 836-vehicle make/model sizing catalog.
- Preserves the previous recommendation, add-on, paint-upgrade and pricing behavior.
- Uses the new site's native design system and responsive layout.
- Sends the completed build through /api/lead instead of the old Google Apps Script URL.
- Saves vehicle size, recommended service, estimated quote, customer concerns and build details into CRM fields.
- Keeps Book Now routed through the new site's vehicle/service booking flow.
- Preserves ?interest=ceramic and ?interest=paint-correction by preselecting the matching paint upgrade when a recommendation is built.
