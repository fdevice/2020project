import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../@vex/layout/layout.module';
import { SidenavModule } from '../../@vex/layout/sidenav/sidenav.module';
import { ToolbarModule } from '../../@vex/layout/toolbar/toolbar.module';
import { FooterModule } from '../../@vex/components/footer/footer.module';
import { ConfigPanelModule } from '../../@vex/components/config-panel/config-panel.module';
import { SidebarModule } from '../../@vex/components/sidebar/sidebar.module';
import { QuickpanelModule } from '../../@vex/components/quickpanel/quickpanel.module';

import { DashboardComponent } from './dashboard.component';
import { HqComponent } from './components/hq/hq.component';
import { DashboardRoutingModule } from './dashboard-routing.module';


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
    DashboardRoutingModule
  ],
  declarations: [
    DashboardComponent,
    HqComponent          
  ], 
})
export class DashboardModule {
}
