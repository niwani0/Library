# Structural Patterns

## Table of Contents
1. Team Topologies
2. Coordination Mechanisms
3. Decision Frameworks
4. Role Design Patterns

---

## 1. Team Topologies

### Stream-Aligned Teams
Own end-to-end flow of value. Minimize handoffs. Best when work is customer-facing and requires fast iteration.

**When to use**: Product teams, feature teams, customer journey ownership
**Watch for**: Platform/infrastructure becoming neglected, duplicated capabilities

### Platform Teams
Provide internal services that reduce cognitive load for stream-aligned teams. APIs, tools, infrastructure.

**When to use**: Shared capabilities needed by multiple teams, specialist skills that shouldn't be distributed
**Watch for**: Platform team becoming bottleneck, building features no one asked for

### Enabling Teams
Temporarily embed with other teams to transfer capabilities. Consultants, coaches, specialists.

**When to use**: New technology adoption, capability building, transformation support
**Watch for**: Creating dependency rather than capability transfer

### Complicated-Subsystem Teams
Own technically complex components requiring specialist expertise.

**When to use**: ML models, compliance systems, core algorithms
**Watch for**: Becoming isolated ivory tower, API mismatches with consumers

---

## 2. Coordination Mechanisms

### Lightweight Coordination
- **Liaison roles**: Single point of contact between teams
- **Shared Slack channels**: Low-ceremony async coordination
- **Office hours**: Regular availability for questions
- **Documentation**: Self-serve information

### Medium Coordination
- **Working groups**: Time-bounded cross-team collaboration
- **Sync meetings**: Regular touchpoints (use sparingly)
- **Shared OKRs/goals**: Alignment through outcomes
- **Service contracts**: Explicit expectations between teams

### Heavy Coordination
- **Dedicated coordination role**: Program manager, technical program manager
- **Joint planning**: Shared roadmap sessions
- **Embedded members**: Person from Team A sits with Team B
- **Merge teams**: When coordination cost exceeds separation benefit

**Selection principle**: Use the lightest mechanism that works. Escalate only when lighter mechanisms fail.

---

## 3. Decision Frameworks

### RACI
- **Responsible**: Does the work
- **Accountable**: Owns the outcome (exactly one person)
- **Consulted**: Input required before decision
- **Informed**: Notified after decision

Use for recurring decisions. Overkill for one-offs.

### Decision Rights Matrix
Map decision types to who decides:

| Decision Type | Who Decides | Who's Consulted | Escalation Path |
|--------------|-------------|-----------------|-----------------|
| Hiring | Manager | Skip-level, peers | VP |
| Tech stack | Tech lead | Team, platform | CTO |
| Roadmap priorities | PM | Stakeholders, eng | Product VP |

### Escalation Paths
Define explicitly:
- When to escalate (criteria, not vibes)
- To whom (specific person/role)
- Expected response time
- What happens if no response

---

## 4. Role Design Patterns

### Single-Threaded Owner
One person owns an initiative end-to-end. Clear accountability. Reduces coordination.

**When to use**: Complex cross-functional initiatives, new product launches
**Watch for**: Creating bottleneck, burnout

### Dual-Track (e.g., PM + EM)
Two complementary roles share leadership. PM owns "what/why," EM owns "how/who."

**When to use**: Product development teams at scale
**Watch for**: Conflict between partners, unclear ownership at edges

### Role vs. Job
**Role**: Set of responsibilities that may be distributed
**Job**: What a specific person does

One person can hold multiple roles. One role can be shared. Separate role design from job design.

### Minimal Viable Role
Define only:
- Core accountabilities (what outcomes they own)
- Key decisions they make
- Primary collaborators

Avoid: Exhaustive task lists, rigid boundaries, detailed process specs. Let people figure out the how.
