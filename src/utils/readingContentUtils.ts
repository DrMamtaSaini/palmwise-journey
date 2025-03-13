
import { ExtendedPalmReading } from "../types/PalmReading";

export const getReadingContent = (reading: ExtendedPalmReading | null) => {
  if (!reading || !reading.results) return null;

  const content: any = {
    lifeLine: {
      title: "Life Line",
      content: [
        reading.results.lifeLine.prediction,
        `Strength: ${reading.results.lifeLine.strength}%`
      ],
      insights: reading.results.lifeLine.insights,
      remedies: reading.results.lifeLine.remedies,
      premium: false
    },
    heartLine: {
      title: "Heart Line",
      content: [
        reading.results.heartLine.prediction,
        `Strength: ${reading.results.heartLine.strength}%`
      ],
      insights: reading.results.heartLine.insights,
      remedies: reading.results.heartLine.remedies,
      premium: false
    },
    headLine: {
      title: "Head Line",
      content: [
        reading.results.headLine.prediction,
        `Strength: ${reading.results.headLine.strength}%`
      ],
      insights: reading.results.headLine.insights,
      remedies: reading.results.headLine.remedies,
      premium: false
    },
    past: {
      title: "Past",
      content: [
        reading.results.past?.prediction || "No past reading available.",
        reading.results.past ? `Significance: ${reading.results.past.significance}%` : ""
      ].filter(Boolean),
      insights: reading.results.past?.insights,
      remedies: reading.results.past?.remedies,
      premium: false
    },
    present: {
      title: "Present",
      content: [
        reading.results.present?.prediction || "No present reading available.",
        reading.results.present ? `Significance: ${reading.results.present.significance}%` : ""
      ].filter(Boolean),
      insights: reading.results.present?.insights,
      remedies: reading.results.present?.remedies,
      premium: false
    },
    future: {
      title: "Future",
      content: [
        reading.results.future?.prediction || "No future reading available.",
        reading.results.future ? `Significance: ${reading.results.future.significance}%` : ""
      ].filter(Boolean),
      insights: reading.results.future?.insights,
      remedies: reading.results.future?.remedies,
      premium: false
    }
  };

  if (reading.results.fateLinePresent && reading.results.fate) {
    content["fateLine"] = {
      title: "Fate Line",
      content: [
        reading.results.fate.prediction,
        `Strength: ${reading.results.fate.strength}%`
      ],
      insights: reading.results.fate.insights,
      remedies: reading.results.fate.remedies,
      premium: false
    };
  }

  if (reading.results.relationships) {
    content["relationships"] = {
      title: "Relationships",
      content: [
        reading.results.relationships.prediction,
        `Significance: ${reading.results.relationships.significance}%`
      ],
      insights: reading.results.relationships.insights,
      remedies: reading.results.relationships.remedies,
      premium: true
    };
  }

  if (reading.results.career) {
    content["career"] = {
      title: "Career",
      content: [
        reading.results.career.prediction,
        `Significance: ${reading.results.career.significance}%`
      ],
      insights: reading.results.career.insights,
      remedies: reading.results.career.remedies,
      premium: true
    };
  }

  if (reading.results.health) {
    content["health"] = {
      title: "Health",
      content: [
        reading.results.health.prediction,
        `Significance: ${reading.results.health.significance}%`
      ],
      insights: reading.results.health.insights,
      remedies: reading.results.health.remedies,
      premium: true
    };
  }

  if (reading.results.elementalInfluences) {
    content["elements"] = {
      title: "Elemental Influences",
      content: [
        reading.results.elementalInfluences.description,
        `Earth: ${reading.results.elementalInfluences.earth}%`,
        `Water: ${reading.results.elementalInfluences.water}%`,
        `Fire: ${reading.results.elementalInfluences.fire}%`,
        `Air: ${reading.results.elementalInfluences.air}%`
      ],
      remedies: reading.results.elementalInfluences.remedies,
      premium: true
    };
  }

  if (reading.results.remedialActions) {
    content["remedies"] = {
      title: "Remedial Actions",
      content: [
        reading.results.remedialActions.description,
        ...reading.results.remedialActions.generalRemedies
      ],
      premium: true
    };
  }

  content["summary"] = {
    title: "Overall Summary",
    content: [
      reading.results.overallSummary,
      `Personality traits: ${reading.results.personalityTraits.join(', ')}`
    ],
    premium: false
  };

  return content;
};
