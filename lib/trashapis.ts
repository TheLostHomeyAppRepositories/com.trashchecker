'use strict';

import { ActivityDates, ApiDefinition, ApiFindResult } from '../types/localTypes';
import { addDate, formatDate, httpsPromise, parseDutchDate, processWasteData, validateCountry, validateHousenumber, validateZipcode, verifyByName, verifyDate } from './helpers';
import { ApiSettings, TrashType } from '../assets/publicTypes';
import { parseDocument, DomUtils } from 'htmlparser2';

export class TrashApis {
  #apiList: ApiDefinition[] = [];
  #log: (...args: any[]) => void;

  constructor(logger: (...args: any[]) => void) {
    this.#log = logger || console.log;

    this.#apiList.push({ name: 'Afval App', id: 'afa', execute: (apiSettings) => this.#afvalapp(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender ACV', id: 'acv', execute: (apiSettings) => this.#acvAfvalkalender(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Almere', id: 'alm', execute: (apiSettings) => this.#almereAfvalkalender(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Alphen aan den Rijn', id: 'apn', execute: (apiSettings) => this.#afvalkalenderApn(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender BAR', id: 'afbar', execute: (apiSettings) => this.#afvalkalenderBar(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Circulus-Berkel', id: 'acb', execute: (apiSettings) => this.#circulusBerkel(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Cyclus', id: 'afc', execute: (apiSettings) => this.#afvalkalenderCyclus(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender DAR', id: 'dar', execute: (apiSettings) => this.#darAfvalkalender(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Etten-Leur', id: 'akel', execute: (apiSettings) => this.#huisvuilkalenderEttenLeur(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Meerlanden', id: 'akm', execute: (apiSettings) => this.#afvalkalenderMeerlanden(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Noardeast-Fryslân', id: 'nfd', execute: (apiSettings) => this.#afvalkalenderNoordOostFriesland(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Peel en Maas', id: 'akpm', execute: (apiSettings) => this.#afvalkalenderPeelEnMaas(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Purmerend', id: 'akpu', execute: (apiSettings) => this.#afvalkalenderPurmerend(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender RAD', id: 'rad', execute: (apiSettings) => this.#afvalkalenderRad(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender RD4', id: 'rd4', execute: (apiSettings) => this.#afvalkalenderRD4(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Reinis', id: 'aknw', execute: (apiSettings) => this.#nissewaard(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender RMN', id: 'afrm', execute: (apiSettings) => this.#afvalRmn(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender ROVA', id: 'rov', execute: (apiSettings) => this.#rovaAfvalkalender(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender RWM', id: 'rwm', execute: (apiSettings) => this.#afvalkalenderRwm(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Saver', id: 'svr', execute: (apiSettings) => this.#afvalkalenderSaver(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Súdwest-Fryslân', id: 'swf', execute: (apiSettings) => this.#afvalkalenderSudwestFryslan(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Venray', id: 'akvr', execute: (apiSettings) => this.#afvalkalenderVenray(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Westland', id: 'akwl', execute: (apiSettings) => this.#afvalKalenderWestland(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender Woerden', id: 'akwrd', execute: (apiSettings) => this.#afvalKalenderWoerden(apiSettings) });
    this.#apiList.push({ name: 'Afvalkalender ZRD', id: 'afzrd', execute: (apiSettings) => this.#afvalkalenderZrd(apiSettings) });
    this.#apiList.push({ name: 'Avalwijzer Montferland', id: 'mont', execute: (apiSettings) => this.#afvalwijzerMontferland(apiSettings) });
    this.#apiList.push({ name: 'Afvalwijzer Pre Zero', id: 'arn', execute: (apiSettings) => this.#afvalwijzerPreZero(apiSettings) });
    this.#apiList.push({ name: 'Area Reiniging', id: 'arei', execute: (apiSettings) => this.#areaReiniging(apiSettings) });
    this.#apiList.push({ name: 'Avalex', id: 'avx', execute: (apiSettings) => this.#afvalAvalex(apiSettings) });
    this.#apiList.push({ name: 'Avri', id: 'avr', execute: (apiSettings) => this.#afvalkalenderAvri(apiSettings) });
    this.#apiList.push({ name: 'Den Bosch Afvalstoffendienstkalender', id: 'dbafw', execute: (apiSettings) => this.#denBoschAfvalstoffendienstCalendar(apiSettings) });
    this.#apiList.push({ name: 'GAD Gooi en Vechtstreek', id: 'gad', execute: (apiSettings) => this.#GadGooiAndVechtstreek(apiSettings) });
    this.#apiList.push({ name: 'Gemeente Assen', id: 'gemas', execute: (apiSettings) => this.#afvalkalenderAssen(apiSettings) });
    this.#apiList.push({ name: 'Gemeente Hellendoorn', id: 'geh', execute: (apiSettings) => this.#gemeenteHellendoorn(apiSettings) });
    this.#apiList.push({ name: 'Gemeente Meppel', id: 'gem', execute: (apiSettings) => this.#gemeenteMeppel(apiSettings) });
    this.#apiList.push({ name: 'Huisvulkalender Den Haag', id: 'hkdh', execute: (apiSettings) => this.#huisvuilkalenderDenHaag(apiSettings) });
    this.#apiList.push({ name: 'Inzamelkalender HVC', id: 'hvc', execute: (apiSettings) => this.#inzamelkalenderHVC(apiSettings) });
    this.#apiList.push({ name: 'Klikomanager Oude IJsselstreek', id: 'kmoij', execute: (apiSettings) => this.#klikoManagerOudeIJsselstreek(apiSettings) });
    this.#apiList.push({ name: 'Klikomanager Uithoorn', id: 'kmuit', execute: (apiSettings) => this.#klikoManagerUithoorn(apiSettings) });
    this.#apiList.push({ name: 'Mijn Afvalwijzer', id: 'afw', execute: (apiSettings) => this.#mijnAfvalWijzer(apiSettings) });
    this.#apiList.push({ name: 'Mijn Blink Afvalkalender', id: 'mba', execute: (apiSettings) => this.#BlinkAfvalkalender(apiSettings) });
    this.#apiList.push({ name: 'Recyclemanager', id: 'remg', execute: (apiSettings) => this.#recycleManager(apiSettings) });
    this.#apiList.push({ name: 'Reinigingsdienst Waardlanden', id: 'rewl', execute: (apiSettings) => this.#reinigingsdienstWaardlanden(apiSettings) });
    this.#apiList.push({ name: 'Twente Milieu', id: 'twm', execute: (apiSettings) => this.#twenteMilieu(apiSettings) });

    this.#apiList.push({ name: 'Recycle App (BE)', id: 'recbe', execute: (apiSettings) => this.#recycleApp(apiSettings) });
  }

  async ExecuteApi(apiSettings: ApiSettings) {
    if (apiSettings.apiId === 'not-applicable' || apiSettings.apiId === '') {
      return [];
    }

    const executingApi = this.#apiList.find((x) => x.id === apiSettings.apiId);
    if (!executingApi || typeof executingApi === 'undefined') {
      throw new Error(`Couldn\'t find specified API ID: ${apiSettings.apiId}`);
    }

    return executingApi.execute(apiSettings);
  }

  async FindApi(apiSettings: ApiSettings) {
    let apiFindResult: ApiFindResult = {
      id: '',
      name: '',
      days: [],
    };

    if (apiSettings?.apiId && apiSettings?.apiId !== '') {
      try {
        const collectionDays = await this.ExecuteApi(apiSettings);

        if (Object.keys(collectionDays).length === 0) {
          throw new Error(`No trash data found.`);
        }

        apiFindResult.id = apiSettings.apiId;
        apiFindResult.days = collectionDays;
      } catch (error) {
        this.#log(`Executing API: ${apiSettings.apiId}.`);
        this.#log(error);
      }

      return apiFindResult;
    }

    apiFindResult = (await this.findFirstSuccessfulApi(apiSettings)) as ApiFindResult;

    return apiFindResult;
  }

  async findFirstSuccessfulApi(apiSettings: ApiSettings) {
    return new Promise(async (resolve, reject) => {
      let resolved = false;

      for (const apiDefinition of this.#apiList) {
        apiDefinition
          .execute(apiSettings)
          .then((collectionDays) => {
            if (!resolved) {
              resolved = true;
              let apiFindResult: ApiFindResult = {
                id: apiDefinition.id,
                name: apiDefinition.name,
                days: collectionDays,
              };
              resolve(apiFindResult);
            }
          })
          .catch((error) => this.#log(`API failed: ${apiDefinition.id} - ${error}`));
      }

      setTimeout(() => {
        if (!resolved) reject(new Error('All API calls failed.'));
      }, 10000); // Optional timeout
    });
  }

  async #mijnAfvalWijzer(apiSettings: ApiSettings) {
    return this.#generalMijnAfvalwijzerApiImplementation(apiSettings, 'www.mijnafvalwijzer.nl');
  }

  async #denBoschAfvalstoffendienstCalendar(apiSettings: ApiSettings) {
    return this.#generalMijnAfvalwijzerApiImplementation(apiSettings, 'denbosch.afvalstoffendienstkalender.nl');
  }

  async #rovaAfvalkalender(apiSettings: ApiSettings) {
    return this.#rovaWasteCalendar(apiSettings, 'www.rova.nl', '/api/waste-calendar/year');
  }

  async #afvalkalenderCyclus(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'cyclusnv.nl');
  }

  async #afvalkalenderZrd(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'zrd.nl');
  }

  async #afvalkalenderRwm(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'rwm.nl');
  }

  async #afvalRmn(apiSettings: ApiSettings) {
    return this.#generalImplementationBurgerportaal(apiSettings, '138204213564933597');
  }

  async #afvalkalenderBar(apiSettings: ApiSettings) {
    return this.#generalImplementationBurgerportaal(apiSettings, '138204213564933497');
  }

  async #afvalkalenderAssen(apiSettings: ApiSettings) {
    return this.#generalImplementationBurgerportaal(apiSettings, '138204213565303512');
  }

  async #afvalkalenderPeelEnMaas(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.peelenmaas.nl');
  }

  async #afvalkalenderVenray(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.venray.nl');
  }

  async #darAfvalkalender(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.dar.nl');
  }

  async #inzamelkalenderHVC(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'inzamelkalender.hvcgroep.nl');
  }

  async #BlinkAfvalkalender(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'www.mijnblink.nl');
  }

  async #GadGooiAndVechtstreek(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'inzamelkalender.gad.nl');
  }

  async #afvalwijzerPreZero(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'inzamelwijzer.prezero.nl');
  }

  async #afvalkalenderPurmerend(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.purmerend.nl');
  }

  async #huisvuilkalenderDenHaag(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'huisvuilkalender.denhaag.nl');
  }

  async #huisvuilkalenderEttenLeur(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'afval3xbeter.nl');
  }

  async #afvalkalenderMeerlanden(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '800bf8d7-6dd1-4490-ba9d-b419d6dc8a45', 'wasteprod2api.ximmio.com');
  }

  async #afvalkalenderRad(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '13a2cad9-36d0-4b01-b877-efcb421a864d', 'wasteapi2.ximmio.com');
  }

  async #afvalkalenderAvri(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '78cd4156-394b-413d-8936-d407e334559a', 'wasteapi.ximmio.com');
  }

  async #afvalAvalex(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, 'f7a74ad1-fdbf-4a43-9f91-44644f4d4222', 'wasteprod2api.ximmio.com');
  }

  async #twenteMilieu(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '8d97bb56-5afd-4cbc-a651-b4f7314264b4', 'twentemilieuapi.ximmio.com');
  }

  async #nissewaard(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '9dc25c8a-175a-4a41-b7a1-83f237a80b77', 'wasteapi.ximmio.com');
  }

  async #gemeenteHellendoorn(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '24434f5b-7244-412b-9306-3a2bd1e22bc1', 'wasteapi.ximmio.com');
  }

  async #gemeenteMeppel(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, 'b7a594c7-2490-4413-88f9-94749a3ec62a', 'wasteapi.ximmio.com');
  }

  async #acvAfvalkalender(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, 'f8e2844a-095e-48f9-9f98-71fceb51d2c3', 'wasteapi.ximmio.com');
  }

  async #almereAfvalkalender(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '53d8db94-7945-42fd-9742-9bbc71dbe4c1', 'wasteapi.ximmio.com');
  }

  async #areaReiniging(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, 'adc418da-d19b-11e5-ab30-625662870761');
  }

  async #afvalKalenderWestland(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'inzamelkalender.hvcgroep.nl');
  }

  async #afvalKalenderWoerden(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '06856f74-6826-4c6a-aabf-69bc9d20b5a6', 'wasteprod2api.ximmio.com');
  }

  async #reinigingsdienstWaardlanden(apiSettings: ApiSettings) {
    return this.#generalImplementationWasteApi(apiSettings, '942abcf6-3775-400d-ae5d-7380d728b23c', 'wasteapi.ximmio.com');
  }

  async #recycleApp(apiSettings: ApiSettings) {
    return this.#generalImplementationRecycleApp(apiSettings);
  }

  async #afvalkalenderSudwestFryslan(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.sudwestfryslan.nl');
  }

  async #afvalwijzerMontferland(apiSettings: ApiSettings) {
    return this.#afvalwijzerMontferlandApiImplementation(apiSettings, 'appapi.montferland.info');
  }

  async #afvalkalenderSaver(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'saver.nl');
  }

  async #afvalkalenderNoordOostFriesland(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'offalkalinder.nl');
  }

  async #afvalkalenderApn(apiSettings: ApiSettings) {
    return this.#newGeneralAfvalkalendersNederlandRest(apiSettings, 'afvalkalender.alphenaandenrijn.nl');
  }

  async #klikoManagerUithoorn(apiSettings: ApiSettings) {
    return this.#generalImplementationContainerManager(apiSettings, 'cp-uithoorn.klikocontainermanager.com', '474');
  }

  async #klikoManagerOudeIJsselstreek(apiSettings: ApiSettings) {
    return this.#generalImplementationContainerManager(apiSettings, 'cp-oudeijsselstreek.klikocontainermanager.com', '454');
  }

  /**
   * Generic API waste providers
   */
  async #newGeneralAfvalkalendersNederlandRest(apiSettings: ApiSettings, baseUrl: string) {
    this.#log('Checking new general afvalkalenders REST with URL: ' + baseUrl);

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const retrieveIdentificationRequest = await httpsPromise({
      hostname: baseUrl,
      path: `/adressen/${apiSettings.zipcode}:${apiSettings.housenumber}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
    });

    let result = <any>retrieveIdentificationRequest.body;
    if (result.length <= 0) {
      throw new Error(`Invalid zipcode for ${baseUrl}`);
    }

    let identificatie = result[0].bagid;
    this.#log(identificatie);

    const retrieveTrashTypes = await httpsPromise({
      hostname: baseUrl,
      path: `/rest/adressen/${identificatie}/afvalstromen`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
    });

    let today = new Date();
    today.setDate(today.getDate() + 7);
    let year = today.getFullYear();

    let retrieveCollectionDays = await httpsPromise({
      hostname: baseUrl,
      path: `/rest/adressen/${identificatie}/kalender/${year}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
    });

    let fDates = processWasteData(retrieveTrashTypes.body, retrieveCollectionDays.body);
    return fDates;
  }

  async #generalMijnAfvalwijzerApiImplementation(apiSettings: ApiSettings, baseUrl: string) {
    this.#log('Checking general afvalkalenders API implementation URL: ' + baseUrl);

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const retrieveCalendarDataRequest = await httpsPromise({
      hostname: baseUrl,
      path: `/nl/${apiSettings.zipcode}/${apiSettings.housenumber}/`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
    });

    // Skip lot of data from body to prevent memory overflow
    const body = <string>retrieveCalendarDataRequest.body;

    const regex = /<a href="#waste-(.*) class="wasteInfoIcon/i;
    let searchResultIndex = body.search(regex);

    while (searchResultIndex >= 0) {
      const endString = body.indexOf('</a>', searchResultIndex);
      const result = body.substring(searchResultIndex, endString + 4);

      // Parse the HTML fragment
      const doc = parseDocument(result);

      // Find all `<a>` elements with class `wasteInfoIcon`
      const wasteInfoLinks = DomUtils.findAll((elem) => DomUtils.isTag(elem) && elem.tagName === 'a' && elem.attribs.class?.includes('wasteInfoIcon'), doc.children);

      for (const link of wasteInfoLinks) {
        const firstParagraph = DomUtils.findOne((elem) => DomUtils.isTag(elem) && elem.tagName === 'p', link.children);

        if (!firstParagraph || !firstParagraph.children || firstParagraph.children.length < 2) continue;

        const trashType = link.attribs?.title || 'Unknown';
        const spanElement = DomUtils.findOne((el) => DomUtils.isTag(el) && el.name === 'span', firstParagraph.children);
        if (!spanElement) continue;

        const trashDate = DomUtils.innerText(spanElement).trim();
        if (trashDate === 'Unknown') continue;

        const parsedTrashDate = parseDutchDate(trashDate);
        if (parsedTrashDate === null) continue;
        verifyByName(fDates, '', trashType, parsedTrashDate);
      }

      // Find the next match
      let nextResult = body.substring(searchResultIndex + 4).search(regex);
      searchResultIndex = nextResult > 0 ? searchResultIndex + 4 + nextResult : -1;
    }

    this.#log('Anddddd exit');
    return fDates;
  }

  async #generalImplementationWasteApi(apiSettings: ApiSettings, companyCode: string, hostName = 'wasteapi.ximmio.com') {
    this.#log(`Checking company code ${companyCode} for hostname ${hostName}.`);

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const startDate = new Date().setDate(new Date().getDate() - 14);
    const endDate = new Date().setDate(new Date().getDate() + 30);

    const post_data1 = `{companyCode:"${companyCode}",postCode:"${apiSettings.zipcode?.toUpperCase()}",houseNumber:${apiSettings.housenumber}}`;
    const retrieveUniqueId = await httpsPromise({
      hostname: hostName,
      path: `/api/FetchAdress`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(post_data1),
      },
      body: post_data1,
      family: 4,
    });

    var result = <any>retrieveUniqueId.body;
    if (!result.status) {
      throw new Error('Invalid response. Postal code not identified.');
    }

    if (typeof result === 'undefined' || typeof result.dataList === 'undefined' || typeof result.dataList[0] === 'undefined') {
      throw new Error('UniqueID could not be found in the response.');
    }

    var uniqueID = result.dataList[0].UniqueId;
    const post_data2 = `{companyCode:"${companyCode}",uniqueAddressID:"${uniqueID}",startDate:"${formatDate(startDate)}",endDate:"${formatDate(endDate)}"}`;
    const retrieveCalendarDataRequest = await httpsPromise({
      hostname: hostName,
      path: `/api/GetCalendar`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(post_data2),
      },
      body: post_data2,
      family: 4,
    });

    var calendarResult = <any>retrieveCalendarDataRequest.body;
    this.#log(calendarResult);
    if (!calendarResult.status) {
      throw new Error('Invalid calendar result. ' + calendarResult.status);
    }

    for (var i = 0; i < Object.keys(calendarResult.dataList).length; i++) {
      for (var j = 0; j < Object.keys(calendarResult.dataList[i].pickupDates).length; j++) {
        verifyByName(fDates, '', calendarResult.dataList[i]._pickupTypeText, calendarResult.dataList[i].pickupDates[j]);
      }
    }
    return fDates;
  }

  async #generalImplementationRecycleApp(apiSettings: ApiSettings) {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'BE');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    // API's moved to api.fostplus.be/recycle-public/app/v1
    var hostName = 'api.fostplus.be';
    var accessConsumer = 'recycleapp.be';
    var accessSecret =
      'Op2tDi2pBmh1wzeC5TaN2U3knZan7ATcfOQgxh4vqC0mDKmnPP2qzoQusmInpglfIkxx8SZrasBqi5zgMSvyHggK9j6xCQNQ8xwPFY2o03GCcQfcXVOyKsvGWLze7iwcfcgk2Ujpl0dmrt3hSJMCDqzAlvTrsvAEiaSzC9hKRwhijQAFHuFIhJssnHtDSB76vnFQeTCCvwVB27DjSVpDmq8fWQKEmjEncdLqIsRnfxLcOjGIVwX5V0LBntVbeiBvcjyKF2nQ08rIxqHHGXNJ6SbnAmTgsPTg7k6Ejqa7dVfTmGtEPdftezDbuEc8DdK66KDecqnxwOOPSJIN0zaJ6k2Ye2tgMSxxf16gxAmaOUqHS0i7dtG5PgPSINti3qlDdw6DTKEPni7X0rxM';

    // Get access token
    const accessTokenRequest = await httpsPromise({
      hostname: hostName,
      path: '/recycle-public/app/v1/access-token',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        'x-consumer': accessConsumer,
        'x-secret': accessSecret,
      },
      family: 4,
    });

    const accessTokenResult = <any>accessTokenRequest.body;
    const accessToken = accessTokenResult.accessToken;

    // Validate zipcode request
    const validateZipCodeRequest = await httpsPromise({
      hostname: hostName,
      path: `/recycle-public/app/v1/zipcodes?q=${apiSettings.zipcode}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        Authorization: accessToken,
        'x-consumer': accessConsumer,
      },
      family: 4,
    });

    const zipCodeResult = <any>validateZipCodeRequest.body;
    if (zipCodeResult.items.length <= 0) {
      throw new Error('No zipcode found for: ' + apiSettings.zipcode);
    }

    if (zipCodeResult.items.length > 1) {
      throw new Error('Multiple zipcode entries found for: ' + apiSettings.zipcode);
    }

    var zipcodeId = zipCodeResult.items[0].id;

    // Validate street request
    const validateStreetRequest = await httpsPromise({
      hostname: hostName,
      path: encodeURI(`/recycle-public/app/v1/streets?q=${apiSettings.streetname.trim()}&zipcodes=${zipcodeId}`),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        Authorization: accessToken,
        'x-consumer': accessConsumer,
      },
      family: 4,
    });

    const streetResult = <any>validateStreetRequest.body;
    if (streetResult.items.length <= 0) {
      throw new Error('No street found for: ' + apiSettings.streetname.trim());
    }

    if (streetResult.items.length > 1) {
      throw new Error('Multiple streets found for: ' + apiSettings.streetname.trim());
    }

    var streetId = streetResult.items[0].id;

    // Retrieve trash request
    var startDate = new Date().setDate(new Date().getDate() - 7);
    var endDate = new Date().setDate(new Date().getDate() + 14);

    var getTrashRequest = await httpsPromise({
      hostname: hostName,
      method: 'GET',
      path: `/recycle-public/app/v1/collections?size=100&untilDate=${formatDate(endDate)}&fromDate=${formatDate(startDate)}&houseNumber=${
        apiSettings.housenumber
      }&streetId=${streetId}&zipcodeId=${zipcodeId}`,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        Authorization: accessToken,
        'x-consumer': accessConsumer,
      },
      family: 4,
    });

    var result = <any>getTrashRequest.body;
    if (result.items.length <= 0) {
      throw new Error(
        `No trash data found for: /recycle-public/app/v1/collections?size=100&untilDate=${formatDate(endDate)}&fromDate=${formatDate(startDate)}&houseNumber=${
          apiSettings.housenumber
        }&streetId=${streetId}&zipcodeId=${zipcodeId}`,
      );
    }

    for (let i in result.items) {
      const entry = result.items[i];
      const dateStr = entry.timestamp.substr(0, 10);

      var description = '';
      if (entry.type !== 'collection') continue;

      try {
        description = entry.fraction.name.nl.toLowerCase().trim();
      } catch (Exception) {
        description = entry.fraction.name.fr.toLowerCase().trim();
      }

      verifyByName(fDates, '', description, dateStr);
    }

    return fDates;
  }

  async #generalImplementationBurgerportaal(apiSettings: ApiSettings, organisationId = '138204213564933597') {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const hostName = 'europe-west3-burgerportaal-production.cloudfunctions.net';
    const userToken = 'AIzaSyA6NkRqJypTfP-cjWzrZNFJzPUbBaGjOdk';

    // Get access token
    const idTokenRequest = await httpsPromise({
      hostname: 'www.googleapis.com',
      path: `/identitytoolkit/v3/relyingparty/signupNewUser?key=${userToken}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
      },
    });

    const responseToken = <any>idTokenRequest.body;
    const refreshToken = responseToken.refreshToken;

    // Retrieve access token
    const post_data = '?&grant_type=refresh_token&refresh_token=' + refreshToken;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(post_data) };
    const accessTokenRequest = await httpsPromise({
      hostname: 'securetoken.googleapis.com',
      path: `/v1/token?key=${userToken}`,
      method: 'POST',
      body: post_data,
      headers: headers,
    });

    const accessTokenBody = <any>accessTokenRequest.body;
    const accessToken = accessTokenBody.access_token;

    // Retrieve address ID
    const addressIdRequest = await httpsPromise({
      hostname: hostName,
      path: `/exposed/organisations/${organisationId}/address?zipcode=${apiSettings.zipcode}&housenumber=${apiSettings.housenumber}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        Authorization: accessToken,
      },
    });

    let result = <any>addressIdRequest.body;
    if (result.length <= 0) {
      throw new Error('No zipcode found for: ' + apiSettings.zipcode);
    }

    if (result.length > 1) {
      throw new Error('Multiple zipcode entries found for: ' + apiSettings.zipcode);
    }

    var addressId = result[0].addressId;

    // Validate street request
    const getTrashRequest = await httpsPromise({
      hostname: hostName,
      path: `/exposed/organisations/${organisationId}/address/${addressId}/calendar`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
        Authorization: accessToken,
      },
      family: 4,
    });

    result = getTrashRequest.body;
    if (result.length <= 0) {
      throw new Error(`No trash data found for: /exposed/organisations/${organisationId}/address/${addressId}/calendar`);
    }

    for (let i in result) {
      const entry = result[i];
      verifyByName(fDates, '', entry.fraction, new Date(entry.collectionDate.substr(0, 10)));
    }

    return fDates;
  }

  async #generalImplementationContainerManager(apiSettings: ApiSettings, hostName: string, organizationId: string) {
    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const path = `/MyKliko/wasteCalendarJSON/${organizationId}/${apiSettings.zipcode}/${apiSettings.housenumber}`;

    const trashRequest = await httpsPromise({
      hostname: hostName,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Homey',
      },
    });

    const trashResult = <any>trashRequest.body;
    if (!trashResult || !trashResult.calendar || trashResult.calendar.length <= 0) {
      throw new Error(`No trash data found for given details: ${path}`);
    }

    for (const dateString in trashResult.calendar) {
      const date = new Date(dateString); // Convert the string to Date
      const trashTypes = Object.keys(trashResult.calendar[dateString]); // Get trash types for the given date

      trashTypes.forEach((trashType) => {
        verifyByName(fDates, '', trashType, date);
      });
    }

    return fDates;
  }

  /**
   * Vendor specific API implementations
   */
  async #recycleManager(apiSettings: ApiSettings) {
    this.#log('Recyclemanager met: ' + apiSettings.zipcode + ' ' + apiSettings.housenumber);

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    // Retrieve recyclemanager data
    var getRecycleData = await httpsPromise({
      hostname: 'vpn-wec-api.recyclemanager.nl',
      path: `/v2/calendars?postalcode=${apiSettings.zipcode}&number=${apiSettings.housenumber}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
    });

    var obj1 = <any>getRecycleData.body;
    if (obj1.status != 'success') {
      throw new Error(`Not a valid response from Recyclemanager.`);
    }

    for (var i = 0; i < 2; i++) {
      if (typeof obj1.data[i].occurrences !== 'undefined') {
        for (var j = 0; j < obj1.data[i].occurrences.length; j++) {
          var trashDate = new Date(obj1.data[i].occurrences[j].from.date);
          verifyByName(fDates, '', obj1.data[i].occurrences[j].title, trashDate);
        }
      }
    }

    return fDates;
  }

  async #afvalkalenderRD4(apiSettings: ApiSettings) {
    this.#log('Checking afvalkalender RD4');

    let fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    let queryAddition = '';
    if (numberAdditionMatch !== null && numberAdditionMatch.length > 0 && numberAdditionMatch[0] !== null) {
      queryAddition = '&house_number_extension=' + numberAdditionMatch[0];
    }

    // Retrieve recyclemanager data
    const d = new Date();
    const getRecycleData = await httpsPromise({
      hostname: 'data.rd4.nl',
      path: `/api/v1/waste-calendar?postal_code=${apiSettings.zipcode.substring(0, 4)}+${apiSettings.zipcode.substring(4, 6)}&house_number=${
        houseNumberMatch[0]
      }${queryAddition}&year=${d.getFullYear()}&types[]=residual_waste&types[]=gft&types[]=paper&types[]=pruning_waste&types[]=pmd&types[]=best_bag&types[]=christmas_trees`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
    });

    var result = <any>getRecycleData.body;
    for (var et in result.data.items[0]) {
      var entry = result.data.items[0][et];
      var trashDate = new Date(entry.date.substring(0, 4) + '-' + entry.date.substring(5, 7) + '-' + entry.date.substring(8, 10));

      verifyByName(fDates, '', entry.type, trashDate);
    }

    return fDates;
  }

  async #rovaWasteCalendar(apiSettings: ApiSettings, hostname: string, startPath: string) {
    this.#log('Checking afvalkalender Rova');

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    let fDates: ActivityDates[] = [];
    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    let queryAddition = '';
    if (numberAdditionMatch !== null && numberAdditionMatch.length > 0 && numberAdditionMatch[0] !== null) {
      queryAddition = '&addition=' + numberAdditionMatch[0];
    }

    const d = new Date();
    const fullPath = `${startPath}?postalcode=${apiSettings.zipcode}&year=${d.getFullYear()}${queryAddition}&houseNumber=${
      houseNumberMatch[0]
    }&types[]=residual_waste&types[]=gft&types[]=paper&types[]=pruning_waste&types[]=pmd&types[]=best_bag&types[]=christmas_trees`;

    // Retrieve rova data
    const getRecycleData = await httpsPromise({
      hostname: hostname,
      path: fullPath,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
    });

    const result = <any>getRecycleData.body;
    if (result.length === 0) {
      throw new Error('No data found for this address.');
    }

    for (var et in result) {
      const entry = result[et];
      const trashDate = new Date(entry.date.substring(0, 4) + '-' + entry.date.substring(5, 7) + '-' + entry.date.substring(8, 10));
      verifyByName(fDates, entry.wasteType.code, entry.wasteType.title, trashDate);
    }

    return fDates;
  }

  async #afvalapp(apiSettings: ApiSettings) {
    this.#log('Checking De Afval App');

    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    // Retrieve recyclemanager data
    const getRecycleData = await httpsPromise({
      hostname: 'dataservice.deafvalapp.nl',
      path: `/dataservice/DataServiceServlet?type=ANDROID&service=OPHAALSCHEMA&land=NL&postcode=${apiSettings.zipcode}&straatId=0&huisnr=${apiSettings.housenumber}'&huisnrtoev=`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      family: 4,
    });

    var data = getRecycleData.body;
    var respArray = data.toString().split('\n').join('').split(';');
    respArray.pop();
    var curr: TrashType = TrashType.REST; // Just start with REST later defined by switch statement

    for (var i in respArray) {
      if (isNaN(parseInt(respArray[i]))) {
        switch (respArray[i]) {
          case 'ZAK_BLAUW':
            curr = TrashType.REST;
            break;
          case 'PBP':
            curr = TrashType.PLASTIC;
            break;
          default:
            curr = <TrashType>respArray[i];
            break;
        }
      } else {
        var verifiedDate = verifyDate(respArray[i]);
        addDate(fDates, curr, verifiedDate);
      }
    }

    if (fDates.length <= 0) {
      throw new Error('No dates found in Afval App.');
    }

    return fDates;
  }

  async #circulusBerkel(apiSettings: ApiSettings) {
    const fDates: ActivityDates[] = [];

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    // Retrieve recyclemanager data
    var getRecycleData = await httpsPromise({
      hostname: 'mijn.circulus.nl',
      path: '/login',
      method: 'GET',
      family: 4,
    });

    let cookie = getRecycleData.headers['set-cookie'];
    let authenticityToken = null;

    if (!cookie || cookie.length === 0) {
      throw new Error('No cookie found');
    }

    for (var i = 0; i < cookie.length; i++) {
      if (cookie[i].startsWith('CB_SESSION')) {
        this.#log(cookie[i]);
        var j = cookie[i].indexOf('___AT=');
        var k = cookie[i].indexOf('&', j);
        authenticityToken = cookie[i].substring(j + 6, k);
      }
    }

    if (!authenticityToken || authenticityToken.length === 0) {
      throw new Error("Couldn't find authenticity token");
    }

    const post_data = `?authenticityToken=${authenticityToken}&zipCode=${apiSettings.zipcode}&number=${apiSettings.housenumber}`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: cookie, 'Content-Length': Buffer.byteLength(post_data) };
    const validateAddressRequest = await httpsPromise({
      hostname: 'mijn.circulus.nl',
      path: '/register/zipcode.json',
      method: 'POST',
      body: post_data,
      headers: headers,
      family: 4,
    });

    let startDate = new Date();
    const queryStartDate = formatDate(startDate.setDate(startDate.getDate() - 14))
      .replace('-0', '-')
      .replace('-0', '-');

    let endDate = new Date();
    const queryEndDate = formatDate(endDate.setDate(endDate.getDate() + 90))
      .replace('-0', '-')
      .replace('-0', '-');

    cookie = validateAddressRequest.headers['set-cookie'];
    if (!cookie || cookie.length === 0) {
      throw new Error('No second cookie found, need more cookies!');
    }

    const newHeaders = { 'Content-Type': 'application/json', Cookie: cookie };
    const getTrashData = <any>await httpsPromise({
      hostname: 'mijn.circulus.nl',
      path: `/afvalkalender.json?from=${queryStartDate}&till=${queryEndDate}`,
      method: 'GET',
      headers: newHeaders,
      family: 4,
    });

    if (
      getTrashData.body == null ||
      typeof getTrashData.body.customData === 'undefined' ||
      typeof getTrashData.body.customData.response === 'undefined' ||
      typeof getTrashData.body.customData.response.garbage === 'undefined'
    ) {
      throw new Error('Something went wrong while retrieving the data.');
    }

    var o = getTrashData.body.customData.response.garbage;
    for (var i = 0; i < o.length; i++) {
      let key = o[i].code.toLowerCase();
      switch (key) {
        case 'pmd':
        case 'gft':
        case 'rest':
          key = key.toUpperCase();
          break;
        case 'restafr':
          key = 'REST';
        case 'drocodev':
          key = 'PLASTIC';
          break;
        case 'zwakra':
          key = 'PMD';
          break;
        case 'pap':
          key = 'PAPIER';
          break;
        case 'best':
        case 'bestafr':
          key = 'TEXTIEL';
          break;
        case 'kerst':
          key = 'KERSTBOOM';
          break;
        default:
          key = key.toUpperCase();
          break;
      }

      for (let index in o[i].dates) {
        addDate(fDates, key, new Date(o[i].dates[index]));
      }
    }

    return fDates;
  }

  async #afvalwijzerMontferlandApiImplementation(apiSettings: ApiSettings, baseUrl: string) {
    this.#log('Checking afvalwijzer Montferland with URL: ' + baseUrl);

    await validateCountry(apiSettings, 'NL');
    await validateZipcode(apiSettings);
    await validateHousenumber(apiSettings);

    const houseNumberMatch = `${apiSettings.housenumber}`.match(/\d+/g);
    const numberAdditionMatch = `${apiSettings.housenumber}`.match(/[a-zA-Z]+/g);

    if (!houseNumberMatch || houseNumberMatch.length === 0) {
      throw new Error('Invalid house number');
    }

    const houseNumber = houseNumberMatch[0];
    let numberAddition = '';

    if (numberAdditionMatch && numberAdditionMatch.length > 0) {
      numberAddition = numberAdditionMatch[0];
    }

    const getGarbageList = await httpsPromise({
      hostname: baseUrl,
      path: `/api/v1/garbage/${apiSettings.zipcode}/${houseNumber}/${numberAddition}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        authToken: '77FE5F8B-9051-4B05-A525-C7CCCD42236F',
      },
      family: 4,
    });

    const result = <any>getGarbageList.body;
    const fDates: ActivityDates[] = [];

    if (result.errorCode === 100) {
      throw new Error('auth token is invalid, it might have changed');
    } else if (result.errorCode === 2002) {
      throw new Error('Address is not supported');
    } else if (result.collections.length === 0) {
      throw new Error('No garbage data found');
    }

    for (const collection of result.collections) {
      const date = collection.collectionDate.split('T')[0] || null; // get rid of the time part

      if (date === null || isNaN(Date.parse(date))) {
        this.#log(`Unable to parse date: ${date}`);
        continue;
      }

      switch (collection.fraction) {
        case 1:
          addDate(fDates, TrashType.REST, date);
          break;

        case 2:
          addDate(fDates, TrashType.GFT, date);
          break;

        case 3:
          addDate(fDates, TrashType.PAPIER, date);
          break;

        case 10:
          addDate(fDates, TrashType.PMD, date);
          break;

        default:
          this.#log(`Unknown fraction: ${collection.fraction}`);
          break;
      }
    }

    return fDates;
  }
}
