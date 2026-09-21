const BANK = {
  easy: [
    ["okra","Green pod that turns slimy when cooked"],
    ["candy","Traded by the bagful every Halloween"],
    ["field","Open land where crops are grown"],
    ["taste","What the tongue is for"],
    ["group","A number of people or things together"],
    ["piano","Eighty-eight keys, black and white"],
    ["river","Fresh water heading for the sea"],
    ["cloud","Floats overhead and sometimes leaks"],
    ["bread","Flour, water, yeast, heat"],
    ["chair","Furniture built for one seated person"],
    ["lemon","Sour yellow citrus"],
    ["tiger","Striped big cat of Asia"],
    ["brush","Moves paint, or tidies hair"],
    ["ghost","Said to haunt the old house"],
    ["sugar","Spooned into tea"],
    ["knife","Blade for cutting at the table"],
    ["storm","Wind and rain arriving together"],
    ["mouse","A rodent, and a thing on your desk"],
    ["crown","Worn by a monarch"],
    ["beach","Where the sand meets the sea"],
    ["clock","Tells the time from the wall"],
    ["glove","Keeps one hand warm"],
    ["train","Runs on rails between stations"],
    ["honey","Made by bees, stolen by us"],
    ["shelf","A plank on the wall for books"],
    ["whale","Biggest animal in the ocean"],
    ["juice","Squeezed straight out of fruit"],
    ["cabin","Small wooden house in the woods"],
    ["flame","The visible part of a fire"],
    ["store","Large shop where goods are traded"]
  ],
  medium: [
    ["meeting","People gathering to talk business"],
    ["number","Symbol used for counting"],
    ["canvas","Cloth a painter works on"],
    ["garden","A plot kept for flowers and plants"],
    ["feather","The outer covering of a bird"],
    ["comfort","A pleasant feeling of ease"],
    ["tongue","The muscular organ of the mouth"],
    ["country","A politically defined region"],
    ["friend","Someone you chose, not inherited"],
    ["pocket","Sewn into clothes to carry small things"],
    ["needle","A thin, sharp metal pin"],
    ["expert","Someone who knows a field deeply"],
    ["second","One sixtieth of a minute"],
    ["resume","One page that tells them about you"],
    ["library","Borrow books from here"],
    ["pajamas","Many developers work in them"],
    ["guitar","Six strings over a hollow body"],
    ["bridge","Carries a road across the water"],
    ["castle","Stone fortress with towers"],
    ["dragon","Fire-breathing beast of legend"],
    ["market","Stalls selling produce"],
    ["pencil","Graphite wrapped in wood"],
    ["rocket","Burns fuel to reach orbit"],
    ["silver","Metal of the second-place medal"],
    ["winter","The coldest season"],
    ["puzzle","Pieces that only fit one way"],
    ["mirror","Shows you your own face"],
    ["island","Land with water all the way round"],
    ["forest","A dense stand of trees"],
    ["anchor","Dropped to hold a ship in place"],
    ["candle","Wax wrapped around a wick"],
    ["desert","Dry land where rain rarely falls"],
    ["engine","Turns fuel into motion"],
    ["fossil","Ancient remains left in rock"],
    ["hammer","Drives the nail home"],
    ["jungle","Thick tropical forest"],
    ["kitchen","The room where meals are made"],
    ["lantern","A portable light with a handle"],
    ["monster","What children fear under the bed"],
    ["octopus","Eight arms and three hearts"],
    ["pyramid","Tomb built in ancient Egypt"],
    ["quarter","One of four equal parts"],
    ["respect","Earned rather than demanded"],
    ["thunder","The sound that follows the flash"],
    ["village","Smaller than a town"],
    ["whisper","Speech without any voice behind it"],
    ["diamond","The hardest natural gem"],
    ["gravity","What keeps you on the ground"],
    ["harvest","Bringing the crop in"],
    ["journey","Travel from one place to another"],
    ["machine","Does work through moving parts"],
    ["mystery","A question with no answer yet"]
  ],
  hard: [
    ["addition","Putting numbers together"],
    ["exchange","Trading one thing for another"],
    ["position","Where someone or something sits"],
    ["expansion","The process of growing outward"],
    ["statement","Something formally declared"],
    ["photograph","A single moment, frozen"],
    ["autonomy","A region that governs itself"],
    ["alphabet","Everything from A to Z"],
    ["elephant","Trunk, tusks and very large ears"],
    ["festival","Days given over to music and food"],
    ["hospital","Where the sick are treated"],
    ["mountain","Climbed rather than walked around"],
    ["notebook","Bound pages waiting to be filled"],
    ["sandwich","A filling between two slices"],
    ["umbrella","Opened the moment it rains"],
    ["adventure","A trip with some risk in it"],
    ["chocolate","Made from roasted cocoa beans"],
    ["dangerous","Likely to cause harm"],
    ["education","What school is supposed to give you"],
    ["furniture","Tables, chairs and beds as a group"],
    ["guarantee","A promise that it will work"],
    ["happiness","What everyone claims to be after"],
    ["knowledge","What learning leaves behind"],
    ["landscape","The view across open country"],
    ["necessary","Cannot be done without"],
    ["orchestra","Many instruments, one conductor"],
    ["paragraph","A block of related sentences"],
    ["signature","Your own name in your own hand"],
    ["telescope","Brings the stars a little closer"],
    ["laboratory","Where the experiments are run"],
    ["generation","Everyone born at roughly the same time"],
    ["imagination","Seeing what isn't there"],
    ["temperature","Measured in degrees"],
    ["information","Facts that remove some doubt"],
    ["celebration","A party with a reason behind it"],
    ["opportunity","A chance worth taking"],
    ["competition","Rivals going after one prize"]
  ]
};

const el = id => document.getElementById(id);
const rack = el("rack"), hintBox = el("hint"), input = el("answer"), msgBox = el("msg"),
      railFill = el("railFill"), rail = el("rail"), livesBox = el("lives"),
      levelOut = el("levelOut"), scoreOut = el("scoreOut"),
      streakOut = el("streakOut"), bestOut = el("bestOut");

const MAX_LIVES = 3, MAX_HINTS = 3;
let word, hintText, level, score, streak, lives, hints, best = 0,
    hintUsed, roundTime, msLeft, ticker, used = [], lastPraise = "";

try { best = parseInt(localStorage.getItem("tileError.best") || "0", 10) || 0; } catch (e) {}
const saveBest = () => { try { localStorage.setItem("tileError.best", String(best)); } catch (e) {} };

const pick = a => a[Math.floor(Math.random() * a.length)];

function tierFor(lv){
  if (lv <= 3) return "easy";
  if (lv <= 8) return Math.random() < 0.25 ? "easy" : "medium";
  if (lv <= 14) return Math.random() < 0.55 ? "medium" : "hard";
  return Math.random() < 0.2 ? "medium" : "hard";
}

// clock shrinks from 30s down to a 12s floor
const timeFor = lv => Math.max(12, 30 - Math.floor((lv - 1) / 2) * 2);

function scramble(w){
  let out = w;
  for (let guard = 0; guard < 12 && out === w; guard++){
    const a = w.split("");
    for (let i = a.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    out = a.join("");
  }
  return out;
}

const sorted = w => w.split("").sort().join("");

function distance(a, b){
  const m = [];
  for (let i = 0; i <= b.length; i++) m[i] = [i];
  for (let j = 0; j <= a.length; j++) m[0][j] = j;
  for (let i = 1; i <= b.length; i++)
    for (let j = 1; j <= a.length; j++)
      m[i][j] = b[i-1] === a[j-1] ? m[i-1][j-1]
        : Math.min(m[i-1][j-1] + 1, m[i][j-1] + 1, m[i-1][j] + 1);
  return m[b.length][a.length];
}

function say(text, kind){
  msgBox.textContent = text;
  msgBox.className = "msg" + (kind ? " " + kind : "");
  if (text){
    void msgBox.offsetWidth;
    msgBox.classList.add("pop");
  }
}

function drawRack(letters){
  rack.className = "rack";
  rack.innerHTML = "";
  letters.split("").forEach((ch, i) => {
    const t = document.createElement("span");
    t.className = "tile";
    t.textContent = ch;
    t.style.animationDelay = (i * 35) + "ms";
    rack.appendChild(t);
  });
}

function paintHud(){
  levelOut.textContent = level;
  scoreOut.textContent = score.toLocaleString();
  streakOut.innerHTML = "&times;" + multiplier().toFixed(2).replace(/\.00$/, "");
  bestOut.textContent = best.toLocaleString();
  el("hintBtn").textContent = "Hint (" + hints + ")";
  el("hintBtn").disabled = hints === 0 || hintUsed;
  [...livesBox.children].forEach((pip, i) => pip.classList.toggle("gone", i >= lives));
}

const multiplier = () => Math.min(3, 1 + streak * 0.25);

function startClock(seconds){
  clearInterval(ticker);
  roundTime = seconds * 1000;
  msLeft = roundTime;
  rail.classList.remove("low");
  railFill.style.width = "100%";
  const secsOut = el("secsOut");
  secsOut.textContent = seconds + "s";
  secsOut.classList.remove("low");
  ticker = setInterval(() => {
    msLeft -= 100;
    const pct = Math.max(0, msLeft / roundTime) * 100;
    railFill.style.width = pct + "%";
    secsOut.textContent = Math.max(0, Math.ceil(msLeft / 1000)) + "s";
    rail.classList.toggle("low", pct < 30);
    secsOut.classList.toggle("low", pct < 30);
    if (msLeft <= 0) timeUp();
  }, 100);
}

function timeUp(){
  clearInterval(ticker);
  lives--;
  streak = 0;
  paintHud();
  if (lives <= 0) return endRun("Time ran out on " + word.toUpperCase() + ".");
  say("Out of time. The word was " + word.toUpperCase() + ". " +
      lives + (lives === 1 ? " life" : " lives") + " left.", "bad");
  setTimeout(nextWord, 1400);
}

function nextWord(){
  const tier = tierFor(level);
  let entry, guard = 0;
  do { entry = pick(BANK[tier]); guard++; } while (used.includes(entry[0]) && guard < 40);

  used.push(entry[0]);
  if (used.length > 45) used.shift();

  word = entry[0];
  hintText = entry[1];
  hintUsed = false;

  drawRack(scramble(word));
  hintBox.className = "hint";
  hintBox.textContent = hints > 0
    ? "Hint locked. " + hints + (hints === 1 ? " left for the run." : " left for the run.")
    : "No hints left. You're on your own.";
  input.value = "";
  input.maxLength = word.length;
  input.focus();
  paintHud();
  startClock(timeFor(level));
}

const PRAISE = ["Solved.", "Clean.", "Got it.", "Unlocked.", "Cracked it."];

function check(){
  const guess = input.value.toLowerCase().replace(/[^a-z]/g, "");

  if (!guess) return say("Type a word first.", "bad");

  if (guess !== word){
    rack.classList.remove("wrong");
    void rack.offsetWidth;
    rack.classList.add("wrong");

    if (sorted(guess) === sorted(word)){
      say("Right letters, wrong order. Rearrange them.", "bad");
    } else if (guess.length !== word.length){
      say("You typed " + guess.length + " letters. The word has " + word.length + ".", "bad");
    } else {
      const d = distance(guess, word);
      say(d <= 2
        ? "Nearly — " + d + (d === 1 ? " letter is" : " letters are") + " wrong."
        : "Not this one. Use every tile on the rack, once each.", "bad");
    }
    input.select();
    return;
  }

  // correct
  clearInterval(ticker);
  rack.classList.add("right");

  const secsLeft = Math.max(0, msLeft / 1000);
  const speedBonus = Math.round(secsLeft * 6 * (hintUsed ? 0.5 : 1));
  const base = word.length * 12;
  const gained = Math.round((base + speedBonus) * multiplier());

  score += gained;
  streak++;
  level++;
  if (score > best){ best = score; saveBest(); }

  let praise;
  do { praise = pick(PRAISE); } while (praise === lastPraise && PRAISE.length > 1);
  lastPraise = praise;

  const streakNote = streak >= 3 ? " " + streak + " in a row, multiplier now \u00d7" +
        multiplier().toFixed(2).replace(/\.00$/, "") + "." : "";
  say(praise + " " + word.toUpperCase() + " for " + gained + " points." + streakNote, "ok");
  paintHud();
  setTimeout(nextWord, 900);
}

function useHint(){
  if (hints === 0 || hintUsed) return;
  hints--;
  hintUsed = true;
  hintBox.className = "hint open";
  hintBox.textContent = hintText;
  say("Hint spent, " + hints + " left. Half speed bonus this round.", "note");
  paintHud();
  input.focus();
}

function shuffle(){
  drawRack(scramble(word));
  input.focus();
}

function skip(){
  clearInterval(ticker);
  streak = 0;
  say("Skipped " + word.toUpperCase() + ". Streak back to \u00d71.", "note");
  paintHud();
  setTimeout(nextWord, 1100);
}

function startRun(){
  level = 1; score = 0; streak = 0; lives = MAX_LIVES; hints = MAX_HINTS;
  used = []; lastPraise = "";
  el("startScreen").hidden = true;
  el("overScreen").hidden = true;
  say("Rearrange the tiles into a real word, then press Enter.", "note");
  paintHud();
  nextWord();
}

function endRun(reason){
  clearInterval(ticker);
  railFill.style.width = "0%";
  if (score > best){ best = score; saveBest(); }
  el("finalScore").textContent = score.toLocaleString();
  el("finalLevel").textContent = level;
  el("finalBest").textContent = best.toLocaleString();
  el("finalWord").innerHTML = reason.replace(/([A-Z]{3,})/, "<b>$1</b>");
  el("overScreen").hidden = false;
}

el("startBtn").addEventListener("click", startRun);
el("againBtn").addEventListener("click", startRun);
el("checkBtn").addEventListener("click", check);
el("shuffleBtn").addEventListener("click", shuffle);
el("hintBtn").addEventListener("click", useHint);
el("skipBtn").addEventListener("click", skip);
input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });

bestOut.textContent = best.toLocaleString();
