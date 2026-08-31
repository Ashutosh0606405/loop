function classify(text: string) {
  const content = text.toLowerCase();

  const posWords = new Set([
    "amazing", "awesome", "great", "love", "loved", "fast", "resolved", "excellent", "superb",
    "helpful", "fantastic", "wonderful", "best", "good", "improvement", "improvements", "improved",
    "saves", "saved", "easy", "easier", "perfect", "smooth", "happy", "delighted", "impressed",
    "top-notch", "outstanding", "brilliant", "valuable", "efficient", "seamless", "favorite",
    "clean", "intuitive", "quick", "thanks", "thank", "nice", "useful", "like", "liked",
    "satisfied", "enjoy", "enjoyed", "recommend", "flawless", "super"
  ]);

  const negWords = new Set([
    "slow", "error", "errors", "fail", "failed", "failure", "broken", "bad", "terrible",
    "horrible", "crash", "crashed", "bug", "bugs", "frustrated", "frustrating", "disappointed",
    "disappointing", "delayed", "delay", "poor", "useless", "stuck", "waste", "refund",
    "annoying", "expensive", "complicated", "difficult", "worst", "hate", "problem", "problems",
    "unable", "cannot", "cant", "freeze", "freezing", "dislike", "disliked", "awful",
    "unacceptable", "garbage", "junk", "clunky", "glitch", "glitchy", "down", "downtime"
  ]);

  const words = content.replace(/[^\w\s]/g, " ").split(/\s+/).filter(Boolean);
  let posScore = 0;
  let negScore = 0;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const prevWords = words.slice(Math.max(0, i - 3), i).join(" ");
    const isNegated = /\b(not|no|never|dont|doesnt|didnt|cannot|cant|wont)\b/.test(prevWords);

    if (posWords.has(w)) {
      if (isNegated) negScore += 1.5;
      else posScore += 1.0;
    } else if (negWords.has(w)) {
      if (isNegated) posScore += 1.0;
      else negScore += 1.5;
    }
  }

  const result = posScore > negScore ? "POSITIVE" : negScore > posScore ? "NEGATIVE" : "NEUTRAL";
  console.log(`[${result}] (pos:${posScore}, neg:${negScore}) => "${text}"`);
}

classify("The app is slow, buggy, and crashes all the time!");
classify("The new dashboard analytics and speed improvements are amazing!");
classify("This software is not good and support did not help.");
classify("Payment checkout failed with error 500 when using Visa card.");
classify("Nothing works properly and I want a full refund.");
