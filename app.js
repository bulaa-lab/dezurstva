// Podatkovni model
let zdravniki = [
    { id: 1, ime: 'Planinc', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 2, ime: 'Vovko', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 3, ime: 'Kmet', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 4, ime: 'Furlan', primarnoDelovisce: 'DTS',samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 5, ime: 'Šoštarič', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 6, ime: 'Kavčič', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 7, ime: 'Mavrič', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 8, ime: 'Martinčič', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 9, ime: 'Petrič', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 10, ime: 'Tomašič', primarnoDelovisce: 'DTS', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 11, ime: 'Kaplan', primarnoDelovisce: 'Vrazov trg', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 12, ime: 'Radinović', primarnoDelovisce: 'Vrazov trg', samoDezurstva: false, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 13, ime: 'Jereb', primarnoDelovisce: 'DTS', samoDezurstva: true, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 14, ime: 'Logar', primarnoDelovisce: 'DTS', samoDezurstva: true, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 15, ime: 'Fabiani', primarnoDelovisce: 'DTS', samoDezurstva: true, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 16, ime: 'Novak', primarnoDelovisce: 'DTS', samoDezurstva: true, dezurstev: 0, dezurstvaPoDnevih: {} },
    { id: 17, ime: 'Golubič', primarnoDelovisce: 'DTS', samoDezurstva: true, dezurstev: 0, dezurstvaPoDnevih: {} }
];

const DEFAULT_ZDRAVNIKI = zdravniki.map(z => ({ ...z }));

// Delovišča kjer so potrebna dežurstva
const DELOVISCA = ['DTS', 'Vrazov trg'];

// Razpored dežurstev
let dezurstva = {
    'DTS': {},
    'Vrazov trg': {}
};

let dopoldan = {
    "DTS": {},
    "Vrazov trg": {}
};

// Fiksna dežurstva za "samo dežurstva" zdravnike
let fiksnaSamo = {};

// Oznake dni (LD, MF, AMB, CC, Ž, KI ...)
let oznake = {}; 
const HARD_CODES = new Set(["LD", "MF", "AMB", "CC", "DRUGO", "IZ"]);
const SOFT_CODES = new Set(["Ž", "KI"]);

let mesec = new Date().getMonth() + 1;
let leto = new Date().getFullYear();

let modalDelovisceZdravnikId = null;
let modalZdravnikId = null;
let modalMesec = mesec;
let modalLeto = leto;
let izbranaOznakaZaKlik = null;
let modalFixZdravnikId = null;
let fixModalMesec = mesec;
let fixModalLeto = leto;
let fiksnaDezurstva = {"DTS": {}, "Vrazov trg": {}};

const SLO_MESCI = [
    "Januar","Februar","Marec","April","Maj","Junij",
    "Julij","Avgust","September","Oktober","November","December"
];

function naloziInZdruziZdravnike() {
  const sh = localStorage.getItem("zdravniki");
  const stored = sh ? JSON.parse(sh) : [];
  const byId = new Map(stored.map(z => [z.id, z]));

  for (const defZ of DEFAULT_ZDRAVNIKI) {
    const old = byId.get(defZ.id);

    if (!old) {
      byId.set(defZ.id, { ...defZ });
    } else {
      // default naj zmaga pri "ime" in "samoDezurstva"
      const merged = { ...old, ...defZ };

      // uporabniku pustiš samo to, kar dejansko spreminja
      if (old.primarnoDelovisce != null) merged.primarnoDelovisce = old.primarnoDelovisce;

      byId.set(defZ.id, merged);
    }
  }

  zdravniki = [...byId.values()].sort((a, b) => a.id - b.id);
  localStorage.setItem("zdravniki", JSON.stringify(zdravniki));
}

function dodajZdravnika() {
    const ime = prompt('Ime zdravnika:');
    if (!ime) return;
    
    let delovisceHtml = 'Primarno delovišče:\n';
    DELOVISCA.forEach((d, i) => {
        delovisceHtml += `${i + 1}. ${d}\n`;
    });
    
    const delovisceIndex = prompt(delovisceHtml);
    const primarnoDelovisce = DELOVISCA[parseInt(delovisceIndex) - 1] || DELOVISCA[0];
    
    const novId = Math.max(...zdravniki.map(z => z.id)) + 1;
    zdravniki.push({
        id: novId,
        ime: ime,
        primarnoDelovisce: primarnoDelovisce,
        dezurstev: 0,
        dezurstvaPoDnevih: {},
        samoDezurstva: false
    });
    
    prikaziZdravnike();
    alert(`✅ Dodan ${ime} na delovišče ${primarnoDelovisce}`);
}


// ========== POMOŽNE FUNKCIJE ZA SHRANJEVANJE ==========
function keyOznake(letoX = leto, mesecX = mesec) {
    return `oznake_${letoX}_${mesecX}`;
}

function keyDezurstva(letoX = leto, mesecX = mesec) {
    return `dezurstva_${letoX}_${mesecX}`;
}

function keyDopoldan(letoX = leto, mesecX = mesec) {
    return `dopoldan_${letoX}_${mesecX}`;
}

function keyFiksnaSamo(letoX = leto, mesecX = mesec) {
    return `fiksnaSamo_${letoX}_${mesecX}`;
}

// ========== POMOŽNE FUNKCIJE ZA OZNAKE ==========
function getOznaka(zdravnikId, dan) {
    return oznake[zdravnikId]?.[dan] || null;
}

function imaHard(zdravnikId, dan) {
    const k = getOznaka(zdravnikId, dan);
    return k && HARD_CODES.has(k);
}

function blokiranDanZaradiJutri(zdravnikId, dan) {
    return imaHard(zdravnikId, dan + 1);
}

// ========== IZBOLJŠAN ALGORITEM Z BACKTRACKING ==========

// Preveri če lahko zdravnik dežura na določen dan in delovišče
// ========== POPRAVLJENA FUNKCIJA ZA PREVERJANJE ==========
function lahkoDezura(zdravnikId, dan, delovisce, trenutniRazpored) {
    const zdravnik = zdravniki.find(z => z.id === zdravnikId);
    if (!zdravnik) return false;

    // Zdravniki "samo dežurstva" se obravnavajo drugače
    // Oni so že dodeljeni v fiksnih slotih, ne smejo biti kandidirani za druge
    if (zdravnik.samoDezurstva) {
        return false; // Ne more biti kandidat za navadne slote
    }

    // 2) Ne sme biti dežuren isti dan na drugem delovišču
    for (const d of DELOVISCA) {
        if (d !== delovisce) {
            const trenutniId = Number(trenutniRazpored[d]?.[dan] || 0);
            if (trenutniId === Number(zdravnikId)) {
                return false;
            }
        }
    }

    // 3) Ne sme biti dežuren dva dni zapored (kjerkoli)
    if (dan > 1) {
        for (const d of DELOVISCA) {
            const vcerajId = Number(trenutniRazpored[d]?.[dan - 1] || 0);
            if (vcerajId === Number(zdravnikId)) {
                return false;
            }
        }
    }
    
    // Preveri tudi naslednji dan (če je že določen)
    if (dan < 31) {
        for (const d of DELOVISCA) {
            const jutriId = Number(trenutniRazpored[d]?.[dan + 1] || 0);
            if (jutriId === Number(zdravnikId)) {
                return false;
            }
        }
    }

    // 4) HARD oznaka na ta dan
    if (imaHard(zdravnikId, dan)) {
        return false;
    }

    // 5) HARD oznaka jutri (blokira danes)
    if (blokiranDanZaradiJutri(zdravnikId, dan)) {
        return false;
    }

    return true;
}

// ========== POPRAVLJENA GLAVNA FUNKCIJA ==========
// ========== POPRAVLJENA FUNKCIJA generirajRazpored ==========
function generirajRazpored() {
    const dniVMesecu = new Date(leto, mesec, 0).getDate();

    // Reset
    dezurstva = {};
    DELOVISCA.forEach(d => dezurstva[d] = {});
    zdravniki.forEach(z => {
        z.dezurstev = 0;
        z.dezurstvaPoDnevih = {};
    });

    // 1) NAJPREJ ZAKLENI VSA FIKSNA "SAMO DEŽURSTVA"
    let napakeFiksna = [];
    
    for (let dan = 1; dan <= dniVMesecu; dan++) {
        const arr = (fiksnaSamo[dan] || []).slice().sort((a, b) => a - b);
        
        if (arr.length === 0) continue;
        
        // Preveri če sta 2 ista (ne more biti isti človek na obeh lokacijah)
        if (arr[0] && arr[1] && arr[0] === arr[1]) {
            const z = zdravniki.find(x => x.id === arr[0]);
            napakeFiksna.push(`Dan ${dan}: ${z.ime} ne more biti dežuren na obeh lokacijah hkrati`);
            continue;
        }
        
        // Prvi gre na DTS
        if (arr[0]) {
            const zdravnik = zdravniki.find(z => z.id === arr[0]);
            if (!zdravnik) continue;
            
            // Preveri HARD omejitve
            if (imaHard(arr[0], dan)) {
                napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} ima HARD oznako (${getOznaka(arr[0], dan)})`);
                continue;
            }
            if (blokiranDanZaradiJutri(arr[0], dan)) {
                napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} ima jutri HARD oznako`);
                continue;
            }
            
            // Preveri zaporedne dni
            if (dan > 1) {
                const vcerajDTS = dezurstva['DTS'][dan - 1];
                const vcerajVT = dezurstva['Vrazov trg'][dan - 1];
                if (vcerajDTS == arr[0] || vcerajVT == arr[0]) {
                    napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} bi bil dežuren 2 dni zapored`);
                    continue;
                }
            }
            
            // Postavi na DTS
            dezurstva['DTS'][dan] = arr[0];
            zdravnik.dezurstev++;
            zdravnik.dezurstvaPoDnevih[dan] = 'DTS';
        }
        
        // Drugi gre na Vrazov trg
        if (arr[1]) {
            const zdravnik = zdravniki.find(z => z.id === arr[1]);
            if (!zdravnik) continue;
            
            // Preveri HARD omejitve
            if (imaHard(arr[1], dan)) {
                napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} ima HARD oznako (${getOznaka(arr[1], dan)})`);
                continue;
            }
            if (blokiranDanZaradiJutri(arr[1], dan)) {
                napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} ima jutri HARD oznako`);
                continue;
            }
            
            // Preveri zaporedne dni
            if (dan > 1) {
                const vcerajDTS = dezurstva['DTS'][dan - 1];
                const vcerajVT = dezurstva['Vrazov trg'][dan - 1];
                if (vcerajDTS == arr[1] || vcerajVT == arr[1]) {
                    napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} bi bil dežuren 2 dni zapored`);
                    continue;
                }
            }
            
            // Postavi na Vrazov trg
            dezurstva['Vrazov trg'][dan] = arr[1];
            zdravnik.dezurstev++;
            zdravnik.dezurstvaPoDnevih[dan] = 'Vrazov trg';
        }
    }
    
    // Če so napake v fiksnih, STOP
    if (napakeFiksna.length > 0) {
        prikaziOpozorila([
            '❌ FIKSNA "samo dežurstva" kršijo HARD pravila:',
            ...napakeFiksna,
            '',
            'Popravite fiksne izbire pri zdravnikih "Samo dežurstva" (klik na 📅)'
        ]);
        prikaziKoledar();
        return;
    }

    // 2) ODSTRANIMO PREVERJANJE ZA "SAMO DEŽURSTVA" BREZ DEŽURSTEV
    // To je OK - nekateri "samo dežurstva" zdravniki lahko nimajo nobenih dežurstev
    
    // 3) SEDAJ REŠI PREOSTALE SLOTE (samo za redne zdravnike)
    const uspeh = resiPreostaleSlote(dniVMesecu);

    if (!uspeh) {
        prikaziOpozorila([
            '❌ Ni mogoče zapolniti vseh dežurstev.',
            'Možni razlogi:',
            '• Preveč HARD oznak pri rednih zdravnikih',
            '• Premalo razpoložljivih zdravnikov',
            '• Preveč fiksnih dežurstev blokira možnosti'
        ]);
        prikaziKoledar();
        return;
    }

    // 4) Generiraj dopoldan
    generirajDopoldan();

    // 5) Validacija in prikaz
    const issues = validirajRazpored();
    prikaziKrsitve(issues);
    prikaziKoledar();
    prikaziZdravnike();

    // 6) Informativno sporočilo o "samo dežurstva" zdravnikih
    const samoZdravniki = zdravniki.filter(z => z.samoDezurstva);
    const zDezurstvi = samoZdravniki.filter(z => z.dezurstev > 0);
    const brezDezurstev = samoZdravniki.filter(z => z.dezurstev === 0);
    
    if (brezDezurstev.length > 0) {
        console.log(`Zdravniki "samo dežurstva" brez dežurstev: ${brezDezurstev.map(z => z.ime).join(', ')}`);
    }
    
    // 7) Shrani
    shraniRazpored();
    
    // Prikaži uspeh
    prikaziSporocilo(`✅ Razpored uspešno generiran! ${zDezurstvi.length}/${samoZdravniki.length} "samo dežurstva" zdravnikov ima dežurstva.`);
}

function resiPreostaleSlote(dniVMesecu) {
    // Zberi samo prazne slote
    const sloti = [];
    
    for (let dan = 1; dan <= dniVMesecu; dan++) {
        for (const delovisce of DELOVISCA) {
            // Če je že zapolnjen (fiksno), preskoči
            if (dezurstva[delovisce][dan]) continue;
            sloti.push({ dan, delovisce });
        }
    }
    
    // Če ni praznih slotov, smo končali
    if (sloti.length === 0) return true;
    
    // Razvrsti po težavnosti
    sloti.sort((a, b) => {
        const kandA = zdravniki.filter(z => {
            // SAMO REDNI zdravniki (ne "samo dežurstva")
            if (z.samoDezurstva) return false;
            return lahkoDezura(z.id, a.dan, a.delovisce, dezurstva);
        }).length;
        
        const kandB = zdravniki.filter(z => {
            if (z.samoDezurstva) return false;
            return lahkoDezura(z.id, b.dan, b.delovisce, dezurstva);
        }).length;
        
        return kandA - kandB;
    });
    
    // Backtracking
    function backtrack(idx) {
        if (idx >= sloti.length) return true;
        
        const { dan, delovisce } = sloti[idx];
        
        // SAMO REDNI zdravniki so kandidati
        let kandidati = zdravniki.filter(z => {
            if (z.samoDezurstva) return false; // Izključi "samo dežurstva"
            return lahkoDezura(z.id, dan, delovisce, dezurstva);
        });
        
        if (kandidati.length === 0) return false;
        
        // Razvrsti po oceni
        kandidati.sort((a, b) => {
            const ocenaA = oceniKandidata(a.id, dan, delovisce);
            const ocenaB = oceniKandidata(b.id, dan, delovisce);
            return ocenaB - ocenaA;
        });
        
        for (const kandidat of kandidati) {
            // Postavi
            dezurstva[delovisce][dan] = kandidat.id;
            kandidat.dezurstev++;
            kandidat.dezurstvaPoDnevih[dan] = delovisce;
            
            // Rekurzija
            if (backtrack(idx + 1)) {
                return true;
            }
            
            // Backtrack
            delete dezurstva[delovisce][dan];
            kandidat.dezurstev--;
            delete kandidat.dezurstvaPoDnevih[dan];
        }
        
        return false;
    }
    
    return backtrack(0);
}


// ========== DODATNA VALIDACIJA ==========
function validirajRazpored() {
    const dniVMesecu = new Date(leto, mesec, 0).getDate();
    const issues = [];

    const imeZ = (id) => zdravniki.find(z => z.id === Number(id))?.ime || `ID:${id}`;

    for (let dan = 1; dan <= dniVMesecu; dan++) {
        // Preveri dežurstva
        for (const delovisce of DELOVISCA) {
            const id = dezurstva[delovisce]?.[dan];
            
            if (!id) {
                issues.push({
                    tip: "Kritično",
                    dan: dan,
                    msg: `❌ ${delovisce}: ni dežurnega`
                });
                continue;
            }

            const idNum = Number(id);

            // HARD oznaka na ta dan
            if (imaHard(idNum, dan)) {
                issues.push({
                    tip: "Kršitev",
                    dan: dan,
                    msg: `❌ ${imeZ(id)} dežura na ${delovisce}, ima HARD oznako (${getOznaka(idNum, dan)})`
                });
            }

            // HARD oznaka jutri
            if (blokiranDanZaradiJutri(idNum, dan)) {
                issues.push({
                    tip: "Kršitev",
                    dan: dan,
                    msg: `❌ ${imeZ(id)} dežura na ${delovisce}, jutri ima HARD oznako`
                });
            }

            // Zaporedna dežurstva - preveri vse lokacije
            if (dan > 1) {
                for (const d of DELOVISCA) {
                    const vcerajId = dezurstva[d]?.[dan - 1];
                    if (vcerajId && Number(vcerajId) === idNum) {
                        issues.push({
                            tip: "Kršitev",
                            dan: dan,
                            msg: `❌ ${imeZ(id)} dežura dva dni zapored`
                        });
                        break; // Dodamo samo enkrat
                    }
                }
            }
        }

        // Soft: Želje (Ž) - če ni nikjer dežuren
        zdravniki.forEach(z => {
            if (getOznaka(z.id, dan) === 'Ž') {
                let jeDezuren = false;
                for (const delovisce of DELOVISCA) {
                    if (Number(dezurstva[delovisce]?.[dan]) === z.id) {
                        jeDezuren = true;
                        break;
                    }
                }
                if (!jeDezuren) {
                    issues.push({
                        tip: "Soft",
                        dan: dan,
                        msg: `⚠️ Želja ni upoštevana: ${z.ime}`
                    });
                }
            }
        });
    }

    return issues;
}


// Oceni kandidata (višja ocena = boljši kandidat)
// ========== IZBOLJŠANA OCENA KANDIDATA ==========
function oceniKandidata(zdravnikId, dan, delovisce) {
    const zdravnik = zdravniki.find(z => z.id === zdravnikId);
    if (!zdravnik) return -10000;

    let ocena = 1000; // Začnemo z visoko osnovno oceno

    // MOČNO nagradi željo (Ž)
    if (getOznaka(zdravnikId, dan) === 'Ž') {
        ocena += 500; // Povečano z 200 na 500
    }

    // MOČNO kaznuj kontraindikacijo (KI)
    if (getOznaka(zdravnikId, dan) === 'KI') {
        ocena -= 400; // Povečano s 100 na 400
    }

    // Fer porazdelitev - manj dežurstev = bolje
    const avgDezurstev = zdravniki.reduce((sum, z) => sum + z.dezurstev, 0) / zdravniki.length;
    const razlika = zdravnik.dezurstev - avgDezurstev;
    ocena -= razlika * 50; // Večja kazen za neenakomerno porazdelitev

    // Vikend bonus za primarno delovišče
    const datum = new Date(leto, mesec - 1, dan);
    const jeVikend = datum.getDay() === 0 || datum.getDay() === 6;
    
    if (jeVikend && zdravnik.primarnoDelovisce === delovisce) {
        ocena += 50;
    }

    // Med tednom manjši bonus za primarno delovišče
    if (!jeVikend && zdravnik.primarnoDelovisce === delovisce) {
        ocena += 20;
    }

    return ocena;
}

// Backtracking algoritem
function resiRazporedBacktracking(dniVMesecu) {
    // Ustvari seznam slotov (dan, delovišče) ki jih moramo zapolniti
    const sloti = [];
    
    for (let dan = 1; dan <= dniVMesecu; dan++) {
        for (const delovisce of DELOVISCA) {
            // Če je že zapolnjen (fiksna dežurstva), preskoči
            if (dezurstva[delovisce][dan]) continue;
            sloti.push({ dan, delovisce });
        }
    }

    // Razvrsti slote po težavnosti (najmanj kandidatov najprej)
    sloti.sort((a, b) => {
        const kandA = zdravniki.filter(z => lahkoDezura(z.id, a.dan, a.delovisce, dezurstva)).length;
        const kandB = zdravniki.filter(z => lahkoDezura(z.id, b.dan, b.delovisce, dezurstva)).length;
        return kandA - kandB;
    });

    // Rekurzivna funkcija za reševanje
    function backtrack(idx) {
        // Če smo rešili vse slote, smo končali
        if (idx >= sloti.length) return true;

        const { dan, delovisce } = sloti[idx];

        // Najdi kandidate
        let kandidati = zdravniki.filter(z => lahkoDezura(z.id, dan, delovisce, dezurstva));

        // Če ni kandidatov, vrnemo false
        if (kandidati.length === 0) return false;

        // Razvrsti kandidate po oceni (najboljši najprej)
        kandidati.sort((a, b) => {
            const ocenaA = oceniKandidata(a.id, dan, delovisce);
            const ocenaB = oceniKandidata(b.id, dan, delovisce);
            return ocenaB - ocenaA; // Padajoče (višja ocena = bolje)
        });

        // Poskusi vsakega kandidata
        for (const kandidat of kandidati) {
            // Postavi kandidata
            dezurstva[delovisce][dan] = kandidat.id;
            kandidat.dezurstev++;
            kandidat.dezurstvaPoDnevih[dan] = delovisce;

            // Rekurzivno reši preostale
            if (backtrack(idx + 1)) {
                return true; // Našli smo rešitev
            }

            // Backtrack - odstrani kandidata
            delete dezurstva[delovisce][dan];
            kandidat.dezurstev--;
            delete kandidat.dezurstvaPoDnevih[dan];
        }

        return false; // Ni rešitve s temi omejitvami
    }

    return backtrack(0);
}



// ========== GENERIRANJE DOPOLDANSKIH IZMEN ==========
// ========== POPRAVLJENA FUNKCIJA GENERIRANJA DOPOLDANSKIH IZMEN ==========
function generirajDopoldan() {
    const dniVMesecu = new Date(leto, mesec, 0).getDate();

    // Reset
    dopoldan = { "DTS": {}, "Vrazov trg": {} };

    // Za fer rotacijo VT dopoldan
    const vtCount = {};
    zdravniki.forEach(z => vtCount[z.id] = 0);

    for (let dan = 1; dan <= dniVMesecu; dan++) {
        const datum = new Date(leto, mesec - 1, dan);
        const vikend = datum.getDay() === 0 || datum.getDay() === 6;
        const praznik = jePraznik(dan, mesec, leto);  // DODANO - definiramo praznik!

        dopoldan["DTS"][dan] = [];
        dopoldan["Vrazov trg"][dan] = [];

        // Preskoči vikende IN praznike
        if (vikend || praznik) continue;

        const dtsDezId = dezurstva?.["DTS"]?.[dan] || null;
        const vtDezId = dezurstva?.["Vrazov trg"]?.[dan] || null;

        // Kandidati za dopoldan
        const kandidati = zdravniki.filter(z => {
            // Samo dežurstva ne delajo dopoldan
            if (z.samoDezurstva) return false;

            // Preveri oznake - KI je OK za dopoldan, ostale ne
            const ozn = getOznaka(z.id, dan);
            if (ozn && ozn !== "KI") return false;

            // Če je bil včeraj dežuren in danes ni, ne more dopoldan
            const bilVceraj = z.dezurstvaPoDnevih?.[dan - 1];
            const danesDezuren = (dtsDezId === z.id) || (vtDezId === z.id);
            if (bilVceraj && !danesDezuren) return false;

            return true;
        });

        if (kandidati.length === 0) continue;

        // Izberi enega za VT
        let vtPick = null;

        // Prednostno vzemi VT dežurnega če je kandidat
        if (vtDezId) {
            vtPick = kandidati.find(z => z.id === vtDezId && z.primarnoDelovisce === 'Vrazov trg');
        }

        // Sicer izberi najboljšega kandidata za VT
        if (!vtPick) {
            const vtKandidati = [...kandidati].sort((a, b) => {
                // Primarno VT ima prednost
                const ap = a.primarnoDelovisce === 'Vrazov trg' ? 0 : 1;
                const bp = b.primarnoDelovisce === 'Vrazov trg' ? 0 : 1;
                if (ap !== bp) return ap - bp;

                // Fer rotacija
                if (vtCount[a.id] !== vtCount[b.id]) {
                    return vtCount[a.id] - vtCount[b.id];
                }

                return 0;
            });

            vtPick = vtKandidati[0] || null;
        }

        if (vtPick) {
            dopoldan["Vrazov trg"][dan] = [vtPick.id];
            vtCount[vtPick.id]++;
        }

        // Ostali gredo na DTS
        dopoldan["DTS"][dan] = kandidati
            .filter(z => !vtPick || z.id !== vtPick.id)
            .map(z => z.id);
    }
}


// ========== GENERATOR VEČ REŠITEV ==========
let trenutnaResitev = null;
let vseResitve = [];
let trenutniIndeksResitve = 0;

// ========== POPRAVLJENA FUNKCIJA ZA GENERIRANJE VEČ REŠITEV ==========
function generirajVecResitev(stResitev = 5) {
    vseResitve = [];
    trenutniIndeksResitve = 0;
    
    const dniVMesecu = new Date(leto, mesec, 0).getDate();
    
    // Generiraj N različnih rešitev
    for (let i = 0; i < stResitev; i++) {
        // Reset za vsako rešitev
        dezurstva = {};
        DELOVISCA.forEach(d => dezurstva[d] = {});
        zdravniki.forEach(z => {
            z.dezurstev = 0;
            z.dezurstvaPoDnevih = {};
        });
        
        // POMEMBNO: Postavi fiksna "samo dežurstva" - uporabi isto kodo kot v generirajRazpored()
        let napakeFiksna = [];
        
        for (let dan = 1; dan <= dniVMesecu; dan++) {
            const arr = (fiksnaSamo[dan] || []).slice().sort((a, b) => a - b);
            
            if (arr.length === 0) continue;
            
            // Preveri če sta 2 ista
            if (arr[0] && arr[1] && arr[0] === arr[1]) {
                const z = zdravniki.find(x => x.id === arr[0]);
                napakeFiksna.push(`Dan ${dan}: ${z.ime} ne more biti na obeh lokacijah`);
                continue;
            }
            
            // Prvi gre na DTS
            if (arr[0]) {
                const zdravnik = zdravniki.find(z => z.id === arr[0]);
                if (!zdravnik) continue;
                
                // Preveri HARD omejitve
                if (imaHard(arr[0], dan)) {
                    napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} ima HARD oznako`);
                    continue;
                }
                if (blokiranDanZaradiJutri(arr[0], dan)) {
                    napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} ima jutri HARD`);
                    continue;
                }
                
                // Preveri zaporedne dni
                if (dan > 1) {
                    const vcerajDTS = dezurstva['DTS'][dan - 1];
                    const vcerajVT = dezurstva['Vrazov trg'][dan - 1];
                    if (vcerajDTS == arr[0] || vcerajVT == arr[0]) {
                        napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} 2 dni zapored`);
                        continue;
                    }
                }
                
                dezurstva['DTS'][dan] = arr[0];
                zdravnik.dezurstev++;
                zdravnik.dezurstvaPoDnevih[dan] = 'DTS';
            }
            
            // Drugi gre na Vrazov trg
            if (arr[1]) {
                const zdravnik = zdravniki.find(z => z.id === arr[1]);
                if (!zdravnik) continue;
                
                // Preveri HARD omejitve
                if (imaHard(arr[1], dan)) {
                    napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} ima HARD oznako`);
                    continue;
                }
                if (blokiranDanZaradiJutri(arr[1], dan)) {
                    napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} ima jutri HARD`);
                    continue;
                }
                
                // Preveri zaporedne dni
                if (dan > 1) {
                    const vcerajDTS = dezurstva['DTS'][dan - 1];
                    const vcerajVT = dezurstva['Vrazov trg'][dan - 1];
                    if (vcerajDTS == arr[1] || vcerajVT == arr[1]) {
                        napakeFiksna.push(`Dan ${dan}: ${zdravnik.ime} 2 dni zapored`);
                        continue;
                    }
                }
                
                dezurstva['Vrazov trg'][dan] = arr[1];
                zdravnik.dezurstev++;
                zdravnik.dezurstvaPoDnevih[dan] = 'Vrazov trg';
            }
        }
        
        // Če so napake v fiksnih, ne generiraj te rešitve
        if (napakeFiksna.length > 0) {
            prikaziOpozorila(['❌ Fiksna dežurstva kršijo pravila:', ...napakeFiksna]);
            return;
        }
        
        // Generiraj preostalo z naključnostjo
        const uspeh = resiRazporedBacktrackingRandom(dniVMesecu, i);
        
        if (uspeh) {
            // Shrani rešitev
            const resitev = {
                dezurstva: JSON.parse(JSON.stringify(dezurstva)),
                statistika: izracunajStatistikoResitve()
            };
            vseResitve.push(resitev);
        }
    }
    
    // Razvrsti rešitve po kvaliteti
    vseResitve.sort((a, b) => {
        // Najprej po soft kršitvah
        if (a.statistika.softKrsitev !== b.statistika.softKrsitev) {
            return a.statistika.softKrsitev - b.statistika.softKrsitev;
        }
        // Nato po odstotku želja
        return b.statistika.odstotekZelj - a.statistika.odstotekZelj;
    });
    
    // Prikaži prvo (najboljšo) rešitev
    if (vseResitve.length > 0) {
        prikaziResitev(0);
        prikaziNavigacijoResitev();
    } else {
        prikaziOpozorila(['❌ Ni mogoče najti nobene rešitve']);
    }
}

// Tudi popravimo resiRazporedBacktrackingRandom da ne upošteva "samo dežurstva" zdravnikov
function resiRazporedBacktrackingRandom(dniVMesecu, seed) {
    const sloti = [];
    
    for (let dan = 1; dan <= dniVMesecu; dan++) {
        for (const delovisce of DELOVISCA) {
            // Preskoči že zapolnjene (fiksne) slote
            if (dezurstva[delovisce][dan]) continue;
            sloti.push({ dan, delovisce });
        }
    }
    
    // Drugačno razvrščanje za vsako rešitev
    if (seed > 0) {
        sloti.sort(() => Math.random() - 0.5);
    } else {
        sloti.sort((a, b) => {
            const kandA = zdravniki.filter(z => {
                // POMEMBNO: izključi "samo dežurstva" zdravnike
                if (z.samoDezurstva) return false;
                return lahkoDezura(z.id, a.dan, a.delovisce, dezurstva);
            }).length;
            const kandB = zdravniki.filter(z => {
                if (z.samoDezurstva) return false;
                return lahkoDezura(z.id, b.dan, b.delovisce, dezurstva);
            }).length;
            return kandA - kandB;
        });
    }
    
    function backtrack(idx) {
        if (idx >= sloti.length) return true;
        
        const { dan, delovisce } = sloti[idx];
        
        // POMEMBNO: filtriraj samo redne zdravnike
        let kandidati = zdravniki.filter(z => {
            if (z.samoDezurstva) return false; // Izključi "samo dežurstva"
            return lahkoDezura(z.id, dan, delovisce, dezurstva);
        });
        
        if (kandidati.length === 0) return false;
        
        // Razvrsti po oceni
        kandidati.sort((a, b) => {
            const ocenaA = oceniKandidata(a.id, dan, delovisce);
            const ocenaB = oceniKandidata(b.id, dan, delovisce);
            return ocenaB - ocenaA;
        });
        
        // Za različnost - včasih vzemi drugega najboljšega
        if (seed > 0 && Math.random() < 0.3 && kandidati.length > 1) {
            const temp = kandidati[0];
            kandidati[0] = kandidati[1];
            kandidati[1] = temp;
        }
        
        for (const kandidat of kandidati) {
            dezurstva[delovisce][dan] = kandidat.id;
            kandidat.dezurstev++;
            kandidat.dezurstvaPoDnevih[dan] = delovisce;
            
            if (backtrack(idx + 1)) {
                return true;
            }
            
            delete dezurstva[delovisce][dan];
            kandidat.dezurstev--;
            delete kandidat.dezurstvaPoDnevih[dan];
        }
        
        return false;
    }
    
    return backtrack(0);
}

// Odstranimo neuporabljeno funkcijo
// Izbrišite ali komentirajte:
// function postaviFiksnaDezurstva() {
//     return true; // TODO: implementiraj
// }

function resiRazporedBacktrackingRandom(dniVMesecu, seed) {
    const sloti = [];
    
    for (let dan = 1; dan <= dniVMesecu; dan++) {
        for (const delovisce of DELOVISCA) {
            if (dezurstva[delovisce][dan]) continue;
            sloti.push({ dan, delovisce });
        }
    }
    
    // Drugačno razvrščanje slotov za vsako rešitev
    if (seed > 0) {
        // Naključno premešaj slote za različne rešitve
        sloti.sort(() => Math.random() - 0.5);
    } else {
        // Prvi poskus - razvrsti po težavnosti
        sloti.sort((a, b) => {
            const kandA = zdravniki.filter(z => lahkoDezura(z.id, a.dan, a.delovisce, dezurstva)).length;
            const kandB = zdravniki.filter(z => lahkoDezura(z.id, b.dan, b.delovisce, dezurstva)).length;
            return kandA - kandB;
        });
    }
    
    function backtrack(idx) {
        if (idx >= sloti.length) return true;
        
        const { dan, delovisce } = sloti[idx];
        let kandidati = zdravniki.filter(z => lahkoDezura(z.id, dan, delovisce, dezurstva));
        
        if (kandidati.length === 0) return false;
        
        // Razvrsti kandidate po oceni
        kandidati.sort((a, b) => {
            const ocenaA = oceniKandidata(a.id, dan, delovisce);
            const ocenaB = oceniKandidata(b.id, dan, delovisce);
            return ocenaB - ocenaA;
        });
        
        // Za različnost - včasih vzemi drugega najboljšega kandidata
        if (seed > 0 && Math.random() < 0.3 && kandidati.length > 1) {
            // 30% verjetnost, da vzamemo drugega najboljšega
            const temp = kandidati[0];
            kandidati[0] = kandidati[1];
            kandidati[1] = temp;
        }
        
        for (const kandidat of kandidati) {
            dezurstva[delovisce][dan] = kandidat.id;
            kandidat.dezurstev++;
            kandidat.dezurstvaPoDnevih[dan] = delovisce;
            
            if (backtrack(idx + 1)) {
                return true;
            }
            
            delete dezurstva[delovisce][dan];
            kandidat.dezurstev--;
            delete kandidat.dezurstvaPoDnevih[dan];
        }
        
        return false;
    }
    
    return backtrack(0);
}

function izracunajStatistikoResitve() {
    const issues = validirajRazpored();
    let hardKrsitev = 0;
    let softKrsitev = 0;
    let zeljeIzpolnjene = 0;
    let zeljeSkupaj = 0;
    
    issues.forEach(issue => {
        if (issue.tip === "Kršitev" || issue.tip === "Kritično") {
            hardKrsitev++;
        } else if (issue.tip === "Soft") {
            softKrsitev++;
        }
    });
    
    // Preštej želje
    const dniVMesecu = new Date(leto, mesec, 0).getDate();
    for (let dan = 1; dan <= dniVMesecu; dan++) {
        zdravniki.forEach(z => {
            if (getOznaka(z.id, dan) === 'Ž') {
                zeljeSkupaj++;
                for (const delovisce of DELOVISCA) {
                    if (Number(dezurstva[delovisce]?.[dan]) === z.id) {
                        zeljeIzpolnjene++;
                        break;
                    }
                }
            }
        });
    }
    
    return {
        hardKrsitev,
        softKrsitev,
        zeljeIzpolnjene,
        zeljeSkupaj,
        odstotekZelj: zeljeSkupaj > 0 ? Math.round((zeljeIzpolnjene / zeljeSkupaj) * 100) : 100
    };
}

function prikaziResitev(index) {
    if (index < 0 || index >= vseResitve.length) return;
    
    trenutniIndeksResitve = index;
    dezurstva = JSON.parse(JSON.stringify(vseResitve[index].dezurstva));
    
    // Posodobi statistike
    posodobiStatistike();
    
    // Generiraj dopoldan
    generirajDopoldan();
    
    // Prikaži
    prikaziKoledar();
    prikaziZdravnike();
    
    // Validacija
    const issues = validirajRazpored();
    prikaziKrsitve(issues);
    
    // Prikaži statistiko rešitve
    const stat = vseResitve[index].statistika;
    prikaziSporocilo(`📊 Rešitev ${index + 1}/${vseResitve.length}: ${stat.zeljeIzpolnjene}/${stat.zeljeSkupaj} želja (${stat.odstotekZelj}%), ${stat.softKrsitev} soft kršitev`);
}

function prikaziNavigacijoResitev() {
    const div = document.getElementById("navigacija-resitev");
    if (!div) {
        // Ustvari navigacijo če ne obstaja
        const nav = document.createElement("div");
        nav.id = "navigacija-resitev";
        nav.style.cssText = "padding: 15px; background: #f8f9fa; margin: 15px 0; border-radius: 8px;";
        
        const container = document.getElementById("opozorila");
        if (container) {
            container.parentNode.insertBefore(nav, container);
        }
    }
    
    const navDiv = document.getElementById("navigacija-resitev");
    navDiv.innerHTML = `
        <h3>🎯 Generirane rešitve (${vseResitve.length})</h3>
        <div style="margin: 10px 0;">
            <button onclick="prikaziPrejsnjoResitev()" ${trenutniIndeksResitve === 0 ? 'disabled' : ''}>
                ← Prejšnja
            </button>
            <span style="margin: 0 15px;">
                Rešitev ${trenutniIndeksResitve + 1} / ${vseResitve.length}
            </span>
            <button onclick="prikaziNaslednjoResitev()" ${trenutniIndeksResitve === vseResitve.length - 1 ? 'disabled' : ''}>
                Naslednja →
            </button>
            <button onclick="izberiResitev()" style="margin-left: 20px; background: #28a745;">
                ✓ Izberi to rešitev
            </button>
        </div>
        <div style="margin-top: 10px;">
            ${vseResitve.map((r, i) => `
                <button onclick="prikaziResitev(${i})" 
                    style="margin: 2px; ${i === trenutniIndeksResitve ? 'background: #007bff; color: white;' : ''}">
                    ${i + 1} (${r.statistika.odstotekZelj}% želja)
                </button>
            `).join('')}
        </div>
    `;
}

function prikaziPrejsnjoResitev() {
    if (trenutniIndeksResitve > 0) {
        prikaziResitev(trenutniIndeksResitve - 1);
        prikaziNavigacijoResitev();
    }
}

function prikaziNaslednjoResitev() {
    if (trenutniIndeksResitve < vseResitve.length - 1) {
        prikaziResitev(trenutniIndeksResitve + 1);
        prikaziNavigacijoResitev();
    }
}

function izberiResitev() {
    shraniRazpored();
    prikaziSporocilo('✅ Rešitev izbrana in shranjena!');
    // Odstrani navigacijo
    const nav = document.getElementById("navigacija-resitev");
    if (nav) nav.remove();
}

function postaviFiksnaDezurstva() {
    // Vaša obstoječa koda za postavljanje fiksnih dežurstev
    // Vrne true če je uspešno, false če so kršitve
    return true; // TODO: implementiraj
}

// ========== VALIDACIJA RAZPOREDA ==========


// ========== PRIKAZ IN UI FUNKCIJE ==========
function prikaziKrsitve(issues) {
    const div = document.getElementById("opozorila");
    if (!div) return;

    if (!issues || issues.length === 0) {
        div.innerHTML = `
            <div class="opozorilo" style="border-left-color:#51cf66;">
                <strong>✅ Vsi pogoji upoštevani</strong>
            </div>`;
        return;
    }

    // Grupiraj po dnevih
    const byDay = {};
    issues.forEach(i => {
        byDay[i.dan] = byDay[i.dan] || [];
        byDay[i.dan].push(i);
    });

    div.innerHTML = `
        <div class="opozorilo">
            <h3>⚠️ Preverjanje razporeda</h3>
            ${Object.entries(byDay).map(([dan, arr]) => `
                <div style="margin:8px 0;">
                    <strong>Dan ${dan}:</strong>
                    <ul style="margin:6px 0 0 18px;">
                        ${arr.map(x => `<li>${x.msg}</li>`).join("")}
                    </ul>
                </div>
            `).join("")}
        </div>
    `;
}

function prikaziOpozorila(napake) {
    const div = document.getElementById('opozorila');
    if (napake.length > 0) {
        div.innerHTML = `
            <div class="opozorilo">
                <h3>⚠️ Opozorila</h3>
                ${napake.map(n => `<p>${n}</p>`).join('')}
            </div>
        `;
    }
}

function prikaziSporocilo(besedilo) {
    const container = document.getElementById("opozorila");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "opozorilo";
    div.style.borderLeftColor = "#51cf66";
    div.innerHTML = `<strong>${besedilo}</strong>`;

    container.appendChild(div);

    setTimeout(() => {
        div.remove();
    }, 2500);
}

// ========== SHRANJEVANJE ==========
function shraniRazpored() {
    localStorage.setItem(keyOznake(), JSON.stringify(oznake));
    localStorage.setItem(keyDezurstva(), JSON.stringify(dezurstva));
    localStorage.setItem('zdravniki', JSON.stringify(zdravniki));
    localStorage.setItem(keyDopoldan(), JSON.stringify(dopoldan));
    localStorage.setItem(keyFiksnaSamo(), JSON.stringify(fiksnaSamo));
    prikaziSporocilo('✅ Razpored shranjen');
}

function naloziRazpored() {
    const shranjeneOznake = localStorage.getItem(keyOznake());
    const shranjenDezurstva = localStorage.getItem(keyDezurstva());
    const shranjenDopoldan = localStorage.getItem(keyDopoldan());
    const shranjenFiksna = localStorage.getItem(keyFiksnaSamo());

    if (shranjeneOznake) oznake = JSON.parse(shranjeneOznake);
    if (shranjenFiksna) fiksnaSamo = JSON.parse(shranjenFiksna);
    
    if (shranjenDezurstva) {
        dezurstva = JSON.parse(shranjenDezurstva);
        if (shranjenDopoldan) dopoldan = JSON.parse(shranjenDopoldan);
        
        posodobiStatistike();
        prikaziKoledar();
        prikaziZdravnike();
        
        const issues = validirajRazpored();
        prikaziKrsitve(issues);
        prikaziSporocilo("✅ Razpored naložen");
    } else {
        prikaziSporocilo("❌ Ni shranjenega razporeda");
    }
}

function posodobiStatistike() {
    // Reset števcev
    zdravniki.forEach(z => {
        z.dezurstev = 0;
        z.dezurstvaPoDnevih = {};
    });
    
    // Preštej dežurstva
    DELOVISCA.forEach(delovisce => {
        if (dezurstva[delovisce]) {
            Object.entries(dezurstva[delovisce]).forEach(([dan, zdravnikId]) => {
                const zdravnik = zdravniki.find(z => z.id === Number(zdravnikId));
                if (zdravnik) {
                    zdravnik.dezurstev++;
                    zdravnik.dezurstvaPoDnevih[dan] = delovisce;
                }
            });
        }
    });
}



// ========== OSTALE FUNKCIJE (UI, koledar, itd.) ==========
// Tukaj dodajte vse ostale funkcije za prikaz koledarja, zdravnikov, modalov itd.
// Te funkcije lahko ostanejo enake kot v vaši obstoječi kodi

// ========== PRAZNIKI IN DELA PROSTI DNEVI ==========
const PRAZNIKI = {
    // Fiksni datumi (ne glede na leto)
    fiksni: [
        { dan: 1, mesec: 1, ime: "Novo leto", delaProst: true },
        { dan: 2, mesec: 1, ime: "Novo leto", delaProst: true },
        { dan: 8, mesec: 2, ime: "Prešernov dan", delaProst: true },
        { dan: 27, mesec: 4, ime: "Dan upora proti okupatorju", delaProst: true },
        { dan: 1, mesec: 5, ime: "Praznik dela", delaProst: true },
        { dan: 2, mesec: 5, ime: "Praznik dela", delaProst: true },
        { dan: 25, mesec: 6, ime: "Dan državnosti", delaProst: true },
        { dan: 15, mesec: 8, ime: "Marijino vnebovzetje", delaProst: true },
        { dan: 31, mesec: 10, ime: "Dan reformacije", delaProst: true },
        { dan: 1, mesec: 11, ime: "Dan spomina na mrtve", delaProst: true },
        { dan: 25, mesec: 12, ime: "Božič", delaProst: true },
        { dan: 26, mesec: 12, ime: "Dan samostojnosti", delaProst: true }
    ],
    
    // Gibljivi prazniki (potrebno izračunati za vsako leto)
    gibljivi: function(leto) {
        const prazniki = [];
        
        // Velika noč (potreben je izračun - tukaj je poenostavljena verzija)
        const velikaNoc = izracunajVelikoNoc(leto);
        if (velikaNoc) {
            prazniki.push({ 
                dan: velikaNoc.dan, 
                mesec: velikaNoc.mesec, 
                ime: "Velika noč", 
                delaProst: true 
            });
            
            // Velikonočni ponedeljek (dan po veliki noči)
            let ponDan = velikaNoc.dan + 1;
            let ponMesec = velikaNoc.mesec;
            if (ponDan > new Date(leto, velikaNoc.mesec, 0).getDate()) {
                ponDan = 1;
                ponMesec++;
            }
            prazniki.push({ 
                dan: ponDan, 
                mesec: ponMesec, 
                ime: "Velikonočni ponedeljek", 
                delaProst: true 
            });
            
            // Binkošti (50 dni po veliki noči)
            const binkostitiDatum = new Date(leto, velikaNoc.mesec - 1, velikaNoc.dan);
            binkostitiDatum.setDate(binkostitiDatum.getDate() + 49);
            prazniki.push({
                dan: binkostitiDatum.getDate(),
                mesec: binkostitiDatum.getMonth() + 1,
                ime: "Binkošti",
                delaProst: true
            });
        }
        
        return prazniki;
    }
};

// Poenostavljen izračun velike noči (Gauss algoritem)
function izracunajVelikoNoc(leto) {
    const a = leto % 19;
    const b = Math.floor(leto / 100);
    const c = leto % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const mesec = Math.floor((h + l - 7 * m + 114) / 31);
    const dan = ((h + l - 7 * m + 114) % 31) + 1;
    
    return { dan: dan, mesec: mesec };
}

// Funkcija za preverjanje če je določen dan praznik
function jePraznik(dan, mesec, leto) {
    // Preveri fiksne praznike
    const fiksniPraznik = PRAZNIKI.fiksni.find(p => 
        p.dan === dan && p.mesec === mesec
    );
    if (fiksniPraznik) return fiksniPraznik;
    
    // Preveri gibljive praznike
    const gibljiviPrazniki = PRAZNIKI.gibljivi(leto);
    const gibljiviPraznik = gibljiviPrazniki.find(p => 
        p.dan === dan && p.mesec === mesec
    );
    if (gibljiviPraznik) return gibljiviPraznik;
    
    return null;
}

// ========== POSODOBLJENA FUNKCIJA ZA PRIKAZ KOLEDARJA ==========
function prikaziKoledar() {
    const div = document.getElementById("koledar");
    const dniVMesecu = new Date(leto, mesec, 0).getDate();
    const danes = new Date().getDate();

    const dneviTedna = ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];

    let html = `<table>
        <thead>
            <tr>
                <th>Datum</th>
                <th>Dan</th>
                <th>Praznik</th>
                <th>📍 DTS dopoldan</th>
                <th>📍 Vrazov trg dopoldan</th>
                <th>📍 DTS dežurstvo</th>
                <th>📍 Vrazov trg dežurstvo</th>
            </tr>
        </thead>
        <tbody>`;

    for (let dan = 1; dan <= dniVMesecu; dan++) {
        const datum = new Date(leto, mesec - 1, dan);
        const danTedna = datum.getDay();
        const jeVikend = danTedna === 0 || danTedna === 6;
        const praznik = jePraznik(dan, mesec, leto);
        const jeDanes = dan === danes && 
                       mesec === new Date().getMonth() + 1 && 
                       leto === new Date().getFullYear();

        let razredDan = "";
        if (jeDanes) razredDan = "danes";
        else if (praznik) razredDan = "praznik";
        else if (jeVikend) razredDan = "vikend";

        // Praznik stolpec
        let praznikTxt = "";
        if (praznik) {
            praznikTxt = `<span style="color: #d32f2f; font-weight: bold;">
                🎊 ${praznik.ime}
            </span>`;
        }

        // ---- DOPOLDAN ----
        let dtsDopTxt = "-";
        let vtDopTxt = "-";

        // Na praznike in vikende ni dopoldanskega dela
        if (!jeVikend && !praznik) {
            const dtsIds = dopoldan?.["DTS"]?.[dan] || [];
            const vtIds = dopoldan?.["Vrazov trg"]?.[dan] || [];

            dtsDopTxt = dtsIds.length
                ? dtsIds.map(id => zdravniki.find(z => z.id === id)?.ime)
                    .filter(Boolean).join(", ")
                : "-";

            vtDopTxt = vtIds.length
                ? vtIds.map(id => zdravniki.find(z => z.id === id)?.ime)
                    .filter(Boolean).join(", ")
                : "-";
        }

        // ---- DEŽURSTVO (tudi na praznike!) ----
        const dtsDezId = dezurstva?.["DTS"]?.[dan] ?? null;
        const vtDezId = dezurstva?.["Vrazov trg"]?.[dan] ?? null;

        const dtsDezZ = zdravniki.find(z => z.id === dtsDezId);
        const vtDezZ = zdravniki.find(z => z.id === vtDezId);

        const ureDTS = dtsDezZ ? (jeVikend || praznik ? "24h" : "15:00-7:00") : "";
        const ureVT = vtDezZ ? (jeVikend || praznik ? "24h" : "15:00-7:00") : "";

        const dtsDezTxt = dtsDezZ
            ? `${dtsDezZ.ime}${dtsDezZ.primarnoDelovisce !== "DTS" ? " 🔄" : ""}`
            : "-";

        const vtDezTxt = vtDezZ
            ? `${vtDezZ.ime}${vtDezZ.primarnoDelovisce !== "Vrazov trg" ? " 🔄" : ""}`
            : "-";

        html += `
            <tr class="${razredDan}">
                <td><strong>${dan}.${mesec}.</strong></td>
                <td>${dneviTedna[danTedna]}</td>
                <td>${praznikTxt}</td>
                <td>${dtsDopTxt}</td>
                <td>${vtDopTxt}</td>
                <td class="${dtsDezZ ? "dezurstvo" : ""}">
                    ${dtsDezTxt} ${dtsDezZ ? `<span style="color:#6c757d;">(${ureDTS})</span>` : ""}
                </td>
                <td class="${vtDezZ ? "dezurstvo" : ""}">
                    ${vtDezTxt} ${vtDezZ ? `<span style="color:#6c757d;">(${ureVT})</span>` : ""}
                </td>
            </tr>`;
    }

    html += "</tbody></table>";
    div.innerHTML = html;
}



// Prikaz zdravnikov - posodobljen
function prikaziZdravnike() {
  const div = document.getElementById("zdravniki-list");
  if (!div) return;

  const samo = zdravniki.filter(z => z.samoDezurstva);
  const redni = zdravniki.filter(z => !z.samoDezurstva);

  // grupiraj samo redne po delovišču
  const poDeloviscih = {};
  DELOVISCA.forEach(d => poDeloviscih[d] = []);
  redni.forEach(z => {
    if (poDeloviscih[z.primarnoDelovisce]) poDeloviscih[z.primarnoDelovisce].push(z);
  });

  let html = "";

  // 1) redni zdravniki
  for (const [delovisce, arr] of Object.entries(poDeloviscih)) {
    html += `<div class="delovisce-skupina">
      <h3>📍 ${delovisce}</h3>`;

    html += arr.map(z => `
      <div class="zdravnik-card">
        <div class="zdravnik-info">
          <div class="zdravnik-ime">${z.ime}</div>
          <div class="zdravnik-delovisce clickable" onclick="spremeniDelovisce(${z.id})">
            📍 ${z.primarnoDelovisce}
          </div>
        </div>
        <div class="zdravnik-stats">
          <span class="dezurstev-count">${z.dezurstev} dežurstev</span>
          <button class="btn-mini" onclick="odpriOznakeModal(${z.id})">📅</button>
        </div>
      </div>
    `).join("");

    html += `</div>`;
  }

  // 2) samo dežurstva (ločeno)
  html += `<div class="delovisce-skupina">
    <h3>🕒 Samo dežurstva (fiksno DTS)</h3>`;

  html += samo.map(z => `
    <div class="zdravnik-card">
      <div class="zdravnik-info">
        <div class="zdravnik-ime">${z.ime}</div>
        <div style="color:#6c757d;font-size:13px;">Samo dežurstva • DTS</div>
      </div>
      <div class="zdravnik-stats">
        <span class="dezurstev-count">${z.dezurstev} dežurstev</span>
        <button class="btn-mini" onclick="odpriFiksnaDezurstvaModal(${z.id})">📅</button>
      </div>
    </div>
  `).join("");

  html += `</div>`;

  div.innerHTML = html;
}

function posodobiNaslovMeseca() {
  const el = document.getElementById("mesec");
  if (el) el.textContent = `${SLO_MESCI[mesec - 1]} ${leto}`;
}


// napolni dropdown in nastavi default vrednosti v UI
function inicializirajIzbirnikMesecLeto() {
  const sel = document.getElementById("izbira-meseca");
  const inp = document.getElementById("izbira-leta");

  if (!sel || !inp) return;

  sel.innerHTML = SLO_MESCI.map((m, i) => `<option value="${i+1}">${m}</option>`).join("");
  sel.value = String(mesec);
  inp.value = String(leto);

  posodobiNaslovMeseca();
}

function nastaviMesecLeto() {
  const sel = document.getElementById("izbira-meseca");
  const inp = document.getElementById("izbira-leta");
  if (!sel || !inp) return;

  mesec = parseInt(sel.value, 10);
  leto = parseInt(inp.value, 10);

  posodobiNaslovMeseca();

  const shOzn = localStorage.getItem(keyOznake());
  oznake = shOzn ? JSON.parse(shOzn) : {};
 
  const shDez = localStorage.getItem(keyDezurstva());
  if (shDez) {
  dezurstva = JSON.parse(shDez);
  posodobiStatistike();
  } else {
  dezurstva = {};
  DELOVISCA.forEach(d => dezurstva[d] = {});
  }

  const shDop = localStorage.getItem(keyDopoldan());
  dopoldan = shDop ? JSON.parse(shDop) : (() => {
    const obj = {};
    DELOVISCA.forEach(d => obj[d] = {});
    return obj;
  })();

  const shSamo = localStorage.getItem(keyFiksnaSamo());
  fiksnaSamo = shSamo ? JSON.parse(shSamo) : {};

  const shFix = localStorage.getItem(keyFiksnaDezurstva());
  fiksnaDezurstva = shFix ? JSON.parse(shFix) : (() => {
    const obj = {}; DELOVISCA.forEach(d => obj[d] = {});
    return obj;
  })();


  prikaziKoledar();
  prikaziZdravnike();
}


function spremeniDelovisce(zdravnikId) {
  const zdravnik = zdravniki.find(z => z.id === zdravnikId);
  if (!zdravnik) return;

  const modal = document.getElementById("modal-delovisce");
  const naslov = document.getElementById("modal-delovisce-naslov");
  const wrap = document.getElementById("delovisce-gumbi");

  if (!modal || !naslov || !wrap) {
    console.error("Manjka modal-delovisce / modal-delovisce-naslov / delovisce-gumbi");
    return;
  }

  naslov.textContent = `📍 Spremeni delovišče – ${zdravnik.ime}`;
  wrap.innerHTML = "";

  // DEBUG (lahko kasneje izbrišeš)
  console.log("DELOVISCA:", DELOVISCA);

  const seznam = DELOVISCA
    .map(d => String(d).trim())
    .filter(d => d.length > 0);

  console.log("DELOVISCA raw:", DELOVISCA);
  console.log("DELOVISCA clean:", seznam);

  seznam.forEach((d) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "delovisce-btn";
    btn.textContent = d;

    if (String(zdravnik.primarnoDelovisce).trim() === d) {
      btn.classList.add("active");
    }

    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();

      zdravnik.primarnoDelovisce = d;
      localStorage.setItem("zdravniki", JSON.stringify(zdravniki));

      prikaziZdravnike();
      prikaziSporocilo(`✅ ${zdravnik.ime}: ${d}`);
      zapriDelovisceModal();
      generirajDopoldan();
      posodobiStatistike();
      prikaziKoledar();

    };

    wrap.appendChild(btn);
  });


  modal.style.display = "flex";
}

function zapriDelovisceModal() {
  const modal = document.getElementById("modal-delovisce");
  if (modal) modal.style.display = "none";
}


function odpriOznakeModal(zdravnikId) {
  modalZdravnikId = zdravnikId;
  modalMesec = mesec;
  modalLeto = leto;

  const zdravnik = zdravniki.find(z => z.id === zdravnikId);
  document.getElementById("modal-naslov").textContent = `📅 Oznake – ${zdravnik?.ime || ""}`;

  // default: nič izbrano
  izberiOznakoZaKlik(null);

  document.getElementById("modal-oznake").style.display = "flex";
  renderModalKoledar();
}

function zapriOznakeModal() {
  document.getElementById("modal-oznake").style.display = "none";
  modalZdravnikId = null;
}

function premakniMesec(delta) {
  modalMesec += delta;
  if (modalMesec < 1) { modalMesec = 12; modalLeto -= 1; }
  if (modalMesec > 12) { modalMesec = 1; modalLeto += 1; }
  const shOzn = localStorage.getItem(keyOznake(modalLeto, modalMesec));
  oznake = shOzn ? JSON.parse(shOzn) : {};

  renderModalKoledar();
}

function izberiOznakoZaKlik(koda) {
  izbranaOznakaZaKlik = koda;

  // posodobi "chip" prikaz
  const chip = document.getElementById("izbrana-oznaka-chip");
  chip.textContent = koda || "–";
  chip.className = "chip " + (
    !koda ? "chip-none" :
    HARD_CODES.has(koda) ? "chip-hard" :
    koda === "Ž" ? "chip-wish" :
    "chip-soft"
  );

  // active stanje na gumbih
  document.querySelectorAll(".oznaka-picker .chip").forEach(btn => btn.classList.remove("active"));
  // poišči gumb z ustreznim textom
  document.querySelectorAll(".oznaka-picker .chip").forEach(btn => {
    if ((koda === null && btn.textContent.trim() === "Brez") ||
        (koda !== null && btn.textContent.trim() === koda)) {
      btn.classList.add("active");
    }
  });
}


function renderModalKoledar() {
  const label = document.getElementById("modal-mesec-label");
  label.textContent = `${SLO_MESCI[modalMesec - 1]} ${modalLeto}`;

  const container = document.getElementById("modal-koledar");
  container.innerHTML = "";

  const dneviGlava = ["Pon","Tor","Sre","Čet","Pet","Sob","Ned"];
  dneviGlava.forEach(d => {
    const el = document.createElement("div");
    el.className = "cal-head";
    el.textContent = d;
    container.appendChild(el);
  });

  const dniVMesecu = new Date(modalLeto, modalMesec, 0).getDate();
  const first = new Date(modalLeto, modalMesec - 1, 1);
  // JS: 0=ned,1=pon,... mi želimo pon=0
  let startIndex = (first.getDay() + 6) % 7;

  // prazne celice pred 1.
  for (let i = 0; i < startIndex; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-cell disabled";
    empty.innerHTML = "&nbsp;";
    container.appendChild(empty);
  }

  // dnevi
  for (let dan = 1; dan <= dniVMesecu; dan++) {
    const cell = document.createElement("div");
    cell.className = "cal-cell";

    const ozn = getOznaka(modalZdravnikId, dan);

    const dayEl = document.createElement("div");
    dayEl.className = "cal-day";
    dayEl.textContent = `${dan}.`;

    const tagEl = document.createElement("div");
    if (ozn) {
      tagEl.className = "cal-tag " + (
        HARD_CODES.has(ozn) ? "tag-hard" :
        ozn === "Ž" ? "tag-wish" :
        "tag-soft"
      );
      tagEl.textContent = ozn;
    } else {
      tagEl.innerHTML = "&nbsp;";
    }

    cell.appendChild(dayEl);
    cell.appendChild(tagEl);

    cell.onclick = () => {
      if (modalZdravnikId == null) return;

      oznake[modalZdravnikId] = oznake[modalZdravnikId] || {};

      if (!izbranaOznakaZaKlik) {
        // "Brez" -> odstrani oznako
        delete oznake[modalZdravnikId][dan];
      } else {
        oznake[modalZdravnikId][dan] = izbranaOznakaZaKlik;
      }

      localStorage.setItem(keyOznake(modalLeto, modalMesec), JSON.stringify(oznake));
      // takoj osveži koledar modala
      renderModalKoledar();
    };

    container.appendChild(cell);
  }
}

function shraniInZapriKoledar() {
  shraniRazpored();   
  zapriOznakeModal(); 
}


function odpriFiksnaDezurstvaModal(zdravnikId) {
  const z = zdravniki.find(x => x.id === zdravnikId);
  if (!z) return;

  modalFixZdravnikId = zdravnikId;
  fixModalMesec = mesec;
  fixModalLeto = leto;

  document.getElementById("modal-fiksna-naslov").textContent =
    `🕒 Fiksna DTS dežurstva – ${z.ime}`;

  document.getElementById("modal-fiksna").style.display = "flex";
  renderFixModalKoledar();
}

function zapriFiksnaModal() {
  document.getElementById("modal-fiksna").style.display = "none";
  modalFixZdravnikId = null;
}

function premakniFixMesec(delta) {
  fixModalMesec += delta;
  if (fixModalMesec < 1) { fixModalMesec = 12; fixModalLeto -= 1; }
  if (fixModalMesec > 12) { fixModalMesec = 1; fixModalLeto += 1; }

  // naloži fiksna za ta mesec
  const shFix = localStorage.getItem(keyFiksnaDezurstva(fixModalLeto, fixModalMesec));
  fiksnaDezurstva = shFix ? JSON.parse(shFix) : (() => {
    const obj = {}; DELOVISCA.forEach(d => obj[d] = {});
    return obj;
  })();
  const shSamo = localStorage.getItem(keyFiksnaSamo(fixModalLeto, fixModalMesec));
  fiksnaSamo = shSamo ? JSON.parse(shSamo) : {};

  renderFixModalKoledar();
}

function renderFixModalKoledar() {
  const label = document.getElementById("modal-fiksna-mesec-label");
  label.textContent = `${SLO_MESCI[fixModalMesec - 1]} ${fixModalLeto}`;

  const container = document.getElementById("modal-fiksna-koledar");
  container.innerHTML = "";

  const dneviGlava = ["Pon","Tor","Sre","Čet","Pet","Sob","Ned"];
  dneviGlava.forEach(d => {
    const el = document.createElement("div");
    el.className = "cal-head";
    el.textContent = d;
    container.appendChild(el);
  });

  const dniVMesecu = new Date(fixModalLeto, fixModalMesec, 0).getDate();
  const first = new Date(fixModalLeto, fixModalMesec - 1, 1);
  let startIndex = (first.getDay() + 6) % 7;

  for (let i = 0; i < startIndex; i++) {
    const empty = document.createElement("div");
    empty.className = "cal-cell disabled";
    empty.innerHTML = "&nbsp;";
    container.appendChild(empty);
  }

  for (let dan = 1; dan <= dniVMesecu; dan++) {
    const cell = document.createElement("div");
    cell.className = "cal-cell";

    const dayEl = document.createElement("div");
    dayEl.className = "cal-day";
    dayEl.textContent = `${dan}.`;

    const tagEl = document.createElement("div");

    // NOVO: preberi array (0..2 izbranih)
    const arr = fiksnaSamo?.[dan] || [];
    const isMine = arr.includes(modalFixZdravnikId);

    if (isMine) {
    tagEl.className = "cal-tag tag-wish";
    tagEl.textContent = "Ž";  // ta zdravnik je izbran za ta dan
    cell.classList.add("active");
    } else if (arr.length) {
    // pokaži kdo je že izbran
    const n1 = zdravniki.find(z => z.id === arr[0])?.ime || `ID:${arr[0]}`;
    const line1 = `DTS: ${n1}`;
    let line2 = "";
    if (arr[1]) {
        const n2 = zdravniki.find(z => z.id === arr[1])?.ime || `ID:${arr[1]}`;
        line2 = `\nVT: ${n2}`;
    }
    tagEl.className = "cal-tag tag-soft";
    tagEl.textContent = line1 + line2;
    } else {
    tagEl.innerHTML = "&nbsp;";
    }


    cell.appendChild(dayEl);
    cell.appendChild(tagEl);

    cell.onclick = () => {
    if (!modalFixZdravnikId) return;

    fiksnaSamo[dan] = fiksnaSamo[dan] || [];
    const arr = fiksnaSamo?.[dan] || [];     // seznam izbranih (0..2)
    const isMine = arr.includes(modalFixZdravnikId);


    const idx = arr.indexOf(modalFixZdravnikId);

    if (idx >= 0) {
        // odstrani
        arr.splice(idx, 1);
    } else {
        // dodaj (max 2)
        if (arr.length >= 2) {
        alert("Na isti dan sta lahko največ 2 zdravnika (1x DTS, 1x Vrazov trg).");
        return;
        }
        arr.push(modalFixZdravnikId);

        // stabilno: sortiraj po ID, da je vedno jasno kdo gre kam
        arr.sort((a,b) => a - b);
    }

    // če je prazen, pobriši ključ
    if (arr.length === 0) delete fiksnaSamo[dan];

    localStorage.setItem(keyFiksnaSamo(fixModalLeto, fixModalMesec), JSON.stringify(fiksnaSamo));
    renderFixModalKoledar();
    };


    container.appendChild(cell);
  }
}

function prikaziStatistiko() {
    const div = document.getElementById('statistika');
    const content = document.getElementById('statistika-content');
    
    div.style.display = div.style.display === 'none' ? 'block' : 'none';
    
    if (!dezurstva[DELOVISCA[0]] || Object.keys(dezurstva[DELOVISCA[0]]).length === 0) {
         content.innerHTML = '<p>Najprej generirajte razpored!</p>';
        return;
    }

    
    let html = '<div class="stat-grid">';
    
    zdravniki.forEach(z => {
        const skupaj = z.dezurstev;
        let poDeloviscih = {};
        DELOVISCA.forEach(d => poDeloviscih[d] = 0);
        
        Object.entries(z.dezurstvaPoDnevih).forEach(([dan, delovisce]) => {
            if (poDeloviscih[delovisce] !== undefined) {
                poDeloviscih[delovisce]++;
            }
        });
        
        html += `
            <div class="stat-card">
                <div class="stat-label"><strong>${z.ime}</strong></div>
                <div class="stat-label">Primarno: ${z.primarnoDelovisce}</div>
                <div class="stat-number">${skupaj}</div>
                <div class="stat-label">Skupaj dežurstev</div>
                <hr style="margin: 10px 0;">
                ${Object.entries(poDeloviscih).map(([d, st]) => 
                    `<div class="stat-label">${d}: ${st}x</div>`
                ).join('')}
            </div>
        `;
    });
    
    html += '</div>';
    
    // Dodaj povzetek
    const totalDezurstev = Object.keys(dezurstva[DELOVISCA[0]]).length * DELOVISCA.length;
    html += `<div class="panel" style="margin-top: 20px;">
        <h3>📊 Povzetek</h3>
        <p>Skupaj dežurstev v mesecu: ${totalDezurstev}</p>
        <p>Povprečno na zdravnika: ${(totalDezurstev / zdravniki.length).toFixed(1)}</p>
    </div>`;
    
    content.innerHTML = html;
}

function nastaviOdsotnost(zdravnikId) {
    const zdravnik = zdravniki.find(z => z.id === zdravnikId);

    const vnos = prompt(
        `Vnesi oznake za ${zdravnik.ime} (dan:KODA)\n` +
        `Primer: 5:LD, 9:KI, 12:Ž, 20:MF\n` +
        `Kode: LD, MF, AMB, CC, DRUGO, Ž, KI`
    );

    if (!vnos) return;

    oznake[zdravnikId] = oznake[zdravnikId] || {};

    vnos.split(",").forEach(par => {
        const [dStr, kStr] = par.trim().split(":");
        const dan = parseInt(dStr, 10);
        const koda = (kStr || "").trim();

        if (!Number.isFinite(dan)) return;
        if (![...HARD_CODES, ...SOFT_CODES].includes(koda)) return;

        oznake[zdravnikId][dan] = koda;
    });

    alert(`✅ Oznake shranjene za ${zdravnik.ime}`);
}

document.addEventListener("click", (e) => {
  const modal = document.getElementById("modal-oznake");
  if (!modal || modal.style.display === "none") return;
  if (e.target === modal) zapriOznakeModal();
});


// ========== INICIALIZACIJA ==========
// ========== INICIALIZACIJA ==========
window.onload = function() {
    // POMEMBNO: Najprej inicializiraj UI elemente
    inicializirajIzbirnikMesecLeto();
    
    // Nato naloži in združi zdravnike
    naloziInZdruziZdravnike();
    
    // Naloži oznake za trenutni mesec
    const shranjeneOznake = localStorage.getItem(keyOznake());
    if (shranjeneOznake) oznake = JSON.parse(shranjeneOznake);
    
    // Naloži fiksna dežurstva
    const shranjenFiksna = localStorage.getItem(keyFiksnaSamo());
    if (shranjenFiksna) fiksnaSamo = JSON.parse(shranjenFiksna);
    
    // Naloži dopoldan
    const shDop = localStorage.getItem(keyDopoldan());
    dopoldan = shDop ? JSON.parse(shDop) : (() => {
        const obj = {};
        DELOVISCA.forEach(d => obj[d] = {});
        return obj;
    })();
    
    // Naloži dezurstva
    const shranjeno = localStorage.getItem(keyDezurstva());
    if (shranjeno) {
        dezurstva = JSON.parse(shranjeno);
        posodobiStatistike();
    } else {
        // Če ni shranjenih, inicializiraj prazno
        dezurstva = {};
        DELOVISCA.forEach(d => dezurstva[d] = {});
    }
    
    // Posodobi naslov meseca
    posodobiNaslovMeseca();
    
    // PRIKAZ - to je ključno!
    prikaziKoledar();
    prikaziZdravnike();
};


window.odpriOznakeModal = odpriOznakeModal;
window.zapriOznakeModal = zapriOznakeModal;
window.premakniMesec = premakniMesec;
window.izberiOznakoZaKlik = izberiOznakoZaKlik;
window.nastaviMesecLeto = nastaviMesecLeto;
window.shraniInZapriKoledar = shraniInZapriKoledar;
window.spremeniDelovisce = spremeniDelovisce;
window.zapriDelovisceModal = zapriDelovisceModal;
window.odpriFiksnaDezurstvaModal = odpriFiksnaDezurstvaModal;
window.zapriFiksnaModal = zapriFiksnaModal;
window.premakniFixMesec = premakniFixMesec;
window.generirajRazpored = generirajRazpored;
window.shraniRazpored = shraniRazpored;
window.naloziRazpored = naloziRazpored;
window.prikaziStatistiko = prikaziStatistiko;
window.dodajZdravnika = dodajZdravnika;
window.generirajVecResitev = generirajVecResitev;
window.prikaziResitev = prikaziResitev;
window.prikaziPrejsnjoResitev = prikaziPrejsnjoResitev;
window.prikaziNaslednjoResitev = prikaziNaslednjoResitev;

window.izberiResitev = izberiResitev;
