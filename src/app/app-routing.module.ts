import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from "./auth/login/login.component";
import { SignupComponent } from "./auth/signup/signup.component";
import { AuthGuard } from './auth/auth.guard';
import { VexRoutes } from 'src/@vex/interfaces/vex-route.interface';


const childrenRoutes: VexRoutes = [
  { 
    path: '',
    redirectTo: 'kokpit',
    pathMatch: 'full',
  },
  {
    path: 'kokpit',
    loadChildren: () => import('./dashboard/dashboard.module').then(mod => mod.DashboardModule)
  },
  {
    path: "bazowe-cv",
    loadChildren: () => import('./dashboard/components/creator/creator.module').then(mod => mod.CreatorModule)
  },
  {
    path: "kreator-cv",
    loadChildren: () => import('./dashboard/components/generator/generator.module').then(mod => mod.GeneratorModule)
  }
];

const routes: Routes = [
  { path: '', component: DashboardComponent, children: childrenRoutes, canActivate: [AuthGuard]  },
  { path: "logowanie", component: LoginComponent },
  { path: "rejestracja", component: SignupComponent }  
  // { path: "**", redirectTo: 'kokpit' }
];



@NgModule({
  imports: [RouterModule.forRoot(routes, {
    // preloadingStrategy: PreloadAllModules,
    scrollPositionRestoration: 'enabled',
    relativeLinkResolution: 'corrected',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {
}
