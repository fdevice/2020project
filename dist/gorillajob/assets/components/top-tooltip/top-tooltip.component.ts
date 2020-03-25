import { Component, OnInit, Input } from '@angular/core';
import { toptipFadeIn } from '../../animations/animations';

@Component({
  selector: 'app-top-tooltip',
  templateUrl: './top-tooltip.component.html',
  styleUrls: ['./top-tooltip.component.scss'],
  animations: [toptipFadeIn()]
})
export class TopTooltipComponent implements OnInit {

  @Input() topHint: string = '';

  constructor() { }

  ngOnInit() {

  }

}
