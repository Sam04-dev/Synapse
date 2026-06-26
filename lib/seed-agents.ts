export interface AgentDef {
  id: string;
  name: string;
  memories: string[];
  relationships: [number, number, string][];
  events: { action: string; payload: Record<string, unknown> }[];
}

function uuid(): string {
  return crypto.randomUUID();
}

function buildAgent1(id: string): AgentDef {
  return {
    id, name: "ShopSmart Personalizer",
    memories: [
      "User profile: Sarah Jenkins — ID:USR-90210, loyalty tier Gold, avg order $127",
      "User profile: David Cho — ID:USR-45612, loyalty tier Silver, browses electronics weekly",
      "User profile: Mark Lewis — new customer, signed up via referral campaign RC-2024-Q2",
      "Behavior: Sarah Jenkins views running shoes 3x/week, converts at 18% on flash sales",
      "Behavior: David Cho abandons cart when shipping > $9.99, responds to free-shipping nudges",
      "Behavior: Mark Lewis clicks email CTAs within 2 hours, prefers mobile app",
      "Action: Triggered 15%-off coupon for Sarah Jenkins after 3rd shoe-category browse session",
      "Action: Sent free-shipping promo to David Cho — cart recovery within 4 hours",
      "Action: Pushed personalized welcome flow to Mark Lewis with curated electronics picks",
      "Strategy: Cross-sell running accessories to shoe buyers — 23% uplift in AOV observed",
      "Strategy: Time-decay model for email sends — 48hr optimal window after browse abandonment",
      "Calculated: Sarah Jenkins CLV projected at $4,200/year based on purchase velocity",
    ],
    relationships: [[0,3,"PREFERS"],[3,6,"TRIGGERED"],[1,4,"PREFERS"],[4,7,"TRIGGERED"],[2,5,"PREFERS"],[5,8,"TRIGGERED"],[9,6,"SUPPORTS"],[10,7,"SUPPORTS"],[11,0,"CALCULATED"],[9,10,"SUPPORTS"]],
    events: [
      { action: "MEMORY_CREATED", payload: { content: "User profile initialized: Sarah Jenkins", tier: "Gold" } },
      { action: "MEMORY_CREATED", payload: { content: "User profile initialized: David Cho", tier: "Silver" } },
      { action: "MEMORY_CREATED", payload: { content: "New customer onboarded: Mark Lewis via referral" } },
      { action: "PROCESS_TICKET", payload: { ticketId: "SHOP-1201", type: "cart_abandonment", customer: "David Cho" } },
      { action: "PROMOTION_SENT", payload: { userId: "USR-90210", promoType: "flash_sale_15_off", channel: "push" } },
      { action: "PROMOTION_SENT", payload: { userId: "USR-45612", promoType: "free_shipping", recoveryWindow: "4h" } },
      { action: "PROMOTION_SENT", payload: { userId: "USR-NEW-ML", promoType: "welcome_flow", curated: "electronics" } },
      { action: "MEMORY_CREATED", payload: { content: "Cross-sell strategy validated", uplift: "23%" } },
      { action: "AUDIT_LOG", payload: { action: "coupon_issued", couponCode: "FLASH15-SJ", discount: "15%" } },
      { action: "MEMORY_CREATED", payload: { content: "CLV projection calculated", projectedCLV: 4200 } },
      { action: "AUDIT_LOG", payload: { action: "browse_session_tracked", userId: "USR-90210", sessionCount: 3 } },
      { action: "PROCESS_TICKET", payload: { ticketId: "SHOP-1215", type: "return_request", customer: "Mark Lewis" } },
      { action: "MEMORY_CREATED", payload: { content: "Time-decay model deployed", optimalWindow: "48h" } },
      { action: "PROMOTION_SENT", payload: { userId: "USR-45612", promoType: "bundle_deal", savings: "$34" } },
      { action: "AUDIT_LOG", payload: { action: "model_retrained", modelVersion: "v2.4.1", accuracy: 0.89 } },
      { action: "MEMORY_CREATED", payload: { content: "Shipping sensitivity confirmed", threshold: "$9.99" } },
      { action: "PROCESS_TICKET", payload: { ticketId: "SHOP-1230", type: "price_match", delta: 12.00 } },
      { action: "PROMOTION_SENT", payload: { userId: "USR-90210", promoType: "loyalty_bonus", pointsAwarded: 500 } },
    ],
  };
}

function buildAgent2(id: string): AgentDef {
  return {
    id, name: "ReguBot Audit Agent",
    memories: [
      "Entity: Apex Capital LLC — CIK #0001823456, registered Delaware, AUM $2.1B",
      "Entity: Nova Digital Holdings — CIK #0001945678, offshore subsidiary flagged for review",
      "Transaction: TXN-88201 — $1.2M wire from Apex Capital to Nova Digital, flagged layering",
      "Transaction: TXN-88450 — $340K structured deposits across 4 accounts in 72 hours",
      "Flag: Unusual volume — Apex Capital executed 47 trades in 12 minutes",
      "KYC: Apex Capital beneficial owner verified — James Thornton, PEP-negative",
      "KYC: Nova Digital — beneficial ownership unclear, requires enhanced due diligence",
      "SAR Report: SAR-2024-0091 filed for TXN-88201, narrative references layering indicators",
      "Compliance rule: transactions > $500K between flagged entities require manual review",
      "Cleared: TXN-88450 downgraded after source-of-funds documentation received",
    ],
    relationships: [[0,2,"FLAGGED"],[1,2,"FLAGGED"],[2,7,"GENERATED"],[3,9,"CLEARED"],[4,0,"FLAGGED"],[5,0,"CLEARED"],[6,1,"UPGRADED"],[7,8,"GENERATED"],[8,2,"FLAGGED"]],
    events: [
      { action: "MEMORY_CREATED", payload: { content: "Entity profile created: Apex Capital LLC" } },
      { action: "MEMORY_CREATED", payload: { content: "Entity profile created: Nova Digital Holdings" } },
      { action: "COMPLIANCE_FLAG", payload: { txnId: "TXN-88201", amount: 1200000, pattern: "layering" } },
      { action: "COMPLIANCE_FLAG", payload: { txnId: "TXN-88450", amount: 340000, pattern: "structuring" } },
      { action: "AUDIT_LOG", payload: { action: "kyc_verification", entity: "Apex Capital", result: "passed" } },
      { action: "AUDIT_LOG", payload: { action: "edd_triggered", entity: "Nova Digital Holdings" } },
      { action: "MEMORY_CREATED", payload: { content: "SAR filed for TXN-88201", sarId: "SAR-2024-0091" } },
      { action: "COMPLIANCE_FLAG", payload: { entity: "Apex Capital", alert: "unusual_trading_volume" } },
      { action: "AUDIT_LOG", payload: { action: "manual_review_assigned", txnId: "TXN-88201", sla: "24h" } },
      { action: "MEMORY_CREATED", payload: { content: "TXN-88450 cleared after source-of-funds received" } },
      { action: "AUDIT_LOG", payload: { action: "rule_evaluation", ruleId: "CR-500K-FLAGGED", triggered: true } },
      { action: "COMPLIANCE_FLAG", payload: { entity: "Nova Digital", alert: "offshore_subsidiary_review" } },
      { action: "AUDIT_LOG", payload: { action: "sar_narrative_generated", sarId: "SAR-2024-0091" } },
      { action: "MEMORY_CREATED", payload: { content: "Compliance rule updated: $500K threshold" } },
      { action: "AUDIT_LOG", payload: { action: "quarterly_audit_summary", entitiesReviewed: 142 } },
      { action: "MEMORY_CREATED", payload: { content: "EDD status: Nova Digital — pending disclosure" } },
    ],
  };
}

function buildAgent3(id: string): AgentDef {
  return {
    id, name: "PagerDuty Synapse Bot",
    memories: [
      "Service: Auth-Gateway — production, p99 latency baseline 120ms, error budget 0.1%",
      "Service: Auth-Gateway — dependent on Redis session store and PostgreSQL user DB",
      "Metric: Auth-Gateway error rate spiked to 4.7% at 03:12 UTC — threshold is 1%",
      "Metric: Redis connection pool exhaustion detected — active connections hit 250/250",
      "Runbook: RB-AUTH-001 — restart Auth-Gateway pods, verify Redis connectivity",
      "Runbook: RB-REDIS-002 — flush idle connections, scale connection pool to 500",
      "Incident: INC-7891 — P1, Auth-Gateway 503 errors affecting 12% of login requests",
      "Incident: INC-7891 — root cause: Redis connection pool saturation under load spike",
      "Engineer: Mike Ross — on-call SRE, notified at 03:14 UTC, acknowledged 03:16 UTC",
      "Resolution: Redis pool scaled to 500, pods restarted, error rate normalized by 03:41",
      "Post-mortem: connection pool default was never updated after traffic 3x growth in Q4",
      "Alert config: Auth-Gateway error_rate > 1% for 5 min triggers P1 page to on-call SRE",
    ],
    relationships: [[2,0,"DETECTED"],[3,1,"SPIKED"],[2,6,"TRIGGERED"],[6,4,"TRIGGERED"],[3,5,"TRIGGERED"],[6,8,"SENT"],[7,3,"DETECTED"],[9,6,"RESOLVED"],[10,7,"DETECTED"],[11,2,"TRIGGERED"]],
    events: [
      { action: "MEMORY_CREATED", payload: { content: "Service profile: Auth-Gateway registered" } },
      { action: "MEMORY_CREATED", payload: { content: "Auth-Gateway dependency map created" } },
      { action: "INCIDENT_TRIGGER", payload: { incidentId: "INC-7891", severity: "P1", errorRate: "4.7%" } },
      { action: "INCIDENT_TRIGGER", payload: { alert: "connection_pool_exhaustion", service: "Redis" } },
      { action: "MEMORY_CREATED", payload: { content: "On-call SRE Mike Ross paged" } },
      { action: "AUDIT_LOG", payload: { action: "runbook_executed", runbookId: "RB-AUTH-001" } },
      { action: "AUDIT_LOG", payload: { action: "runbook_executed", runbookId: "RB-REDIS-002" } },
      { action: "INCIDENT_TRIGGER", payload: { update: "root_cause_identified", incidentId: "INC-7891" } },
      { action: "MEMORY_CREATED", payload: { content: "Redis pool scaled from 250 to 500" } },
      { action: "MEMORY_CREATED", payload: { content: "Auth-Gateway error rate normalized" } },
      { action: "AUDIT_LOG", payload: { action: "incident_resolved", incidentId: "INC-7891" } },
      { action: "MEMORY_CREATED", payload: { content: "Post-mortem filed" } },
      { action: "AUDIT_LOG", payload: { action: "post_mortem_action_items", incidentId: "INC-7891" } },
      { action: "MEMORY_CREATED", payload: { content: "Alert config documented" } },
      { action: "INCIDENT_TRIGGER", payload: { alert: "latency_warning", service: "Auth-Gateway" } },
      { action: "AUDIT_LOG", payload: { action: "capacity_planning_review" } },
      { action: "MEMORY_CREATED", payload: { content: "Autoscale rule added for Redis connection pool" } },
    ],
  };
}

function buildAgent4(id: string): AgentDef {
  return {
    id, name: "Acme Corp Customer Support AI",
    memories: [
      "VIP customer: John Mitchell — account #JM-8923, enterprise plan, annual spend $48,000",
      "Ticket #8923: Billing discrepancy of $47.99 on March invoice — duplicate API overage",
      "Customer preference: John Mitchell prefers email over phone, timezone PST 9am-5pm",
      "Billing history: 3 prior discrepancies in 18 months — invoicing edge case",
      "Cross-agent handoff: escalated from Tier 1 (AutoResolve Bot) to Tier 2",
      "Escalation reason: billing discrepancy > $25 threshold AND VIP customer flag",
      "Resolution: refund of $47.99 approved by manager Sarah Chen, credited to original card",
      "Customer sentiment: NPS score 9 after resolution — improved from NPS 6 pre-incident",
      "Product feedback: John Mitchell requests bulk export for monthly usage reports",
      "Subscription: Enterprise plan, annual billing, renewal 2025-02-01, auto-renew ON",
      "Previous interaction: 2024-03-10 — password reset via email verification",
      "Support strategy: proactive billing audit before renewal to prevent recurrence",
      "UI preference: dark mode enabled — noted in user feedback as reducing eye strain",
      "Engagement: John Mitchell attended Q2 product webinar, asked about API rate limits",
      "Classified strategy: offer 15% renewal discount if 2+ billing issues in 12 months",
    ],
    relationships: [[0,1,"HAS_TICKET"],[1,4,"ESCALATED_TO"],[4,5,"CAUSED_BY"],[1,6,"RESOLVED_BY"],[6,7,"RESULTED_IN"],[0,2,"PREFERS"],[3,11,"SUPPORTS"],[0,9,"CUSTOMER_OF"],[8,13,"RELATED_TO"],[10,2,"CONTEXT_FOR"],[12,2,"INFORMS"],[14,3,"SUPPORTS"]],
    events: [
      { action: "MEMORY_CREATED", payload: { content: "VIP customer profile initialized" } },
      { action: "PROCESS_TICKET", payload: { ticketId: "TKT-8923", priority: "high" } },
      { action: "MEMORY_CREATED", payload: { content: "Billing discrepancy flagged" } },
      { action: "AUDIT_LOG", payload: { action: "escalation_triggered", reason: "amount > $25 AND VIP" } },
      { action: "PROCESS_TICKET", payload: { ticketId: "TKT-8923", update: "assigned_tier2" } },
      { action: "AUDIT_LOG", payload: { action: "refund_approved", amount: 47.99 } },
      { action: "MEMORY_CREATED", payload: { content: "Refund processed and confirmed" } },
      { action: "MEMORY_CREATED", payload: { content: "Customer sentiment improved post-resolution" } },
      { action: "PROCESS_TICKET", payload: { ticketId: "TKT-8923", status: "resolved" } },
      { action: "MEMORY_CREATED", payload: { content: "Product feedback logged: bulk export" } },
      { action: "AUDIT_LOG", payload: { action: "billing_pattern_detected", issuesInPeriod: 3 } },
      { action: "MEMORY_CREATED", payload: { content: "Proactive billing audit strategy created" } },
      { action: "AUDIT_LOG", payload: { action: "cross_agent_handoff_logged" } },
      { action: "MEMORY_CREATED", payload: { content: "Engagement tracked: Q2 webinar attendance" } },
      { action: "PROMOTION_SENT", payload: { promoType: "renewal_discount", discount: "15%" } },
      { action: "MEMORY_CREATED", payload: { content: "Dark mode preference noted" } },
      { action: "AUDIT_LOG", payload: { action: "password_reset_completed" } },
      { action: "MEMORY_CREATED", payload: { content: "Support preference confirmed" } },
      { action: "PROCESS_TICKET", payload: { ticketId: "TKT-9100", type: "feature_inquiry" } },
      { action: "AUDIT_LOG", payload: { action: "memory_sync_completed", memoriesSynced: 15 } },
    ],
  };
}

export function buildAgents(): AgentDef[] {
  return [buildAgent1(uuid()), buildAgent2(uuid()), buildAgent3(uuid()), buildAgent4(uuid())];
}
