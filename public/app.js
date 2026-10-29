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

  // Word generation: Supabase database, local words.txt, or random a-z strings.
  let wordText = "";
  let wordStarts = new Uint32Array(0), wordLengths = new Uint32Array(0), wordCount = 0;
  let wordsReady = false, lastWord = "";
  const tokenPattern = /[A-Za-z]+(?:['-][A-Za-z]+)*/g;
  const cfg = window.SUPABASE_CONFIG || {};
  const supabaseConfigured = !!(cfg.url && cfg.anonKey && !cfg.url.includes("YOUR_PROJECT_REF") && !cfg.anonKey.includes("YOUR_SUPABASE"));
  function setWordLoading(on) {
    $("word-loading").classList.toggle("hidden", !on);
    if (on) { $("word-content").classList.add("hidden"); $("word-error").classList.add("hidden"); }
  }
  function showWordError(message) {
    $("word-loading").classList.add("hidden"); $("word-content").classList.add("hidden");
    $("word-error").textContent = message; $("word-error").classList.remove("hidden");
  }
  function displayWord(word, source) {
    lastWord = word; $("word-title").textContent = word; $("phonetic").textContent = "";
    $("part-of-speech").textContent = source === "letters" ? "Random string" : "Word list";
    $("word-source").textContent = source === "database" ? "Supabase" : source === "local" ? "Local file" : "A–Z generator";
    $("definition").textContent = source === "letters" ? "A randomly generated string using the 26 English letters." : "This entry was selected from your word list.";
    $("example").textContent = source === "letters" ? "This is a letter combination, not necessarily a real English word." : "Your word list contains words only; definitions, examples and audio are not included.";
    $("play-audio").disabled = true; $("play-audio").style.opacity = ".45";
    $("word-loading").classList.add("hidden"); $("word-content").classList.remove("hidden"); $("word-error").classList.add("hidden");
    $("word-count").textContent = source === "database" ? "Word selected from Supabase" : source === "local" ? `${wordCount.toLocaleString()} words loaded from words.txt` : `Random string · ${word.length} letters`;
  }
  function getWord(index) { return wordText.slice(wordStarts[index], wordStarts[index] + wordLengths[index]); }
  async function loadLocalWords() {
    setWordLoading(true);
    try {
      const response = await fetch("./words.txt", {cache:"no-store"});
      if (!response.ok) throw new Error(`Could not load public/words.txt (HTTP ${response.status}). Add your word-list file there and redeploy.`);
      wordText = await response.text(); let match, count = 0; tokenPattern.lastIndex = 0;
      while ((match = tokenPattern.exec(wordText)) !== null) count++;
      if (!count) throw new Error("words.txt is empty or contains no English words.");
      wordStarts = new Uint32Array(count); wordLengths = new Uint32Array(count); tokenPattern.lastIndex = 0;
      let i = 0; while ((match = tokenPattern.exec(wordText)) !== null) { wordStarts[i]=match.index; wordLengths[i]=match[0].length; i++; }
      wordCount=i; wordsReady=true; return true;
    } catch(err) { wordsReady=false; showWordError(err.message || "Could not load local word list."); $("word-count").textContent="Local word list not loaded"; return false; }
  }
  function randomLetters() {
    const n = Math.max(1, Math.min(100, Number.parseInt($("letter-length").value,10) || 8));
    $("letter-length").value=n;
    const alphabet="abcdefghijklmnopqrstuvwxyz"; let out="";
    const cryptoObj=window.crypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      const bytes=new Uint8Array(n); cryptoObj.getRandomValues(bytes);
      for (const b of bytes) out += alphabet[b % 26];
    } else for(let i=0;i<n;i++) out += alphabet[Math.floor(Math.random()*26)];
    $("word-input").value=""; displayWord(out,"letters");
  }
  async function supabaseRequest(path, options={}) {
    if (!supabaseConfigured) throw new Error("Supabase is not configured. Edit public/supabase-config.js with your project URL and publishable/anon key.");
    const base=cfg.url.replace(/\/$/,"");
    const response=await fetch(`${base}/rest/v1/${path}`, { ...options, headers:{ apikey:cfg.anonKey, Authorization:`Bearer ${cfg.anonKey}`, "Content-Type":"application/json", ...(options.headers||{}) } });
    if(!response.ok) { const body=await response.text(); throw new Error(`Supabase request failed (HTTP ${response.status}). ${body.slice(0,220)}`); }
    return response.json();
  }
  async function randomDatabaseWord() {
    setWordLoading(true);
    try { const data=await supabaseRequest("rpc/random_word",{method:"POST",body:"{}"});
      const word=typeof data === "string" ? data : Array.isArray(data) ? (typeof data[0]==="string" ? data[0] : data[0]?.random_word) : data?.random_word;
      if(!word) throw new Error("Supabase returned no word. Check that the words table is populated and the random_word function exists.");
      displayWord(String(word),"database");
    } catch(err) { showWordError(err.message || "Could not get a word from Supabase."); $("word-count").textContent="Supabase query failed"; }
  }
  async function searchDatabaseWord(query) {
    setWordLoading(true);
    try { const data=await supabaseRequest(`words?select=word&word=eq.${encodeURIComponent(query)}&limit=1`);
      if(!data.length) throw new Error(`“${query}” was not found in the Supabase word bank.`);
      displayWord(data[0].word,"database");
    } catch(err) { showWordError(err.message || "Supabase search failed."); }
  }
  async function randomWord() {
    const mode=$("word-mode").value;
    if(mode==="letters") return randomLetters();
    if(mode==="database") return randomDatabaseWord();
    if(!wordsReady && !(await loadLocalWords())) return;
    let index=Math.floor(Math.random()*wordCount);
    if(wordCount>1 && getWord(index).toLowerCase()===lastWord.toLowerCase()) index=(index+1+Math.floor(Math.random()*(wordCount-1)))%wordCount;
    $("word-input").value=""; displayWord(getWord(index),"local");
  }
  async function searchWord() {
    const query=($("word-input").value||"").trim().toLowerCase().replace(/^['"]|['"]$/g,"");
    if(!query) { showWordError("Enter a word or switch to random-letter mode."); return; }
    if($("word-mode").value==="letters") { showWordError("Search is disabled in random-letter mode. Click ↻ to generate a string."); return; }
    if($("word-mode").value==="database") return searchDatabaseWord(query);
    if(!wordsReady && !(await loadLocalWords())) return;
    tokenPattern.lastIndex=0; let match;
    while((match=tokenPattern.exec(wordText))!==null) if(match[0].toLowerCase()===query) { displayWord(match[0],"local"); return; }
    showWordError(`“${query}” was not found in your local word list.`);
  }
  $("random-word").addEventListener("click",randomWord);
  $("search-word").addEventListener("click",searchWord);
  $("word-input").addEventListener("keydown",e=>{if(e.key==="Enter")searchWord();});
  $("word-mode").addEventListener("change",()=>{
    const letters=$("word-mode").value==="letters";
    $("letter-length").classList.toggle("hidden",!letters); $("letter-length-label").classList.toggle("hidden",!letters);
    if(letters) randomLetters(); else randomWord();
  });
  $("play-audio").addEventListener("click",()=>toast("Audio is not included in a word-list-only file."));
  $("copy-word").addEventListener("click",()=>copyText($("word-title").textContent));

  $("year").textContent=new Date().getFullYear();
  generateIdentity();
  // Initial display uses a local word if available; database mode is selectable.
  $("letter-length").classList.add("hidden"); $("letter-length-label").classList.add("hidden");
  if (supabaseConfigured) randomDatabaseWord(); else { $("word-mode").value="local"; randomWord(); }
})();