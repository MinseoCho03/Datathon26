# Opportunity Atlas

Opportunity Atlas is a funder-facing discovery dashboard for finding and reviewing overlooked young builders through self-reported local projects.

The prototype is a static front-end app:

- `index.html` loads the dashboard shell.
- `app.js` contains the demo data, page rendering, filters, evaluation packet, and submit-project preview.
- `styles.css` contains the dashboard styling.
- `data/oecd-data.js` is generated from the OECD workbook data and powers funding signals, similar funded projects, funder relevance, and opportunity gap context.
- `scripts/generate_oecd_data.py` regenerates `data/oecd-data.js` from the `complete_p4d3_df` sheet in the source workbook.

Responsible-use boundaries are part of the product:

- Similarity to past funded projects shows funder relevance, not project quality.
- Verification status is shown as self-reported.
- Underfunding is a signal, not a conclusion.
- The app helps funders discover, compare, and review projects; it does not automatically decide who deserves funding.

Open `index.html` in a browser to run the prototype.
