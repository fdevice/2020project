import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule, FormsModule } from "@angular/forms";

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { VexModule } from '../@vex/vex.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import {
  MatInputModule,
  MatCardModule,
  MatButtonModule,
  MatToolbarModule,
  MatExpansionModule,
  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatDialogModule,
  MatTooltipModule,
  MatIconModule,
  MatSnackBarModule,
  MatCheckboxModule,
  MatSelectModule,
} from "@angular/material";

import { DashboardModule } from './dashboard/dashboard.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthInterceptor } from "./auth/auth-interceptor";
import { ErrorComponent } from './error/error.component';
import { ErrorInterceptor } from './error-interceptor';
import { IconModule } from '@visurel/iconify-angular';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SideTooltipComponent } from 'src/assets/components/side-tooltip/side-tooltip.component';
import { TopTooltipComponent } from 'src/assets/components/top-tooltip/top-tooltip.component';
import { ElementFocusDirective } from 'src/assets/directives/element-focus.directive';
import { CreatorComponent } from './dashboard/components/creator/creator.component';
import { WarningDialogComponent } from 'src/assets/components/warning-dialog/warning-dialog.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { CreatePdfService } from 'src/assets/services/create-pdf.service';
import { ListsViewerService } from 'src/assets/services/list-viewer.service';
import { DialogService } from 'src/assets/services/dialog.service';
import { CanDeactivateGuard } from 'src/assets/guards/can-deactivate-guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ErrorComponent,
    // SideTooltipComponent,
    // TopTooltipComponent,
    // ElementFocusDirective,
    // CreatorComponent,
    WarningDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    // BsDatepickerModule.forRoot(),
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDialogModule,
    MatTooltipModule,
    MatIconModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatSelectModule,
    // Vex & Gorilla
    VexModule,
    IconModule,
    DashboardModule //chyba do usunięcia stąd   
  ],
  providers: [ 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    CreatePdfService,
    ListsViewerService,
    DialogService,
    CanDeactivateGuard
   ],
  bootstrap: [AppComponent],
  entryComponents: [
    ErrorComponent,
    WarningDialogComponent
  ]
})
export class AppModule { }
