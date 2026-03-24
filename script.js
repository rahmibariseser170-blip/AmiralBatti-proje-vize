const tahtaBoyutu = 10;
const gemiUzunluklari = [5, 4, 3, 3, 2];
const gemiIsimleri = ["Uçak Gemisi", "Kruvazör", "Denizaltı", "Muhrip", "Hücumbot"];

let oyuncuHaritasi = [];
let dusmanHaritasi = [];
let oyuncuFilo = [];
let dusmanFilo = [];
let oyuncuSkoru = 0;
let oyunBittiMi = false;
let siraOyuncuda = true; 

let yatayYerlesimMi = true;
let tutulanGemiUzunlugu = 0;
let tutulanGemiId = null;
let tutulanGemiIndeksi = 0;
let yerlestirilenGemiSayisi = 0;

let yapayZekaHafizasi = [];  
let yapayZekaHedefleri = []; 

const sesTopAtis = new Audio('assets/TopAtıs.mp3');
const sesTopIsabet = new Audio('assets/TopIsabet.mp3');
const sesTopIska = new Audio('assets/TopIska.mp3');
const sesGemiBatma = new Audio('assets/GemiBatma.mp3');

function sesCal(sesDosyasi) {
  sesDosyasi.currentTime = 0;
  sesDosyasi.play().catch(e => console.log("Ses çalınamadı:", e));
}

function oyunuBaslat() {
  oyuncuHaritasi = [];
  dusmanHaritasi = [];
  oyuncuFilo = [];
  dusmanFilo = [];
  oyuncuSkoru = 0;
  yatayYerlesimMi = true;
  yerlestirilenGemiSayisi = 0;
  oyunBittiMi = false;
  siraOyuncuda = true;
  yapayZekaHafizasi = [];
  yapayZekaHedefleri = [];

  document.getElementById('zorluk').disabled = false;
  document.getElementById('skor-gosterge').innerText = oyuncuSkoru;
  document.getElementById('yeniden-oyna-butonu').style.display = 'none';
  document.getElementById('dusman-alani').classList.remove('aktif');
  document.getElementById('tersane').style.display = 'flex';
  document.getElementById('savas-kaydi-listesi').innerHTML = '';
  document.getElementById('gemi-bekleme-alani').classList.remove('dikey-mod');
  
  ekranaMesajYaz("Gemilerini tersaneden alıp haritaya yerleştir!", "#ffd700");

  haritaOlustur('oyuncu-haritasi', oyuncuHaritasi, false);
  haritaOlustur('dusman-haritasi', dusmanHaritasi, true);
  
  dusmanGemileriniOtomatikYerlestir();
  tersaneyiHazirla();
}

function ekranaMesajYaz(metin, renk) {
  const mesajKutusu = document.getElementById('bilgi-mesaji');
  mesajKutusu.innerText = metin;
  mesajKutusu.style.color = renk;
}

function kayitEkle(mesaj, sinifTipi) {
  const liste = document.getElementById('savas-kaydi-listesi');
  const satir = document.createElement('li');
  satir.className = `kayit-satiri ${sinifTipi}`;
  satir.innerText = mesaj;
  liste.appendChild(satir);
  liste.scrollTop = liste.scrollHeight;
}

function haritaOlustur(elementId, haritaDizisi, dusmaninHaritasiMi) {
  const haritaDivi = document.getElementById(elementId);
  haritaDivi.innerHTML = '';

  let bos = document.createElement('div');
  haritaDivi.appendChild(bos);
  
  for(let i = 0; i < tahtaBoyutu; i++) {
    let harf = document.createElement('div');
    harf.className = 'etiket';
    harf.innerText = String.fromCharCode(65 + i);
    haritaDivi.appendChild(harf);
  }

  for (let satir = 0; satir < tahtaBoyutu; satir++) {
    let geciciSatir = [];
    
    let sayi = document.createElement('div');
    sayi.className = 'etiket';
    sayi.innerText = satir + 1;
    haritaDivi.appendChild(sayi);

    for (let sutun = 0; sutun < tahtaBoyutu; sutun++) {
      geciciSatir.push(0);
      
      const hucreDivi = document.createElement('div');
      hucreDivi.className = 'hucre';
      hucreDivi.dataset.satir = satir;
      hucreDivi.dataset.sutun = sutun;
      
      if (dusmaninHaritasiMi) {
        hucreDivi.addEventListener('click', () => oyuncuAtesEdiyor(satir, sutun, hucreDivi));
      } else {
        hucreDivi.addEventListener('dragover', suruklemeUzerinde);
        hucreDivi.addEventListener('drop', icineBirakma);
        hucreDivi.addEventListener('dragleave', icindenCikma);
      }
      haritaDivi.appendChild(hucreDivi);
    }
    haritaDizisi.push(geciciSatir);
  }
}

function domIndeksiBul(r, c) {
  return (r + 1) * 11 + (c + 1);
}

function tersaneyiHazirla() {
  const beklemeAlani = document.getElementById('gemi-bekleme-alani');
  beklemeAlani.innerHTML = '';

  gemiUzunluklari.forEach((uzunluk, sira) => {
    const gemiDivi = document.createElement('div');
    gemiDivi.className = 'suruklenebilir-gemi';
    gemiDivi.id = 'gemi-' + sira;
    gemiDivi.draggable = true;
    gemiDivi.dataset.uzunluk = uzunluk;
    gemiDivi.dataset.indeks = sira;
    gemiDivi.style.width = (uzunluk * 40 + (uzunluk - 1) * 2) + 'px';
    
    gemiDivi.addEventListener('dragstart', (olay) => {
      tutulanGemiUzunlugu = parseInt(olay.target.dataset.uzunluk);
      tutulanGemiId = olay.target.id;
      tutulanGemiIndeksi = parseInt(olay.target.dataset.indeks);
    });
    
    beklemeAlani.appendChild(gemiDivi);
  });
}

document.getElementById('yon-degistir-butonu').addEventListener('click', (olay) => {
  yatayYerlesimMi = !yatayYerlesimMi;
  olay.target.innerText = yatayYerlesimMi ? "Yön: Yatay" : "Yön: Dikey";
  
  const beklemeAlani = document.getElementById('gemi-bekleme-alani');
  if(yatayYerlesimMi) {
    beklemeAlani.classList.remove('dikey-mod');
  } else {
    beklemeAlani.classList.add('dikey-mod');
  }
  
  const gemiler = document.querySelectorAll('.suruklenebilir-gemi');
  gemiler.forEach(gemi => {
    let uzunluk = parseInt(gemi.dataset.uzunluk);
    let hesaplananBoyut = (uzunluk * 40 + (uzunluk - 1) * 2) + 'px';
    
    if (yatayYerlesimMi) {
      gemi.style.width = hesaplananBoyut;
      gemi.style.height = '30px';
    } else {
      gemi.style.width = '30px';
      gemi.style.height = hesaplananBoyut;
    }
  });
});

function onizlemeTemizle() {
  document.querySelectorAll('.hucre').forEach(h => {
    h.classList.remove('onizleme-gecerli', 'onizleme-hata');
  });
}

function suruklemeUzerinde(olay) {
  olay.preventDefault();
  
  let hucre = olay.target.closest('.hucre');
  if (!hucre) return;

  onizlemeTemizle();

  let satir = parseInt(hucre.dataset.satir);
  let sutun = parseInt(hucre.dataset.sutun);

  if (isNaN(satir) || isNaN(sutun)) return;

  let kuralaUygun = kuralaUygunMu(oyuncuHaritasi, satir, sutun, tutulanGemiUzunlugu, yatayYerlesimMi);

  for (let i = 0; i < tutulanGemiUzunlugu; i++) {
    let gSatir = yatayYerlesimMi ? satir : satir + i;
    let gSutun = yatayYerlesimMi ? sutun + i : sutun;

    if (gSatir < tahtaBoyutu && gSutun < tahtaBoyutu) {
      let indeks = domIndeksiBul(gSatir, gSutun);
      let h = document.getElementById('oyuncu-haritasi').children[indeks];
      if (kuralaUygun) {
        h.classList.add('onizleme-gecerli');
      } else {
        h.classList.add('onizleme-hata');
      }
    }
  }
}

function icindenCikma(olay) {
  onizlemeTemizle();
}

function icineBirakma(olay) {
  olay.preventDefault();
  onizlemeTemizle();
  
  let hucre = olay.target.closest('.hucre');
  if (!hucre) return;

  let satir = parseInt(hucre.dataset.satir);
  let sutun = parseInt(hucre.dataset.sutun);
  
  if (isNaN(satir) || isNaN(sutun)) return;
  
  if (kuralaUygunMu(oyuncuHaritasi, satir, sutun, tutulanGemiUzunlugu, yatayYerlesimMi)) {
    
    let yeniGemi = {
      isim: gemiIsimleri[tutulanGemiIndeksi],
      uzunluk: tutulanGemiUzunlugu,
      hucreler: [],
      vurulan: 0,
      batti: false
    };

    for (let i = 0; i < tutulanGemiUzunlugu; i++) {
      let guncelSatir = yatayYerlesimMi ? satir : satir + i;
      let guncelSutun = yatayYerlesimMi ? sutun + i : sutun;
      oyuncuHaritasi[guncelSatir][guncelSutun] = tutulanGemiIndeksi + 1; 
      yeniGemi.hucreler.push({r: guncelSatir, c: guncelSutun});
      
      let indeks = domIndeksiBul(guncelSatir, guncelSutun);
      document.getElementById('oyuncu-haritasi').children[indeks].classList.add('gemi');
    }
    
    oyuncuFilo[tutulanGemiIndeksi] = yeniGemi;
    document.getElementById(tutulanGemiId).remove();
    yerlestirilenGemiSayisi++;
    
    if (yerlestirilenGemiSayisi === gemiUzunluklari.length) {
      document.getElementById('tersane').style.display = 'none';
      document.getElementById('dusman-alani').classList.add('aktif');
      document.getElementById('zorluk').disabled = true;
      ekranaMesajYaz("Savaş başlıyor! İlk atışı sen yap.", "#64ffda");
      kayitEkle("Sistem: Tüm gemiler yerleştirildi. Savaş başladı!", "zafer");
    }
  }
}

function dusmanGemileriniOtomatikYerlestir() {
  gemiUzunluklari.forEach((uzunluk, indeks) => {
    let yerlestiMi = false;
    while (!yerlestiMi) {
      let rastgeleSatir = Math.floor(Math.random() * tahtaBoyutu);
      let rastgeleSutun = Math.floor(Math.random() * tahtaBoyutu);
      let rastgeleYatayMi = Math.random() < 0.5;
      
      if (kuralaUygunMu(dusmanHaritasi, rastgeleSatir, rastgeleSutun, uzunluk, rastgeleYatayMi)) {
        
        let yeniDusmanGemisi = {
          isim: gemiIsimleri[indeks],
          uzunluk: uzunluk,
          hucreler: [],
          vurulan: 0,
          batti: false
        };

        for (let i = 0; i < uzunluk; i++) {
          let r = rastgeleYatayMi ? rastgeleSatir : rastgeleSatir + i;
          let c = rastgeleYatayMi ? rastgeleSutun + i : rastgeleSutun;
          dusmanHaritasi[r][c] = indeks + 1;
          yeniDusmanGemisi.hucreler.push({r: r, c: c});
        }
        dusmanFilo.push(yeniDusmanGemisi);
        yerlestiMi = true;
      }
    }
  });
}

function kuralaUygunMu(haritaDizisi, satir, sutun, uzunluk, yatayMi) {
  if (yatayMi && sutun + uzunluk > tahtaBoyutu) return false;
  if (!yatayMi && satir + uzunluk > tahtaBoyutu) return false;
  
  for (let i = 0; i < uzunluk; i++) {
    if (yatayMi && haritaDizisi[satir][sutun + i] !== 0) return false;
    if (!yatayMi && haritaDizisi[satir + i][sutun] !== 0) return false;
  }
  return true;
}

function oyuncuAtesEdiyor(satir, sutun, hucreDivi) {
  if (!siraOyuncuda || oyunBittiMi || dusmanHaritasi[satir][sutun] > 5 || yerlestirilenGemiSayisi < gemiUzunluklari.length) return;

  siraOyuncuda = false;
  let koordinat = String.fromCharCode(65 + sutun) + (satir + 1);

  sesCal(sesTopAtis);
  hucreDivi.classList.add('hedef-alindi');
  ekranaMesajYaz(`${koordinat} koordinatına atış yapılıyor...`, "#f1c40f");

  setTimeout(() => {
    hucreDivi.classList.remove('hedef-alindi');
    document.getElementById('dusman-alani').classList.add('sarsinti');
    setTimeout(() => document.getElementById('dusman-alani').classList.remove('sarsinti'), 400);

    if (dusmanHaritasi[satir][sutun] > 0 && dusmanHaritasi[satir][sutun] <= 5) {
      let gemiIndeksi = dusmanHaritasi[satir][sutun] - 1;
      let vurulanGemi = dusmanFilo[gemiIndeksi];
      
      dusmanHaritasi[satir][sutun] = 8;
      hucreDivi.classList.add('vuruldu');
      oyuncuSkoru += 10;
      document.getElementById('skor-gosterge').innerText = oyuncuSkoru;
      
      vurulanGemi.vurulan++;
      
      if (vurulanGemi.vurulan === vurulanGemi.uzunluk) {
        vurulanGemi.batti = true;
        sesCal(sesGemiBatma);
        oyuncuSkoru += 40; 
        document.getElementById('skor-gosterge').innerText = oyuncuSkoru;
        kayitEkle(`Düşman ${vurulanGemi.isim} tamamen battı!`, 'zafer');
        
        vurulanGemi.hucreler.forEach(h => {
          let idx = domIndeksiBul(h.r, h.c);
          let huc = document.getElementById('dusman-haritasi').children[idx];
          huc.classList.remove('vuruldu');
          huc.classList.add('batti');
        });
        ekranaMesajYaz(`Harika! Düşman ${vurulanGemi.isim} battı.`, "#ff6b6b");
      } else {
        sesCal(sesTopIsabet);
        kayitEkle(`${koordinat} Atış Yapılıyor... Tam isabet!`, 'basari');
        ekranaMesajYaz("Tam isabet! Düşman gemisini vurdun.", "#ff6b6b");
      }

      oyunBittiMiKontrol();
      if(!oyunBittiMi) {
        siraOyuncuda = true;
      }
    } else {
      sesCal(sesTopIska);
      dusmanHaritasi[satir][sutun] = 9;
      hucreDivi.classList.add('iskala');
      oyuncuSkoru = Math.max(0, oyuncuSkoru - 5);
      document.getElementById('skor-gosterge').innerText = oyuncuSkoru;
      
      kayitEkle(`${koordinat} Atış Yapılıyor... Iskaladık!`, 'iska');
      ekranaMesajYaz("Iskaladın. Düşman nişan alıyor...", "#a4b0be");
      
      setTimeout(yapayZekaAtesEdiyor, 1000);
    }
  }, 800);
}

function yapayZekaAtesEdiyor() {
  if (oyunBittiMi) return;
  
  let atisSatiri, atisSutunu;
  let zorluk = document.getElementById('zorluk').value;
  
  if (zorluk !== 'kolay' && yapayZekaHedefleri.length > 0) {
    const mevcutHedef = yapayZekaHedefleri.shift();
    atisSatiri = mevcutHedef.satir;
    atisSutunu = mevcutHedef.sutun;
  } else {
    let gecerliNoktaBulundu = false;
    while (!gecerliNoktaBulundu) {
      atisSatiri = Math.floor(Math.random() * tahtaBoyutu);
      atisSutunu = Math.floor(Math.random() * tahtaBoyutu);
      
      const hafizadaVarMi = yapayZekaHafizasi.some(veri => veri.satir === atisSatiri && veri.sutun === atisSutunu);
      
      if (!hafizadaVarMi) {
        if (zorluk === 'zor') {
          if ((atisSatiri + atisSutunu) % 2 === 0 || yapayZekaHafizasi.length > 50) {
            gecerliNoktaBulundu = true;
          }
        } else {
          gecerliNoktaBulundu = true;
        }
      }
    }
  }

  yapayZekaHafizasi.push({satir: atisSatiri, sutun: atisSutunu});
  
  let indeks = domIndeksiBul(atisSatiri, atisSutunu);
  let hedefHucre = document.getElementById('oyuncu-haritasi').children[indeks];
  let koordinat = String.fromCharCode(65 + atisSutunu) + (atisSatiri + 1);

  sesCal(sesTopAtis);
  hedefHucre.classList.add('hedef-alindi');

  setTimeout(() => {
    hedefHucre.classList.remove('hedef-alindi');
    document.querySelector('.oyuncu-paneli').classList.add('sarsinti');
    setTimeout(() => document.querySelector('.oyuncu-paneli').classList.remove('sarsinti'), 400);

    if (oyuncuHaritasi[atisSatiri][atisSutunu] > 0 && oyuncuHaritasi[atisSatiri][atisSutunu] <= 5) {
      let gemiIndeksi = oyuncuHaritasi[atisSatiri][atisSutunu] - 1;
      let vurulanGemi = oyuncuFilo[gemiIndeksi];
      
      oyuncuHaritasi[atisSatiri][atisSutunu] = 8;
      hedefHucre.classList.add('vuruldu');
      
      vurulanGemi.vurulan++;
      
      if (vurulanGemi.vurulan === vurulanGemi.uzunluk) {
        vurulanGemi.batti = true;
        sesCal(sesGemiBatma);
        kayitEkle(`Düşman ${koordinat} Atış Yapıyor... Müttefik ${vurulanGemi.isim} tamamen battı!`, 'dusman-isabet');
        ekranaMesajYaz(`Kritik Hasar! ${vurulanGemi.isim} battı!`, "#ff6b6b");
        
        vurulanGemi.hucreler.forEach(h => {
          let hIndeks = domIndeksiBul(h.r, h.c);
          let huc = document.getElementById('oyuncu-haritasi').children[hIndeks];
          huc.classList.remove('vuruldu');
          huc.classList.add('batti');
        });
      } else {
        sesCal(sesTopIsabet);
        kayitEkle(`Düşman ${koordinat} Atış Yapıyor... Müttefik gemisi vuruldu!`, 'dusman-isabet');
        ekranaMesajYaz("UYARI! Düşman gemini vurdu!", "#ff6b6b");
      }
      
      if (zorluk !== 'kolay') {
        const komsular = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        komsular.forEach(komsu => {
          let komsuSatir = atisSatiri + komsu[0];
          let komsuSutun = atisSutunu + komsu[1];
          
          if (komsuSatir >= 0 && komsuSatir < tahtaBoyutu && komsuSutun >= 0 && komsuSutun < tahtaBoyutu) {
            let atesEdilmisMi = yapayZekaHafizasi.some(v => v.satir === komsuSatir && v.sutun === komsuSutun);
            let hedefteVarMi = yapayZekaHedefleri.some(h => h.satir === komsuSatir && h.sutun === komsuSutun);
            
            if (!atesEdilmisMi && !hedefteVarMi) {
              yapayZekaHedefleri.push({satir: komsuSatir, sutun: komsuSutun});
            }
          }
        });
      }
      
      oyunBittiMiKontrol();
      if (!oyunBittiMi) setTimeout(yapayZekaAtesEdiyor, 1000);
      
    } else {
      sesCal(sesTopIska);
      oyuncuHaritasi[atisSatiri][atisSutunu] = 9;
      hedefHucre.classList.add('iskala');
      kayitEkle(`Düşman ${koordinat} Atış Yapıyor... Düşman Iskaladı!`, 'dusman-iska');
      ekranaMesajYaz("Düşman ıskaladı. Sıra sende, komutan.", "#64ffda");
      siraOyuncuda = true;
    }
  }, 800);
}

function oyunBittiMiKontrol() {
  let oyuncuGemiKaldiMi = oyuncuFilo.some(gemi => !gemi.batti);
  let dusmanGemiKaldiMi = dusmanFilo.some(gemi => !gemi.batti);

  if (!dusmanGemiKaldiMi) {
    ekranaMesajYaz("ZAFER! Tüm düşman filosu denizin dibini boyladı.", "#64ffda");
    kayitEkle("Sistem: Zafer! Tüm düşman gemileri imha edildi.", "zafer");
    oyunBittiMi = true;
    document.getElementById('yeniden-oyna-butonu').style.display = 'inline-block';
  } else if (!oyuncuGemiKaldiMi) {
    ekranaMesajYaz("AĞIR YENİLGİ. Filon tamamen yok edildi.", "#ff6b6b");
    kayitEkle("Sistem: Yenilgi! Tüm müttefik gemileri battı.", "dusman-isabet");
    oyunBittiMi = true;
    document.getElementById('yeniden-oyna-butonu').style.display = 'inline-block';
  }
}

document.getElementById('yeniden-oyna-butonu').addEventListener('click', oyunuBaslat);

oyunuBaslat();