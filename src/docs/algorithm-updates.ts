
export const algorithmUpdatesDocs = `
# Google Algorithm Updates Reference

The \`analytics_drop_attribution\` tool correlates traffic drops with major known Google Algorithm Updates. The following updates are currently supported:

| Date | Update Name | Impact Area |
|------|-------------|-------------|
| 2025-01-15 | January 2025 Core Update | General Ranking |
| 2024-11-11 | November 2024 Core Update | General Ranking |
| 2024-08-15 | August 2024 Core Update | General Ranking |
| 2024-06-20 | June 2024 Spam Update | Content Quality / Spam |
| 2024-03-05 | March 2024 Core Update | General Ranking / Quality |
| 2023-11-02 | November 2023 Core Update | General Ranking |
| 2023-10-05 | October 2023 Core Update | General Ranking |
| 2023-09-14 | September 2023 Helpful Content Update | Quality / Value |

## How Attribution Works
When a traffic drop is detected, the system checks if it occurred within **+/- 2 days** of any of these dates. If it matches, the update is flagged as a potential primary cause of the drop.
`;

export default algorithmUpdatesDocs;
