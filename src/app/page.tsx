"use client";

import { useMemo, useState } from "react";
import {
  AnswerMap,
  AnswerValue,
  QuestionCard,
  QuestionDefinition
} from "./components/QuestionCard";

type StyleId = "modern-zen" | "cottage-romance" | "tropical-lounge" | "edible-oasis" | "playgarden" | "rewilded-sanctuary";

interface GardenBlueprint {
  headlineStyle: { id: StyleId; label: string; narrative: string; sensoryNotes: string[] };
  plantPalette: string[];
  heroFeatures: string[];
  careRhythm: string[];
  experientialVignettes: string[];
}

const QUESTION_ORDER = [
  "gardenFeel",
  "usage",
  "stylePreference",
  "sunExposure",
  "maintenance",
  "colorPalette",
  "featureFocus",
  "wildlifeSupport",
  "edibleFocus",
  "kidSafety",
  "scentPriority",
  "waterTone",
  "comfortLevel",
  "favoritePlants",
  "notes"
] as const;

const QUESTIONS: Record<string, QuestionDefinition> = {
  gardenFeel: {
    id: "gardenFeel",
    title: "Emotion Palette",
    prompt: "When you imagine stepping outside, what feeling should the garden give you within the first few seconds?",
    helper: "Pick the dominant vibe that fits. We’ll layer nuance later.",
    type: "single",
    options: [
      { value: "serene", label: "Serene & Restorative", description: "Soft greens, flowing lines, decompression first." },
      { value: "vibrant", label: "Energetic & Social", description: "Bold gestures, color pops, ready for gatherings." },
      { value: "enchanted", label: "Dreamy & Enchanted", description: "Storybook textures, romantic lighting, discovery." },
      { value: "wild", label: "Wild & Naturalistic", description: "Immersive planting, layered habitats, organic edges." },
      { value: "productive", label: "Grounded & Productive", description: "Edible abundance, purpose-driven spaces." }
    ]
  },
  usage: {
    id: "usage",
    title: "Lifestyle Mapping",
    prompt: "How will this garden actually serve you and the people who use it week to week?",
    helper: "Pick everything that applies. The agent will adapt follow-up questions based on this mix.",
    type: "multi",
    options: [
      { value: "quiet-retreat", label: "Quiet retreat", description: "Reading nook, meditative corner, restorative rituals." },
      { value: "entertaining", label: "Entertaining & dining", description: "Evening dinners, friends over, cocktails under lights." },
      { value: "family-hub", label: "Family hub / kid play", description: "Safe exploration, open lawn moments, playful features." },
      { value: "grow-food", label: "Grow fresh food", description: "Raised beds, kitchen garden, culinary herbs." },
      { value: "wildlife", label: "Thrive with wildlife", description: "Pollinators, birds, butterflies, ecological focus." },
      { value: "creative", label: "Creative studio energy", description: "Outdoor office, art, yoga, making space." }
    ]
  },
  stylePreference: {
    id: "stylePreference",
    title: "Visual Compass",
    prompt: "Which visual language feels closest to what you love seeing in gardens?",
    type: "multi",
    options: [
      { value: "architectural", label: "Architectural lines", description: "Crisp edges, strong geometry, contrast planting." },
      { value: "cottagecore", label: "Cottage abundance", description: "Layered flowers, romantic textures, winding paths." },
      { value: "tropical", label: "Lush tropical", description: "Large leaves, saturated color, resort atmosphere." },
      { value: "xeric", label: "Modern dry garden", description: "Grasses, sculptural succulents, gravelled calm." },
      { value: "woodland", label: "Woodland understory", description: "Dappled shade, ferns, mossy softness." }
    ]
  },
  sunExposure: {
    id: "sunExposure",
    title: "Sun + Microclimate",
    prompt: "Across an average day, how does sunlight move through the garden footprint?",
    type: "single",
    options: [
      { value: "full-sun", label: "Full sun (6+ hours)", description: "Bright, open exposures, heat tolerant species." },
      { value: "partial", label: "Partial sun (3-6 hours)", description: "Mixed light, flexible planting palette." },
      { value: "dappled", label: "Dappled shade", description: "Filtered light, woodland or understory feel." },
      { value: "full-shade", label: "Dense shade", description: "North-facing walls, large canopy trees, cool zones." }
    ]
  },
  maintenance: {
    id: "maintenance",
    title: "Care Energy",
    prompt: "How much weekly attention can you realistically offer?",
    type: "single",
    options: [
      { value: "low", label: "Low effort (under 1 hr)", description: "Automated irrigation, resilient planting." },
      { value: "medium", label: "Moderate (1-3 hrs)", description: "Seasonal edits, light grooming." },
      { value: "high", label: "Hands-on (3+ hrs)", description: "Happy to prune, deadhead, and tend regularly." }
    ]
  },
  colorPalette: {
    id: "colorPalette",
    title: "Color Priorities",
    prompt: "What color moods feel essential to weave through the planting?",
    type: "multi",
    options: [
      { value: "soft-neutrals", label: "Soft neutrals", description: "Creams, sages, muted palettes." },
      { value: "jewel", label: "Jewel tones", description: "Deep purples, reds, dramatic contrasts." },
      { value: "citrus", label: "Citrus brights", description: "Sunlit yellows, oranges, vibrant energy." },
      { value: "blues", label: "Coastal blues", description: "Blues, lavenders, breezy calm." },
      { value: "lush-green", label: "Texture-driven greens", description: "Foliage diversity, tonal layering." }
    ]
  },
  featureFocus: {
    id: "featureFocus",
    title: "Experience Anchors",
    prompt: "Which hero moments or features are you curious about building into the space?",
    type: "multi",
    options: [
      { value: "water", label: "Water element", description: "Reflective basin, rill, wildlife pond, or fountain." },
      { value: "fire", label: "Fire or warmth", description: "Fire bowl, chiminea, built-in fireplace." },
      { value: "dining", label: "Outdoor dining", description: "Pergola, kitchen node, harvest table." },
      { value: "lounge", label: "Lounge platforms", description: "Daybeds, hammock zone, conversation pit." },
      { value: "path", label: "Immersive pathways", description: "Stepping stones, boardwalk, discovery loops." },
      { value: "art", label: "Sculpture / art moment", description: "Feature wall, plinth, handmade element." }
    ]
  },
  wildlifeSupport: {
    id: "wildlifeSupport",
    title: "Habitat Emphasis",
    prompt: "What kind of wildlife partnership matters most to you?",
    type: "multi",
    shouldAsk: (answers) => hasSelection(answers, "usage", "wildlife"),
    options: [
      { value: "pollinators", label: "Pollinators", description: "Bees, butterflies, nectar corridors." },
      { value: "birds", label: "Songbirds", description: "Berries, shelter, nesting structures." },
      { value: "nightlife", label: "Night pollinators", description: "Evening bloomers, moon garden moments." },
      { value: "biodiversity", label: "Overall biodiversity", description: "Layered habitat, micro ecosystems." }
    ]
  },
  edibleFocus: {
    id: "edibleFocus",
    title: "Edible Intentions",
    prompt: "What edible harvest feels most exciting to you?",
    type: "multi",
    shouldAsk: (answers) => hasSelection(answers, "usage", "grow-food"),
    options: [
      { value: "culinary-herbs", label: "Culinary herbs", description: "Mediterranean mix, tea blends, aromatics." },
      { value: "seasonal-veg", label: "Seasonal vegetables", description: "Raised beds, succession planting." },
      { value: "fruit", label: "Fruit trees & shrubs", description: "Espalier, dwarf rootstock, berry guilds." },
      { value: "edible-flowers", label: "Edible flowers", description: "Calendula, nasturtium, borage accents." }
    ]
  },
  kidSafety: {
    id: "kidSafety",
    title: "Play & Safety Lens",
    prompt: "Any kid-friendly considerations the garden should respect?",
    type: "multi",
    shouldAsk: (answers) => hasSelection(answers, "usage", "family-hub"),
    options: [
      { value: "soft-ground", label: "Soft landing surfaces", description: "Clover lawn, cushioned mulch, rubber insets." },
      { value: "sightlines", label: "Clear sightlines", description: "Parents can keep watch from indoors or patios." },
      { value: "sensory-play", label: "Discovery / sensory play", description: "Mud kitchens, sound elements, nature labs." },
      { value: "edible-safe", label: "Only kid-safe edible plants", description: "No toxic species near play zones." }
    ]
  },
  scentPriority: {
    id: "scentPriority",
    title: "Fragrance Threshold",
    prompt: "How important are aromatics or fragrant plants for you?",
    type: "scale",
    shouldAsk: (answers) => {
      const feel = answers.gardenFeel;
      return typeof feel === "string" && ["serene", "enchanted", "productive"].includes(feel);
    },
    scale: {
      min: 0,
      max: 10,
      step: 1,
      labels: ["Not needed", "", "", "Layered fragrance", "", "", "", "", "", "Signature scent"]
    }
  },
  waterTone: {
    id: "waterTone",
    title: "Water Relationship",
    prompt: "What describes the water relationship you want this garden to have?",
    type: "single",
    options: [
      { value: "rain-catcher", label: "Harvest & reuse", description: "Rain gardens, cisterns, closed loops." },
      { value: "balanced", label: "Balanced irrigation", description: "Efficient smart irrigation, mindful use." },
      { value: "drought-tuned", label: "Drought expressive", description: "Xeric planting, no irrigation once established." }
    ]
  },
  comfortLevel: {
    id: "comfortLevel",
    title: "Comfort Priorities",
    prompt: "What creature comforts feel essential for the people spending time out there?",
    type: "multi",
    options: [
      { value: "shade-structure", label: "Shade solutions", description: "Pergolas, retractable sails, mature canopy." },
      { value: "heating", label: "Heating elements", description: "Fire, patio heaters, radiant warmth." },
      { value: "lighting", label: "Immersive lighting", description: "Layered low-voltage glow, festoon rhythm." },
      { value: "sound", label: "Soundscaping", description: "Speakers, water sounds, quiet buffers." },
      { value: "seating", label: "Comfort seating", description: "Lounge sets, swings, ergonomic dining." }
    ]
  },
  favoritePlants: {
    id: "favoritePlants",
    title: "Plant Crushes",
    prompt: "Are there any plants you’re already in love with (or ones you never want to see again)?",
    type: "textarea",
    placeholder:
      "List plant loves, dislikes, or any must-include species. Feel free to include memories (\"the lilacs from my grandmother’s garden\")."
  },
  notes: {
    id: "notes",
    title: "Context & Story",
    prompt: "Anything else the agent should know? Access points, pets, HOA rules, renovation plans?",
    type: "textarea",
    placeholder: "Share constraints, big ideas, or links to inspiration boards."
  }
};

function hasSelection(answers: AnswerMap, key: string, value: string) {
  const answer = answers[key];
  if (!answer) return false;
  if (Array.isArray(answer)) {
    return answer.includes(value);
  }
  if (typeof answer === "string") {
    return answer === value;
  }
  return false;
}

function computeNextQuestionId(answers: AnswerMap, asked: string[]): string | null {
  for (const id of QUESTION_ORDER) {
    if (asked.includes(id)) continue;
    const def = QUESTIONS[id];
    if (def.shouldAsk && !def.shouldAsk(answers)) continue;
    return id;
  }
  return null;
}

const STYLE_LIBRARY: Record<
  StyleId,
  {
    label: string;
    baseScore: number;
    triggers: Array<{ key: string; match: string | string[]; weight: number }>;
    narrative: string;
    sensoryNotes: string[];
    defaultPlants: string[];
    heroFeatures: string[];
  }
> = {
  "modern-zen": {
    label: "Modern Zen Refuge",
    baseScore: 1,
    triggers: [
      { key: "gardenFeel", match: "serene", weight: 3 },
      { key: "stylePreference", match: "architectural", weight: 2 },
      { key: "colorPalette", match: ["soft-neutrals", "lush-green"], weight: 1 }
    ],
    narrative:
      "Liquid geometry, calming water sounds, and evergreen structure create a restorative sanctuary tuned for decompression.",
    sensoryNotes: ["Low rustling grasses", "Reflective water plane", "Warm stone underfoot"],
    defaultPlants: ["Japanese forest grass", "Dwarf conifers", "White hellebores", "Cloud-pruned evergreens"],
    heroFeatures: ["Floating deck with meditation mat", "Linear rill with black pebbles", "Minimalist lantern lighting"]
  },
  "cottage-romance": {
    label: "Cottage Romance Tapestry",
    baseScore: 1,
    triggers: [
      { key: "gardenFeel", match: "enchanted", weight: 3 },
      { key: "stylePreference", match: "cottagecore", weight: 2 },
      { key: "colorPalette", match: ["jewel", "blues"], weight: 1 }
    ],
    narrative:
      "Layered blooms, winding gravel paths, and perfumed evenings craft a storybook escape that feels lived-in and loved.",
    sensoryNotes: ["Perfumed twilight air", "Crunch of gravel paths", "Flowering hedges as walls"],
    defaultPlants: ["David Austin roses", "Nepeta 'Walker's Low'", "Peonies", "Foxgloves", "Climbing clematis"],
    heroFeatures: ["Bistro breakfast nook", "Trellised entry arch", "Lantern-lit evening spine"]
  },
  "tropical-lounge": {
    label: "Tropical Lounge Hideaway",
    baseScore: 1,
    triggers: [
      { key: "gardenFeel", match: "vibrant", weight: 3 },
      { key: "stylePreference", match: "tropical", weight: 2 },
      { key: "colorPalette", match: ["citrus", "jewel"], weight: 1 }
    ],
    narrative: "Large-leaf drama, saturated foliage, and cinematic lighting turn the garden into a resort-grade lounge.",
    sensoryNotes: ["Mist-cooled air", "Fragrant gingers", "Dappled palm light"],
    defaultPlants: ["Bird of paradise", "Elephant ears", "Red cordyline", "Variegated ginger", "Philodendron Xanadu"],
    heroFeatures: ["Daybed platform with canopy", "Rain curtain water wall", "Integrated cocktail bar ledge"]
  },
  "edible-oasis": {
    label: "Edible Oasis Atelier",
    baseScore: 1,
    triggers: [
      { key: "gardenFeel", match: "productive", weight: 3 },
      { key: "usage", match: "grow-food", weight: 3 },
      { key: "stylePreference", match: ["architectural", "cottagecore"], weight: 1 }
    ],
    narrative:
      "Kitchen garden theatrics meet design-forward structure, balancing productivity with beauty and culinary storytelling.",
    sensoryNotes: ["Crush of herb oils", "Bee buzz in the beds", "Wood raised-bed warmth"],
    defaultPlants: ["Espaliered apple", "Perennial kale", "Thai basil", "Calendula", "Ever-bearing strawberries"],
    heroFeatures: ["Chef's harvest table", "Self-watering raised beds", "Drying rack pergola"]
  },
  playgarden: {
    label: "Family Playgarden Circuit",
    baseScore: 1,
    triggers: [
      { key: "usage", match: ["family-hub"], weight: 3 },
      { key: "gardenFeel", match: "vibrant", weight: 1 },
      { key: "kidSafety", match: ["soft-ground", "sensory-play"], weight: 2 }
    ],
    narrative:
      "Layered play zones and durable planting invite exploration, with choreographed sightlines that keep everyone connected.",
    sensoryNotes: ["Giggle-friendly clearings", "Tactile planting edges", "Adventure micro-zones"],
    defaultPlants: ["Low-mow fescue mix", "Lavender cotton", "Serviceberry", "Blue fescue", "Pollinator strips"],
    heroFeatures: ["Loose-parts play deck", "Tree swing or climbing boulder", "Evening glow string-light spine"]
  },
  "rewilded-sanctuary": {
    label: "Rewilded Sanctuary",
    baseScore: 1,
    triggers: [
      { key: "gardenFeel", match: "wild", weight: 3 },
      { key: "usage", match: "wildlife", weight: 3 },
      { key: "wildlifeSupport", match: ["pollinators", "biodiversity"], weight: 2 }
    ],
    narrative:
      "Regenerative planting layers, micro-habitats, and seasonal rhythms center ecological joy and cohabitation.",
    sensoryNotes: ["Birdsong corridors", "Seed-head silhouettes", "Dynamic meadow breezes"],
    defaultPlants: ["Little bluestem", "Echinacea", "Milkweed", "Serviceberry", "Prairie dropseed"],
    heroFeatures: ["Rain-fed wildlife pond", "Deadwood habitat sculpture", "Meadow walk with seating boulder"]
  }
};

function scoreStyles(answers: AnswerMap): GardenBlueprint {
  const tally: Record<StyleId, number> = {
    "modern-zen": STYLE_LIBRARY["modern-zen"].baseScore,
    "cottage-romance": STYLE_LIBRARY["cottage-romance"].baseScore,
    "tropical-lounge": STYLE_LIBRARY["tropical-lounge"].baseScore,
    "edible-oasis": STYLE_LIBRARY["edible-oasis"].baseScore,
    playgarden: STYLE_LIBRARY.playgarden.baseScore,
    "rewilded-sanctuary": STYLE_LIBRARY["rewilded-sanctuary"].baseScore
  };

  (Object.keys(STYLE_LIBRARY) as StyleId[]).forEach((styleId) => {
    const style = STYLE_LIBRARY[styleId];
    style.triggers.forEach((trigger) => {
      const currentAnswer = answers[trigger.key];
      if (!currentAnswer) return;
      if (Array.isArray(currentAnswer)) {
        const matcher = Array.isArray(trigger.match) ? trigger.match : [trigger.match];
        if (currentAnswer.some((value) => matcher.includes(value))) {
          tally[styleId] += trigger.weight;
        }
        return;
      }
      if (typeof currentAnswer === "string") {
        if (Array.isArray(trigger.match) ? trigger.match.includes(currentAnswer) : currentAnswer === trigger.match) {
          tally[styleId] += trigger.weight;
        }
      }
    });
  });

  const sorted = (Object.entries(tally) as Array<[StyleId, number]>).sort((a, b) => b[1] - a[1]);
  const [topStyleId] = sorted[0];
  const primary = STYLE_LIBRARY[topStyleId];

  const plantPalette = new Set<string>(primary.defaultPlants);

  if (hasSelection(answers, "sunExposure", "full-sun")) {
    ["Lavandula angustifolia", "Pennisetum alopecuroides"].forEach((plant) => plantPalette.add(plant));
  }

  if (hasSelection(answers, "sunExposure", "full-shade") || hasSelection(answers, "sunExposure", "dappled")) {
    ["Hakonechloa macra", "Hosta 'Halcyon'"].forEach((plant) => plantPalette.add(plant));
  }

  if (hasSelection(answers, "maintenance", "low")) {
    ["Evergreen structural shrubs", "Drip-irrigated natives"].forEach((plant) => plantPalette.add(plant));
  }

  if (hasSelection(answers, "colorPalette", "citrus")) {
    ["Crocosmia 'Fire King'", "Coreopsis verticillata"].forEach((plant) => plantPalette.add(plant));
  }

  const heroFeatures = new Set<string>(primary.heroFeatures);
  const requestedFeatures = answers.featureFocus;
  if (Array.isArray(requestedFeatures)) {
    requestedFeatures.forEach((value) => {
      const label = QUESTIONS.featureFocus.options?.find((option) => option.value === value)?.label;
      if (label) heroFeatures.add(label);
    });
  }

  if (hasSelection(answers, "usage", "grow-food")) {
    heroFeatures.add("Vertically layered edible wall");
  }

  if (hasSelection(answers, "usage", "wildlife")) {
    heroFeatures.add("Native meadow corridor");
  }

  const careRhythm: string[] = [];
  const maintenance = answers.maintenance;
  if (maintenance === "low") {
    careRhythm.push("Seasonal editing twice a year", "Mulch and auto-irrigation keep daily care minimal");
  } else if (maintenance === "medium") {
    careRhythm.push("Bi-weekly garden walk to deadhead and adjust irrigation", "Seasonal compost top-dress");
  } else if (maintenance === "high") {
    careRhythm.push("Weekly pruning choreography", "Room for experimental plant trials and succession sowing");
  }

  if (typeof answers.waterTone === "string") {
    if (answers.waterTone === "rain-catcher") {
      careRhythm.push("Install bioswale and rain chain to harvest roof runoff.");
    } else if (answers.waterTone === "drought-tuned") {
      careRhythm.push("Group planting by hydrozone and incorporate deep mulch to preserve moisture.");
    } else {
      careRhythm.push("Use moisture sensors to tune irrigation only when soil levels dip below target range.");
    }
  }

  const experientialVignettes: string[] = [];
  if (hasSelection(answers, "usage", "entertaining")) {
    experientialVignettes.push("Twinkle-lit dining platform framed by aromatic herbs.");
  }
  if (hasSelection(answers, "usage", "quiet-retreat")) {
    experientialVignettes.push("Low lounge bench tucked beside a water element for morning rituals.");
  }
  if (hasSelection(answers, "usage", "creative")) {
    experientialVignettes.push("Shaded studio deck with power access and movable planters for mood shifts.");
  }
  if (hasSelection(answers, "usage", "family-hub")) {
    experientialVignettes.push("Adventure loop connecting play zones with resilient groundcover.");
  }

  return {
    headlineStyle: {
      id: topStyleId,
      label: primary.label,
      narrative: primary.narrative,
      sensoryNotes: primary.sensoryNotes
    },
    plantPalette: Array.from(plantPalette),
    heroFeatures: Array.from(heroFeatures),
    careRhythm,
    experientialVignettes
  };
}

const AGENTIC_NOTES: Array<{ id: string; title: string; generator: (answers: AnswerMap) => string | null }> = [
  {
    id: "sunlight",
    title: "Light Strategy",
    generator: (answers) => {
      const sun = answers.sunExposure;
      if (sun === "full-sun") {
        return "Prioritize heat-loving perennials with reflective mulches to keep roots balanced.";
      }
      if (sun === "partial") {
        return "Design patchwork planting so morning and afternoon light catch different bloom sequences.";
      }
      if (sun === "dappled") {
        return "Lean on layered understory planting with pops of variegation to brighten shaded pockets.";
      }
      if (sun === "full-shade") {
        return "Integrate uplighting and mossy textures to create luminous shade theatrics.";
      }
      return null;
    }
  },
  {
    id: "maintenance",
    title: "Maintenance Cadence",
    generator: (answers) => {
      if (answers.maintenance === "low") {
        return "Agent recommends establishing irrigation automation and evergreen bones for cruise-control care.";
      }
      if (answers.maintenance === "medium") {
        return "Schedule fortnightly tuning sessions: light pruning, soil checks, and sensory recalibration.";
      }
      if (answers.maintenance === "high") {
        return "Lean into horticultural play—seasonal cut-flower beds and bespoke pruning rituals will shine.";
      }
      return null;
    }
  },
  {
    id: "scent",
    title: "Fragrance Playbook",
    generator: (answers) => {
      if (typeof answers.scentPriority === "number" && answers.scentPriority >= 7) {
        return "Stack aromatic layers: base of rosemary, mid of night-blooming jasmine, high of citrus blossom.";
      }
      if (typeof answers.scentPriority === "number" && answers.scentPriority >= 3) {
        return "Integrate seasonal scent hits near seating—think daphne and sweet box along paths.";
      }
      return null;
    }
  },
  {
    id: "edibles",
    title: "Edible Integration",
    generator: (answers) => {
      if (!hasSelection(answers, "usage", "grow-food")) return null;
      const edibleFocus = answers.edibleFocus;
      if (Array.isArray(edibleFocus) && edibleFocus.length > 0) {
        return `Blend edible ${edibleFocus.join(", ")} into ornamental borders for year-round harvest moments.`;
      }
      return "Agent suggests raised corten beds tied into architectural rhythms for productive beauty.";
    }
  }
];

export default function Page() {
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [asked, setAsked] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(() =>
    computeNextQuestionId({}, [])
  );

  const currentQuestion = currentQuestionId ? QUESTIONS[currentQuestionId] : null;

  function handleAnswer(value: AnswerValue) {
    if (!currentQuestion) return;
    const id = currentQuestion.id;
    const updatedAnswers: AnswerMap = { ...answers, [id]: value };
    const updatedAsked = asked.includes(id) ? asked : [...asked, id];

    setAnswers(updatedAnswers);
    setAsked(updatedAsked);

    const nextId = computeNextQuestionId(updatedAnswers, updatedAsked);
    if (nextId) {
      setCurrentQuestionId(nextId);
    } else {
      setCurrentQuestionId(null);
      setIsComplete(true);
    }
  }

  function handleRestart() {
    setAnswers({});
    setAsked([]);
    setIsComplete(false);
    setCurrentQuestionId(computeNextQuestionId({}, []));
  }

  const blueprint = useMemo(() => {
    if (!isComplete) return null;
    return scoreStyles(answers);
  }, [answers, isComplete]);

  const agentNotes = useMemo(() => {
    return AGENTIC_NOTES.map((note) => {
      const insight = note.generator(answers);
      return insight ? { id: note.id, title: note.title, body: insight } : null;
    }).filter(Boolean) as Array<{ id: string; title: string; body: string }>;
  }, [answers]);

  return (
    <main className="container" style={{ paddingBottom: "4rem" }}>
      <header style={{ margin: "3rem 0 2.5rem", textAlign: "center" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "rgba(92, 142, 79, 0.12)",
            borderRadius: "999px",
            padding: "0.5rem 1.25rem",
            color: "var(--accent)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            fontWeight: 600
          }}
        >
          Agentic Garden Interview
        </span>
        <h1 style={{ marginTop: "1.5rem", marginBottom: "0.75rem", fontSize: "2.75rem" }}>
          Decode Your Signature Garden DNA
        </h1>
        <p style={{ margin: "0 auto", maxWidth: "56ch", fontSize: "1.05rem", color: "rgba(25, 32, 23, 0.8)" }}>
          An adaptive design agent listens, infers, and drafts a bespoke garden blueprint—from emotional tone to plant palette—while you respond to sculpted prompts.
        </p>
      </header>

      <section
        style={{
          display: "grid",
          gap: "2rem",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)"
        }}
      >
        <div>
          {!isComplete && currentQuestion ? (
            <>
              <progress
                value={asked.length}
                max={QUESTION_ORDER.length}
                style={{
                  width: "100%",
                  height: "12px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(150, 167, 136, 0.3)",
                  appearance: "none",
                  marginBottom: "1.5rem"
                }}
              />
              <QuestionCard
                question={currentQuestion}
                onAnswer={handleAnswer}
                defaultValue={answers[currentQuestion.id]}
                isLastStep={isLikelyFinalStep(currentQuestion.id, answers, asked)}
              />
            </>
          ) : null}

          {isComplete && blueprint ? (
            <div
              style={{
                backgroundColor: "rgba(255,255,255,0.92)",
                borderRadius: "24px",
                padding: "2.75rem",
                border: "1px solid rgba(92, 142, 79, 0.18)",
                boxShadow: "0 24px 48px rgba(33, 51, 24, 0.18)",
                marginBottom: "2.5rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                <div>
                  <span style={{ textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "0.7rem", color: "rgba(51, 66, 44, 0.75)" }}>
                    Agent Verdict
                  </span>
                  <h2 style={{ margin: "0.75rem 0 0.5rem", fontSize: "2.15rem" }}>{blueprint.headlineStyle.label}</h2>
                  <p style={{ margin: 0, maxWidth: "60ch", color: "rgba(31, 39, 27, 0.8)", fontSize: "1.05rem" }}>
                    {blueprint.headlineStyle.narrative}
                  </p>
                </div>
                <button
                  onClick={handleRestart}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "999px",
                    border: "1px solid rgba(59, 82, 56, 0.3)",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    fontWeight: 600,
                    color: "var(--accent)"
                  }}
                >
                  Restart Interview
                </button>
              </div>

              <div style={{ marginTop: "2rem", display: "grid", gap: "2rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.75rem" }}>Sensory Imprint</h3>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    {blueprint.headlineStyle.sensoryNotes.map((note) => (
                      <li key={note} style={{ marginBottom: "0.35rem" }}>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 0.75rem" }}>Plant Palette Draft</h3>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "0.5rem"
                    }}
                  >
                    {blueprint.plantPalette.map((plant) => (
                      <span
                        key={plant}
                        style={{
                          backgroundColor: "rgba(92, 142, 79, 0.12)",
                          border: "1px solid rgba(92, 142, 79, 0.2)",
                          padding: "0.4rem 0.9rem",
                          borderRadius: "999px",
                          fontSize: "0.9rem"
                        }}
                      >
                        {plant}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 0.75rem" }}>Hero Moments</h3>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    {blueprint.heroFeatures.map((feature) => (
                      <li key={feature} style={{ marginBottom: "0.35rem" }}>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 style={{ margin: "0 0 0.75rem" }}>Care Rhythm</h3>
                  <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                    {blueprint.careRhythm.map((item) => (
                      <li key={item} style={{ marginBottom: "0.35rem" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {blueprint.experientialVignettes.length > 0 ? (
                  <div>
                    <h3 style={{ margin: "0 0 0.75rem" }}>Signature Moments</h3>
                    <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                      {blueprint.experientialVignettes.map((vignette) => (
                        <li key={vignette} style={{ marginBottom: "0.35rem" }}>
                          {vignette}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.85)",
              borderRadius: "18px",
              border: "1px solid rgba(59, 82, 56, 0.22)",
              padding: "1.75rem"
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Agent Timeline</h3>
            <ol style={{ margin: 0, paddingLeft: "1.2rem", color: "rgba(33, 47, 29, 0.78)" }}>
              {asked.map((id) => (
                <li key={id} style={{ marginBottom: "0.65rem" }}>
                  <strong>{QUESTIONS[id].title}</strong>
                  <div style={{ fontSize: "0.85rem", marginTop: "0.25rem", opacity: 0.75 }}>
                    {formatAnswerForDisplay(answers[id])}
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div
            style={{
              backgroundColor: "rgba(92, 142, 79, 0.14)",
              borderRadius: "18px",
              padding: "1.75rem",
              border: "1px solid rgba(92, 142, 79, 0.22)"
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>Agentic Notes</h3>
            {agentNotes.length === 0 ? (
              <p style={{ margin: 0, color: "rgba(25, 37, 20, 0.75)" }}>
                As you respond, the agent will surface strategic guidance here.
              </p>
            ) : (
              <ul style={{ margin: 0, paddingLeft: "1.2rem", color: "rgba(25, 37, 20, 0.85)" }}>
                {agentNotes.map((note) => (
                  <li key={note.id} style={{ marginBottom: "0.75rem" }}>
                    <strong>{note.title}:</strong> {note.body}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>
    </main>
  );
}

function isLikelyFinalStep(currentId: string, answers: AnswerMap, asked: string[]) {
  const simulatedAsked = asked.includes(currentId) ? asked : [...asked, currentId];
  const nextId = computeNextQuestionId(answers, simulatedAsked);
  return nextId === null;
}

function formatAnswerForDisplay(answer: AnswerValue | undefined) {
  if (!answer) return "Awaiting input.";
  if (Array.isArray(answer)) {
    if (answer.length === 0) return "No selections.";
    return answer
      .map((value) => {
        const option = Object.values(QUESTIONS)
          .flatMap((question) => question.options ?? [])
          .find((opt) => opt.value === value);
        return option?.label ?? value;
      })
      .join(", ");
  }
  if (typeof answer === "object") {
    if ("text" in answer && typeof answer.text === "string" && answer.text.trim().length > 0) {
      return answer.text;
    }
    return "Captured.";
  }
  if (typeof answer === "number") {
    return `${answer} / 10`;
  }
  const option = Object.values(QUESTIONS)
    .flatMap((question) => question.options ?? [])
    .find((opt) => opt.value === answer);
  return option?.label ?? answer;
}
