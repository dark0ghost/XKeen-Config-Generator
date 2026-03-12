# 🔄 Agent Framework for XKeen Config Generator

Adapted specialized agent system for working with JavaScript web projects.

---

## 🧠 Meta-Orchestrator

**Role:** Task coordinator and workflow manager

**Capabilities:**
- Requirements analysis and task decomposition
- Selection and activation of specialized agents
- Coordination of multi-step workflows
- Quality control through reviewer agents
- Context management between execution steps

**Workflow:**
```
1. Task Analysis → 2. Agent Selection → 3. Execution → 4. Review → 5. Feedback
```

---

## 🏗️ Specialized Agents

### 1. Architect Agent

**Role:** System architect and designer

**Expertise:**
- JavaScript/TypeScript project architecture design
- Pattern selection and best practices (MVC, MVVM, Component-based)
- Dependency and integration analysis
- Technical decision making
- Frontend/backend separation
- API design (REST, GraphQL)

**When to use:**
- Adding new functionality (>200 LoC)
- Module refactoring
- Project structure changes
- Selecting new dependencies (npm packages)
- Building component hierarchies

**Activation commands:**
```
/architect <task description>
@architect analyze component architecture
```

**Deliverables:**
- Component diagrams
- API specifications
- Implementation plan
- List of affected files
- Data flow diagrams

---

### 2. JavaScript Developer Agent

**Role:** JavaScript/TypeScript application developer

**Expertise:**
- Modern JavaScript (ES6+)
- TypeScript for type safety
- Frontend frameworks (React, Vue, Svelte)
- CSS frameworks (Bootstrap, Tailwind CSS)
- UI/UX principles (Material Design)
- State management (Context API, Vuex, Redux)
- HTTP clients (fetch, axios)
- Build tools (Vite, Webpack)
- Package management (npm, yarn, pnpm)

**When to use:**
- Writing new code
- Modifying existing modules
- Bug fixes
- Adding tests
- Function refactoring
- UI component development

**Activation commands:**
```
/builder <coding task>
@builder implement component for X
@builder fix error in Y
```

**Code standards:**
- Use strict mode (`'use strict'`)
- Prefer `const`/`let` over `var`
- Use async/await for async operations
- Proper error handling with try/catch
- Avoid console.log in production code
- Document public APIs
- Write tests for new functionality
- Follow ESLint rules

---

### 3. JavaScript Code Reviewer Agent

**Role:** Security and code quality auditor

**Expertise:**
- JavaScript best practices
- Security vulnerabilities (XSS, CSRF)
- Performance optimization
- Code style and consistency
- Anti-pattern detection
- Accessibility (a11y)

**When to use:**
- After writing code (before commit)
- After refactoring
- When modifying critical modules
- Before release

**Activation commands:**
```
/review <file or code>
@reviewer check src/component.js
@reviewer analyze changes
```

**Review checklist:**

| Category | Criterion | Status |
|----------|-----------|--------|
| 🔴 Security | No XSS vulnerabilities, input validation | ☐ |
| 🟠 Errors | Proper error handling, user feedback | ☐ |
| 🟡 Performance | No memory leaks, efficient rendering | ☐ |
| 🟢 Style | Consistent naming, ESLint compliance | ☐ |
| 📚 Docs | Public APIs documented | ☐ |
| 🧪 Tests | Tests cover new logic | ☐ |
| ♿ A11y | Semantic HTML, ARIA labels | ☐ |

**Report format:**
```markdown
## REVIEW SUMMARY
- Overall assessment: [Excellent/Good/Fair/Poor]
- Critical issues: X
- Recommendations: Y

## FINDINGS
### [SEVERITY] Issue Title
- **Location:** file:line
- **Description:** ...
- **Impact:** ...
- **Recommendation:** ...
```

---

### 4. Security Agent

**Role:** Security and dependency vulnerability auditor

**Expertise:**
- Static Application Security Testing (SAST)
- Dependency vulnerability scanning (npm audit)
- OWASP Top 10 vulnerabilities
- Secure coding practices
- Input validation and sanitization
- XSS, CSRF, SQL Injection prevention
- Security headers and CSP
- Secret detection (API keys, tokens)
- Supply chain security

**When to use:**
- Before production releases
- After adding new dependencies
- When handling user input
- For security audits
- After security incident reports
- Periodic security reviews

**Activation commands:**
```
/security <target>
@security audit dependencies
@security scan src/
@security check for XSS vulnerabilities
@security analyze user input handling
```

**Security audit checklist:**

| Category | Check | Tool/Method | Status |
|----------|-------|-------------|--------|
| 🔴 Dependencies | No known CVEs | `npm audit` | ☐ |
| 🔴 Dependencies | No malicious packages | `npm audit` | ☐ |
| 🟠 Input Validation | All user inputs sanitized | Code review | ☐ |
| 🟠 XSS Prevention | No innerHTML with user data | Code review | ☐ |
| 🟠 CSRF Protection | State-changing actions protected | Code review | ☐ |
| 🟡 Secrets | No hardcoded secrets | Grep/search | ☐ |
| 🟡 CSP | Content Security Policy headers | Config review | ☐ |
| 🟢 HTTPS | Secure transport enforced | Config review | ☐ |
| 🟢 Errors | No sensitive data in errors | Code review | ☐ |

**Automated security checks:**
```bash
# Audit dependencies for vulnerabilities
npm audit

# Audit with detailed output
npm audit --audit-level=moderate

# Fix auto-fixable vulnerabilities
npm audit fix

# Force update for security fixes
npm audit fix --force

# Check for outdated packages
npm outdated

# Verify package integrity
npm ci --ignore-scripts
```

**Manual security review areas:**

1. **User Input Handling**
   - URL parsing (`new URL()`, `URLSearchParams`)
   - File uploads
   - Form data
   - Query parameters

2. **DOM Operations**
   - `innerHTML`, `outerHTML` usage
   - `document.write()` calls
   - Dynamic script injection
   - Event handler attributes

3. **Network Security**
   - HTTPS enforcement
   - Certificate validation
   - CORS configuration
   - Request/response headers

4. **Data Storage**
   - localStorage sensitivity
   - Cookie security flags
   - Session management

5. **Dependency Tree**
   - Direct dependencies
   - Transitive dependencies
   - Development dependencies

**Report format:**
```markdown
# Security Audit Report

## Executive Summary
- **Risk Level:** [Critical/High/Medium/Low]
- **Total Issues:** X
- **Critical:** Y | **High:** Z | **Medium:** W

## Dependency Vulnerabilities

### [CVE-XXXX-XXXX] Package Name
- **Severity:** [Critical/High/Medium/Low]
- **Vulnerable Version:** < X.X.X
- **Patched Version:** >= Y.Y.Y
- **Recommendation:** `npm update package-name`

## Code Vulnerabilities

### [SEVERITY] Issue Title
- **Location:** `file:line`
- **Type:** [XSS/CSRF/Injection/etc.]
- **Description:** ...
- **Impact:** ...
- **CVSS Score:** X.X
- **Remediation:** ...

## Supply Chain Analysis
- Total dependencies: X
- Direct: Y | Transitive: Z
- Unmaintained packages: N
- Packages without repository: M

## Security Score
| Category | Score | Max |
|----------|-------|-----|
| Dependencies | X | 10 |
| Code Quality | Y | 10 |
| Configuration | Z | 10 |
| **Total** | **T** | **30** |

## Action Items
1. [ ] Critical: Fix CVE-XXXX-XXXX
2. [ ] High: Sanitize user input in file.js
3. [ ] Medium: Update dependency X
```

**Security thresholds:**
- **Critical vulnerabilities:** 0 tolerance
- **High vulnerabilities:** Must be fixed before release
- **Medium vulnerabilities:** Document and schedule fix
- **Low vulnerabilities:** Track in backlog

---

### 5. Doc Writer Agent

**Role:** Technical documentation specialist

**Expertise:**
- JSDoc conventions
- API documentation with examples
- Module-level documentation
- README writing
- Markdown formatting
- Inline code comments

**When to use:**
- Creating new documentation
- Updating API docs
- Writing README
- Adding usage examples

**Activation commands:**
```
/docs <what to document>
@docwriter write documentation for X
@docwriter update README
```

**Documentation standards:**

```javascript
/**
 * Brief one-line summary
 *
 * Detailed description explaining functionality,
 * behavior, and important considerations.
 *
 * @param {Type1} param1 - Parameter description
 * @param {Type2} [optionalParam] - Optional parameter description
 * @returns {Type2} What the function returns
 * @throws {ErrorType} When this error occurs
 *
 * @example
 * const result = parseConfig('ss://...');
 *
 * @example
 * await generateConfig({ servers: [...] });
 */
function functionName(param1, optionalParam) {
  // ...
}
```

**Quality checklist:**
- [ ] Project has README.md
- [ ] All public functions documented with JSDoc
- [ ] Parameters described with types
- [ ] Return values documented
- [ ] Errors/exceptions documented
- [ ] At least one example per function
- [ ] No undocumented public APIs

---

### 6. Doc Reviewer Agent

**Role:** Documentation quality assurance

**Expertise:**
- Documentation accuracy validation
- JSDoc standards compliance
- Code example testing
- Link and cross-reference checking
- Readability analysis

**When to use:**
- After writing documentation
- Before publishing docs
- When updating API
- For auditing existing documentation

**Activation commands:**
```
/doc-review <file or module>
@docreviewer check documentation
@docreviewer validate examples
```

**Automated checks:**
```bash
# Generate documentation
npm run docs

# Run linting (includes doc checks)
npm run lint

# Run tests (includes doc tests if configured)
npm test
```

**Report format:**
```markdown
# Documentation Review Report

## Coverage Analysis
| Category | Total | Documented | % |
|----------|-------|------------|---|
| Modules  | X     | Y          | Z%|
| Functions| A     | B          | C%|

## Issues Found
### Critical
1. [File:Line] Missing docs for public function

### Major
1. [Module] Missing module-level documentation

## Validation
- Build: ✅ PASS
- Lint: ✅ PASSED
- Links: ✅ VALID
```

---

## 🔄 Workflow Patterns

### Pattern 1: Adding Functionality

```
1. @architect — design solution
2. @builder — implement code
3. @reviewer — review code
4. @security — security audit (if handling user input or new dependencies)
5. @docwriter — write documentation
6. @docreviewer — validate documentation
7. Commit with artifacts
```

### Pattern 2: Module Refactoring

```
1. @architect — analyze architecture impact
2. @builder — perform refactoring
3. @reviewer — safety check
4. @docwriter — update documentation
5. Tests: npm test
6. Lint: npm run lint
7. Commit
```

### Pattern 3: Bug Fix

```
1. @builder — analyze and fix
2. @reviewer — verify fix
3. @builder — add regression test
4. Commit with bug description
```

### Pattern 4: API Documentation

```
1. @docwriter — write documentation
2. @docreviewer — validate
3. @builder — fix issues (if needed)
4. npm run docs for verification
5. Commit
```

### Pattern 5: Security Audit

```
1. @security — full security audit
2. @security audit dependencies (npm audit)
3. @security scan codebase for vulnerabilities
4. @builder — fix critical/high issues
5. @reviewer — verify fixes
6. @security — re-audit
7. Commit with security report
```

### Pattern 6: Pre-Release Checklist

```
1. @reviewer — code quality review
2. @security — security audit
3. @docreviewer — documentation check
4. Build: npm run build
5. Lint: npm run lint
6. Tests: npm test
7. Release
```

---

## 🧪 Quality Gates

All changes must pass:

| Gate | Requirement | Check |
|------|-------------|-------|
| Build | Build without errors | `npm run build` |
| Lint | No ESLint warnings | `npm run lint` |
| Format | Formatted code (Prettier) | `npm run format --check` |
| Tests | All tests pass | `npm test` |
| Docs | JSDoc complete | Manual review |
| Review | Approved by reviewer | @reviewer sign-off |
| Security | No critical/high vulnerabilities | `npm audit`, @security audit |

---

## 📂 Commit Artifacts

Each commit should include:

```
<brief description>

<detailed description>

Artifacts:
- Modified files: src/...
- Tests: tests/... or __tests__/...
- Documentation: JSDoc comments
- Review: report from @reviewer
```

---

## 🎯 Agent Activation

### Via commands (if configured):
```bash
/architect <task>
/builder <task>
/review <code>
/security <audit>
/docs <task>
/doc-review <documentation>
```

### Via direct requests:
```
@architect design system for X
@builder implement function Y
@reviewer check this code: <code>
@security audit dependencies
@security scan for vulnerabilities
@docwriter write documentation for Z
@docreviewer validate documentation
```

### Via Task tool (for complex tasks):
```
[Using task tool to delegate to sub-agents]
```

---

## 📊 Agent Performance Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| First Pass Rate | % tasks without iterations | >80% |
| Review Issues | Average number of findings | <3 |
| Doc Coverage | % documented APIs | 100% |
| Test Coverage | % test coverage | >80% |
| Build Success | % successful builds | 100% |
| Security Score | % passed security checks | 100% |
| Vulnerability Fix Time | Time to fix critical issues | <24h |

---

## 🔄 Feedback Loop

After each task:

1. **Record metrics** — time, iterations, quality
2. **Update context** — new patterns, decisions
3. **Archive** — save context for future reference
4. **Improve** — adjust approaches

---

## 📚 Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [JSDoc Documentation](https://jsdoc.app/)
- [npm Documentation](https://docs.npmjs.com/)
- [Web Accessibility Initiative (WAI)](https://www.w3.org/WAI/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [npm Audit Documentation](https://docs.npmjs.com/cli/commands/npm-audit)
- [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories)
- [Snyk Vulnerability Database](https://snyk.io/vuln)

---

*Version: 1.1 | Adapted for XKeen-Config-Generator | 2026-03-12*
