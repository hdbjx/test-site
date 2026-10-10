/**
 * Every Detail service areas. Location pages deliberately stay focused on
 * service logistics and coverage rather than inventing neighborhood-specific
 * claims that we cannot substantiate.
 */

export type AreaPage = {
  title: string;
  description: string;
  intro: string;
  localNotes: string[];
  photos?: string[];
};

export type Area = { name: string; slug: string; primary?: boolean; page?: AreaPage };

const page = (name: string, intro: string, notes: string[]): AreaPage => ({
  title: `Mobile Car Detailing in ${name}, GA`,
  description: `Mobile car detailing in ${name}, GA from Every Detail. We bring our own power, water, equipment and trained crew to your driveway or approved parking area.`,
  intro,
  localNotes: notes,
});

const standardNotes = [
  "We bring our own power and water, so you do not need to provide a hose or electrical outlet.",
  "A driveway or accessible parking area with enough room to work around the vehicle is ideal.",
  "Pricing is based on vehicle size and service level, not on which neighborhood you live in.",
  "Choose a service and vehicle online to see your price before you book.",
];

export const areas: Area[] = [
  {
    name: "Decatur",
    slug: "decatur",
    primary: true,
    page: page(
      "Decatur",
      "Decatur is home base for Every Detail. Our student-run crew operates mobile detailing rigs built to bring the shop to you, with the power, water, products and equipment already on board.",
      ["Decatur is our home base and the center of our mobile service area.", ...standardNotes.slice(0, 3)]
    ),
  },
  {
    name: "Brookhaven",
    slug: "brookhaven",
    page: page(
      "Brookhaven",
      "Every Detail serves Brookhaven with fully mobile interior and exterior detailing. Pick the level of clean your vehicle needs and our crew arrives with the setup to complete it where the vehicle is parked.",
      standardNotes
    ),
  },
  {
    name: "Avondale Estates",
    slug: "avondale-estates",
    page: page(
      "Avondale Estates",
      "Every Detail provides mobile detailing in Avondale Estates, bringing a trained crew and equipped rig directly to the vehicle. You choose the service, and we bring the rest of the setup.",
      standardNotes
    ),
  },
  {
    name: "Chamblee",
    slug: "chamblee",
    page: page(
      "Chamblee",
      "Our mobile detailing team serves Chamblee with one-time details, deeper resets and recurring care. The goal is simple: professional detailing without adding a shop trip to your day.",
      standardNotes
    ),
  },
  {
    name: "North Buckhead",
    slug: "north-buckhead",
    page: page(
      "North Buckhead",
      "Every Detail brings mobile car detailing to North Buckhead with our own power, water and professional equipment. Book the service that fits the vehicle and we handle the detail on site.",
      standardNotes
    ),
  },
  {
    name: "North Druid Hills",
    slug: "north-druid-hills",
    page: page(
      "North Druid Hills",
      "Every Detail serves North Druid Hills from our Decatur-based mobile operation. Our crew arrives prepared for the full job, from interior cleaning and extraction to hand washing, wheels and finishing work.",
      standardNotes
    ),
  },
  {
    name: "Sandy Springs",
    slug: "sandy-springs",
    page: page(
      "Sandy Springs",
      "Every Detail offers mobile detailing in Sandy Springs for clients who want the work done where the car already is. Our rigs carry the water, power, products and equipment needed for the appointment.",
      standardNotes
    ),
  },
  {
    name: "Dunwoody",
    slug: "dunwoody",
    page: page(
      "Dunwoody",
      "Our mobile crew serves Dunwoody with detailing that ranges from routine upkeep to a full Factory Reset. Choose your vehicle and service online to see pricing before you schedule.",
      standardNotes
    ),
  },
  {
    name: "Briarcliff",
    slug: "briarcliff",
    page: page(
      "Briarcliff",
      "Every Detail provides mobile detailing throughout the Briarcliff area from our Decatur-based operation. We bring a complete setup and work through the vehicle on site.",
      standardNotes
    ),
  },
  {
    name: "Atlanta",
    slug: "atlanta",
    page: page(
      "Atlanta",
      "Every Detail serves select Atlanta neighborhoods from our Decatur-based mobile operation. Because travel and parking conditions vary across the city, online availability is the best way to confirm a specific appointment window.",
      [
        "We serve select Atlanta neighborhoods within our normal mobile range.",
        "Online availability reflects the appointment windows we can actually service.",
        ...standardNotes.slice(0, 2),
      ]
    ),
  },
];

export const areasWithPages = areas.filter((a): a is Area & { page: AreaPage } => !!a.page);
