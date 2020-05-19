import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { SideTooltipComponent } from 'src/assets/components/side-tooltip/side-tooltip.component';
import { TopTooltipComponent } from 'src/assets/components/top-tooltip/top-tooltip.component';
import { ElementFocusDirective } from 'src/assets/directives/element-focus.directive';


@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        SideTooltipComponent,
        TopTooltipComponent,
        ElementFocusDirective 
    ],
    exports: [
        SideTooltipComponent,
        TopTooltipComponent,
        ElementFocusDirective 
    ]
})
export class SharedModule {

}