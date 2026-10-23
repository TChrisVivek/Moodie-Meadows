// Structured content for the five Moodie Meadows emotion adventures.
// Every adventure follows the same gameplay loop:
//   story → feel (identify) → clues (understand) → choose (action) → practise → celebrate
// Keeping the content as data lets one set of reusable components play every adventure.

export type Mood = "angry" | "sad" | "worried" | "happy" | "calm";

export type FeelingOption = {
  label: string;
  mood: Mood;
  tint: string;
  correct: boolean;
  feedback: string;
};

export type Clue = { id: string; label: string; detail: string };

export type ResponseOption = {
  text: string;
  helpful: boolean;
  feedback: string;
};

export type PickOption = {
  id: string;
  text: string;
  helpful: boolean;
  feedback: string;
};

type TaskBase = { id: string; title: string; prompt: string; done: string };

export type BreatheTask = TaskBase & {
  kind: "breathe";
  breaths: number;
  inWord: string;
  outWord: string;
  alternative: string;
};
export type CountTask = TaskBase & { kind: "count"; to: number; cue: string };
export type PickTask = TaskBase & {
  kind: "pick";
  need: number;
  options: PickOption[];
};
export type OrderTask = TaskBase & {
  kind: "order";
  /** Steps in the correct order. */
  steps: { id: string; text: string }[];
  /** Order the steps are shown on screen (indexes into steps). */
  shown: number[];
  wrong: string;
};
export type SortTask = TaskBase & {
  kind: "sort";
  bins: [string, string];
  items: { id: string; text: string; bin: 0 | 1; wrong: string }[];
};
export type NoticeTask = TaskBase & {
  kind: "notice";
  items: { id: string; name: string; icon: string }[];
};
export type Task =
  | BreatheTask
  | CountTask
  | PickTask
  | OrderTask
  | SortTask
  | NoticeTask;

export type Adventure = {
  id: "anger" | "stress" | "sadness" | "anxiety" | "happiness";
  title: string;
  short: string;
  color: string;
  mascot: string;
  tint: string;
  mood: Mood;
  feeling: string;
  /** Short story pages, read one at a time. */
  pages: string[];
  story?: string;
  feelings: FeelingOption[];
  clues: Clue[];
  validation: string;
  responses: ResponseOption[];
  skill: string;
  practice: string;
  tasks: Task[];
  learned: string;
  next: string;
  kindness: string;
  sticker: string;
};

const tints = {
  Angry: "#edb29b",
  Stressed: "#b6c99b",
  Sad: "#afccdd",
  Worried: "#c7b9df",
  Happy: "#f7cd64",
} as const

function feeling(
  label: keyof typeof tints,
  mood: Mood,
  correct: boolean,
  feedback: string,
): FeelingOption {
  return { label, mood, tint: tints[label], correct, feedback }
}

export const adventures: Adventure[] = [
  {
    id: "anger",
    title: "Anger Volcano",
    short: "Pause & use words",
    color: "peach",
    mascot: "Ember",
    tint: "#edb29b",
    mood: "angry",
    feeling: "Angry",
    pages: [
      "This is Ember. Ember lives by the Anger Volcano.",
      "Ember is building a toy town. The little red truck is Ember’s favourite.",
      "Pip runs over and grabs the red truck. Pip did not ask!",
      "Ember’s cheeks get hot. Rumble, rumble… like a volcano!",
    ],
    feelings: [
      feeling(
        "Angry",
        "angry",
        true,
        "Yes! Ember feels angry. Someone took the truck without asking. That can feel unfair.",
      ),
      feeling(
        "Sad",
        "sad",
        false,
        "Good thinking. Ember might feel a bit sad too. But look: hot cheeks and a rumbly body. Those are clues for a different feeling.",
      ),
      feeling(
        "Worried",
        "worried",
        false,
        "Worry feels fluttery, like butterflies. Ember feels hot and rumbly. Look again!",
      ),
      feeling(
        "Happy",
        "happy",
        false,
        "Ember isn’t smiling right now. The truck was taken. Look at the clues again.",
      ),
    ],
    clues: [
      {
        id: "cheeks",
        label: "Hot cheeks",
        detail: "Anger can make our face feel warm.",
      },
      {
        id: "fists",
        label: "Tight fists",
        detail: "Our hands might squeeze tight.",
      },
      {
        id: "heart",
        label: "Fast heartbeat",
        detail: "Our heart can go thump, thump, fast!",
      },
    ],
    validation:
      "It is okay to feel angry. Anger is not bad. What we do next is what matters.",
    responses: [
      {
        text: "Grab the truck back and push Pip",
        helpful: false,
        feedback:
          "Ember’s anger makes sense. But pushing can hurt Pip, and the problem is still there. Let’s find a safer choice.",
      },
      {
        text: "Stop, take a deep breath, then tell Pip how I feel",
        helpful: true,
        feedback:
          "Great choice! A pause helps the volcano cool down. Then Ember can use words to fix the problem.",
      },
      {
        text: "Knock down the whole toy town",
        helpful: false,
        feedback:
          "Big anger can make us want to smash things. But then Ember’s town is gone too. What could help Ember calm down first?",
      },
    ],
    skill: "Pause, breathe, and speak",
    practice: "Help Ember cool the volcano. Then choose calm words.",
    tasks: [
      {
        kind: "breathe",
        id: "breathe",
        title: "Volcano breaths",
        prompt:
          "Breathe in as the volcano fills up. Breathe out as the steam floats away.",
        breaths: 3,
        inWord: "Breathe in… 2… 3… 4",
        outWord: "Breathe out… 2… 3… 4",
        alternative: "Squeeze your hands tight… now let them go floppy.",
        done: "The volcano is calm. Lovely breathing!",
      },
      {
        kind: "pick",
        id: "words",
        title: "Choose Ember’s words",
        prompt: "What could Ember say to Pip?",
        need: 1,
        options: [
          {
            id: "you-worst",
            text: "“You’re the worst! Go away!”",
            helpful: false,
            feedback:
              "Those words might hurt Pip. Try words that say how Ember feels.",
          },
          {
            id: "i-feel",
            text: "“I feel angry. I was using the truck. Please give it back.”",
            helpful: true,
            feedback:
              "Clear and calm! Now Pip knows how Ember feels and what Ember needs.",
          },
          {
            id: "stomp",
            text: "Say nothing and stomp away",
            helpful: false,
            feedback:
              "Walking away for a moment is okay. But Pip still doesn’t know what’s wrong. Try using words.",
          },
          {
            id: "turns",
            text: "“I’m upset. Can we take turns with the truck?”",
            helpful: true,
            feedback:
              "Wonderful! Ember named the feeling and found a fair idea.",
          },
        ],
        done: "Calm words help solve problems.",
      },
    ],
    learned: "When I feel angry, I can stop, breathe, and use calm words.",
    next: "I can pause, notice my body, use words, and ask a trusted adult for help.",
    kindness: "Offer to take turns with the truck when Ember is finished.",
    sticker: "Brave Little Ember",
  },
  {
    id: "stress",
    title: "Stress Mountain",
    short: "One small step",
    color: "green",
    mascot: "Moss",
    tint: "#b6c99b",
    mood: "worried",
    feeling: "Stressed",
    pages: [
      "This is Moss. Moss lives on Stress Mountain.",
      "Moss has homework, a messy room, and a school bag to pack.",
      "And it’s nearly bedtime! “There’s too much to do!” says Moss.",
    ],
    feelings: [
      feeling(
        "Stressed",
        "worried",
        true,
        "Yes! Moss feels stressed. Too many jobs at once can feel like a giant mountain.",
      ),
      feeling(
        "Happy",
        "happy",
        false,
        "Moss isn’t smiling. There’s a big pile of jobs. Look at the clues again.",
      ),
      feeling(
        "Sad",
        "sad",
        false,
        "Good try. Moss isn’t crying, though. Moss feels like there’s too much to do.",
      ),
      feeling(
        "Angry",
        "angry",
        false,
        "Moss isn’t cross at anyone. Moss feels like there’s too much at once. Try again!",
      ),
    ],
    clues: [
      {
        id: "shoulders",
        label: "Tight shoulders",
        detail: "Stress can make our shoulders go up high.",
      },
      {
        id: "thoughts",
        label: "Racing thoughts",
        detail: "Our thoughts zoom around very fast.",
      },
      {
        id: "stuck",
        label: "Feeling stuck",
        detail: "It’s hard to know where to start.",
      },
    ],
    validation:
      "Feeling stressed is normal. You don’t have to do everything at once.",
    responses: [
      {
        text: "Try to do every job at once, super fast",
        helpful: false,
        feedback:
          "Moss wants it all done! But doing everything at once makes the mountain feel even bigger.",
      },
      {
        text: "Pick one small job and start there",
        helpful: true,
        feedback:
          "Yes! One small step at a time makes a big mountain feel smaller.",
      },
      {
        text: "Hide under the blanket and give up",
        helpful: false,
        feedback:
          "Wanting to hide is normal when things feel big. A short rest is okay. Then one small step can help.",
      },
    ],
    skill: "Make a little-step plan",
    practice:
      "Help Moss break a big job into small steps. Then take a calm pause.",
    tasks: [
      {
        kind: "order",
        id: "plan",
        title: "Small steps up the mountain",
        prompt: "Big job: pack the school bag. Tap the steps in order.",
        steps: [
          { id: "get", text: "Get the bag" },
          { id: "homework", text: "Put the homework inside" },
          { id: "zip", text: "Zip it up" },
          { id: "door", text: "Put it by the door" },
        ],
        shown: [2, 0, 3, 1],
        wrong: "Hmm, not that one yet. Which step comes first?",
        done: "One step at a time. The bag is packed!",
      },
      {
        kind: "count",
        id: "pause",
        title: "A calm pause",
        prompt: "Roll your shoulders. Count slowly to five with Moss.",
        to: 5,
        cue: "Tap each number slowly.",
        done: "Shoulders soft. Mind calm. Nice pause!",
      },
    ],
    learned:
      "Big jobs feel smaller when I take one small step at a time and pause to breathe.",
    next: "I can break a big task into small steps, take a break, and ask for support.",
    kindness: "Offer to help Moss put one pencil away.",
    sticker: "Little-Step Moss",
  },
  {
    id: "sadness",
    title: "Tear River",
    short: "Feel it & share it",
    color: "blue",
    mascot: "Ripple",
    tint: "#afccdd",
    mood: "sad",
    feeling: "Sad",
    pages: [
      "This is Ripple. Ripple lives by Tear River.",
      "Ripple’s friends are playing tag. Nobody asks Ripple to play.",
      "Ripple sits by the river. A little tear rolls down.",
    ],
    feelings: [
      feeling(
        "Sad",
        "sad",
        true,
        "Yes! Ripple feels sad. Being left out can really hurt.",
      ),
      feeling(
        "Angry",
        "angry",
        false,
        "Some people feel cross when left out. But Ripple is quiet and teary. Look again!",
      ),
      feeling(
        "Happy",
        "happy",
        false,
        "Ripple isn’t smiling. Ripple is sitting alone. Look at the clues again.",
      ),
      feeling(
        "Worried",
        "worried",
        false,
        "Good thinking. But Ripple isn’t thinking “what if”. Ripple feels left out and teary.",
      ),
    ],
    clues: [
      {
        id: "chest",
        label: "Heavy chest",
        detail: "Sadness can feel heavy inside.",
      },
      {
        id: "eyes",
        label: "Watery eyes",
        detail: "Tears are a natural way to let feelings out.",
      },
      {
        id: "tired",
        label: "Low energy",
        detail: "We might want to sit still and be quiet.",
      },
    ],
    validation:
      "Sadness is okay. Ripple doesn’t have to smile before they’re ready.",
    responses: [
      {
        text: "Tell someone they trust, “I feel sad.”",
        helpful: true,
        feedback:
          "Yes! Sharing a sad feeling can make it feel lighter. Nobody has to be sad alone.",
      },
      {
        text: "Pretend everything is fine and keep it inside",
        helpful: false,
        feedback:
          "Lots of people hide sad feelings. But keeping them inside can make them feel heavier. Let’s try another way.",
      },
      {
        text: "Hide the friends’ ball so they can’t play",
        helpful: false,
        feedback:
          "Ripple’s hurt feelings make sense. But that would make friends sad too. Let’s find a kinder way.",
      },
    ],
    skill: "Name, share, and find comfort",
    practice:
      "Help Ripple find words, choose someone to talk to, and pick a comfort.",
    tasks: [
      {
        kind: "pick",
        id: "words",
        title: "Find Ripple’s feeling words",
        prompt: "Pick two words that fit how Ripple feels.",
        need: 2,
        options: [
          {
            id: "sad",
            text: "Sad",
            helpful: true,
            feedback: "Yes, Ripple feels sad.",
          },
          {
            id: "silly",
            text: "Silly",
            helpful: false,
            feedback: "Ripple isn’t feeling silly right now. Try another word.",
          },
          {
            id: "left-out",
            text: "Left out",
            helpful: true,
            feedback: "Yes! Ripple wasn’t asked to play.",
          },
          {
            id: "excited",
            text: "Excited",
            helpful: false,
            feedback: "Not right now. Ripple feels quiet and teary.",
          },
          {
            id: "lonely",
            text: "Lonely",
            helpful: true,
            feedback: "Yes! Ripple is sitting all alone.",
          },
        ],
        done: "Naming a feeling is a brave first step.",
      },
      {
        kind: "pick",
        id: "talk",
        title: "Who can Ripple talk to?",
        prompt: "Pick someone Ripple could share the feeling with.",
        need: 1,
        options: [
          {
            id: "grownup",
            text: "A grown-up at home",
            helpful: true,
            feedback: "Yes! Grown-ups who care can listen and help.",
          },
          {
            id: "secret",
            text: "Nobody. Keep it a secret.",
            helpful: false,
            feedback: "Keeping it secret can feel lonely. Who could listen?",
          },
          {
            id: "teacher",
            text: "A teacher",
            helpful: true,
            feedback: "Yes! Teachers can listen and help Ripple join in.",
          },
          {
            id: "friend",
            text: "A kind friend",
            helpful: true,
            feedback: "Yes! A kind friend can sit with Ripple.",
          },
        ],
        done: "Sharing helps us feel less alone.",
      },
      {
        kind: "pick",
        id: "comfort",
        title: "Pick a comfort",
        prompt: "What could help Ripple feel a little cosier?",
        need: 1,
        options: [
          {
            id: "hug",
            text: "A cosy hug",
            helpful: true,
            feedback: "Hugs can feel warm and safe.",
          },
          {
            id: "draw",
            text: "Draw a picture",
            helpful: true,
            feedback: "Drawing can help feelings come out.",
          },
          {
            id: "toy",
            text: "Cuddle a soft toy",
            helpful: true,
            feedback: "Soft toys are great comfort buddies.",
          },
        ],
        done: "A little comfort can help. Sadness can stay a while, and that’s okay.",
      },
    ],
    learned:
      "It’s okay to feel sad. I can name my feeling, talk to someone I trust, and find comfort.",
    next: "I can say “I feel sad,” talk with someone trusted, and choose a little comfort.",
    kindness: "Ask Ripple, “Would you like to play with me?”",
    sticker: "Caring Ripple",
  },
  {
    id: "anxiety",
    title: "Worry Woods",
    short: "Control & calm",
    color: "purple",
    mascot: "Nimbus",
    tint: "#c7b9df",
    mood: "worried",
    feeling: "Worried",
    pages: [
      "This is Nimbus. Nimbus lives in Worry Woods.",
      "Tomorrow, Nimbus will read a story to the whole class.",
      "“What if I forget the words? What if they laugh?” Nimbus wonders.",
    ],
    feelings: [
      feeling(
        "Worried",
        "worried",
        true,
        "Yes! Nimbus feels worried. “What if” thoughts are big worry clues.",
      ),
      feeling(
        "Happy",
        "happy",
        false,
        "Nimbus isn’t smiling. Nimbus is thinking “what if…?”. Look again!",
      ),
      feeling(
        "Angry",
        "angry",
        false,
        "Nimbus isn’t cross. Nimbus is thinking about tomorrow. Try again!",
      ),
      feeling(
        "Sad",
        "sad",
        false,
        "Good thinking. But Nimbus isn’t teary. Nimbus has fluttery “what if” thoughts.",
      ),
    ],
    clues: [
      {
        id: "tummy",
        label: "Fluttery tummy",
        detail: "Worry can feel like butterflies inside.",
      },
      {
        id: "hands",
        label: "Sweaty hands",
        detail: "Our hands might feel warm and damp.",
      },
      {
        id: "whatif",
        label: "“What if” thoughts",
        detail: "Our mind keeps thinking about what could happen.",
      },
    ],
    validation:
      "Feeling worried is normal. Everyone worries sometimes. Small brave steps help.",
    responses: [
      {
        text: "Keep every worry a secret",
        helpful: false,
        feedback:
          "Worries can grow bigger when we keep them hidden. Sharing them can help them shrink.",
      },
      {
        text: "Practise with a grown-up and take slow breaths",
        helpful: true,
        feedback:
          "Great choice! Practising helps Nimbus feel ready. Slow breaths help the body feel calm.",
      },
      {
        text: "Stay home so I never have to try",
        helpful: false,
        feedback:
          "Staying away can feel safer for a moment. But the worry can grow. Small brave steps help it shrink.",
      },
    ],
    skill: "Sort worries & notice now",
    practice:
      "Help Nimbus sort what they can control. Then notice five things in the woods.",
    tasks: [
      {
        kind: "sort",
        id: "control",
        title: "What can Nimbus control?",
        prompt: "Tap a card, then pick a basket.",
        bins: ["I can control", "I can’t control"],
        items: [
          {
            id: "practise",
            text: "Practising my story",
            bin: 0,
            wrong:
              "Nimbus can choose to practise. That’s something Nimbus can control!",
          },
          {
            id: "others",
            text: "What others think",
            bin: 1,
            wrong: "We can’t control what others think. That’s okay!",
          },
          {
            id: "breaths",
            text: "Taking slow breaths",
            bin: 0,
            wrong:
              "Nimbus can choose to breathe slowly. That’s in Nimbus’s control!",
          },
          {
            id: "rain",
            text: "If it rains tomorrow",
            bin: 1,
            wrong:
              "Nobody can control the weather! That one goes in the other basket.",
          },
          {
            id: "help",
            text: "Asking for help",
            bin: 0,
            wrong:
              "Nimbus can choose to ask for help. That’s in Nimbus’s control!",
          },
        ],
        done: "Focus on what you can control. Let the rest float by.",
      },
      {
        kind: "notice",
        id: "notice",
        title: "Notice five things",
        prompt:
          "Find five things in Worry Woods. Look around your own room too!",
        items: [
          { id: "flower", name: "A flower", icon: "flower" },
          { id: "cloud", name: "A soft cloud", icon: "cloud" },
          { id: "tree", name: "A tall tree", icon: "tree" },
          { id: "star", name: "A little star", icon: "star" },
          { id: "hill", name: "A green hill", icon: "hill" },
        ],
        done: "Noticing what’s around you brings your mind back to right now.",
      },
    ],
    learned:
      "When I feel worried, I can focus on what I can control and notice what’s around me.",
    next: "I can sort my worries, notice five things, take one small step, and talk to a trusted adult.",
    kindness: "Tell Nimbus, “I can listen while you practise one sentence.”",
    sticker: "Brave Woods Nimbus",
  },
  {
    id: "happiness",
    title: "Spark Summit",
    short: "Celebrate & share",
    color: "sunshine",
    mascot: "Sunny",
    tint: "#f7cd64",
    mood: "happy",
    feeling: "Happy",
    pages: [
      "This is Sunny. Sunny lives on Spark Summit.",
      "Sunny watered a tiny seed every day for a whole week.",
      "Today a green sprout popped up! “I did it!” shouts Sunny.",
    ],
    feelings: [
      feeling(
        "Happy",
        "happy",
        true,
        "Yes! Sunny feels happy. Hard work paid off!",
      ),
      feeling(
        "Sad",
        "sad",
        false,
        "Sunny isn’t teary. Sunny is shouting “I did it!”. Look again!",
      ),
      feeling(
        "Angry",
        "angry",
        false,
        "Sunny isn’t cross at all. The seed grew! Try again.",
      ),
      feeling(
        "Worried",
        "worried",
        false,
        "Good thinking, but Sunny isn’t worried. The sprout popped up! Look at the clues.",
      ),
    ],
    clues: [
      {
        id: "smile",
        label: "Big smile",
        detail: "Happy feelings often show on our face.",
      },
      {
        id: "warm",
        label: "Warm inside",
        detail: "Happiness can feel cosy and warm.",
      },
      {
        id: "bouncy",
        label: "Bouncy body",
        detail: "We might want to jump and dance!",
      },
    ],
    validation:
      "Happy moments are lovely to notice. It’s okay to feel proud of yourself.",
    responses: [
      {
        text: "Say “My flower is the best. Yours are boring!”",
        helpful: false,
        feedback:
          "Sunny is proud, and that’s great! But those words could make friends feel bad. Let’s share joy kindly.",
      },
      {
        text: "Keep it secret and say it’s no big deal",
        helpful: false,
        feedback: "Small wins matter! It’s okay to feel proud and celebrate.",
      },
      {
        text: "Show a friend and say “Look what I grew!”",
        helpful: true,
        feedback: "Yes! Sharing happy moments lets others join the joy.",
      },
    ],
    skill: "Celebrate & share joy kindly",
    practice: "Help Sunny celebrate. Then share the joy in a kind way.",
    tasks: [
      {
        kind: "pick",
        id: "celebrate",
        title: "Celebrate the win",
        prompt: "How should Sunny celebrate? You choose!",
        need: 1,
        options: [
          {
            id: "dance",
            text: "Do a happy dance",
            helpful: true,
            feedback: "Wiggle, wiggle! Dancing lets the joy out.",
          },
          {
            id: "draw",
            text: "Draw the sprout",
            helpful: true,
            feedback: "A drawing helps Sunny remember this moment.",
          },
          {
            id: "proud",
            text: "Say “I worked hard!”",
            helpful: true,
            feedback: "Yes! Being proud of effort feels great.",
          },
        ],
        done: "Celebrating small wins helps us notice good things.",
      },
      {
        kind: "pick",
        id: "share",
        title: "Share thoughtfully",
        prompt: "Moss’s seed didn’t grow. How can Sunny share kindly?",
        need: 1,
        options: [
          {
            id: "brag",
            text: "Shout “Mine grew and yours didn’t!”",
            helpful: false,
            feedback: "That might make Moss feel sad. Try a kinder way.",
          },
          {
            id: "seeds",
            text: "Say “Want some seeds? We can grow them together!”",
            helpful: true,
            feedback: "So kind! Now the joy can grow for both friends.",
          },
          {
            id: "ask",
            text: "Ask Moss “How are you feeling?” first",
            helpful: true,
            feedback: "Thoughtful! Checking on a friend shows you care.",
          },
        ],
        done: "Joy grows when we share it kindly.",
      },
    ],
    learned:
      "Happy feelings are great to notice. I can celebrate and share my joy in kind ways.",
    next: "I can enjoy small wins, notice good moments, and share kindness with others.",
    kindness: "Invite a meadow friend to plant seeds with Sunny.",
    sticker: "Sunshine Sharer",
  },
]

export type AdventureId = Adventure["id"];

export function getAdventure(id: AdventureId): Adventure {
  return adventures.find((a) => a.id === id) ?? adventures[0]
}
