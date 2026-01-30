// System prompt for ChatGPT to extract structured metadata from sports articles
export const SYSTEM_PROMPT = `You are a sports article analyzer. Your task is to extract structured information from sports articles and return it as valid JSON.

Extract the following information:
1. clubs: Array of sport clubs mentioned with their name, county, and league
2. matches: Array of matches mentioned with teams and results
3. primaryCounty: The main county/area the article focuses on
4. leagues: All leagues mentioned in the article

Rules:
- Club names should be full official names (e.g., "Dublin GAA", "Shamrock Rovers")
- Counties should be valid Irish county names
- For matches, include homeTeam, awayTeam, and result (if mentioned)
- primaryCounty should be a single county name, not multiple
- If a piece of information is not mentioned, omit it from the respective array or use null
- Return ONLY valid JSON, no other text

The JSON structure should match this format:
{
  "clubs": [
    {
      "name": "Club Name",
      "county": "County Name",
      "league": "League Name (optional)"
    }
  ],
  "matches": [
    {
      "homeTeam": "Team 1",
      "awayTeam": "Team 2",
      "result": "Score (optional)"
    }
  ],
  "primaryCounty": "County Name",
  "leagues": ["League 1", "League 2"]
}`;

// Few-shot examples to guide the model
export const FEW_SHOT_EXAMPLES = [
  {
    input: `Dublin GAA secured a decisive 2-15 to 1-12 victory over Kerry GAA in yesterday's All-Ireland Senior Championship final at Croke Park. This championship is the premier competition for both teams. The match showcased excellent attacking play from Dublin's midfield.`,
    output: {
      clubs: [
        { name: "Dublin GAA", county: "Dublin", league: "All-Ireland Senior Championship" },
        { name: "Kerry GAA", county: "Kerry", league: "All-Ireland Senior Championship" }
      ],
      matches: [
        { homeTeam: "Dublin GAA", awayTeam: "Kerry GAA", result: "2-15 to 1-12" }
      ],
      primaryCounty: "Dublin",
      leagues: ["All-Ireland Senior Championship"]
    }
  },
  {
    input: `Shamrock Rovers are preparing for this weekend's Dublin derby against Bohemians FC. Both clubs play in the League of Ireland Premier Division. The fixture at Tallaght Stadium is expected to be closely contested. Rovers have been training hard this week.`,
    output: {
      clubs: [
        { name: "Shamrock Rovers", county: "Dublin", league: "League of Ireland Premier Division" },
        { name: "Bohemians FC", county: "Dublin", league: "League of Ireland Premier Division" }
      ],
      matches: [],
      primaryCounty: "Dublin",
      leagues: ["League of Ireland Premier Division"]
    }
  },
  {
    input: `Cork Rugby Club announced their new signing from Limerick. The player will compete in the Munster Rugby provincial competition. Cork is excited to have strengthened their squad ahead of the upcoming season.`,
    output: {
      clubs: [
        { name: "Cork Rugby Club", county: "Cork", league: "Munster Rugby" },
        { name: "Limerick Rugby", county: "Limerick", league: "Munster Rugby" }
      ],
      matches: [],
      primaryCounty: "Cork",
      leagues: ["Munster Rugby"]
    }
  }
];

// Build the complete prompt for extracting metadata
export function buildExtractionPrompt(articleContent) {
  const examplesText = FEW_SHOT_EXAMPLES.map((ex, idx) => `
Example ${idx + 1}:
Input: "${ex.input}"
Output: ${JSON.stringify(ex.output, null, 2)}
`).join('\n');

  return `Here are some examples of how to extract information from sports articles:

${examplesText}

Now, extract the structured information from this article:

"${articleContent}"

Return ONLY the JSON object with no additional text or explanation.`;
}

export default {
  SYSTEM_PROMPT,
  FEW_SHOT_EXAMPLES,
  buildExtractionPrompt
};
