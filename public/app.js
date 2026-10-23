(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const names = {
    first: ["Avery","Jordan","Riley","Morgan","Taylor","Casey","Jamie","Quinn","Alex","Robin","Cameron","Drew","Emerson","Harper","Jules","Kai","Logan","Parker","Reese","Rowan","Sage","Skyler","Tatum","Blair","Ellis","Finley","Hayden","Micah","Noah","Sasha","Theo","Zoe","Maya","Elliot","Iris","Luca","Milo","Nora","Olive","Remy","Aria","Eden","Felix","Lena","Mira","Oscar","Violet","Wren"],
    last: ["Morgan","Bennett","Reed","Hayes","Brooks","Parker","Ellis","Foster","Miller","Turner","Collins","Bailey","Rivera","Sullivan","Murphy","Carter","Mitchell","Cooper","Ward","Price","Kelly","Howard","Bell","Cook","Gray","James","Watson","Young","Diaz","Ross","Wells","Stone","Green","Adams","Baker","Clarke","Hughes","Perry","Flores","Powell"],
    places: [
      {city:"Portland",country:"United States",street:"Willow Lane",phone:"+1 (202) 555-01"},
      {city:"Toronto",country:"Canada",street:"Maple Crescent",phone:"+1 (416) 555-01"},
      {city:"Brighton",country:"United Kingdom",street:"Meadow Walk",phone:"+44 20 7946 0"},
      {city:"Melbourne",country:"Australia",street:"Banksia Street",phone:"+61 2 5550 0"},
      {city:"Dublin",country:"Ireland",street:"Clover Row",phone:"+353 1 555 0"},
      {city:"Auckland",country:"New Zealand",street:"Harbour View Road",phone:"+64 9 555 0"}
    ],
    streets:["Willow Lane","Maple Crescent","Meadow Walk","Clover Row","Orchard Street","Riverbend Road","Juniper Avenue","Oakfield Way","Harbour View Road","Fernhill Drive","Rosewood Terrace","Linden Court"]
  };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const int = (min,max) => Math.floor(Math.random()*(max-min+1))+min;
  const pad = n => String(n).padStart(2,"0");
  const dateText = d => d.toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
  let currentProfile = {};

  function generateIdentity() {
    const first = pick(names.first), last = pick(names.last), place = pick(names.places);
    const year = int(1965,2005), month = int(0,11), day = int(1,new Date(year,month+1,0).getDate());
    const birth = new Date(year,month,day);
    const age = Math.max(0, new Date().getFullYear()-year-((new Date().getMonth()<month || (new Date().getMonth()===month && new Date().getDate()<day))?1:0));
    const username = (first+last).toLowerCase()+int(10,99);
    const email = `${first}.${last}${int(10,99)}@example.com`.toLowerCase();
    const streetNumber = int(10,980);
    const phone = place.phone + int(10,99);
    currentProfile = {
      name:`${first} ${last}`, birthdate:dateText(birth), email, username,
      location:`${place.city}, ${place.country}`, address:`${streetNumber} ${pick(names.streets)}`,
      phone, age, initials:(first[0]+last[0]).toUpperCase()
    };
    $("avatar").textContent=currentProfile.initials;
    $("full-name").textContent=currentProfile.name;
    $("profile-subtitle").textContent=`Born ${birth.toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})} · ${age} years old`;
    ["email","username","location","address","phone","birthdate"].forEach(k=>$(k).textContent=currentProfile[k]);
  }

  let toastTimer;
  function toast(message) {
    const node=$("toast"); node.textContent=message; node.classList.add("show");
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>node.classList.remove("show"),2200);
  }
  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const area=document.createElement("textarea"); area.value=text; area.style.position="fixed"; area.style.opacity="0";
        document.body.appendChild(area); area.select(); const ok=document.execCommand("copy"); area.remove();
        if(!ok) throw new Error("Copy unavailable");
      }
      toast("Copied to clipboard");
    } catch { toast("Copy failed — please select and copy the text manually."); }
  }
  $("generate-identity").addEventListener("click",generateIdentity);
  $("generate-identity-bottom").addEventListener("click",generateIdentity);
  document.querySelectorAll("[data-copy]").forEach(btn=>btn.addEventListener("click",()=>copyText(currentProfile[btn.dataset.copy]||"")));
  $("copy-all").addEventListener("click",()=>copyText(
    `Name: ${currentProfile.name}\nDate of birth: ${currentProfile.birthdate}\nEmail: ${currentProfile.email}\nUsername: ${currentProfile.username}\nCountry and city: ${currentProfile.location}\nStreet address: ${currentProfile.address}\nPhone number: ${currentProfile.phone}\n\nFictional sample data only.`
  ));

  document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>{
    document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t===btn));
    $("identity-panel").classList.toggle("hidden",btn.dataset.tab!=="identity");
    $("words-panel").classList.toggle("hidden",btn.dataset.tab!=="words");
  }));

  // Local word list: public/words.txt. No third-party dictionary API is used.
  // The word file can be large; keep its text plus compact typed-array indexes,
  // rather than creating millions of individual JavaScript strings.
  let wordText = "";
  let wordStarts = new Uint32Array(0);
  let wordLengths = new Uint32Array(0);
  let wordCount = 0;
  let lastWord = "";
  let wordsReady = false;
  const tokenPattern = /[A-Za-z]+(?:['-][A-Za-z]+)*/g;

  function setWordLoading(on) {
    $("word-loading").classList.toggle("hidden", !on);
    $("word-content").classList.toggle("hidden", on);
    $("word-error").classList.add("hidden");
  }
  function showWordError(message) {
    $("word-loading").classList.add("hidden");
    $("word-content").classList.add("hidden");
    $("word-error").textContent = message;
    $("word-error").classList.remove("hidden");
  }
  function getWord(index) {
    return wordText.slice(wordStarts[index], wordStarts[index] + wordLengths[index]);
  }
  function displayLocalWord(word) {
    lastWord = word;
    $("word-title").textContent = word;
    $("phonetic").textContent = "";
    $("part-of-speech").textContent = "Word list";
    $("word-source").textContent = "Local file";
    $("definition").textContent = "This word was loaded from your local vocabulary file.";
    $("example").textContent = "Your file contains words only, so definitions, examples, and audio are not available.";
    $("play-audio").disabled = true;
    $("play-audio").style.opacity = ".45";
    $("word-loading").classList.add("hidden");
    $("word-content").classList.remove("hidden");
    $("word-error").classList.add("hidden");
    $("word-count").textContent = `${wordCount.toLocaleString()} words loaded from words.txt`;
  }
  async function loadLocalWords() {
    setWordLoading(true);
    try {
      const response = await fetch("./words.txt", { cache: "no-store" });
      if (!response.ok) throw new Error(`Could not load public/words.txt (HTTP ${response.status}). Add your word-list file there and redeploy.`);
      wordText = await response.text();
      // First pass: count tokens so we can allocate compact indexes exactly once.
      let match, count = 0;
      tokenPattern.lastIndex = 0;
      while ((match = tokenPattern.exec(wordText)) !== null) count++;
      if (!count) throw new Error("words.txt is empty or contains no English words. Add words like \"the\", \"of\", \"and\".");
      wordStarts = new Uint32Array(count);
      wordLengths = new Uint32Array(count);
      tokenPattern.lastIndex = 0;
      let i = 0;
      while ((match = tokenPattern.exec(wordText)) !== null) {
        wordStarts[i] = match.index;
        wordLengths[i] = match[0].length;
        i++;
      }
      wordCount = i;
      wordsReady = true;
      displayLocalWord(getWord(Math.floor(Math.random() * wordCount)));
    } catch (err) {
      showWordError(err.message || "Could not load your local word list.");
      $("word-count").textContent = "Local word list not loaded";
    }
  }
  function randomWord() {
    if (!wordsReady || !wordCount) {
      toast("Wait for words.txt to finish loading.");
      return;
    }
    let index = Math.floor(Math.random() * wordCount);
    if (wordCount > 1 && getWord(index).toLowerCase() === lastWord.toLowerCase()) index = (index + 1 + Math.floor(Math.random() * (wordCount - 1))) % wordCount;
    $("word-input").value = "";
    displayLocalWord(getWord(index));
  }
  function searchLocalWord() {
    if (!wordsReady) { showWordError("Your local word list is not loaded yet."); return; }
    const query = ($("word-input").value || "").trim().toLowerCase().replace(/^["']|["']$/g, "");
    if (!query) { showWordError("Enter a word to search in your local list."); return; }
    // Scan tokens without creating a second large collection of strings.
    tokenPattern.lastIndex = 0;
    let match;
    while ((match = tokenPattern.exec(wordText)) !== null) {
      if (match[0].toLowerCase() === query) {
        displayLocalWord(match[0]);
        return;
      }
    }
    showWordError(`“${query}” was not found in your local word list.`);
  }
  $("random-word").addEventListener("click", randomWord);
  $("search-word").addEventListener("click", searchLocalWord);
  $("word-input").addEventListener("keydown", e => { if (e.key === "Enter") searchLocalWord(); });
  $("play-audio").addEventListener("click", () => toast("Audio is not included in a word-list-only file."));
  $("copy-word").addEventListener("click", () => copyText($("word-title").textContent));

  $("year").textContent=new Date().getFullYear();
  generateIdentity();
  loadLocalWords();
})();