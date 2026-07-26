# Groundquote test matrix

Groundquote is small on purpose, but its tests cover the places where a document Q&A tool can fail in ways that matter. Every automated check below runs locally with `npm run test:all`.

## Document handling

| Scenario | Expected behavior | Coverage |
| --- | --- | --- |
| Empty input | Produces no chunks | Unit |
| Windows line endings and repeated spaces | Normalizes text without changing its meaning | Unit |
| Several policy sections | Produces ordered passages under the size limit | Unit |
| One oversized sentence | Splits safely without dropping text | Unit |
| Adjacent passages | Keeps a small overlap when space allows | Unit |
| Unsupported or oversized browser upload | Shows a useful error before sending anything | Browser behavior and code review |

## Retrieval and evidence

| Scenario | Expected behavior | Coverage |
| --- | --- | --- |
| Exact policy term | Ranks the matching passage first | Unit and API integration |
| Common question words | Removes low-signal words before ranking | Unit |
| Accented words and punctuation | Normalizes terms consistently | Unit |
| Semantic vectors | Ranks the closest vector first | Unit |
| Keyword and semantic rankings | Combines both rankings and normalizes the score | Unit |
| Repeated passages | Keeps distinct evidence instead of duplicates | Unit |
| Good term coverage | Produces a stronger retrieval confidence | Unit |
| Strong semantic match with different wording | Can pass the evidence threshold in hybrid mode | Unit |
| Unrelated question | Does not treat a weak match as evidence | Unit, evaluation, API, and browser |

## Answers, citations, and abstention

| Scenario | Expected behavior | Coverage |
| --- | --- | --- |
| Supported question | Returns a cited answer and visible source passage | API and browser |
| Valid inline citation | Passes server-side citation validation | Unit |
| Missing inline citation | Replaces the answer with the safe no-answer response | Unit |
| Invented citation ID | Replaces the answer with the safe no-answer response | Unit |
| Duplicate citation IDs | Deduplicates them | Unit |
| Model marks evidence insufficient | Uses the safe no-answer response | Unit |
| Model is not configured or fails | Uses a cited extractive answer | Unit and API |
| No evidence is available | Returns no answer and no citations | Unit, API, evaluation, and browser |
| Prompt injection inside a source | Treats source passages as untrusted data | Prompt boundary, evaluation, and code review |

## API and security boundaries

| Scenario | Expected behavior | Coverage |
| --- | --- | --- |
| Valid same-origin JSON | Accepts the request | Unit and API |
| Browser-facing host behind a proxy | Accepts the forwarded production host | Unit |
| Cross-origin request | Returns 403 | Unit and API |
| Malformed origin | Returns 403 | Unit |
| Non-JSON request | Returns 415 | Unit and API |
| Declared oversized request | Returns 413 before parsing | Unit and API |
| Invalid or too-short fields | Returns 400 | API |
| Unexpected payload fields | Returns 400 instead of silently accepting them | API |
| Private answer or feedback response | Sends `Cache-Control: no-store` | API |
| Repeated requests | Applies an IP-based limit | Unit |
| Missing model key | Keeps evidence-only mode working | API |
| Missing feedback database | Accepts feedback locally without failing the UI | API |
| Service-role credential | Stays server-side and never enters client code | Build and code review |

## Public experience

| Scenario | Expected behavior | Coverage |
| --- | --- | --- |
| First visit | Explains the product and privacy in plain language | Browser |
| Guided example | Loads a realistic policy and question | Browser |
| Citation click | Connects the claim to its evidence | Browser |
| Learning challenge | Explains both the safe and unsafe choice | Browser |
| RAG guide | Explains retrieval misses and safe answers | Browser |
| Privacy page | States what is and is not stored | Browser |
| Phone viewport | Has no horizontal overflow and keeps the workflow usable | Browser |
| Keyboard navigation | Reaches the home link and primary navigation in order | Browser |
| WCAG A and AA scan | Reports no automated Axe violations | Browser |
| `robots.txt`, sitemap, manifest, and `llms.txt` | Remain public and point to the right product | Browser |

## Human checks before a release

Automation cannot judge every part of trust. Before tagging a release, the maintainer also checks:

- The evidence actually supports the wording of the answer.
- The safe no-answer response feels clear, not alarming.
- The example does not contain private or company-confidential data.
- The privacy wording still matches every configured provider.
- Screenshots were captured from the current build, not a mockup.
- Launch copy sounds like a person explaining a useful tool, not a sales bot.
