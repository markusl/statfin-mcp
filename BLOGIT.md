# Tilastolliset analyysiteemat Tilastokeskuksen blogeista

Tämä dokumentti kokoaa keskeiset analyysiteemat Tilastokeskuksen Tieto&trendit-blogista (2015-2025) ja tarjoaa esimerkkikyselyitä tekoälyavustajille StatFin MCP -palvelimen käyttöön.

---

## Sisällysluettelo

1. [Väestö ja demografiset muutokset](#1-väestö-ja-demografiset-muutokset)
2. [Työllisyys ja työmarkkinat](#2-työllisyys-ja-työmarkkinat)
3. [Koulutus ja osaaminen](#3-koulutus-ja-osaaminen)
4. [Maahanmuutto ja muuttoliike](#4-maahanmuutto-ja-muuttoliike)
5. [Asuminen ja asuntomarkkinat](#5-asuminen-ja-asuntomarkkinat)
6. [Talous ja BKT](#6-talous-ja-bkt)
7. [Energia ja ympäristö](#7-energia-ja-ympäristö)
8. [Hinnat ja inflaatio](#8-hinnat-ja-inflaatio)
9. [Tulot ja eriarvoisuus](#9-tulot-ja-eriarvoisuus)
10. [Digitalisaatio ja teknologia](#10-digitalisaatio-ja-teknologia)
11. [Etätyö ja työelämä](#11-etätyö-ja-työelämä)
12. [Alueellinen kehitys](#12-alueellinen-kehitys)
13. [Rikollisuus ja turvallisuus](#13-rikollisuus-ja-turvallisuus)
14. [Kotitaloudet ja kulutus](#14-kotitaloudet-ja-kulutus)
15. [Terveys ja kuolleisuus](#15-terveys-ja-kuolleisuus)
16. [Kestävä kehitys](#16-kestävä-kehitys)

---

## 1. Väestö ja demografiset muutokset

### Keskeiset havainnot Tieto&trendit-blogista
- **Syntyvyyden lasku**: Kokonaishedelmällisyysluku pudonnut 3,5:stä (1940-luku) 1,37:ään (2022)
- **Väestön ikääntyminen**: Suuret ikäluokat (1945-1950) nyt 70+, heistä 70 % elossa
- **Perhekoon pieneneminen**: Yksinasuvien määrä kasvussa, perhekoot pienenevät
- **Väestöllinen keskipiste siirtyy**: Suomen demografinen keskipiste liikkuu etelään

### Aiheeseen liittyvät blogit
- [Syntyvyys nousuun syyllistämällä?](https://www.stat.fi/tietotrendit/blogit/2017/syntyvyys-nousuun-syyllistamalla/) (2017)
- [Maahanmuutto paikkaa tehokkaasti heikkoa syntyvyyttä](https://stat.fi/tietotrendit/blogit/2022/maahanmuutto-paikkaa-tehokkaasti-heikkoa-syntyvyytta) (2022)
- [Bye bye suuret ikäluokat](https://stat.fi/tietotrendit/blogit/2022/bye-bye-suuret-ikaluokat) (2022)
- [Lapset näkyvät ja kuuluvat tilastoissa](https://stat.fi/tietotrendit/blogit/2021/lapset-nakyvat-ja-kuuluvat-tilastoissa) (2021)
- [Tilastot lapsistrategian tukena](https://stat.fi/tietotrendit/blogit/2022/tilastot-lapsistrategian-tukena-erillaan-oleva-tieto-yhteen-paikkaan) (2022)
- [Väestöllisen keskipisteen vauhti on nopeutunut entisestään](https://stat.fi/tietotrendit/blogit/2024/vaestollisen-keskipisteen-vauhti-nopeutunut-entisestaan) (2024)
- [Kaikkien aikojen vauvaviikko](https://stat.fi/tietotrendit/blogit/2015/kaikkien-aikojen-vauvaviikko) (2015)

### Analyysi-ideat

#### 1.1 Suomen syntyvyyskriisi: 30 vuoden perspektiivi
*Miten syntyvyys on laskenut ja mitä se tarkoittaa tulevaisuuden väestölle?*

**Kehote Claudelle:**
> Analysoi StatFin MCP:n avulla Suomen syntyvyystrendejä viimeisten 30 vuoden ajalta. Hae väestötilastoista:
> 1. Syntyneiden määrä vuosittain (1995-2024)
> 2. Kokonaishedelmällisyysluvun kehitys
> 3. Vertaile syntyvyyttä alueittain (Helsinki, Oulu, maaseutu)
> Esitä data aikajanana, joka näyttää keskeiset demografiset muutokset.

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_synt_pxt_12dx.px",
  selections: [
    { variable: "Alue", filter: "item", values: ["SSS"] },
    { variable: "Vuosi", filter: "top", top: 30 }
  ]
})
```

#### 1.2 Yksinasuvien vallankumous
*Miten Suomen kotitalousrakenne muuttuu?*

**Kehote Claudelle:**
> Etsi kotitaloustilastoja StatFinistä ja analysoi yksinasuvien kotitalouksien kasvu verrattuna perheisiin. Vertaile:
> 1. Kotitalouksien kokojakauma (1985-2024)
> 2. Alueelliset erot kaupunkien ja maaseudun välillä
> 3. Korrelaatio asuntotyypin kanssa (kerrostalot vs omakotitalot)

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_asas_pxt_116a.px",
  selections: [
    { variable: "Asuntokunnan koko", filter: "item", values: ["1", "2", "3", "4+"] },
    { variable: "Talotyyppi", filter: "item", values: ["1", "2", "3"] },
    { variable: "Vuosi", filter: "top", top: 40 }
  ]
})
```

#### 1.3 Hyvästi suuret ikäluokat: Sukupolvien väestömuutos
*Seuraa demografisia vaikutuksia Suomen suurimman sukupolven ikääntyessä*

**Kehote Claudelle:**
> Analysoi StatFin-datan avulla Suomen ikärakenteen kehitystä. Näytä:
> 1. Väestöpyramidin muutokset 1990-2024
> 2. Yli 65-vuotiaiden määrä ajan kuluessa
> 3. Työikäisen väestön (15-64) väheneminen vuodesta 2009
> Laske vanhushuoltosuhteen trendit.

---

## 2. Työllisyys ja työmarkkinat

### Keskeiset havainnot Tieto&trendit-blogista
- **Työllisyysasteen vaihtelut**: COVID-19:n vaikutus ja toipuminen
- **Työikäisen väestön väheneminen**: 136 000 työikäistä vähemmän vuodesta 2010
- **Sukupuolten työllisyyseron kaventuminen**: Naiset kirivät miesten ohi pandemian aikana
- **Johtajaparadoksi**: Johtajia yhä enemmän, vaikka työllisten määrä laskee

### Aiheeseen liittyvät blogit
- [Työllisyyden kasvu yllätti, taustalla monia asioita](https://stat.fi/tietotrendit/blogit/2020/tyollisyyden-kasvu-yllatti-taustalla-monia-asioita) (2020)
- [Talouskasvu pysähtyi, työllisyys yhä vahvaa](https://stat.fi/tietotrendit/blogit/2022/talouskasvu-pysahtyi-tyollisyys-yha-vahvaa-tyoikaisten-vaheneminen-varjostaa-nakymaa) (2022)
- [Työllisyys on laskussa – mutta johtajia on yhä enemmän](https://stat.fi/tietotrendit/blogit/2025/Tyoellisyys-on-laskussa-mutta-johtajia-on-yhae-enemmaen) (2025)
- [Työttömyysluvut eivät vääristele - mutta ne eivät kerro kaikkea](https://stat.fi/tietotrendit/blogit/2025/Tyoettoemyysluvut-eivaet-vaeaeristele-mutta-ne-eivaet-kerro-kaikkea) (2025)
- [Aika näyttää, putosiko työllisyys uudelle tasolle](https://stat.fi/tietotrendit/blogit/2020/aika-nayttaa-putosiko-tyollisyys-uudelle-tasolle-korona-aiheuttaa-haasteita-myos-kausitasoituksessa) (2020)
- [Taantuma vai lama?](https://www2.stat.fi/tietotrendit/blogit/2020/taantuma-vai-lama/) (2020)
- [Suomi on kirinyt ikääntyneiden työllisyydessä](https://stat.fi/tietotrendit/blogit/2024/suomi-on-kirinyt-ikaantyneiden-tyollisyydessa-miehet-edelleen-jaljessa-pohjoismaisessa-vertailussa) (2024)

### Analyysi-ideat

#### 2.1 COVID-19:n pysyvä vaikutus Suomen työllisyyteen
*Muuttiko pandemia pysyvästi työllisyysmalleja?*

**Kehote Claudelle:**
> Hae StatFinin työllisyystilastot ja analysoi COVID-19:n vaikutusta:
> 1. Kuukausittaiset työllisyysasteet tammikuu 2019 - joulukuu 2024
> 2. Työttömyysaste sukupuolittain kriisin aikana
> 3. Toipumismallit toimialoittain
> Vertaile pandemiaa edeltävää, kriisin aikaista ja sen jälkeistä tasoa.

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_tyti_pxt_135y.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["SSS", "1", "2"] },
    { variable: "Tiedot", filter: "item", values: ["tyollisyysaste", "tyottomyysaste"] },
    { variable: "Kuukausi", filter: "top", top: 72 }
  ]
})
```

#### 2.2 Kutistuvan työvoiman haaste
*Suomen työikäisen väestön väheneminen ja sen taloudelliset vaikutukset*

**Kehote Claudelle:**
> Analysoi Suomen työvoimademografiaa StatFinistä:
> 1. Työikäinen väestö (15-64) vuodesta 2000 vuoteen 2024
> 2. Työllisyysaste ikäryhmittäin (55-64 vs nuoremmat)
> 3. Kansainvälinen vertailu Pohjoismaiden kanssa
> Laske kuinka monta lisätyöntekijää Suomi tarvitsee nykyisen työllisyystason ylläpitämiseen.

#### 2.3 Enemmän johtajia, vähemmän työntekijöitä: Rakennemuutos
*Miksi Suomessa johtajien määrä kasvaa työllisyyden laskiessa?*

**Kehote Claudelle:**
> Etsi StatFinistä työllisyystiedot ammattiluokittain. Analysoi:
> 1. Johtajien määrä vs kokonaistyölliset (2015-2024)
> 2. Kasvuvauhti ammattiluokittain
> 3. Sektorijakauma (julkinen vs yksityinen)

---

## 3. Koulutus ja osaaminen

### Keskeiset havainnot Tieto&trendit-blogista
- **Koulutustason pysähtyminen**: Suomalaisnuoret eivät enää ohita OECD-keskiarvoa
- **NEET-nuoret**: Nuoret, jotka eivät ole työssä, koulutuksessa tai harjoittelussa
- **Sukupuolten koulutuero**: Naiset merkittävästi koulutetumpia kuin miehet
- **Ulkomaisen koulutuksen tunnustaminen**: Haasteet maahanmuuttajien tutkintojen tunnustamisessa

### Aiheeseen liittyvät blogit
- [Koulutustason huima nousu notkahti](https://stat.fi/tietotrendit/blogit/2022/koulutustason-huima-nousu-notkahti-suomalaisnuoret-enaa-oecd-maiden-keskitasoa) (2022)
- [Enemmän nuoria työn ja koulutuksen ulkopuolella](https://stat.fi/tietotrendit/blogit/2016/enemman-nuoria-tyon-ja-koulutuksen-ulkopuolella-ei-sentaan-viidennesta) (2016)
- [Nuoret vailla perusasteen jälkeistä tutkintoa](https://www.stat.fi/tietotrendit/blogit/2017/nuoret-vailla-perusasteen-jalkeista-tutkintoa-eniten-uudellamaalla-ja-ahvenanmaalla/) (2017)
- [Koronan satoa: nuoret naiset opiskelevat, miehet enemmän työttöminä](https://stat.fi/tietotrendit/blogit/2021/koronan-satoa-nuoret-naiset-opiskelevat-miehet-enemman-tyottomina) (2021)
- [Korkeasti koulutettuja ja vähän koulutettuja](https://stat.fi/tietotrendit/blogit/2019/korkeasti-koulutettuja-ja-vahan-koulutettuja-ulkomaalaistaustaisten-koulutuksesta-tulossa-tarkempaa-tietoa) (2019)
- [Suomalaisnuoret muuttavat omilleen eurooppalaisittain varhain](https://www2.stat.fi/tietotrendit/blogit/2021/suomalaisnuoret-muuttavat-omilleen-eurooppalaisittain-varhain-koronan-vaikutuksia-voimme-vasta-arvailla/) (2021)

### Analyysi-ideat

#### 3.1 Koulutustason tasaantuminen: Kun edistys pysähtyi
*Miksi Suomen koulutusetu katosi?*

**Kehote Claudelle:**
> Hae StatFinistä koulutustilastot ja analysoi:
> 1. Korkeakoulututkinnon suorittaneiden osuus 25-34-vuotiaista (2000-2024)
> 2. Vertailu OECD-keskiarvoihin
> 3. Sukupuolierot koulutustasossa
> 4. Koulutusalojen jakauman muutokset

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_vkour_pxt_12bs.px",
  selections: [
    { variable: "Ikä", filter: "item", values: ["25-34", "35-44", "45-54"] },
    { variable: "Koulutusaste", filter: "item", values: ["3", "6", "7", "8"] },
    { variable: "Vuosi", filter: "top", top: 25 }
  ]
})
```

#### 3.2 Sukupuolten koulutuskuilu: Maailman suurin?
*Suomen poikkeuksellinen sukupuolijakauma korkeakoulutuksessa*

**Kehote Claudelle:**
> Hae koulutustilastot ja näytä:
> 1. Korkeakoulututkinnon suorittaneet sukupuolittain (1990-2024)
> 2. Koulutusala sukupuolittain
> 3. Kansainvälinen vertailu sukupuolten koulutuseroista
> Analysoi miksi Suomessa on yksi maailman suurimmista naisten hyväksi olevista koulutuseroista.

#### 3.3 NEET-nuoret: Piilotettu kriisi
*Työn ja koulutuksen ulkopuolella olevien nuorten seuranta*

**Kehote Claudelle:**
> Analysoi NEET-tilastoja (ei työssä, koulutuksessa tai harjoittelussa):
> 1. NEET-osuudet ikäryhmittäin (15-19, 20-24, 25-29)
> 2. Alueellinen vaihtelu (Uusimaa vs muut alueet)
> 3. Trendianalyysi 2010-2024
> 4. Sukupuolierot NEET-malleissa

---

## 4. Maahanmuutto ja muuttoliike

### Keskeiset havainnot Tieto&trendit-blogista
- **Maahanmuutto kompensoi syntyvyyttä**: 15 % syntyvistä lapsista ulkomaalaistaustaisilta perheiltä
- **Työmarkkinapanos**: Maahanmuuttajat täyttävät tiettyjä työvoimapuutteita
- **Sisäinen muuttoliike**: Muutto kaupunkeihin, erityisesti COVID-aikana
- **Maastamuuttomallit**: 80 % länsieurooppalaisista lähtee, vain 10 % aasialaisista

### Aiheeseen liittyvät blogit
- [Maahanmuutto paikkaa tehokkaasti heikkoa syntyvyyttä](https://stat.fi/tietotrendit/blogit/2022/maahanmuutto-paikkaa-tehokkaasti-heikkoa-syntyvyytta) (2022)
- [Maahanmuuttajat paikkaavat Suomen työllisyysvajetta](https://stat.fi/tietotrendit/blogit/2023/maahanmuuttajat-paikkaavat-suomen-tyollisyysvajetta) (2023)
- [Mihin maahanmuuttajia tarvitaan kun meillä on 350 000 työtöntä?](https://stat.fi/tietotrendit/blogit/2015/mihin-maahanmuuttajia-tarvitaan-kun-meilla-on-350-000-tyotonta) (2015)
- [Pääseekö "maahanmuuttajuudesta" ikinä eroon?](https://stat.fi/tietotrendit/blogit/2016/paaseeko-maahanmuuttajuudesta-ikina-eroon) (2016)
- [Suomiko maahanmuuttajan onnela?](https://stat.fi/tietotrendit/blogit/2014/suomiko-maahanmuuttajan-onnela) (2014)
- [Lappi ja isot kaupungit vetävät työllisiä](https://stat.fi/tietotrendit/blogit/2024/lappi-ja-isot-kaupungit-vetavat-tyollisia-poikkeuksina-oulu-jyvaskyla-ja-vantaa) (2024)
- [Kuntien välinen muuttoliike vilkasta koronavuonna](https://stat.fi/tietotrendit/blogit/2021/kuntien-valinen-muuttoliike-vilkasta-koronavuonna-muuttuuko-suunta) (2021)

### Analyysi-ideat

#### 4.1 Maahanmuutto demografisena ratkaisuna
*Miten muuttoliike kompensoi alhaista syntyvyyttä*

**Kehote Claudelle:**
> Analysoi StatFinin muuttoliike- ja väestötietojen avulla:
> 1. Nettomaahanmuutto Suomeen (1990-2024)
> 2. Maahanmuuttajien panos väestönkasvuun vuosittain
> 3. Maahanmuuttajien ikäjakauma vs kantaväestö
> 4. Syntyvyys ulkomaalaistaustaisissa perheissä
> Laske millainen Suomen väestö olisi ilman maahanmuuttoa vuodesta 1990.

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_muutl_pxt_119z.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["SSS"] },
    { variable: "Tiedot", filter: "item", values: ["vm41", "vm42", "vm43"] },
    { variable: "Vuosi", filter: "top", top: 35 }
  ]
})
```

#### 4.2 Missä maahanmuuttajat työskentelevät: Työvoimapuutteiden täyttäminen
*Maahanmuuttajien työllisyysmallien kartoitus*

**Kehote Claudelle:**
> Analysoi maahanmuuttajien työllisyyttä Suomessa:
> 1. Työllisyysasteet taustamaaryhmittäin
> 2. Ulkomaalaistaustaisten työntekijöiden toimialajakauma
> 3. Vertailu kantaväestön työllisyysmalleihin
> 4. Maahanmuuttajatyöntekijöiden maantieteellinen keskittyminen

#### 4.3 Kuka jää, kuka lähtee: Maahanmuuttajien pysyvyysmallit
*Maastamuuttoasteiden ymmärtäminen lähtömaan mukaan*

**Kehote Claudelle:**
> Analysoi StatFinin muuttoliikedatan avulla:
> 1. Maastamuuttoasteet 5 vuoden kuluessa lähtöalueen mukaan
> 2. Pysyvyysasteet eri kansallisuusryhmille
> 3. Jäämiseen vs lähtemiseen korreloivat tekijät
> Miksi 80 % länsieurooppalaisista lähtee mutta 90 % afrikkalaisista ja aasialaisista jää?

---

## 5. Asuminen ja asuntomarkkinat

### Keskeiset havainnot Tieto&trendit-blogista
- **Hintaero kasvaa**: Helsingin hinnat nousevat, maaseudun laskevat
- **Velkaantuminen keskittyy**: Nuoret perheet kaupungeissa velkaantuneimpia
- **Vuokramarkkinat**: Suuret institutionaaliset vuokranantajat hallitsevat
- **Pandemian jälkeinen lasku**: Asuntokaupat 30 vuoden alimmillaan (2023)

### Aiheeseen liittyvät blogit
- [Asuntomarkkinoiden alavire hellittää aikaisintaan ensi vuoden puolella](https://stat.fi/tietotrendit/blogit/2023/asuntomarkkinoiden-alavire-hellittaa-aikaisintaan-ensi-vuoden-puolella) (2023)
- [Miksi neliöhinta nousee, mutta hintaindeksi laskee?](https://stat.fi/tietotrendit/blogit/2019/miksi-neliohinta-nousee-mutta-hintaindeksi-laskee) (2019)
- [Velkaosuudet ovat kasvaneet erityisesti suurissa kaupungeissa](https://www.stat.fi/tietotrendit/blogit/2018/velkaosuudet-ovat-kasvaneet-erityisesti-suurissa-kaupungeissa/) (2018)
- [Isot omistajat jylläävät vuokramarkkinoilla](https://www2.stat.fi/tietotrendit/blogit/2021/isot-omistajat-jyllaavat-vuokramarkkinoilla/) (2021)
- [Minkä hintaisille alueille isoissa kaupungeissa rakennetaan?](https://www.stat.fi/tietotrendit/blogit/2020/minka-hintaisille-alueille-isoissa-kaupungeissa-rakennetaan/) (2020)
- [Tontin omistusmuodon vaikutus asuntojen hintatilastoon](https://stat.fi/tietotrendit/blogit/2019/tontin-omistusmuodon-vaikutus-asuntojen-hintatilastoon-miten-laajasta-ilmiosta-on-kyse) (2019)

### Analyysi-ideat

#### 5.1 Suuri kahtiajako: Asuntohinnat kahdessa Suomessa
*Kaupunkihinnat nousevat, maaseutuhinnat laskevat*

**Kehote Claudelle:**
> Hae StatFinin asuntohintadata ja analysoi:
> 1. Asuntohintaindeksi alueittain (2010-2024)
> 2. Neliöhinta: Helsingin keskusta vs Kajaani
> 3. Tunnista alueet, joissa hinnat nousevat vs laskevat
> 4. Korrelaatio väestömuutosten kanssa
> Kartoita asuntomarkkinoiden maantieteelliset "voittajat ja häviäjät".

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_ashi_pxt_112p.px",
  selections: [
    { variable: "Alue", filter: "item", values: ["pks", "091", "837", "SSS"] },
    { variable: "Huoneluku", filter: "item", values: ["0"] },
    { variable: "Vuosineljännes", filter: "top", top: 60 }
  ]
})
```

#### 5.2 Nuoret perheet ja asuntovelka
*Asunnon omistamisen velkataakka suurissa kaupungeissa*

**Kehote Claudelle:**
> Analysoi asuntovelkamalleja:
> 1. Kotitalouksien velkasuhde ikäryhmittäin
> 2. Alueellinen vaihtelu velkatasoissa
> 3. Velan koostumus (asuntolaina vs muu)
> 4. Muutokset vuodesta 2010
> Mitkä väestöryhmät ovat haavoittuvimpia korkojen nousulle?

#### 5.3 Vuokrahintakehitys: Kellä on varaa asua missä?
*Vuokramarkkinoiden kehitys postinumeroalueittain*

**Kehote Claudelle:**
> Analysoi vuokrahintatilaston avulla:
> 1. Vuokra neliöltä postinumeroittain (Helsinki, Espoo, Tampere)
> 2. Vuokrien kasvuvauhti vs inflaatio
> 3. Vuokra-tulot-suhde alueittain
> Tunnista gentrifikoituvat vs edullisemmiksi muuttuvat alueet.

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_asvu_pxt_13eb.px",
  selections: [
    { variable: "Postinumero", filter: "item", values: ["00100", "00500", "02100", "33100"] },
    { variable: "Huoneluku", filter: "item", values: ["02"] },
    { variable: "Vuosineljännes", filter: "top", top: 20 }
  ]
})
```

---

## 6. Talous ja BKT

### Keskeiset havainnot Tieto&trendit-blogista
- **Viennin merkityksen väheneminen**: Siirtymä vientivetoistesta kotimaiseen kysyntään perustuvaan kasvuun
- **T&K-investointivaje**: Vielä 1 % päässä 4 % BKT-tavoitteesta
- **BKT:n mittaushaasteet**: Revisiot, jakamistalous, digitalisaatio
- **Palvelusektorin nousu**: Palvelut ohittaneet teollisuuden

### Aiheeseen liittyvät blogit
- [Miten mitata talouden menestystä? Bkt puolustaa paikkaansa](https://www2.stat.fi/tietotrendit/blogit/2022/miten-mitata-talouden-menestysta-bkt-puolustaa-paikkaansa-mutta-muita-nakokulmia-tarvitaan/) (2022)
- [Bkt:n vaisu kasvu 2010-luvulla kotimaisen kysynnän varassa](https://stat.fi/tietotrendit/blogit/2020/bktn-vaisu-kasvu-2010-luvulla-kotimaisen-kysynnan-varassa-maksettujen-elakkeiden-nousu-ruokki-yksityista-kulutusta) (2020)
- [Tutkimus- ja kehittämistoiminnan 4 prosentin bkt-osuuteen yhä prosenttiyksikön verran matkaa](https://stat.fi/tietotrendit/blogit/2022/tutkimus-ja-kehittamistoiminnan-4-prosentin-bkt-osuuteen-yha-prosenttiyksikon-verran-matkaa-talkoisiin-tarvitaan-kaikki-sektorit) (2022)
- [Tieto bkt:stä tarkentuu – mutta miksi?](https://www.stat.fi/tietotrendit/blogit/2018/tieto-bktsta-tarkentuu-mutta-mika-on-syy/) (2018)
- [Huomioiko bkt jakamistalouden?](https://stat.fi/tietotrendit/blogit/2016/huomioiko-bruttokansantuote-jakamistalouden) (2016)
- [Uudet ilmiöt vaativat uudistamaan kansantalouden tilinpitoa](https://www2.stat.fi/tietotrendit/blogit/2022/uudet-ilmiot-vaativat-uudistamaan-kansantalouden-tilinpitoa/) (2022)
- [Kansantalouden tilinpidon julkaisuaikataulut uudistuivat](https://www2.stat.fi/tietotrendit/blogit/2020/kansantalouden-tilinpidon-julkaisuaikataulut-uudistuivat-hyodyt-esiin-koronakriisin-seurannassa/) (2020)

### Analyysi-ideat

#### 6.1 Vientijättiläisestä kotimaiseksi taloudeksi
*Miten Suomen kasvumalli muuttui Nokian jälkeen*

**Kehote Claudelle:**
> Analysoi Suomen talousrakenteen kehitystä:
> 1. BKT kysyntäkomponenteittain (vienti, kulutus, investoinnit) 2000-2024
> 2. Teollisuuden vs palveluiden osuus BKT:sta
> 3. Vientikoostumuksen muutokset
> 4. Vertailu 2000-luvun vientibuumiin
> Milloin kotimaisesta kysynnästä tuli kasvun veturi?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_vtp_pxt_11sf.px",
  selections: [
    { variable: "Taloustoimi", filter: "item", values: ["B1GMH", "P3", "P51G", "P6", "P7"] },
    { variable: "Vuosi", filter: "top", top: 25 }
  ]
})
```

#### 6.2 T&K-investointihaaste
*Edistyminen kohti Suomen 4 % BKT-tavoitetta*

**Kehote Claudelle:**
> Hae T&K-tilastot ja analysoi:
> 1. T&K-menot prosentteina BKT:sta (2000-2024)
> 2. T&K sektoreittain (yritykset, julkinen, korkeakoulut)
> 3. Vertailu Pohjoismaihin
> 4. Mitkä toimialat johtavat T&K-panostuksissa?
> Kuinka paljon lisäinvestointeja tarvitaan 4 %:n saavuttamiseksi?

#### 6.3 Mittaamattoman mittaaminen: BKT digitaalisella aikakaudella
*Haasteet jakamistalouden ja digipalveluiden tilastoinnissa*

**Kehote Claudelle:**
> Tutki miten Suomen kansantalouden tilinpito kattaa uudet taloudelliset toiminnot:
> 1. ICT-sektorin panos BKT:hen ajan kuluessa
> 2. Alustatalouden indikaattorit
> 3. Digipalveluviennin arviot
> Keskustele mitä perinteinen BKT saattaa jättää huomiotta.

---

## 7. Energia ja ympäristö

### Keskeiset havainnot Tieto&trendit-blogista
- **Energiasiirtymä**: Siirtymä fossiilisista uusiutuviin ja ydinvoimaan
- **Globaali kolmoiskriisi**: Ilmastonmuutos, luontokato, ylikulutus
- **Jätehaasteet**: Suomi jäljessä EU:n jätevähennysvertailussa
- **Hiilineutraaliustavoite**: 2035-takaraja lähestyy

### Aiheeseen liittyvät blogit
- [Sähkön hinnan nousu jatkunut voimakkaana](https://stat.fi/tietotrendit/blogit/2023/sahkon-hinnannousu-jatkunut-voimakkaana-kolme-nakokulmaa-sahkon-hintakehitykseen) (2023)
- [Maailma ajautuu kohti globaalia kolmoiskriisiä](https://stat.fi/tietotrendit/blogit/2025/Maailma-ajautuu-kohti-globaalia-kolmoiskriisiae) (2025)
- [Yhdyskuntajätteen määrä yhä kasvussa](https://stat.fi/tietotrendit/blogit/2022/yhdyskuntajatteen-maara-yha-kasvussa-eu-vertailussa-suomi-jaa-kauas-karjesta) (2022)
- [Ympäristötilinpito rakentaa siltaa talouden ja ympäristön välille](https://stat.fi/tietotrendit/blogit/2023/ymparistotilinpito-rakentaa-siltaa-talouden-ja-ympariston-valille-seuraavana-vuorossa-ekosysteemien-tilastointi) (2023)
- [Globaali kestävä kehitys pahasti pois raiteilta](https://stat.fi/tietotrendit/blogit/2024/Globaali-kestaevae-kehitys-pahasti-pois-raiteilta) (2024)
- [Nykyinen osaaminen riittää hiilineutraaliin energiahuoltoon](https://stat.fi/tietotrendit/blogit/2019/nykyinen-osaaminen-riittaa-hiilineutraaliin-energiahuoltoon) (2019)
- [Palvelualat pelastavat maailman – ja vielä vähin päästöin](https://stat.fi/tietotrendit/blogit/2020/palvelualat-pelastavat-maailman-ja-viela-vahin-paastoin) (2020)
- [Ympäristötuet-tilasto tarkentaa kuvaa vihreän siirtymän etenemisestä](https://stat.fi/tietotrendit/blogit/2024/ymparistotuet-tilasto-tarkentaa-kuvaa-vihrean-siirtyman-etenemisesta) (2024)
- [Sähköä yli tarpeen](https://www2.stat.fi/tietotrendit/blogit/2014/sahkoa-yli-tarpeen/) (2014)

### Analyysi-ideat

#### 7.1 Suomen sähköntuotannon kehitys
*25 vuoden sähköntuotannon muutos*

**Kehote Claudelle:**
> Hae StatFinin energiatilastot ja analysoi:
> 1. Sähköntuotanto energialähteittäin (2000-2024)
> 2. Tuulivoiman kasvukehitys
> 3. Ydinvoiman osuuden muutokset
> 4. Fossiilisten polttoaineiden alasajon edistyminen
> Ennusta milloin Suomi saavuttaa hiilineutraalin sähköntuotannon.

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_sahatuo_pxt_11sr.px",
  selections: [
    { variable: "Tiedot", filter: "item", values: ["sahkon_tuot", "vesivoima", "tuulivoima", "ydinvoima"] },
    { variable: "Vuosi", filter: "top", top: 25 }
  ]
})
```

#### 7.2 Tie hiilineutraaliuteen 2035
*Suomen päästövähennysten edistymisen seuranta*

**Kehote Claudelle:**
> Analysoi Suomen kasvihuonekaasupäästöjä:
> 1. Kokonaispäästöt sektoreittain (1990-2024)
> 2. Päästöt asukasta kohti -trendi
> 3. Vertailu EU-tavoitteisiin
> 4. Mitkä sektorit ovat vähentäneet eniten/vähiten?
> Laske vaadittu vuosittainen vähennysvauhti 2035-tavoitteen saavuttamiseksi.

#### 7.3 Jätteet ja kiertotalouden edistyminen
*Miksi Suomi jää jälkeen EU:n jätetilastoissa*

**Kehote Claudelle:**
> Hae jätetilastot ja analysoi:
> 1. Yhdyskuntajäte asukasta kohti (Suomi vs EU-keskiarvo)
> 2. Kierrätysasteet jätelajeittain
> 3. Jätemäärien trendit 2010-2024
> Miksi Suomessa syntyy enemmän jätettä samalla kun muut vähentävät?

---

## 8. Hinnat ja inflaatio

### Keskeiset havainnot Tieto&trendit-blogista
- **Energiahintashokki**: 40-60 % sähkönhinnan nousu (2022)
- **Ruoan hintapyrähdys**: Ukrainan sodan jälkeiset maatalouden panoshinnat
- **Erilainen inflaatio**: Maaseutu vs kaupunki, nuoret vs vanhat kokevat eri inflaation
- **Asumiskustannusten paine**: Nousevat hoitovastikkeet ja energiakulut

### Aiheeseen liittyvät blogit
- [Sähkön hinnan nousu jatkunut voimakkaana](https://stat.fi/tietotrendit/blogit/2023/sahkon-hinnannousu-jatkunut-voimakkaana-kolme-nakokulmaa-sahkon-hintakehitykseen) (2023)
- [Yksi virallinen, erilainen kaikille – Mitä on inflaatio?](https://stat.fi/tietotrendit/blogit/2022/yksi-virallinen-erilainen-kaikille-mita-on-inflaatio) (2022)
- [Inflaatio Euroopassa ennätysvauhdissa alkuvuonna 2022](https://stat.fi/tietotrendit/blogit/2022/inflaatio-euroopassa-ennatysvauhdissa-alkuvuonna-2022-miten-kay-maiden-valisille-hintaeroille) (2022)
- [Ruoka, sähkö ja bensa vauhdittavat inflaatiota](https://stat.fi/tietotrendit/blogit/2022/ruoka-sahko-ja-bensa-vauhdittavat-inflaatiota-niiden-mukana-moni-muukin) (2022)
- [Hallinnolliset hinnat näkyvät inflaatiossa](https://www.stat.fi/tietotrendit/blogit/2019/hallinnolliset-hinnat-nakyvat-inflaatiossa-ja-eri-tavoin-kukkaroissa/) (2019)
- [Pandemia ja inflaatio ovat myllänneet kotitalouksien kulutusta](https://stat.fi/tietotrendit/blogit/2023/pandemia-ja-inflaatio-ovat-myllanneet-kotitalouksien-kulutusta) (2023)

### Analyysi-ideat

#### 8.1 Inflaatioshokki 2022-2023
*Hintapyrähdyksen anatomia*

**Kehote Claudelle:**
> Analysoi vuosien 2022-2023 inflaatiojaksoa:
> 1. Kuluttajahintaindeksi komponenteittain (ruoka, energia, asuminen)
> 2. Kuukausittainen inflaatiokehitys
> 3. Vertailu EU-naapurimaihin
> 4. Mitkä tuotteet nousivat eniten?
> Mikä ajoi huippua ja mikä laski sitä?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_khi_pxt_11xd.px",
  selections: [
    { variable: "Hyödyke", filter: "item", values: ["0", "01", "04", "07"] },
    { variable: "Kuukausi", filter: "top", top: 48 }
  ]
})
```

#### 8.2 Energianhinnan vaikutus kotitalouksiin
*Ketkä kärsivät eniten sähkönhinnan noususta?*

**Kehote Claudelle:**
> Käyttäen energiahinta- ja kotitaloustilastoja:
> 1. Sähkön hinnat kulutustason mukaan
> 2. Alueelliset energiahintaerot
> 3. Vaikutus eri asuntotyyppeihin (sähkölämmitys vs kaukolämpö)
> 4. Valtion tukitoimien tehokkuus
> Tunnista eniten kärsineet kotitaloustyypit.

#### 8.3 Minun inflaationi vs sinun inflaatiosi
*Miten eri kotitaloudet kokevat eri hintamuutokset*

**Kehote Claudelle:**
> Analysoi inflaatiokokemusta kotitaloustyypeittäin:
> 1. Kulutuskorit kotitaloustyypeittäin
> 2. Painoerot (kaupunki vs maaseutu, nuoret vs vanhat)
> 3. Laske "henkilökohtaiset" inflaatioasteet eri ryhmille
> Kuka koki 15 % inflaation kun toiset kokivat vain 5 %?

---

## 9. Tulot ja eriarvoisuus

### Keskeiset havainnot Tieto&trendit-blogista
- **Sukupuolten palkkakuilu**: 16,6 % ansioero (pysyvä vuosikymmeniä)
- **Globaalit eriarvoisuusaallot**: Globalisaatio auttoi Aasian keskiluokkaa, ei länsimaisia työntekijöitä
- **Itsensätyöllistäjien tulot**: Freelancerit ansaitsevat vähemmän kuin palkansaajat samoilla aloilla
- **Eläkekuilu**: Sukupuolten eläke-ero 20 %

### Aiheeseen liittyvät blogit
- [Prosenttipeliä palkkaeroilla](https://stat.fi/tietotrendit/blogit/2018/prosenttipelia-palkkaeroilla) (2018)
- [Tuloerot kasvavat ja kaventuvat aaltoina](https://stat.fi/tietotrendit/blogit/2019/tuloerot-kasvavat-ja-kaventuvat-aaltoina-enta-globalisaation-aikakaudella) (2019)
- [Tilastomuutoksella vaikutus sukupuolten väliseen palkkaeroon](https://stat.fi/tietotrendit/blogit/2019/tilastomuutoksella-vaikutus-sukupuolten-valiseen-palkkaeroon) (2019)
- [Taitettu indeksi ei tasaa sukupuolten välistä eroa eläkkeissä](https://stat.fi/tietotrendit/blogit/2019/taitettu-indeksi-ei-tasaa-sukupuolten-valista-eroa-elakkeissa) (2019)
- [Palkkatulot rojahtivat yksityisellä sektorilla toukokuussa 2020](https://www2.stat.fi/tietotrendit/blogit/2020/palkkatulot-rojahtivat-yksityisella-sektorilla-toukokuussa-2020/) (2020)
- [Työnteon tavat pirstaloituvat](https://www.stat.fi/tietotrendit/blogit/2016/tyonteon-tavat-pirstaloituvat/) (2016)
- [Palkoista riittää porinaa](https://www.stat.fi/tietotrendit/blogit/2017/palkoista-riittaa-porinaa/) (2017)

### Analyysi-ideat

#### 9.1 Sitkeä sukupuolten palkkakuilu
*Miksi Suomen sukupuolten palkkakuilu ei ole juuri kaventunut?*

**Kehote Claudelle:**
> Hae palkkatilastot ja analysoi:
> 1. Sukupuolten palkkakuilu sektoreittain (julkinen vs yksityinen)
> 2. Palkkakuilu ammattiluokittain
> 3. Trendit 25 vuoden ajalta
> 4. Osa-aikatyön jakauma sukupuolittain
> Mikä selittää yksityisen sektorin suurempaa kuilua?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_pra_pxt_12h3.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["1", "2"] },
    { variable: "Sektori", filter: "item", values: ["1", "2", "3"] },
    { variable: "Vuosi", filter: "top", top: 20 }
  ]
})
```

#### 9.2 Tulojakauma: Kuka hyötyi globalisaatiosta?
*Suomen tulotrendit globaalissa kontekstissa*

**Kehote Claudelle:**
> Analysoi tulojakaumatrendejä:
> 1. Reaalitulojen kasvu tulokymmenyksittäin (1995-2024)
> 2. Ylimmän 1 %:n tulo-osuuden muutokset
> 3. Gini-kertoimen trendit
> 4. Vertailu Pohjoismaisiin naapureihin
> Hyötyivätkö kaikki suomalaiset globalisaatiosta?

#### 9.3 Keikkatalouden palkkasakko
*Itsensätyöllistäjien ansiot vs palkansaajien palkat*

**Kehote Claudelle:**
> Vertaile itsensätyöllistämistä palkkatyöhön:
> 1. Mediaanitulot: itsensätyöllistäjät vs palkansaajat ammattialoittain
> 2. Itsensätyöllistämisen kasvu ajan kuluessa
> 3. Itsensätyöllistäjien toimialajakauma
> 4. Ikä- ja koulutusmallit
> Millä aloilla itsensätyöllistäminen kannattaa?

---

## 10. Digitalisaatio ja teknologia

### Keskeiset havainnot Tieto&trendit-blogista
- **Tekoäly ja ChatGPT**: Huoli hallusinaatioista tilastoissa
- **Dataräjähdys**: Haasteet tilastoviranomaisille
- **Digitaalitalouden säästöt**: 2,7 miljardia euroa potentiaalisia vuosisäästöjä
- **DESI-sijoitukset**: Suomi johtaa digitalisaatiossa mutta jää jälkeen taloudellisissa vaikutuksissa

### Aiheeseen liittyvät blogit
- [Keskusteleva tekoäly kehittyi pikavauhtia osaksi teknojättien varustelua](https://stat.fi/tietotrendit/blogit/2023/keskusteleva-tekoaly-kehittyi-pikavauhtia-osaksi-teknojattien-varustelua-kilpailu-isoista-rahoista-kovenee-vaaroista-valittamatta) (2023)
- [Miten tuottaa tekoälyllä oikeaa dataa hallusinoidun sijaan?](https://stat.fi/tietotrendit/blogit/2025/Miten-tuottaa-tekoaelyllae-oikeaa-dataa-hallusinoidun-sijaan) (2025)
- [Dataräjähdys muutti datan merkityksen yhteiskunnassa](https://stat.fi/tietotrendit/blogit/2021/datarajahdys-muutti-datan-merkityksen-yhteiskunnassa-miten-siihen-pitaisi-reagoida) (2021)
- [Digitalous tuo merkittäviä säästöjä valtionhallintoon ja yrityksille](https://stat.fi/tietotrendit/blogit/2024/digitalous-tuo-merkittavia-saastoja-valtionhallintoon-ja-yrityksille) (2024)
- [Rahkeita on, mutta riittääkö rohkeus digitalisaation edistämiseen?](https://www.stat.fi/tietotrendit/blogit/2019/rahkeita-on-mutta-riittaako-rohkeus-digitalisaation-edistamiseen/) (2019)
- [Pelko digitaitojen riittämättömyydestä vaivaa ikääntyneitä palkansaajia](https://www.stat.fi/tietotrendit/blogit/2020/pelko-digitaitojen-riittamattomyydesta-vaivaa-ikaantyneita-palkansaajia/) (2020)
- [Data- ja alustatalous kiinnostavat – miten mitata niitä?](https://stat.fi/tietotrendit/blogit/2019/data-ja-alustatalous-kiinnostavat-miten-mitata-niita) (2019)
- [Suomi on edelleen Pohjoismaa digitalisaation pyörteistä huolimatta](https://stat.fi/tietotrendit/blogit/2021/suomi-on-edelleen-pohjoismaa-digitalisaation-pyorteista-huolimatta) (2021)

### Analyysi-ideat

#### 10.1 Suomen digitaalinen paradoksi
*Maailman kärjessä digitalisaatiossa, hitaampi taloudellisissa tuotoissa*

**Kehote Claudelle:**
> Analysoi Suomen digitaalista taloutta:
> 1. ICT-sektorin työllisyys ja arvonlisäys
> 2. Yritysten digitalisaatioindikaattorit
> 3. Verkkokaupan käyttöönotto
> 4. Vertailu EU:n digikärkimaihin
> Miksi digitaalinen johtajuus ei käänny nopeammaksi kasvuksi?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_tti_pxt_11pk.px",
  selections: [
    { variable: "Toimiala", filter: "item", values: ["J", "J61", "J62", "J63"] },
    { variable: "Vuosi", filter: "top", top: 15 }
  ]
})
```

#### 10.2 Tekoälyn käyttöönotto suomalaisissa yrityksissä
*Miten suomalaiset yritykset ottavat tekoälyä käyttöön?*

**Kehote Claudelle:**
> Hae yritystilastot teknologian käyttöönotosta:
> 1. Tekoälyn käyttö toimialoittain
> 2. Yrityskoko ja tekoälyn käyttöönotto -korrelaatio
> 3. Käytössä olevat tekoälysovellustyypit
> 4. Kansainvälinen vertailu
> Mitkä toimialat johtavat tekoälyn käyttöönotossa?

#### 10.3 Digitaalisten taitojen kuilu
*Ikä ja digitaaliset kyvyt työvoimassa*

**Kehote Claudelle:**
> Analysoi digitaalisia taitoja työvoimassa:
> 1. ICT-taitotasot ikäryhmittäin
> 2. Osallistuminen digitaalisten taitojen koulutukseen
> 3. Pelko teknologisen vanhentumisen edessä iän mukaan
> 4. Etätyökyky ammattialoittain
> Kuinka valmis Suomen työvoima on digitaaliseen murrokseen?

---

## 11. Etätyö ja työelämä

### Keskeiset havainnot Tieto&trendit-blogista
- **Etätyön vallankumous**: 15 % → 31 % työskentelee kotoa (2020)
- **Ei paluuta vanhaan**: 90 % etätyöntekijöistä haluaa jatkaa
- **Epätasa-arvoinen vaikutus**: Tietotyöntekijät vs palvelutyöntekijät
- **Sairaana työssä**: Etätyö lisäsi sairaana työskentelyä

### Aiheeseen liittyvät blogit
- [Uusi normaali kutsuu – vanhaan ei ole paluuta, jos työntekijöiltä kysytään](https://stat.fi/tietotrendit/blogit/2021/uusi-normaali-kutsuu-vanhaan-ei-ole-paluuta-jos-tyontekijoilta-kysytaan) (2021)
- [Säännöllisesti kotona työskenteleminen on kaksinkertaistunut](https://stat.fi/tietotrendit/blogit/2020/saannollisesti-kotona-tyoskenteleminen-on-kaksinkertaistunut) (2020)
- [Toiset kukoistavat, toiset kuormittuvat – koronan vaikutukset työoloihin ovat moninaisia](https://stat.fi/tietotrendit/blogit/2021/toiset-kukoistavat-toiset-kuormittuvat-koronan-vaikutukset-tyooloihin-ovat-moninaisia) (2021)
- [Kun mahdoton kävi mahdolliseksi – tietotyön yleisyys mahdollisti etätyön läpimurron Suomessa](https://stat.fi/tietotrendit/blogit/2020/kun-mahdoton-kavi-mahdolliseksi-tietotyon-yleisyys-mahdollisti-etatyon-lapimurron-suomessa) (2020)
- [Etätyö vähentää sairauspoissaoloja – mutta lisää sairaana työskentelyä](https://stat.fi/tietotrendit/blogit/2020/etatyo-vahentaa-sairauspoissaoloja-mutta-lisaa-sairaana-tyoskentelya) (2020)
- [Kotona työskentely on suosiossa lapsiperheissä](https://stat.fi/tietotrendit/blogit/2021/kotona-tyoskentely-on-suosiossa-lapsiperheissa) (2021)
- [Etätyö on pidentänyt työpäivää eniten koulutuksessa](https://stat.fi/tietotrendit/blogit/2021/etatyo-on-pidentanyt-tyopaivaa-eniten-koulutuksessa) (2021)
- [Korona kiritti lopulta naiset miesten ohi työllisyydessä](https://www2.stat.fi/tietotrendit/blogit/2022/korona-kiritti-lopulta-naiset-miesten-ohi-tyollisyydessa-vauhdittiko-pandemia-myos-rakennemuutosta/) (2022)
- [Korona muutti henkilöstökoulutuksen tapoja yrityksissä](https://www.stat.fi/tietotrendit/blogit/2022/korona-muutti-henkilostokoulutuksen-tapoja-yrityksissa/) (2022)

### Analyysi-ideat

#### 11.1 Etätyökokeilu: Mikä jäi pysyväksi?
*Pandemian jälkeiset etätyömallit*

**Kehote Claudelle:**
> Analysoi etätyön kehitystä:
> 1. Etätyöasteet ennen pandemiaa, sen aikana ja sen jälkeen
> 2. Toimialaerot etätyön käyttöönotossa
> 3. Alueelliset erot etätyömahdollisuuksissa
> 4. Sukupuolimallit hybridityössä
> Mitkä muutokset ovat pysyviä vs tilapäisiä?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_tyti_pxt_13ad.px",
  selections: [
    { variable: "Etätyö", filter: "all" },
    { variable: "Toimiala", filter: "item", values: ["SSS", "J", "K", "M", "O"] },
    { variable: "Vuosineljännes", filter: "top", top: 20 }
  ]
})
```

#### 11.2 Etätyön voittajat ja häviäjät
*Kuka hyötyi vs kärsi työmuutoksesta?*

**Kehote Claudelle:**
> Vertaile etätyön vaikutuksia:
> 1. Työtyytyväisyys etätyöstatuksen mukaan
> 2. Työn ja vapaa-ajan tasapaino -indikaattorit
> 3. Tuottavuuskäsitykset
> 4. Sosiaalisen eristäytymisen indikaattorit
> Mitkä ryhmät kukoistivat vs kamppailivat etätyön kanssa?

#### 11.3 Perheet ja joustavuus
*Miten vanhemmat käyttävät etätyötä eri tavoin*

**Kehote Claudelle:**
> Analysoi etätyötä perheissä:
> 1. Etätyö vanhemmuusstatuksen mukaan
> 2. Sukupuolierot etätyössä vanhempien keskuudessa
> 3. Lastenhoitojärjestelyt ja etätyö
> 4. Työaikamuutokset etätyön myötä
> Miten etätyö on muuttanut perhe-elämää?

---

## 12. Alueellinen kehitys

### Keskeiset havainnot Tieto&trendit-blogista
- **Väestön keskittyminen**: Kasvu vain 5:ssä 19:stä maakunnasta (2022)
- **Kaupunkipako kääntyi**: COVID-ajan maaseutukiinnostus hiipui
- **Taloudellinen eriytyminen**: Uusimaa vetää kauemmaksi muista alueista
- **Asuntomarkkinoiden jakautuminen**: Helsingin hinnat +50 %, muualla tasaisia tai laskevia

### Aiheeseen liittyvät blogit
- [Kuntien välinen muuttoliike vilkasta koronavuonna – muuttuuko suunta?](https://stat.fi/tietotrendit/blogit/2021/kuntien-valinen-muuttoliike-vilkasta-koronavuonna-muuttuuko-suunta) (2021)
- [Väestöllisen keskipisteen vauhti nopeutunut](https://stat.fi/tietotrendit/blogit/2023/vaestollisen_keskipisteen_vauhti_nopeutunut) (2023)
- [Maakuntien talouden rakenne- ja riippuvuustietoa jälleen saatavilla](https://stat.fi/tietotrendit/blogit/2019/maakuntien-talouden-rakenne-ja-riippuvuustietoa-jalleen-saatavilla) (2019)
- [Lappi ja isot kaupungit vetävät työllisiä](https://stat.fi/tietotrendit/blogit/2024/lappi-ja-isot-kaupungit-vetavat-tyollisia-poikkeuksina-oulu-jyvaskyla-ja-vantaa) (2024)
- [Minkä hintaisille alueille isoissa kaupungeissa rakennetaan?](https://www.stat.fi/tietotrendit/blogit/2020/minka-hintaisille-alueille-isoissa-kaupungeissa-rakennetaan/) (2020)

### Analyysi-ideat

#### 12.1 Demografinen jakautuminen: Kasvavat vs kutistuvat alueet
*Alueelliset väestötrendit ja ennusteet*

**Kehote Claudelle:**
> Analysoi alueellista väestödynamiikkaa:
> 1. Väestömuutos maakunnittain (2000-2024)
> 2. Nettomuutto alueiden välillä
> 3. Luonnollinen väestömuutos (syntyneet miinus kuolleet) alueittain
> 4. Ikärakenne-erot
> Mitkä alueet ovat pitkällä aikavälillä kestäviä?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_vaerak_pxt_11re.px",
  selections: [
    { variable: "Alue", filter: "item", values: ["MK01", "MK02", "MK06", "MK08", "MK17"] },
    { variable: "Ikä", filter: "item", values: ["SSS"] },
    { variable: "Vuosi", filter: "top", top: 25 }
  ]
})
```

#### 12.2 COVID:n maaseudun renessanssi: Totta vai tarua?
*Jäivätkö pandemian aikaiset muutot maaseudulle pysyviksi?*

**Kehote Claudelle:**
> Analysoi kuntien välisiä muuttomalleja:
> 1. Kaupungista maaseudulle muutto 2019-2024
> 2. Etätyö ja asuinpaikkavalinnat
> 3. Asunnon ostot maaseutualueilla
> 4. Paluumuutto kaupunkeihin
> Oliko maaseutukiinnostus tilapäinen ilmiö?

#### 12.3 Alueelliset talouserot: Yksi Suomi vai monta?
*Taloudellinen eriytyminen alueiden välillä*

**Kehote Claudelle:**
> Vertaile alueellista taloudellista suorituskykyä:
> 1. BKT asukasta kohti maakunnittain
> 2. Työttömyysaste kunnittain
> 3. Keskipalkat alueittain
> 4. Yritysten perustamisaste
> Onko Suomi taloudellisesti yhä tasa-arvoisempi vai eriarvoisempi alueiden välillä?

---

## 13. Rikollisuus ja turvallisuus

### Keskeiset havainnot Tieto&trendit-blogista
- **Nuorisorikollisuuskäsitys**: Yhden rikos leimaa 99 viatonta nuorta
- **Rikostilastointimenetelmät**: Miten kirjaaminen vaikuttaa tilastoihin
- **Ulkomaalaistausta ja rikollisuus**: Vivahteikas kuva datasta
- **Kausivaihtelut**: Rikollisuus seuraa ennustettavia vuosisyklejä

### Aiheeseen liittyvät blogit
- [Yhden rikos leimaa 99 nuorta](https://stat.fi/tietotrendit/blogit/2023/yhden-rikos-leimaa-99-nuorta) (2023)
- [Yksi rikos, monta osatekoa – miten rikoksia tilastoidaan?](https://stat.fi/tietotrendit/blogit/2021/yksi-rikos-monta-osatekoa-miten-rikoksia-tilastoidaan) (2021)

### Analyysi-ideat

#### 13.1 Nuorisorikollisuus: Faktat vs käsitykset
*Mitä tilastot todella kertovat nuorista rikoksentekijöistä?*

**Kehote Claudelle:**
> Analysoi nuorisorikollisuustilastoja:
> 1. Rikokset epäillyn ikäryhmän mukaan
> 2. Nuorten tekemien rikosten tyypit
> 3. Trendit 10 vuoden ajalta
> 4. Alueellinen jakauma
> Kuinka edustavia näkyvät tapaukset ovat?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_rpk_pxt_13jt.px",
  selections: [
    { variable: "Rikosryhmä ja teonkuvauksen tarkenne", filter: "item", values: ["101T603", "101T504X406", "101T161"] },
    { variable: "Tiedot", filter: "item", values: ["rikokset_lkm"] },
    { variable: "Kuukausi", filter: "top", top: 60 }
  ]
})
```

#### 13.2 Rikollisuusmallit ajan kuluessa
*Ilmoitetun rikollisuuden pitkän aikavälin trendit*

**Kehote Claudelle:**
> Hae rikostilastot trendianalyysiin:
> 1. Ilmoitetut rikokset 1000 asukasta kohti (2000-2024)
> 2. Rikostyypit: kasvu vs lasku
> 3. Väkivalta- vs omaisuusrikostrendit
> 4. Kansainvälinen vertailu
> Onko Suomesta tulossa turvallisempi vai vaarallisempi?

#### 13.3 Rikollisuuden kausirytmit
*Milloin ja missä rikollisuutta tapahtuu*

**Kehote Claudelle:**
> Analysoi rikollisuuden kausivaihtelua:
> 1. Kuukausittaiset rikosasteet tyypeittäin
> 2. Viikonpäivämallit
> 3. Alueelliset rikosasteet
> 4. Sää ja rikollisuus -korrelaatio
> Milloin poliisin tulisi kohdentaa lisäresursseja?

---

## 14. Kotitaloudet ja kulutus

### Keskeiset havainnot Tieto&trendit-blogista
- **Pandemian kulutusmuutos**: Ravintolat kiinni, kotikulutus kasvuun
- **Säästämisen piikki**: Ennätykselliset kotitalouksien säästämisasteet COVID-aikana
- **Velkaantumisen väheneminen**: Ensimmäinen lasku kotitalouksien velkasuhteessa 1990-luvun jälkeen (2022)
- **Inflaation vaikutus**: Harkinnanvarainen kulutus laski, välttämättömyydet nousivat

### Aiheeseen liittyvät blogit
- [Pandemia ja inflaatio ovat myllänneet kotitalouksien kulutusta](https://stat.fi/tietotrendit/blogit/2023/pandemia-ja-inflaatio-ovat-myllanneet-kotitalouksien-kulutusta) (2023)
- [Talous laskussa, kotitalouksien säästäminen kasvussa – mistä on kyse?](https://stat.fi/tietotrendit/blogit/2020/talous-laskussa-kotitalouksien-saastaminen-kasvussa-mista-on-kyse) (2020)
- [Kuva kulutusmenoista tarkentui: Kotitalouksilla jää luultua enemmän säästöön](https://stat.fi/tietotrendit/blogit/2024/Kuva-kulutusmenoista-tarkentui-Kotitalouksilla-jaeae-luultua-enemmaen-saeaestoeoen) (2024)
- [Millainen kotitalous olemmekaan?](https://stat.fi/tietotrendit/blogit/2018/millainen-kotitalous-olemmekaan) (2018)
- [Talouden kokonaiskuva synkkenee, mutta valopilkkujakin on](https://stat.fi/tietotrendit/blogit/2023/talouden-kokonaiskuva-synkkenee-mutta-valopilkkujakin-on) (2023)
- [Riittävätkö rahat? – arviointi vaatii kulutustutkimusta](https://stat.fi/tietotrendit/blogit/2016/riittavatko-rahat-arviointiin-tarvitaan-kulutustutkimusta) (2016)

### Analyysi-ideat

#### 14.1 Pandemian kulutusmuutos
*Miten COVID-19 muutti kotitalouksien kulutusta*

**Kehote Claudelle:**
> Analysoi kulutusmallimuutoksia:
> 1. Kotitalouksien kulutus luokittain (2019 vs 2020 vs 2021)
> 2. Eniten kasvaneet/laskeneet kategoriat
> 3. Toipumismallit pandemian jälkeen
> 4. Vertailu pandemiaa edeltäviin normeihin
> Mitkä muutokset ovat pysyviä?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_ktutk_pxt_141p.px",
  selections: [
    { variable: "Kulutusmenon kohde", filter: "item", values: ["01", "04", "07", "09", "11"] },
    { variable: "Vuosi", filter: "top", top: 10 }
  ]
})
```

#### 14.2 Kotitalouksien velka: Käännekohta?
*Vuosikymmeniä jatkuneen velkakertymän loppu*

**Kehote Claudelle:**
> Analysoi kotitalouksien velkamalleja:
> 1. Kotitalouksien velka suhteessa tuloihin (1990-2024)
> 2. Velka kotitaloustyypeittäin
> 3. Asuntolaina vs kulutusluotto -jakauma
> 4. Korkoherkkyyys
> Onko velan lasku tilapäinen vai rakenteellinen?

#### 14.3 Inflaatiopuristus: Kulutuksen sopeutuminen
*Miten kotitaloudet reagoivat vuosien 2022-2023 hinnannousuihin*

**Kehote Claudelle:**
> Seuraa kulutusreaktioita inflaatioon:
> 1. Reaaliset kulutusmuutokset kategorioittain inflaation aikana
> 2. "Alaspäin vaihtaminen" (premium → budjettimerkit)
> 3. Energiankulutuksen sopeuttaminen
> 4. Säästämisasteen muutokset
> Miten eri tuloryhmät selvisivät?

---

## 15. Terveys ja kuolleisuus

### Keskeiset havainnot Tieto&trendit-blogista
- **Elinajanodotteen kasvu**: Suuret ikäluokat elävät 10 vuotta odotettua pidempään
- **Satavuotiaat lisääntyvät**: Yhä useampi saavuttaa 100 vuoden iän
- **Nuorten kuolleisuuden kääntyminen**: 15-19-vuotiaiden kuolleisuus kääntynyt jälleen kasvuun
- **COVID-kuolleisuus**: Haasteet kuolemansyytilastoissa

### Aiheeseen liittyvät blogit
- [Bye bye suuret ikäluokat](https://stat.fi/tietotrendit/blogit/2022/bye-bye-suuret-ikaluokat) (2022)
- [Onko koronaan kuolleista tietoa?](https://stat.fi/tietotrendit/blogit/2021/onko-koronaan-kuolleista-tietoa-kuolemansyytilastoa-saadaan-viela-odottaa) (2021)
- [Kaikkien aikojen vauvaviikko](https://stat.fi/tietotrendit/blogit/2015/kaikkien-aikojen-vauvaviikko) (2015)
- [Onnea satavuotiaalle selviytyjälle!](https://stat.fi/tietotrendit/blogit/2017/onnea-satavuotiaalle-selviytyjalle) (2017)
- [Suomalaisnuoret muuttavat omilleen eurooppalaisittain varhain](https://www2.stat.fi/tietotrendit/blogit/2021/suomalaisnuoret-muuttavat-omilleen-eurooppalaisittain-varhain-koronan-vaikutuksia-voimme-vasta-arvailla/) (2021)

### Analyysi-ideat

#### 15.1 Pidempään eläminen: Elinajanodotetrendit
*Suomen merkittävät edistysaskeleet pitkäikäisyydessä*

**Kehote Claudelle:**
> Analysoi elinajanodotetietoja:
> 1. Elinajanodote syntyessä (1970-2024)
> 2. Sukupuoliero elinajanodotteessa
> 3. Elinajanodote 65-vuotiaana
> 4. Alueelliset erot
> Kuinka paljon pidempään suomalaiset elävät verrattuna ennusteisiin?

**Esimerkkikysely:**
```javascript
query_table({
  tableId: "statfin_kuol_pxt_12an.px",
  selections: [
    { variable: "Sukupuoli", filter: "item", values: ["1", "2"] },
    { variable: "Ikä", filter: "item", values: ["0", "65"] },
    { variable: "Vuosi", filter: "top", top: 50 }
  ]
})
```

#### 15.2 Sadan vuoden kerho: Satavuotiaiden nousu
*Suomen vanhimmat asukkaat*

**Kehote Claudelle:**
> Hae väestö äärimmäisen iän mukaan:
> 1. Yli 90-, 95-, 100-vuotiaiden määrä ajan kuluessa
> 2. Sukupuolijakauma korkeissa ikäluokissa
> 3. Maantieteellinen keskittyminen
> 4. Eloonjäämisaste syntymävuosikymmenen mukaan
> Mikä selittää satavuotiaiden buumin?

#### 15.3 Kuolleisuustrendit kuolemansyyn mukaan
*Miten kuolemansyymallit muuttuvat*

**Kehote Claudelle:**
> Analysoi kuolleisuustilastoja:
> 1. Kuolemat pääkuolemansyyn mukaan (2000-2024)
> 2. Muutokset syöpä-, sydänsairaus-, tapaturmakuolleisuudessa
> 3. Ikävakioidut kuolleisuusluvut
> 4. COVID-19:n vaikutus kokonaiskuolleisuuteen
> Mitkä kuolemansyyt vähenevät vs lisääntyvät?

---

## 16. Kestävä kehitys

### Keskeiset havainnot Tieto&trendit-blogista
- **SDG-edistyminen jäljessä**: Globaalit tavoitteet vaarassa epäonnistua
- **Lämpötilaennätykset**: 1,5°C raja ylitetty
- **Vihreän siirtymän seuranta**: Uudet ympäristötukitilastot
- **Ympäristötilinpito**: Talous- ja ympäristödatan yhdistäminen

### Aiheeseen liittyvät blogit
- [Maailma ajautuu kohti globaalia kolmoiskriisiä](https://stat.fi/tietotrendit/blogit/2025/Maailma-ajautuu-kohti-globaalia-kolmoiskriisiae) (2025)
- [YK:n tuore raportti: Kestävä kehitys on vaarassa epäonnistua](https://stat.fi/tietotrendit/blogit/2023/ykn-tuore-raportti-kestava-kehitys-on-vaarassa-epaonnistua) (2023)
- [Globaali kestävä kehitys pahasti pois raiteilta](https://stat.fi/tietotrendit/blogit/2024/Globaali-kestaevae-kehitys-pahasti-pois-raiteilta) (2024)
- [Agenda 2030 -tavoitteiden saavuttaminen edellyttää Suomelta kestävyysmurrosta](https://stat.fi/tietotrendit/blogit/2023/agenda-2030-tavoitteiden-saavuttaminen-edellyttaa-suomelta-kestavyysmurrosta) (2023)
- [Kestävän kehityksen haaste vaatii tietoa, viestintää ja osallistumista](https://stat.fi/tietotrendit/blogit/2021/kestavan-kehityksen-haaste-vaatii-tietoa-viestintaa-ja-osallistumista-kansalaiskeskustelulla-on-jo-kiire) (2021)
- [Ympäristötuet-tilasto tarkentaa kuvaa vihreän siirtymän etenemisestä](https://stat.fi/tietotrendit/blogit/2024/ymparistotuet-tilasto-tarkentaa-kuvaa-vihrean-siirtyman-etenemisesta) (2024)
- [Ympäristötilinpito rakentaa siltaa talouden ja ympäristön välille](https://stat.fi/tietotrendit/blogit/2023/ymparistotilinpito-rakentaa-siltaa-talouden-ja-ympariston-valille-seuraavana-vuorossa-ekosysteemien-tilastointi) (2023)

### Analyysi-ideat

#### 16.1 Suomen SDG-tuloskortti
*Edistyminen kohti vuoden 2030 kestävän kehityksen tavoitteita*

**Kehote Claudelle:**
> Analysoi Suomen kestävän kehityksen indikaattoreita:
> 1. SDG-indikaattoritrendit (2015-2024)
> 2. Edistymisen ja pysähtymisen alueet
> 3. Vertailu Pohjoismaihin
> 4. Tavoitteet, jotka ovat vaarassa jäädä saavuttamatta
> Missä Suomi onnistuu ja missä epäonnistuu?

**Esimerkkikysely:**
```javascript
search_statistics({ query: "kestävän kehityksen indikaattorit" })
// Sitten hae relevantteja taulukoita ympäristö-, sosiaali- ja talousulottuvuuksille
```

#### 16.2 Vihreän siirtymän investointivaje
*Ympäristötukien ja -investointien seuranta*

**Kehote Claudelle:**
> Analysoi ympäristöinvestointeja:
> 1. Valtion ympäristötuet tyypeittäin
> 2. Yritysten ympäristöinvestoinnit
> 3. Vihreiden velkakirjojen liikkeeseenlaskut
> 4. Uusiutuvan energian investointitrendit
> Pysyvätkö investoinnit ilmastotavoitteiden vauhdissa?

#### 16.3 Talouskasvu vs ympäristövaikutus
*Ympäristötilinpito BKT:lle*

**Kehote Claudelle:**
> Tutki talouden ja ympäristön välisiä yhteyksiä:
> 1. Päästöt suhteessa BKT:hen
> 2. Tuotannon resurssitehokkuus
> 3. Ympäristöverot osuutena kokonaisveroista
> 4. Materiaalijalanjälkitrendit
> Saavuttaako Suomi vihreää kasvua vai vain viherpesuuko?

---

## Pikaopas: Esimerkkikehotteet Claudelle

### Perusetsintä
> "Mitä tilastoja StatFinissä on aiheesta [aihe]?"
> "Etsi tauluja hakusanalla [avainsana] suomeksi"
> "Listaa kaikki aihealueet StatFinissä"

### Datan tutkiminen
> "Näytä taulun [tableId] muuttujat ja rakenne"
> "Mitä aluekoodeja on saatavilla taulukossa [table]?"
> "Hae kaikki vuodet, jotka ovat saatavilla taulukossa [table]"

### Analyysikyselyt
> "Hae [table] Helsingin väestö viimeiseltä 10 vuodelta"
> "Vertaile [mittaria] alueiden [alueet] välillä vuodesta 2000 vuoteen 2024"
> "Näytä kuukausittaiset [indikaattori] trendit viimeiseltä 5 vuodelta"

### Monimutkaiset analyysit
> "Analysoi [muuttuja1]:n ja [muuttuja2]:n välistä suhdetta StatFin-datan avulla"
> "Luo alueellinen vertailu aiheesta [aihe] kaikissa Suomen maakunnissa"
> "Näytä miten [indikaattori] on muuttunut ennen COVID-19:ää, sen aikana ja sen jälkeen"

---

## Tietolähteet

Kaikki analyysit käyttävät Tilastokeskuksen virallista StatFin-tietokantaa:
- **API**: https://pxdata.stat.fi/PxWeb/api/v1
- **Verkkoliittymä**: https://pxdata.stat.fi/PxWeb/pxweb/fi/StatFin/
- **Blogilähde**: https://stat.fi/tietotrendit/blogit

Tilastokeskus on Suomen kansallinen tilastoviranomainen, joka on tuottanut virallisia tilastoja vuodesta 1865.

---

*Tämä dokumentti on luotu yli 100 blogikirjoituksen analyysiin perustuen Tilastokeskuksen Tieto&trendit-julkaisusta (2015-2025).*
