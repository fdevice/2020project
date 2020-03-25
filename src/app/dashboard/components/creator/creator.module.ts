import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../../../@vex/layout/layout.module';
import { SidenavModule } from '../../../../@vex/layout/sidenav/sidenav.module';
import { ToolbarModule } from '../../../../@vex/layout/toolbar/toolbar.module';
import { FooterModule } from '../../../../@vex/components/footer/footer.module';
import { ConfigPanelModule } from '../../../../@vex/components/config-panel/config-panel.module';
import { SidebarModule } from '../../../../@vex/components/sidebar/sidebar.module';
import { QuickpanelModule } from '../../../../@vex/components/quickpanel/quickpanel.module';

import { CreatorRoutingModule } from './creator-routing.module'
import { CreatorComponent } from './creator.component';
import { SideTooltipComponent } from 'src/assets/components/side-tooltip/side-tooltip.component';
import { TopTooltipComponent } from 'src/assets/components/top-tooltip/top-tooltip.component';
import { MatSelectModule, MatProgressSpinnerModule } from '@angular/material';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ReactiveFormsModule } from '@angular/forms';
import { ElementFocusDirective } from 'src/assets/directives/element-focus.directive';


@NgModule({  
  imports: [
    CommonModule,
    LayoutModule,
    SidenavModule,
    ToolbarModule,
    FooterModule,
    ConfigPanelModule,
    SidebarModule,
    QuickpanelModule,
    CreatorRoutingModule,
    MatSelectModule,
    BsDatepickerModule.forRoot(),
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  declarations: [    
    CreatorComponent,
    SideTooltipComponent,
    TopTooltipComponent,  
    ElementFocusDirective    
  ],
  exports: [
    CreatorComponent 
  ] 
})
export class CreatorModule {
}