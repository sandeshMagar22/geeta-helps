export const gitaQuotes = [
  { text: "You have the right to action, never to its fruits.", source: "Bhagavad Gita 2.47" },
  { text: "The mind is restless, but it can be trained through practice.", source: "Bhagavad Gita 6.35" },
  { text: "When meditation is mastered, the mind is unwavering — like a flame in a windless place.", source: "Bhagavad Gita 6.19" },
  { text: "He who is steady in joy and sorrow is fit for immortality.", source: "Bhagavad Gita 2.15" },
  { text: "Lift yourself by yourself; do not let yourself fall.", source: "Bhagavad Gita 6.5" },
  { text: "A person can rise through the efforts of their own mind, or fall by the same.", source: "Bhagavad Gita 6.5" },
  { text: "The soul is unborn, eternal, ever-existing — it does not die when the body dies.", source: "Bhagavad Gita 2.20" },
  { text: "Perform your duty with calmness, abandoning attachment to results.", source: "Bhagavad Gita 2.48" },
  { text: "What is night for all beings is day for the disciplined; what is day for all is night for the wise.", source: "Bhagavad Gita 2.69" },
  { text: "Anger leads to clouded judgment; clouded judgment to ruin.", source: "Bhagavad Gita 2.63" },
  { text: "He who has conquered himself is a friend of himself.", source: "Bhagavad Gita 6.6" },
  { text: "Set thy heart on thy work, but never on its reward.", source: "Bhagavad Gita 2.47" },
];

export const motivationQuotes = [
  { text: "Discipline is choosing between what you want now and what you want most.", source: "Abraham Lincoln" },
  { text: "Fall seven times, stand up eight.", source: "Japanese proverb" },
  { text: "The wound is the place where the light enters you.", source: "Rumi" },
  { text: "What you seek is seeking you.", source: "Rumi" },
  { text: "Strength does not come from physical capacity — it comes from an indomitable will.", source: "Mahatma Gandhi" },
  { text: "Arise, awake, and stop not till the goal is reached.", source: "Swami Vivekananda" },
];

export const allQuotes = [...gitaQuotes, ...motivationQuotes];

export function getDailyWisdom() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return gitaQuotes[day % gitaQuotes.length];
}
