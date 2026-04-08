/**
 * Full Alt Doc Matrix — LTV & Quick Reference Guide
 * Program: Prime Time Full Doc / Alt Doc (Bank Statement, P&L, 1099, WVOE, Asset Utilization)
 * Lender: Total Quality Lending
 * Version: 2.19.2026
 * Auto-generated for Gemini AI App — RAG/Hybrid RAG retrieval
 * Generated: 2026-03-29
 *
 * Usage:
 *   import { fullAltDocMatrix } from "./fullAltDocMatrix";
 *   const chunks = fullAltDocMatrix.chunks; // pass to Gemini embeddings
 */

import type { KnowledgeDocument } from "./knowledge_types";

export const fullAltDocMatrix: KnowledgeDocument = {
  metadata: {
    id: 'fullAltDocMatrix',
    title: 'Full Alt Doc Matrix — LTV & Quick Reference Guide',
    program: 'Prime Time Full Doc / Alt Doc (Bank Statement, P&L, 1099, WVOE, Asset Utilization)',
    docType: 'ltv_matrix_and_quick_reference',
    productLine: 'Non-QM Full Doc / Alt Doc',
    version: '2.19.2026',
    lender: 'Total Quality Lending',
    tags: ['non-qm', 'full-doc', 'alt-doc', 'bank-statement', 'profit-loss', '1099', 'wvoe', 'asset-utilization', 'ltv-matrix', 'fico', 'primary-residence', 'second-home', 'investment', 'rag-optimized'],
    totalChunks: 78,
    generatedAt: '2026-03-29T00:00:00Z',
  },
  chunks: [
    {
      id: 'fullAltDocMatrix-000',
      section: 'Full Alt Doc Matrix — LTV & Quick Reference Guide',
      headingLevel: 1,
      content: `**Program:** Prime Time Full Doc / Alt Doc | **Lender:** Total Quality Lending
**Version:** 2.19.2026 | **Covers:** Bank Statement, P&L, 1099, WVOE, Asset Utilization
**Use:** LLM RAG / Hybrid RAG — LTV lookup and underwriting rule retrieval.
⚠️ *Confirm current pricing and overlays with TQL AE before quoting.*

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 0,
    },
    {
      id: 'fullAltDocMatrix-001',
      section: 'LTV Matrix — Full Doc & Alt Doc Programs',
      headingLevel: 2,
      content: `**Sheet:** Matrix_LLM_Ready | Rows grouped by Property Type → FICO → Doc Type

This matrix covers maximum **LTV** by **Property Type**, **Min Credit Score (FICO)**, **Loan Amount range**, **Doc Type**, and **Loan Purpose**.`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 1,
    },
    {
      id: 'fullAltDocMatrix-002',
      section: 'Primary Residence',
      headingLevel: 3,
      content: `Primary Residence`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 2,
    },
    {
      id: 'fullAltDocMatrix-003',
      section: 'FICO 720+',
      headingLevel: 4,
      content: `**Doc Type: Full Doc BankStatements 1099**`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 3,
    },
    {
      id: 'fullAltDocMatrix-004',
      section: 'FICO 720+',
      headingLevel: 4,
      content: `| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 90% |
| up to $1,000,000 | Rate Term Refinance | 85% |
| up to $1,000,000 | Cash Out Refinance | 80% |
| up to $1,500,000 | Purchase | 90% |
| up to $1,500,000 | Rate Term Refinance | 85% |
| up to $1,500,000 | Cash Out Refinance | 80% |
| up to $2,000,000 | Purchase | 85% |
| up to $2,000,000 | Rate Term Refinance | 80% |
| up to $2,000,000 | Cash Out Refinance | 80% |
| up to $2,500,000 | Purchase | 80% |
| up to $2,500,000 | Rate Term Refinance | 75% |
| up to $2,500,000 | Cash Out Refinance | 75% |
| up to $3,000,000 | Purchase | 75% |
| up to $3,000,000 | Rate Term Refinance | 70% |
| up to $3,000,000 | Cash Out Refinance | 70% |
| up to $3,500,000 | Purchase | 70% |
| up to $3,500,000 | Rate Term Refinance | 65% |
| up to $3,500,000 | Cash Out Refinance | Not Eligible |
| up to $4,000,000 | Purchase | 70% |
| up to $4,000,000 | Rate Term Refinance | 65% |
| up to $4,000,000 | Cash Out Refinance | Not Eligible |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 4,
    },
    {
      id: 'fullAltDocMatrix-005',
      section: 'FICO 720+',
      headingLevel: 4,
      content: `**Doc Type: ProfitLoss WrittenVOE AssetUtilization**`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 5,
    },
    {
      id: 'fullAltDocMatrix-006',
      section: 'FICO 720+',
      headingLevel: 4,
      content: `| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 80% |
| up to $1,000,000 | Rate Term Refinance | 75% |
| up to $1,000,000 | Cash Out Refinance | 70% |
| up to $1,500,000 | Purchase | 80% |
| up to $1,500,000 | Rate Term Refinance | 75% |
| up to $1,500,000 | Cash Out Refinance | 70% |
| up to $2,000,000 | Purchase | 80% |
| up to $2,000,000 | Rate Term Refinance | 75% |
| up to $2,000,000 | Cash Out Refinance | 70% |
| up to $2,500,000 | Purchase | 75% |
| up to $2,500,000 | Rate Term Refinance | 70% |
| up to $2,500,000 | Cash Out Refinance | 70% |
| up to $3,000,000 | Purchase | 70% |
| up to $3,000,000 | Rate Term Refinance | Not Eligible |
| up to $3,000,000 | Cash Out Refinance | Not Eligible |
| up to $3,500,000 | Purchase | Not Eligible |
| up to $3,500,000 | Rate Term Refinance | Not Eligible |
| up to $3,500,000 | Cash Out Refinance | Not Eligible |
| up to $4,000,000 | Purchase | Not Eligible |
| up to $4,000,000 | Rate Term Refinance | Not Eligible |
| up to $4,000,000 | Cash Out Refinance | Not Eligible |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 6,
    },
    {
      id: 'fullAltDocMatrix-007',
      section: 'FICO 700+',
      headingLevel: 4,
      content: `**Doc Type: Full Doc BankStatements 1099**`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 7,
    },
    {
      id: 'fullAltDocMatrix-008',
      section: 'FICO 700+',
      headingLevel: 4,
      content: `| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 90% |
| up to $1,000,000 | Rate Term Refinance | 85% |
| up to $1,000,000 | Cash Out Refinance | 80% |
| up to $1,500,000 | Purchase | 90% |
| up to $1,500,000 | Rate Term Refinance | 85% |
| up to $1,500,000 | Cash Out Refinance | 80% |
| up to $2,000,000 | Purchase | 85% |
| up to $2,000,000 | Rate Term Refinance | 75% |
| up to $2,000,000 | Cash Out Refinance | 70% |
| up to $2,500,000 | Purchase | 75% |
| up to $2,500,000 | Rate Term Refinance | 70% |
| up to $2,500,000 | Cash Out Refinance | 65% |
| up to $3,000,000 | Purchase | 75% |
| up to $3,000,000 | Rate Term Refinance | 70% |
| up to $3,000,000 | Cash Out Refinance | 65% |
| up to $3,500,000 | Purchase | 70% |
| up to $3,500,000 | Rate Term Refinance | 65% |
| up to $3,500,000 | Cash Out Refinance | Not Eligible |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 8,
    },
    {
      id: 'fullAltDocMatrix-009',
      section: 'FICO 700+',
      headingLevel: 4,
      content: `**Doc Type: ProfitLoss WrittenVOE AssetUtilization**`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 9,
    },
    {
      id: 'fullAltDocMatrix-010',
      section: 'FICO 700+',
      headingLevel: 4,
      content: `| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 80% |
| up to $1,000,000 | Rate Term Refinance | 75% |
| up to $1,000,000 | Cash Out Refinance | 70% |
| up to $1,500,000 | Purchase | 80% |
| up to $1,500,000 | Rate Term Refinance | 75% |
| up to $1,500,000 | Cash Out Refinance | 70% |
| up to $2,000,000 | Purchase | 80% |
| up to $2,000,000 | Rate Term Refinance | 75% |
| up to $2,000,000 | Cash Out Refinance | 70% |
| up to $2,500,000 | Purchase | 75% |
| up to $2,500,000 | Rate Term Refinance | 70% |
| up to $2,500,000 | Cash Out Refinance | 65% |
| up to $3,000,000 | Purchase | 70% |
| up to $3,000,000 | Rate Term Refinance | Not Eligible |
| up to $3,000,000 | Cash Out Refinance | Not Eligible |
| up to $3,500,000 | Purchase | Not Eligible |
| up to $3,500,000 | Rate Term Refinance | Not Eligible |
| up to $3,500,000 | Cash Out Refinance | Not Eligible |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 10,
    },
    {
      id: 'fullAltDocMatrix-011',
      section: 'FICO 680+',
      headingLevel: 4,
      content: `**Doc Type: Full Doc BankStatements 1099**

| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 90% |
| up to $1,000,000 | Rate Term Refinance | 85% |
| up to $1,000,000 | Cash Out Refinance | 75% |
| up to $1,500,000 | Purchase | 85% |
| up to $1,500,000 | Rate Term Refinance | 80% |
| up to $1,500,000 | Cash Out Refinance | 75% |
| up to $2,000,000 | Purchase | 80% |
| up to $2,000,000 | Rate Term Refinance | 75% |
| up to $2,000,000 | Cash Out Refinance | 70% |
| up to $2,500,000 | Purchase | 75% |
| up to $2,500,000 | Rate Term Refinance | 70% |
| up to $2,500,000 | Cash Out Refinance | 65% |
| up to $3,000,000 | Purchase | 70% |
| up to $3,000,000 | Rate Term Refinance | 65% |
| up to $3,000,000 | Cash Out Refinance | 65% |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 11,
    },
    {
      id: 'fullAltDocMatrix-012',
      section: 'FICO 680+',
      headingLevel: 4,
      content: `**Doc Type: ProfitLoss WrittenVOE AssetUtilization**`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 12,
    },
    {
      id: 'fullAltDocMatrix-013',
      section: 'FICO 680+',
      headingLevel: 4,
      content: `| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 80% |
| up to $1,000,000 | Rate Term Refinance | 75% |
| up to $1,000,000 | Cash Out Refinance | 70% |
| up to $1,500,000 | Purchase | 80% |
| up to $1,500,000 | Rate Term Refinance | 75% |
| up to $1,500,000 | Cash Out Refinance | 70% |
| up to $2,000,000 | Purchase | 75% |
| up to $2,000,000 | Rate Term Refinance | 70% |
| up to $2,000,000 | Cash Out Refinance | 65% |
| up to $2,500,000 | Purchase | 70% |
| up to $2,500,000 | Rate Term Refinance | 65% |
| up to $2,500,000 | Cash Out Refinance | 60% |
| up to $3,000,000 | Purchase | Not Eligible |
| up to $3,000,000 | Rate Term Refinance | Not Eligible |
| up to $3,000,000 | Cash Out Refinance | Not Eligible |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 13,
    },
    {
      id: 'fullAltDocMatrix-014',
      section: 'FICO 660+',
      headingLevel: 4,
      content: `**Doc Type: Full Doc BankStatements 1099**

| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 80% |
| up to $1,000,000 | Rate Term Refinance | 80% |
| up to $1,000,000 | Cash Out Refinance | 75% |
| up to $1,500,000 | Purchase | 80% |
| up to $1,500,000 | Rate Term Refinance | 75% |
| up to $1,500,000 | Cash Out Refinance | 75% |
| up to $2,000,000 | Purchase | 75% |
| up to $2,000,000 | Rate Term Refinance | 70% |
| up to $2,000,000 | Cash Out Refinance | 65% |
| up to $2,500,000 | Purchase | 70% |
| up to $2,500,000 | Rate Term Refinance | 65% |
| up to $2,500,000 | Cash Out Refinance | 65% |
| $100,000–$149,000 | Purchase | 80% |
| $100,000–$149,000 | Rate Term Refinance | 75% |
| $100,000–$149,000 | Cash Out Refinance | 75% |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 14,
    },
    {
      id: 'fullAltDocMatrix-015',
      section: 'FICO 660+',
      headingLevel: 4,
      content: `**Doc Type: ProfitLoss WrittenVOE AssetUtilization**`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 15,
    },
    {
      id: 'fullAltDocMatrix-016',
      section: 'FICO 660+',
      headingLevel: 4,
      content: `| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | Not Eligible |
| up to $1,000,000 | Rate Term Refinance | Not Eligible |
| up to $1,000,000 | Cash Out Refinance | Not Eligible |
| up to $1,500,000 | Purchase | Not Eligible |
| up to $1,500,000 | Rate Term Refinance | Not Eligible |
| up to $1,500,000 | Cash Out Refinance | Not Eligible |
| up to $2,000,000 | Purchase | Not Eligible |
| up to $2,000,000 | Rate Term Refinance | Not Eligible |
| up to $2,000,000 | Cash Out Refinance | Not Eligible |
| up to $2,500,000 | Purchase | Not Eligible |
| up to $2,500,000 | Rate Term Refinance | Not Eligible |
| up to $2,500,000 | Cash Out Refinance | Not Eligible |
| $100,000–$149,000 | Purchase | 75% |
| $100,000–$149,000 | Rate Term Refinance | 70% |
| $100,000–$149,000 | Cash Out Refinance | 70% |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 16,
    },
    {
      id: 'fullAltDocMatrix-017',
      section: 'FICO 640+',
      headingLevel: 4,
      content: `**Doc Type: Full Doc BankStatements 1099**

| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 80% |
| up to $1,000,000 | Rate Term Refinance | 75% |
| up to $1,000,000 | Cash Out Refinance | 70% |
| up to $1,500,000 | Purchase | 70% |
| up to $1,500,000 | Rate Term Refinance | 65% |
| up to $1,500,000 | Cash Out Refinance | 65% |
| up to $2,000,000 | Purchase | 65% |
| up to $2,000,000 | Rate Term Refinance | Not Eligible |
| up to $2,000,000 | Cash Out Refinance | Not Eligible |

**Doc Type: ProfitLoss WrittenVOE AssetUtilization**`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 17,
    },
    {
      id: 'fullAltDocMatrix-018',
      section: 'FICO 640+',
      headingLevel: 4,
      content: `| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | Not Eligible |
| up to $1,000,000 | Rate Term Refinance | Not Eligible |
| up to $1,000,000 | Cash Out Refinance | Not Eligible |
| up to $1,500,000 | Purchase | Not Eligible |
| up to $1,500,000 | Rate Term Refinance | Not Eligible |
| up to $1,500,000 | Cash Out Refinance | Not Eligible |
| up to $2,000,000 | Purchase | Not Eligible |
| up to $2,000,000 | Rate Term Refinance | Not Eligible |
| up to $2,000,000 | Cash Out Refinance | Not Eligible |`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 18,
    },
    {
      id: 'fullAltDocMatrix-019',
      section: 'FICO 620+',
      headingLevel: 4,
      content: `**Doc Type: Full Doc BankStatements 1099**

| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | 70% |
| up to $1,000,000 | Rate Term Refinance | 70% |
| up to $1,000,000 | Cash Out Refinance | Not Eligible |

**Doc Type: ProfitLoss WrittenVOE AssetUtilization**

| Loan Amount Range | Purpose | Max LTV |
|---|---|---|
| up to $1,000,000 | Purchase | Not Eligible |
| up to $1,000,000 | Rate Term Refinance | Not Eligible |
| up to $1,000,000 | Cash Out Refinance | Not Eligible |

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 19,
    },
    {
      id: 'fullAltDocMatrix-020',
      section: 'Quick Reference Guide — Underwriting Rules',
      headingLevel: 2,
      content: `**Sheet:** QR GUIDE_LLM_Ready | Rules grouped by Category → Sub-Category
Each rule includes a Rule_ID for precise citation.`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 20,
    },
    {
      id: 'fullAltDocMatrix-021',
      section: 'Property_Type',
      headingLevel: 3,
      content: `Property_Type`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 21,
    },
    {
      id: 'fullAltDocMatrix-022',
      section: 'Eligible_Types',
      headingLevel: 4,
      content: `- **[PT-001]** **Single Family** — Eligibility: \`Eligible (Attached and Detached)\`
- **[PT-002]** **2-4 Units** — Max LTV/CLTV: \`85%\`
- **[PT-003]** **Condominiums** — Max LTV/CLTV: \`85%\`
- **[PT-004]** **Non-Warrantable Condo** — Max LTV/CLTV: \`85%\`
- **[PT-005]** **Non-Warrantable Condo** — Max Loan Amount: \`$2,500,000\`
- **[PT-006]** **Condo Hotel** — Max LTV/CLTV: \`85%\`
- **[PT-007]** **Condo Hotel** — Max Loan Amount: \`$2,500,000\`
- **[PT-008]** **Rural** — Max LTV/CLTV Purchase: \`80%\`
- **[PT-009]** **Rural** — Max LTV/CLTV Refinance: \`75%\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 22,
    },
    {
      id: 'fullAltDocMatrix-023',
      section: 'Housing_History',
      headingLevel: 3,
      content: `Housing_History`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 23,
    },
    {
      id: 'fullAltDocMatrix-024',
      section: '1x30x12',
      headingLevel: 4,
      content: `- **[HH-001]** **Housing history is 1x30x12** — Max LTV/CLTV Purchase: \`See eligibility matrix (no additional restriction)\`
- **[HH-002]** **Housing history is 1x30x12** — Max LTV/CLTV Refinance: \`See eligibility matrix (no additional restriction)\`
- **[HH-003]** **Housing history is 1x30x12** — Max Loan Amount: \`See eligibility matrix (no additional restriction)\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 24,
    },
    {
      id: 'fullAltDocMatrix-025',
      section: '0x60x12',
      headingLevel: 4,
      content: `- **[HH-004]** **Housing history is 0x60x12** — Max LTV/CLTV Purchase: \`80%\`
- **[HH-005]** **Housing history is 0x60x12** — Max LTV/CLTV Refinance: \`75%\`
- **[HH-006]** **Housing history is 0x60x12** — Max Loan Amount: \`$1,500,000\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 25,
    },
    {
      id: 'fullAltDocMatrix-026',
      section: '0x90x12',
      headingLevel: 4,
      content: `- **[HH-007]** **Housing history is 0x90x12** — Max LTV/CLTV Purchase: \`70%\`
- **[HH-008]** **Housing history is 0x90x12** — Max LTV/CLTV Refinance: \`Not Eligible\`
- **[HH-009]** **Housing history is 0x90x12** — Max Loan Amount: \`$1,000,000\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 26,
    },
    {
      id: 'fullAltDocMatrix-027',
      section: 'Forbearance',
      headingLevel: 4,
      content: `- **[HH-010]** **Forbearance, Modification, or Deferral <= 12 months** — Treatment: \`Treated as 0x90x12\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 27,
    },
    {
      id: 'fullAltDocMatrix-028',
      section: 'Credit_Event_Seasoning',
      headingLevel: 3,
      content: `Credit_Event_Seasoning`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 28,
    },
    {
      id: 'fullAltDocMatrix-029',
      section: 'BK_FC_SS_DIL_PreFC_MC',
      headingLevel: 4,
      content: `- **[CE-001]** **Seasoning >= 36 months** — Max LTV/CLTV Purchase: \`See eligibility matrix (no additional restriction)\`
- **[CE-002]** **Seasoning >= 36 months** — Max LTV/CLTV Refinance: \`See eligibility matrix (no additional restriction)\`
- **[CE-003]** **Seasoning >= 36 months** — Max Loan Amount: \`See eligibility matrix (no additional restriction)\`
- **[CE-004]** **Seasoning >= 24 months** — Max LTV/CLTV Purchase: \`80%\`
- **[CE-005]** **Seasoning >= 24 months** — Max LTV/CLTV Refinance: \`75%\`
- **[CE-006]** **Seasoning >= 24 months** — Max Loan Amount: \`$1,500,000\`
- **[CE-007]** **Seasoning >= 12 months** — Max LTV/CLTV Purchase: \`70%\`
- **[CE-008]** **Seasoning >= 12 months** — Max LTV/CLTV Refinance: \`Not Eligible\`
- **[CE-009]** **Seasoning >= 12 months** — Max Loan Amount: \`$1,000,000\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 29,
    },
    {
      id: 'fullAltDocMatrix-030',
      section: 'BK_FC_SS_DIL_PreFC_MC',
      headingLevel: 4,
      content: `---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 30,
    },
    {
      id: 'fullAltDocMatrix-031',
      section: 'State_Eligibility',
      headingLevel: 3,
      content: `State_Eligibility`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 31,
    },
    {
      id: 'fullAltDocMatrix-032',
      section: 'State_Overlays',
      headingLevel: 4,
      content: `- **[SE-001]** **States: CT, FL, IL, NJ, NY** — Max LTV/CLTV Purchase: \`85%\`
- **[SE-002]** **States: CT, FL, IL, NJ, NY** — Max LTV/CLTV Refinance: \`80%\`
- **[SE-003]** **States: CT, FL, IL, NJ, NY** — Max Loan Amount: \`$2,000,000\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 32,
    },
    {
      id: 'fullAltDocMatrix-033',
      section: 'Ineligible_Locations',
      headingLevel: 4,
      content: `- **[SE-004]** **Puerto Rico** — Eligibility: \`Ineligible\`
- **[SE-005]** **Guam** — Eligibility: \`Ineligible\`
- **[SE-006]** **US Virgin Islands** — Eligibility: \`Ineligible\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 33,
    },
    {
      id: 'fullAltDocMatrix-034',
      section: 'Declining_Market',
      headingLevel: 3,
      content: `Declining_Market`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 34,
    },
    {
      id: 'fullAltDocMatrix-035',
      section: 'Appraisal_Flag',
      headingLevel: 4,
      content: `- **[DM-001]** **Property in declining market per appraisal** — Max LTV/CLTV Purchase: \`85%\`
- **[DM-002]** **Property in declining market per appraisal** — Max LTV/CLTV Refinance: \`80%\`
- **[DM-003]** **Property in declining market per appraisal** — Max Loan Amount: \`$2,000,000\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 35,
    },
    {
      id: 'fullAltDocMatrix-036',
      section: 'General_Requirements',
      headingLevel: 3,
      content: `General_Requirements`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 36,
    },
    {
      id: 'fullAltDocMatrix-037',
      section: 'Product_Type',
      headingLevel: 4,
      content: `- **[GR-001]** **Fixed Rate** — Eligible Terms: \`15-year, 30-year, 40-year\`
- **[GR-002]** **ARM** — Eligible Terms: \`5/6 ARM, 7/6 ARM, 10/6 ARM (all with 30-year term)\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 37,
    },
    {
      id: 'fullAltDocMatrix-038',
      section: 'Interest_Only',
      headingLevel: 4,
      content: `- **[GR-003]** **Interest Only** — Min Credit Score: \`660\`
- **[GR-004]** **Interest Only** — Max LTV: \`90%\`
- **[GR-005]** **Interest Only with 40-year ARM** — Eligibility: \`Eligible when combined with interest only feature\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 38,
    },
    {
      id: 'fullAltDocMatrix-039',
      section: 'Loan_Amounts',
      headingLevel: 4,
      content: `- **[GR-006]** **All Loans** — Minimum Loan Amount: \`$150,000\`
- **[GR-007]** **All Loans** — Maximum Loan Amount: \`$4,000,000\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 39,
    },
    {
      id: 'fullAltDocMatrix-040',
      section: 'Loan_Purpose',
      headingLevel: 4,
      content: `- **[GR-008]** **All Loans** — Eligible Purposes: \`Purchase, Rate/Term Refinance, Cash Out Refinance\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 40,
    },
    {
      id: 'fullAltDocMatrix-041',
      section: 'Occupancy',
      headingLevel: 4,
      content: `- **[GR-009]** **All Loans** — Eligible Occupancy Types: \`Primary Residence, Second Home, Investment\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 41,
    },
    {
      id: 'fullAltDocMatrix-042',
      section: 'Acreage',
      headingLevel: 4,
      content: `- **[GR-010]** **All Properties** — Maximum Acreage: \`20 acres\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 42,
    },
    {
      id: 'fullAltDocMatrix-043',
      section: 'Cash_In_Hand',
      headingLevel: 4,
      content: `- **[GR-011]** **All Loans** — Max Cash-In-Hand: \`Unlimited\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 43,
    },
    {
      id: 'fullAltDocMatrix-044',
      section: 'Appraisals',
      headingLevel: 4,
      content: `- **[GR-012]** **All Loans** — Required Forms: \`FNMA Form 1004, 1025, 1073 with interior/exterior inspection\`
- **[GR-013]** **All Loans** — Appraisal Review: \`Required unless 2nd appraisal obtained\`
- **[GR-014]** **Loan Amount > $2,000,000** — 2nd Appraisal: \`Required\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 44,
    },
    {
      id: 'fullAltDocMatrix-045',
      section: 'Income_Requirements',
      headingLevel: 3,
      content: `Income_Requirements`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 45,
    },
    {
      id: 'fullAltDocMatrix-046',
      section: 'Full_Doc_Standard',
      headingLevel: 4,
      content: `- **[IR-001]** **Wage/Salary (Standard Doc)** — Required Documents: \`Paystubs, W-2s, 1-year or 2-years Tax Returns, IRS Form 4506-C, Verbal VOE\`
- **[IR-002]** **Self-Employed (Standard Doc)** — Required Documents: \`1-year or 2-years Personal and Business Tax Returns, YTD P&L, IRS Form 4506-C\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 46,
    },
    {
      id: 'fullAltDocMatrix-047',
      section: 'Full_Doc_AUS',
      headingLevel: 4,
      content: `- **[IR-003]** **AUS Findings** — Fannie Mae: \`DU Approve/Eligible required\`
- **[IR-004]** **AUS Findings** — Freddie Mac: \`LPA Accept/Eligible required\`
- **[IR-005]** **AUS Findings** — Caution or Refer with Caution: \`Not Allowed\`
- **[IR-006]** **AUS Findings** — Appraisal Waiver from DU/LPA: \`Not Eligible\`
- **[IR-007]** **Fannie Mae DU Approve/Ineligible or Freddie Mac LPA Accept/Ineligible** — Allowed For: \`Loan amount, interest only, prepayment penalty, number of financed properties, credit score < 720 with >= 7 financed properties, refinances exceeding 75% LTV subject to Verus program max\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 47,
    },
    {
      id: 'fullAltDocMatrix-048',
      section: 'Alt_Doc_Personal_Bank_Stmts',
      headingLevel: 4,
      content: `- **[IR-008]** **Personal Bank Statements** — Required Statements: \`12 or 24 months personal + 2 months business bank statements\`
- **[IR-009]** **Personal Bank Statements** — Income Calculation: \`Total eligible deposits from 12 or 24 months personal statements divided by number of statements. Business statements must reflect business activity and transfers to personal account.\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 48,
    },
    {
      id: 'fullAltDocMatrix-049',
      section: 'Alt_Doc_Business_Bank_Stmts',
      headingLevel: 4,
      content: `- **[IR-010]** **Business Bank Statements** — Required Statements: \`12 or 24 months of business bank statements\`
- **[IR-011]** **Business Bank Statements - Fixed Expense Ratio** — Expense Ratio: \`50%\`
- **[IR-012]** **Business Bank Statements - 3rd Party Expense Ratio** — Min Expense Ratio: \`10% (provided by CPA, EA, or tax preparer)\`
- **[IR-013]** **Business Bank Statements - 3rd Party P&L** — Requirement: \`P&L prepared by CPA, EA, or tax preparer\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 49,
    },
    {
      id: 'fullAltDocMatrix-050',
      section: 'Alt_Doc_PnL_Only',
      headingLevel: 4,
      content: `- **[IR-014]** **Profit & Loss Statement Only** — Required Document: \`12 or 24 months CPA/EA/CTEC/Tax Attorney prepared P&L\`
- **[IR-015]** **Profit & Loss Statement Only** — Attestation Requirement: \`CPA/EA/CTEC/Tax Attorney must attest they completed or filed borrower's most recent business tax return\`
- **[IR-016]** **Profit & Loss Statement Only** — Max Housing History: \`1x30x12\`
- **[IR-017]** **Profit & Loss Statement Only** — Min Credit Event Seasoning: \`36 months\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 50,
    },
    {
      id: 'fullAltDocMatrix-051',
      section: 'Alt_Doc_Written_VOE',
      headingLevel: 4,
      content: `- **[IR-018]** **Written VOE** — Required Form: \`FNMA Form 1005\`
- **[IR-019]** **Written VOE** — Required Bank Statements: \`2 most recent months personal bank statements showing employer deposits\`
- **[IR-020]** **Written VOE** — Max Housing History: \`1x30x12\`
- **[IR-021]** **Written VOE** — Min Credit Event Seasoning: \`36 months\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 51,
    },
    {
      id: 'fullAltDocMatrix-052',
      section: 'Alt_Doc_1099_Only',
      headingLevel: 4,
      content: `- **[IR-022]** **IRS Form 1099 Only** — Required Document: \`1-year or 2-years 1099\`
- **[IR-023]** **IRS Form 1099 Only** — Fixed Expense Ratio: \`10%\`
- **[IR-024]** **IRS Form 1099 Only** — YTD Documentation: \`Required to support continued receipt of income from same source\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 52,
    },
    {
      id: 'fullAltDocMatrix-053',
      section: 'Alt_Doc_Asset_Utilization',
      headingLevel: 4,
      content: `- **[IR-025]** **Asset Utilization** — Income Calculation: \`Eligible assets divided by 84 for monthly income stream\`
- **[IR-026]** **Asset Utilization** — Max Housing History: \`1x30x12\`
- **[IR-027]** **Asset Utilization** — Min Credit Event Seasoning: \`36 months\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 53,
    },
    {
      id: 'fullAltDocMatrix-054',
      section: 'Credit_Score',
      headingLevel: 3,
      content: `Credit_Score`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 54,
    },
    {
      id: 'fullAltDocMatrix-055',
      section: 'Representative_Score',
      headingLevel: 4,
      content: `- **[CS-001]** **All Loans** — Which Score To Use: \`Representative credit score of the borrower with the highest qualifying income\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 55,
    },
    {
      id: 'fullAltDocMatrix-056',
      section: 'Reserves',
      headingLevel: 3,
      content: `Reserves`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 56,
    },
    {
      id: 'fullAltDocMatrix-057',
      section: 'LTV_Based',
      headingLevel: 4,
      content: `- **[RV-001]** **LTV <= 80%** — Required Reserves: \`3 months PITIA\`
- **[RV-002]** **LTV 80.01% to 85%** — Required Reserves: \`6 months PITIA\`
- **[RV-003]** **LTV > 85%** — Required Reserves: \`12 months PITIA\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 57,
    },
    {
      id: 'fullAltDocMatrix-058',
      section: 'Loan_Amount_Based',
      headingLevel: 4,
      content: `- **[RV-004]** **Loan Amount > $1,500,000** — Required Reserves: \`9 months PITIA\`
- **[RV-005]** **Loan Amount > $2,500,000** — Required Reserves: \`12 months PITIA\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 58,
    },
    {
      id: 'fullAltDocMatrix-059',
      section: 'General',
      headingLevel: 4,
      content: `- **[RV-006]** **All Loans** — Cash Out for Reserves: \`Cash out may be used to satisfy reserves requirement\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 59,
    },
    {
      id: 'fullAltDocMatrix-060',
      section: 'Borrower_Contribution',
      headingLevel: 3,
      content: `Borrower_Contribution`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 60,
    },
    {
      id: 'fullAltDocMatrix-061',
      section: 'Minimum',
      headingLevel: 4,
      content: `- **[BC-001]** **Primary Residence or Second Home** — Min Contribution: \`5%\`
- **[BC-002]** **Investment Property** — Min Contribution: \`10%\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 61,
    },
    {
      id: 'fullAltDocMatrix-062',
      section: 'Tradelines',
      headingLevel: 3,
      content: `Tradelines`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 62,
    },
    {
      id: 'fullAltDocMatrix-063',
      section: 'Minimum_Requirement',
      headingLevel: 4,
      content: `- **[TL-001]** **Standard (fewer than 3 credit scores)** — Min Tradelines Option A: \`2 tradelines reporting for 24 months with activity in last 12 months\`
- **[TL-002]** **Standard (fewer than 3 credit scores)** — Min Tradelines Option B: \`3 tradelines reporting for 12 months with recent activity\`
- **[TL-003]** **Primary borrower has 3 credit scores** — Tradeline Requirement: \`Waived\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 63,
    },
    {
      id: 'fullAltDocMatrix-064',
      section: 'Escrows',
      headingLevel: 3,
      content: `Escrows`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 64,
    },
    {
      id: 'fullAltDocMatrix-065',
      section: 'HPML',
      headingLevel: 4,
      content: `- **[ES-001]** **HPML Loans** — Required Escrows: \`Property taxes, hazard insurance, and flood insurance (if applicable)\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 65,
    },
    {
      id: 'fullAltDocMatrix-066',
      section: 'Assets',
      headingLevel: 3,
      content: `Assets`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 66,
    },
    {
      id: 'fullAltDocMatrix-067',
      section: 'Verification',
      headingLevel: 4,
      content: `- **[AS-001]** **All Loans** — Min Verification Period: \`30 days\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 67,
    },
    {
      id: 'fullAltDocMatrix-068',
      section: 'Large_Deposits',
      headingLevel: 4,
      content: `- **[AS-002]** **All Loans** — Large Deposit Requirement: \`Must be sourced\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 68,
    },
    {
      id: 'fullAltDocMatrix-069',
      section: 'DTI',
      headingLevel: 3,
      content: `DTI`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 69,
    },
    {
      id: 'fullAltDocMatrix-070',
      section: 'Standard_Max',
      headingLevel: 4,
      content: `- **[DTI-001]** **All Loans** — Max DTI: \`50%\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 70,
    },
    {
      id: 'fullAltDocMatrix-071',
      section: 'FTHB_Restriction',
      headingLevel: 4,
      content: `- **[DTI-002]** **First Time Home Buyer** — DTI Restriction: \`See FTHB guidelines for DTI restrictions\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 71,
    },
    {
      id: 'fullAltDocMatrix-072',
      section: 'Extended_55_Percent',
      headingLevel: 4,
      content: `- **[DTI-003]** **Primary Residence up to 55% DTI** — Min Residual Income: \`$3,500\`
- **[DTI-004]** **Primary Residence up to 55% DTI** — Max LTV/CLTV: \`80%\`
- **[DTI-005]** **Primary Residence up to 55% DTI** — Documentation: \`Standard Doc 2-years\`
- **[DTI-006]** **Primary Residence up to 55% DTI** — Min Reserves: \`6 months\`
- **[DTI-007]** **Primary Residence up to 55% DTI** — FTHB Eligibility: \`Not Eligible\`
- **[DTI-008]** **Primary Residence up to 55% DTI** — Min Credit Score: \`660\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 72,
    },
    {
      id: 'fullAltDocMatrix-073',
      section: 'Document_Age',
      headingLevel: 3,
      content: `Document_Age`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 73,
    },
    {
      id: 'fullAltDocMatrix-074',
      section: 'General',
      headingLevel: 4,
      content: `- **[DA-001]** **All Documents** — Max Document Age: \`120 days\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 74,
    },
    {
      id: 'fullAltDocMatrix-075',
      section: 'Prepayment_Penalty',
      headingLevel: 3,
      content: `Prepayment_Penalty`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 75,
    },
    {
      id: 'fullAltDocMatrix-076',
      section: 'General',
      headingLevel: 4,
      content: `- **[PP-001]** **Investment Only** — Max Prepayment Period: \`Up to 5 years (see rate sheet)\``,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 76,
    },
    {
      id: 'fullAltDocMatrix-077',
      section: 'State_Restrictions',
      headingLevel: 4,
      content: `- **[PP-002]** **States: AK, KS, MI, MN, NM, RI** — Prepayment Penalty: \`Not Allowed\`
- **[PP-003]** **Loans vested to individuals in IL & NJ** — Prepayment Penalty: \`Not Allowed\`
- **[PP-004]** **Loan amounts less than $319,777 in PA** — Prepayment Penalty: \`Not Allowed\`
- **[PP-005]** **1-2 unit properties in OH** — Prepayment Penalty Cap: \`Cannot exceed 1% of loan balance during first 5 years\`

---`,
      sourceDocId: 'fullAltDocMatrix',
      chunkIndex: 77,
    },
  ],
};

export default fullAltDocMatrix;
