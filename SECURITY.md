# Security policy

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Use
[GitHub private vulnerability reporting](https://github.com/eatusc/groundquote/security/advisories/new)
and include:

- the affected route or component;
- steps to reproduce;
- expected and observed behavior;
- potential impact;
- a suggested fix, if you have one.

You should receive an acknowledgement within seven days. Please allow time for a
fix before publishing details.

## Security model

- API keys and service-role credentials stay on the server.
- Document text and questions are request-scoped and are not persisted by the
  application.
- Request type, origin, size, and schema are validated.
- Public endpoints have rate and payload limits.
- Generated answers are restricted to retrieved evidence and citation IDs are
  validated in application code.
- Security headers restrict framing, content sources, browser permissions, and
  MIME sniffing.

This public demo is not intended for secrets or regulated data. Operators should
add a distributed rate limiter, usage alerts, and their own privacy review before
running Groundquote at high traffic or in a regulated environment.
