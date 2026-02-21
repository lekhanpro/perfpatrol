# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Active support  |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue
2. Email security concerns to the maintainers
3. Include a detailed description of the vulnerability
4. Provide steps to reproduce if possible

### What to Expect

- **Acknowledgment** within 48 hours
- **Assessment** within 1 week
- **Fix timeline** communicated after assessment
- **Credit** given in the security advisory (if desired)

### Scope

The following are in scope:

- SQL injection in API routes
- Authentication/authorization bypasses
- Cross-Site Scripting (XSS) in the dashboard
- Server-Side Request Forgery (SSRF) in the audit worker
- Sensitive data exposure
- Dependency vulnerabilities

### Out of Scope

- Issues in third-party dependencies (report to the upstream project)
- Social engineering attacks
- Denial of service attacks

## Security Best Practices

When contributing, please ensure:

- All user inputs are validated and sanitized
- SQL queries use parameterized queries (Prisma handles this)
- API endpoints validate authentication where required
- Sensitive configuration is stored in environment variables
- Dependencies are regularly updated
