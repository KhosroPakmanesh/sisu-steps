// Audited, finite word/phrase inventory for the approved Genitive blueprint.
// Declarative exception: keeping the complete family table together makes coverage reviewable.
export type GenitiveTarget = readonly [string, 'singular' | 'plural', number, string];
export const GENITIVE_TARGETS: Readonly<Record<string, readonly GenitiveTarget[]>> = {
  'genitive-forms': [
    [
      'gnf-regular-singular',
      'singular',
      24,
      'talo=talon|auto=auton|koulu=koulun|koira=koiran|kirja=kirjan|pallo=pallon|lelu=lelun|kynä=kynän',
    ],
    [
      'gnf-kpt-singular',
      'singular',
      28,
      'katu=kadun|kauppa=kaupan|pankki=pankin|äiti=äidin|leipä=leivän|silta=sillan|ranta=rannan|kenkä=kengän',
    ],
    [
      'gnf-e-singular',
      'singular',
      20,
      'huone=huoneen|perhe=perheen|vene=veneen|kone=koneen|hame=hameen|kirje=kirjeen|osoite=osoitteen|tuote=tuotteen',
    ],
    [
      'gnf-nen-singular',
      'singular',
      20,
      'nainen=naisen|ihminen=ihmisen|hevonen=hevosen|suomalainen=suomalaisen|punainen=punaisen|iloinen=iloisen|tavallinen=tavallisen|sininen=sinisen',
    ],
  ],
  'genitive-forms-singular-families': [
    [
      'gns-i-retained-singular',
      'singular',
      20,
      'bussi=bussin|taksi=taksin|hotelli=hotellin|kahvi=kahvin|posti=postin|tiimi=tiimin|tuoli=tuolin|paperi=paperin',
    ],
    [
      'gns-i-e-singular',
      'singular',
      20,
      'ovi=oven|nimi=nimen|kieli=kielen|pieni=pienen|suuri=suuren|saari=saaren|vuori=vuoren|nuori=nuoren',
    ],
    [
      'gns-si-de-singular',
      'singular',
      20,
      'käsi=käden|vesi=veden|uusi=uuden|vuosi=vuoden|kuusi=kuuden|viisi=viiden',
    ],
    [
      'gns-in-ime-singular',
      'singular',
      20,
      'puhelin=puhelimen|avain=avaimen|eläin=eläimen|soitin=soittimen|keitin=keittimen|pakastin=pakastimen',
    ],
    [
      'gns-s-kse-singular',
      'singular',
      20,
      'vastaus=vastauksen|kysymys=kysymyksen|ostos=ostoksen|kerros=kerroksen|keskus=keskuksen|päätös=päätöksen|ajatus=ajatuksen|ilmoitus=ilmoituksen',
    ],
    ['gns-exceptions-singular', 'singular', 24, 'lapsi=lapsen|mies=miehen|veli=veljen|poika=pojan'],
  ],
  'genitive-forms-plural-jen-ien': [
    [
      'gnj-vowel-plural',
      'plural',
      20,
      'talo=talojen|auto=autojen|koulu=koulujen|lelu=lelujen|pallo=pallojen|kello=kellojen|sivu=sivujen|hylly=hyllyjen',
    ],
    [
      'gnj-a-o-plural',
      'plural',
      20,
      'kissa=kissojen|kirja=kirjojen|kala=kalojen|sana=sanojen|laiva=laivojen|hinta=hintojen|lista=listojen|ilta=iltojen',
    ],
    [
      'gnj-a-ien-plural',
      'plural',
      20,
      'koira=koirien|kynä=kynien|kuva=kuvien|muna=munien|asema=asemien|kesä=kesien|päivä=päivien|seinä=seinien',
    ],
    [
      'gnj-i-plural',
      'plural',
      24,
      'bussi=bussien|taksi=taksien|ovi=ovien|nimi=nimien|käsi=käsien|vesi=vesien|vuosi=vuosien|tuoli=tuolien',
    ],
    [
      'gnj-kpt-plural',
      'plural',
      28,
      'pankki=pankkien|kauppa=kauppojen|katu=katujen|leipä=leipien|silta=siltojen|ranta=rantojen|kenkä=kenkien|kuppi=kuppien',
    ],
  ],
  'genitive-forms-plural-iden': [
    [
      'gnd-long-vowel-plural',
      'plural',
      20,
      'maa=maiden/maitten|pää=päiden/päitten|puu=puiden/puitten|suu=suiden/suitten|syy=syiden/syitten|kuu=kuiden/kuitten',
    ],
    [
      'gnd-diphthong-plural',
      'plural',
      20,
      'tie=teiden/teitten|työ=töiden/töitten|yö=öiden/öitten|suo=soiden/soitten|vyö=vöiden/vöitten',
    ],
    [
      'gnd-e-plural',
      'plural',
      24,
      'huone=huoneiden/huoneitten|perhe=perheiden/perheitten|vene=veneiden/veneitten|kone=koneiden/koneitten|hame=hameiden/hameitten|kirje=kirjeiden/kirjeitten|osoite=osoitteiden/osoitteitten|tuote=tuotteiden/tuotteitten',
    ],
    [
      'gnd-long-o-plural',
      'plural',
      24,
      'numero=numeroiden/numeroitten/numerojen|vartalo=vartaloiden/vartaloitten/vartalojen|henkilö=henkilöiden/henkilöitten/henkilöjen|lokero=lokeroiden/lokeroitten/lokerojen|korjaamo=korjaamoiden/korjaamoitten/korjaamojen|huoltamo=huoltamoiden/huoltamoitten/huoltamojen',
    ],
    [
      'gnd-ija-plural',
      'plural',
      20,
      'opiskelija=opiskelijoiden/opiskelijoitten|lukija=lukijoiden/lukijoitten|hakija=hakijoiden/hakijoitten|tutkija=tutkijoiden/tutkijoitten|tekijä=tekijöiden/tekijöitten',
    ],
  ],
  'genitive-forms-plural-ten': [
    [
      'gnt-nen-plural',
      'plural',
      24,
      'nainen=naisten/naisien|ihminen=ihmisten/ihmisien|hevonen=hevosten/hevosien|suomalainen=suomalaisten/suomalaisien|punainen=punaisten/punaisien|iloinen=iloisten/iloisien|tavallinen=tavallisten/tavallisien|sininen=sinisten/sinisien',
    ],
    [
      'gnt-in-plural',
      'plural',
      24,
      'puhelin=puhelinten/puhelimien|avain=avainten/avaimien|eläin=eläinten/eläimien|soitin=soitinten/soittimien|keitin=keitinten/keittimien|pakastin=pakastinten/pakastimien',
    ],
    [
      'gnt-consonant-plural',
      'plural',
      28,
      'kieli=kielten/kielien|pieni=pienten/pienien|suuri=suurten/suurien|nuori=nuorten/nuorien|lapsi=lasten/lapsien|mies=miesten/miehien|saari=saarten/saarien|vuori=vuorten/vuorien',
    ],
  ],
  'genitive-ownership': [
    ['gno-modifier-singular', 'singular', 24, 'Anna=Annan|Liisa=Liisan|lapsi=lapsen|talo=talon'],
    [
      'gno-modifier-plural',
      'plural',
      24,
      'lapsi=lasten/lapsien|nainen=naisten/naisien|talo=talojen|koulu=koulujen',
    ],
    [
      'gno-predicate-singular',
      'singular',
      20,
      'Anna=Annan|Liisa=Liisan|lapsi=lapsen|opettaja=opettajan',
    ],
    [
      'gno-predicate-plural',
      'plural',
      20,
      'lapsi=lasten/lapsien|nainen=naisten/naisien|opettaja=opettajien|opiskelija=opiskelijoiden/opiskelijoitten',
    ],
  ],
  'genitive-adjectives-pronouns-questions': [
    [
      'gna-adjective-singular',
      'singular',
      20,
      'iso talo=ison talon|pieni talo=pienen talon|uusi talo=uuden talon|vanha talo=vanhan talon|iso auto=ison auton|pieni auto=pienen auton|uusi auto=uuden auton|vanha auto=vanhan auton',
    ],
    [
      'gna-adjective-plural',
      'plural',
      24,
      'iso talo=isojen talojen|pieni talo=pienten talojen/pienien talojen|uusi talo=uusien talojen|vanha talo=vanhojen talojen|iso auto=isojen autojen|pieni auto=pienten autojen/pienien autojen|uusi auto=uusien autojen|vanha auto=vanhojen autojen',
    ],
    [
      'gna-demonstrative-singular',
      'singular',
      20,
      'tämä talo=tämän talon|tuo talo=tuon talon|se talo=sen talon|tuo auto=tuon auton|se auto=sen auton|tämä auto=tämän auton',
    ],
    [
      'gna-demonstrative-plural',
      'plural',
      24,
      'nämä talo=näiden talojen/näitten talojen|nuo talo=noiden talojen/noitten talojen|ne talo=niiden talojen/niitten talojen|nuo auto=noiden autojen/noitten autojen|ne auto=niiden autojen/niitten autojen|nämä auto=näiden autojen/näitten autojen',
    ],
    [
      'gna-whose-singular',
      'singular',
      20,
      'kuka kirja=Kenen kirja|kuka auto=Kenen auto|kuka lelu=Kenen lelu|kuka kynä=Kenen kynä|kuka laukku=Kenen laukku|kuka puhelin=Kenen puhelin|kuka avain=Kenen avain|kuka pallo=Kenen pallo',
    ],
    [
      'gna-whose-plural',
      'plural',
      24,
      'kuka kirja=Keiden kirja/Keitten kirja|kuka auto=Keiden auto/Keitten auto|kuka lelu=Keiden lelu/Keitten lelu|kuka kynä=Keiden kynä/Keitten kynä|kuka laukku=Keiden laukku/Keitten laukku|kuka puhelin=Keiden puhelin/Keitten puhelin|kuka avain=Keiden avain/Keitten avain|kuka pallo=Keiden pallo/Keitten pallo',
    ],
    [
      'gna-which-singular',
      'singular',
      20,
      'mikä maa lippu=Minkä maan lippu|mikä koulu ovi=Minkä koulun ovi|mikä talo ikkuna=Minkä talon ikkuna|mikä auto avain=Minkä auton avain',
    ],
    [
      'gna-which-plural',
      'plural',
      24,
      'mikä maa lippu=Minkä maiden lippu/Minkä maitten lippu|mikä koulu ovi=Minkä koulujen ovi|mikä talo ikkuna=Minkä talojen ikkuna|mikä auto avain=Minkä autojen avain',
    ],
  ],
  'genitive-constructions': [
    ['gnc-location-singular', 'singular', 24, 'pöytä=pöydän|tuoli=tuolin|auto=auton|sänky=sängyn'],
    [
      'gnc-location-plural',
      'plural',
      24,
      'pöytä=pöytien|tuoli=tuolien|auto=autojen|sänky=sänkyjen',
    ],
    [
      'gnc-kanssa-singular',
      'singular',
      20,
      'Anna=Annan|Liisa=Liisan|lapsi=lapsen|opettaja=opettajan',
    ],
    [
      'gnc-kanssa-plural',
      'plural',
      20,
      'lapsi=lasten/lapsien|ystävä=ystävien|opettaja=opettajien|opiskelija=opiskelijoiden/opiskelijoitten',
    ],
    ['gnc-necessity-singular', 'singular', 24, 'minä=Minun|sinä=Sinun|hän=Hänen'],
    ['gnc-necessity-plural', 'plural', 24, 'me=Meidän|te=Teidän|he=Heidän'],
    [
      'gnc-total-object-singular',
      'singular',
      24,
      'kirja=kirjan|auto=auton|lelu=lelun|kynä=kynän|laukku=laukun|puhelin=puhelimen|avain=avaimen|pallo=pallon',
    ],
  ],
};
