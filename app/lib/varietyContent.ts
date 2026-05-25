// Per-variety editorial content — the unique value that keeps each
// programmatic page from being thin. Edit freely; the page renders whatever
// is here. Keep facts honest; thin/duplicated content gets de-ranked.

import type { MangoVariety } from './catalog';

export interface VarietyContent {
  altNames: string[];
  origin: string;
  seasonMonths: string;
  taste: string;
  texture: string;
  bestFor: string[];
  fact: string;
  faqs: { q: string; a: string }[];
}

export const VARIETY_CONTENT: Record<MangoVariety, VarietyContent> = {
  Banganapalle: {
    altNames: ['Beneshan', 'Safeda', 'Banganapalli'],
    origin: 'Kurnool district, Andhra Pradesh',
    seasonMonths: 'April – June',
    taste: 'Honey-sweet with a low-acid, mild finish',
    texture: 'Firm, fiberless yellow pulp with thin skin',
    bestFor: ['Eating fresh', 'Cubes and platters', 'Smoothies', 'Mango milkshake'],
    fact:
      'Banganapalle is the first mango to receive a Geographical Indication (GI) tag in India — a protected origin marker just like Champagne or Darjeeling tea.',
    faqs: [
      {
        q: 'When is Banganapalle mango in season?',
        a: 'Banganapalle is harvested between April and June. We ship only naturally tree-ripened fruit during these months.',
      },
      {
        q: 'How long do Banganapalle mangoes last after delivery?',
        a: 'Once fully ripe, eat within 3–4 days. Unripe fruit can be kept at room temperature for 4–6 days to ripen evenly.',
      },
    ],
  },
  'Cheruku Rasalu': {
    altNames: ['Cheruku Rasaalu', 'Sugarcane Rasalu'],
    origin: 'Coastal districts of Andhra Pradesh',
    seasonMonths: 'May – June',
    taste: 'Intensely sweet, mimicking the pure flavor of sugarcane juice',
    texture: 'Extremely juicy and pulpy, usually consumed by squeezing and sucking',
    bestFor: ['Sucking fresh', 'Mamidi rasam', 'Traditional desserts', 'Mango milkshakes'],
    fact:
      'Named "Cheruku" (sugarcane in Telugu) because of its extraordinary sweetness that resembles sugarcane juice.',
    faqs: [
      {
        q: 'How do you eat Cheruku Rasalu?',
        a: 'This is a suckable variety! Gently press the fruit all around to soften the pulp, make a small opening at the tip, and suck the delicious juice directly.',
      },
      {
        q: 'Is it good for cutting into slices?',
        a: 'No, Cheruku Rasalu is extremely juicy and fibrous, making it unsuitable for slicing. It is best enjoyed by sucking or making fresh juice.',
      },
    ],
  },
  Sindhura: {
    altNames: ['Sindhura Mango', 'Sundari'],
    origin: 'Chittoor and coastal Andhra Pradesh',
    seasonMonths: 'April – June',
    taste: 'Rich sweetness with a delightful aromatic, honey-like profile',
    texture: 'Smooth, fiberless pulp under a beautiful red-green blushed skin',
    bestFor: ['Fresh eating', 'Fruit salads', 'Desserts', 'Gifting boxes'],
    fact:
      'Sindhura is famous for its gorgeous red and orange blush, making it one of the most visually striking and popular early-season varieties.',
    faqs: [
      {
        q: 'Why is it called Sindhura?',
        a: 'It is named after the traditional red "Sindhoor" color because of the bright red blush on its skin when ripe.',
      },
      {
        q: 'How do I know when Sindhura is ripe?',
        a: 'The skin develops a bright golden-red color and releases a strong, sweet floral aroma near the stem.',
      },
    ],
  },
  Totapuri: {
    altNames: ['Bangalora', 'Sandersha', 'Kili Mooku'],
    origin: 'Chittoor district, Andhra Pradesh',
    seasonMonths: 'May – July',
    taste: 'Tangy-sweet with a distinctive sharp finish',
    texture: 'Firm, fibrous golden pulp — holds its shape when cut',
    bestFor: ['Mango pickle (avakaya)', 'Salads', 'Pulp and concentrate', 'Chutneys'],
    fact:
      'Totapuri is named for its parrot-beak shape (“tota” = parrot). It is the variety used in most commercial mango pulp worldwide.',
    faqs: [
      {
        q: 'Is Totapuri good for eating fresh?',
        a: 'It is tangier than dessert mangoes — most customers prefer it for pickle, salads and cooking rather than as table fruit.',
      },
    ],
  },
  'Natu Rasalu': {
    altNames: ['Native Rasalu', 'Chinna Rasalu'],
    origin: 'Krishna and Guntur districts, Andhra Pradesh',
    seasonMonths: 'May – July',
    taste: 'Highly sweet, traditional rich heritage flavor',
    texture: 'Soft, fibrous, and highly juicy pulp meant for sucking',
    bestFor: ['Pulp extraction', 'Serving with traditional Telugu meals', 'Mango juices'],
    fact:
      'Natu Rasalu is the local wild-derived favorite in Andhra villages, cherished for generations for its authentic native taste.',
    faqs: [
      {
        q: 'What is the difference between Natu Rasalu and Cheruku Rasalu?',
        a: 'Natu Rasalu is the standard wild-native juicy mango with a strong traditional flavor, whereas Cheruku Rasalu is exceptionally sweet, resembling sugarcane juice.',
      },
    ],
  },
  'Aaku Palli / Native Varieties': {
    altNames: ['Aaku Palli', 'Native Field Varieties', 'Desi Mangoes'],
    origin: 'Local village orchards across Andhra Pradesh',
    seasonMonths: 'May – June',
    taste: 'Earthy, traditional sweetness with a mild rustic tang',
    texture: 'Variable fiber, soft and incredibly aromatic',
    bestFor: ['Fresh rustic eating', 'Local village style juices', 'Mamidi pulusu'],
    fact:
      'Aaku Palli refers to the native varieties grown directly in small-scale village backyards and orchards, preserved for their local heritage.',
    faqs: [
      {
        q: 'What does "Aaku Palli" mean?',
        a: '"Aaku Palli" literally translates to leaf-colored fruits in Telugu, indicating their green/yellow hues even when fully ripe.',
      },
    ],
  },
  'Imam Pasand': {
    altNames: ['Himayat', 'Himam Pasand', 'Imampasand'],
    origin: 'Andhra Pradesh and Tamil Nadu — historically a royal variety',
    seasonMonths: 'May – June',
    taste: 'Rich, complex sweetness with a custard-like finish',
    texture: 'Creamy, completely fiberless pulp under thin green-yellow skin',
    bestFor: ['Premium gifting', 'Eating fresh by the slice', 'Mango cream desserts'],
    fact:
      'Often called the “king of mangoes” in the Telugu states — legend says it was the preferred mango of Mughal royalty, hence the name “Imam Pasand” (favoured by the Imam).',
    faqs: [
      {
        q: 'Why is Imam Pasand more expensive than Banganapalle?',
        a: 'Imam Pasand has lower yields per tree, a shorter season, and almost no fiber — making it the premium dessert mango of South India.',
      },
      {
        q: 'How do I tell a ripe Imam Pasand?',
        a: 'The skin stays largely green even when ripe. Press gently near the stem — a slight give and a strong sweet fragrance mean it is ready.',
      },
    ],
  },
  Neelum: {
    altNames: ['Neelam', 'Blue Mango'],
    origin: 'Rayalaseema region, Andhra Pradesh',
    seasonMonths: 'June – July',
    taste: 'Intensely sweet, floral, with a strong pleasant aroma',
    texture: 'Firm, smooth, orange pulp with highly balanced fiber',
    bestFor: ['Fresh slicing', 'Mango milkshakes', 'Sorbets', 'Late-season gifting'],
    fact:
      'Neelum is one of the most resilient late-season varieties, performing beautifully even during summer rains, extending the mango season.',
    faqs: [
      {
        q: 'When is Neelum in season?',
        a: 'Neelum is a late-season variety, typically arriving in late June and continuing through July after other varieties finish.',
      },
    ],
  },
  'Pickle Mango': {
    altNames: ['Raw Mango', 'Ugadi Pacchadi mango', 'Avakaya mango'],
    origin: 'Andhra Pradesh and Telangana',
    seasonMonths: 'March – May',
    taste: 'Extremely sharp, sour, and tangy',
    texture: 'Crisp, firm green flesh that stays crunchy when cut',
    bestFor: ['Ugadi pachadi', 'Avakaya pickle', 'Mamidikaya pulihora', 'Chutneys'],
    fact:
      'Essential for the iconic Andhra Avakaya pickle, these raw green mangoes are handpicked for their firm seed shell and high acidity.',
    faqs: [
      {
        q: 'Will Pickle mangoes ripen into sweet table fruit?',
        a: 'No, these are raw green mangoes selected specifically for cooking and pickling due to their sharp sour flavor and crisp texture.',
      },
    ],
  },
};

