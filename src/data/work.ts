/**
 * The /our-work wall: real job photos and real Google reviews, mixed together.
 * Captions only describe what the photo shows. Review quotes are exact sentences
 * from Every Detail's Google listing, attributed the way Google shows them.
 * Kept separate from `reviews.ts` so ReviewGrid and the homepage are unaffected.
 */

export type WorkFilter = "interior" | "exterior" | "paint" | "crew";

export const workFilters: { id: "all" | WorkFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "interior", label: "Interiors" },
  { id: "exterior", label: "Exteriors" },
  { id: "paint", label: "Paint" },
  { id: "crew", label: "Crew + rigs" },
];

export type WorkPhoto = { kind: "photo"; id: string; caption: string; tags: WorkFilter[]; tall?: boolean };
export type WorkReview = { kind: "review"; author: string; quote: string; tags: WorkFilter[]; crew?: string };
export type WorkItem = WorkPhoto | WorkReview;

/** Wall order. Reviews sit between photos so the wall reads as work + reaction. */
export const workWall: WorkItem[] = [
  { kind: "photo", id: "hero", caption: "Foam pre-wash, red Volvo", tags: ["exterior"] },
  { kind: "photo", id: "clean-white-interior", caption: "Light interior, finished", tags: ["interior"] },
  { kind: "review", author: "Andrew H.", quote: "Car has literally never looked this good since it rolled off the lot new 8 years ago.", tags: ["exterior", "interior"] },
  { kind: "photo", id: "hq-black-suv-finished", caption: "Black SUV, final finish", tags: ["exterior"] },
  { kind: "photo", id: "hq-interior-team-front-seats", caption: "Two techs on the front seats", tags: ["interior", "crew"] },
  { kind: "review", author: "Stephanie R.", quote: "Got rid of years of pet hair embedded in my car’s carpet!", tags: ["interior"] },
  { kind: "photo", id: "paint-01", caption: "Water beading on black paint", tags: ["paint"] },
  { kind: "photo", id: "rear-seat-detail", caption: "Rear seats, wiped by hand", tags: ["interior"] },
  { kind: "review", author: "Max G.", quote: "It was raining when they arrived, but instead of postponing, they took their own initiative to set up a tent over the car and got right to work.", tags: ["crew"] },
  { kind: "photo", id: "work-06", caption: "Hand wash, black SUV", tags: ["exterior"] },
  { kind: "photo", id: "rig-03", caption: "Van and trailer, both electric", tags: ["crew"] },
  { kind: "review", author: "Maia K.", quote: "Even the mats are shiny. Grady and Mateo were efficient and polite.", tags: ["interior"], crew: "Grady + Mateo" },
  { kind: "photo", id: "work-davis-0909", caption: "Floor mats get their own station", tags: ["interior", "crew"] },
  { kind: "photo", id: "hq-white-ioniq-front", caption: "White Hyundai Ioniq, finished", tags: ["exterior"] },
  { kind: "review", author: "leigh P.", quote: "I had no idea how dirty my wheels were until they cleaned them to a shine. All the dog hair is gone!", tags: ["exterior", "interior"] },
  { kind: "photo", id: "classic-car-cockpit", caption: "Classic cockpit, rig outside", tags: ["interior"] },
  { kind: "photo", id: "paint-polisher", caption: "Machine polishing black paint", tags: ["paint", "crew"] },
  { kind: "review", author: "Joy F.", quote: "It is a 2017 Tahoe that is used a lot to transport kids, pets, and has made many a long road trip, and Every Detail has restored it to like new condition.", tags: ["interior", "exterior"] },
  { kind: "photo", id: "tesla-foam-wash", caption: "Foam wash, Tesla", tags: ["exterior"] },
  { kind: "photo", id: "work-08", caption: "Clean cabin, front to back", tags: ["interior"] },
  { kind: "review", author: "Amanda D.", quote: "Grady and Hayes were fantastic and even managed to clean off a melted gummy which seemed impossible!", tags: ["interior"], crew: "Grady + Hayes" },
  { kind: "photo", id: "work-07", caption: "Two techs, one exterior", tags: ["exterior", "crew"] },
  { kind: "photo", id: "hq-black-suv-grille", caption: "Grille and front end, detailed", tags: ["exterior"] },
  { kind: "review", author: "Mark F.", quote: "Right to your driveway and they bring their own water!", tags: ["crew"] },
  { kind: "photo", id: "hq-technician-trunk-detail", caption: "Cargo area, not skipped", tags: ["interior"] },
  { kind: "photo", id: "paint-02", caption: "Red paint after detailing", tags: ["paint"] },
  { kind: "review", author: "catherine f.", quote: "I lived at the beach for 2 years and they got all the sand out of every crevice!!", tags: ["interior"] },
  { kind: "photo", id: "mobile-rig-open-driveway", caption: "Rig open in a driveway", tags: ["crew"] },
  { kind: "photo", id: "hq-white-suv-finished", caption: "White SUV, finished", tags: ["exterior"] },
  { kind: "review", author: "Stephen B.", quote: "Grady and Thomas did a phenomenal job on our Subaru.", tags: ["exterior", "interior"], crew: "Grady + Thomas" },
  { kind: "photo", id: "hq-interior-front-seat-work", caption: "Tan interior, mid-detail", tags: ["interior"] },
  { kind: "photo", id: "ceramic-02", caption: "Finishing the paint by hand", tags: ["paint", "exterior"] },
  { kind: "review", author: "Melissa B.", quote: "The carpet was very stained, and they got it looking like it did when I first got the car!", tags: ["interior"] },
  { kind: "photo", id: "classic-red-wheel", caption: "Classic red wheel and fender", tags: ["exterior", "paint"] },
  { kind: "photo", id: "work-will-0920", caption: "Job checklist on the van iPad", tags: ["crew"] },
  { kind: "review", author: "Randy C.", quote: "It is the best it’s been since it left the lot new, 14 years ago.", tags: ["exterior", "paint"] },
  { kind: "photo", id: "black-car-pressure-wash", caption: "Rinse beside the rig", tags: ["exterior", "crew"] },
  { kind: "photo", id: "hq-white-ioniq-wheel", caption: "Wheel and front quarter", tags: ["exterior"] },
  { kind: "review", author: "Michael M.", quote: "Mateo and Nathan did an incredible job of detailing my car.", tags: ["crew"], crew: "Mateo + Nathan" },
  { kind: "photo", id: "hq-van-through-flowers", caption: "Another neighborhood job", tags: ["crew"] },
];
