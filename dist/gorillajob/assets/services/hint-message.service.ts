import { Injectable } from '@angular/core';
import { HOVER_MESSAGE } from '../json/hover-messages';

@Injectable({
  providedIn: 'root'
})
export class HintMessageService {

  constructor() { }

  public setHintMessage() {
    return HOVER_MESSAGE;
  }

}
