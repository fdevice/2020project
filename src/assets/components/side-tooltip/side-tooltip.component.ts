import { Component, OnInit, Input } from '@angular/core';
import { sidetipFadeIn } from '../../animations/animations';

@Component({
  selector: 'app-side-tooltip',
  templateUrl: './side-tooltip.component.html',
  styleUrls: ['./side-tooltip.component.scss'],
  animations: [sidetipFadeIn()]
})
export class SideTooltipComponent implements OnInit {

  @Input() hint: string;
  @Input() hintPosition: number;

  constructor() { }

  ngOnInit() {

  }

}
