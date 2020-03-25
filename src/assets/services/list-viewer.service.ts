import { Injectable } from '@angular/core';
import { LANGUAGES_LIST } from '../json/languages';
import { ADVANTAGES_LIST } from '../json/advantages';
import { EMPLOYMENT_LIST } from '../json/employment';
import { AVAILABILITY_LIST } from '../json/availability';
import { STUDIES_MODES } from '../json/studies-modes';
import { LANGUAGE_LEVELS } from '../json/language-levels';

@Injectable({
  providedIn: 'root'
})
export class ListsViewerService {

  constructor() { }

  public getLanguageList() {
    return LANGUAGES_LIST;
  }

  public getAdvantagesList() {
    return ADVANTAGES_LIST;
  }

  public getEmploymentList() {
    return EMPLOYMENT_LIST;
  }

  public getAvailabilityList() {
    return AVAILABILITY_LIST;
  }

  public getStudiesModes() {
    return STUDIES_MODES;
  }

  public getLanguageLevels() {
    return LANGUAGE_LEVELS;
  }

}
