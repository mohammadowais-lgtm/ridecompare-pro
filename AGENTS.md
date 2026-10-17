<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- Pickup/drop-off place search calls Google Places (New) autocomplete + place details through the connector gateway from `src/lib/places.functions.ts` (server functions). Credentials are server-only (`LOVABLE_API_KEY`, `GOOGLE_MAPS_API_KEY`); never call Places from the browser. Suggestions are debounced 300 ms client-side with one session token per interaction, retired after the details call. App auth is currently a client-side demo — add session verification to these handlers before shipping real user auth.
- `src/lib/places.ts` keeps a small curated Bengaluru list used as offline fallback and for the default pickup/drop-off; it must not grow into the primary search source.
