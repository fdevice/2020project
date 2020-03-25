import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PopoverService } from '../popover/popover.service';
import { ToolbarUserDropdownComponent } from './toolbar-user-dropdown/toolbar-user-dropdown.component';
import icPerson from '@iconify/icons-ic/twotone-person';
import theme from '../../utils/tailwindcss';
import { AuthService } from 'src/app/auth/auth.service';
import { UserDataService } from 'src/app/dashboard/services/userData.service';

@Component({
  selector: 'vex-toolbar-user',
  templateUrl: './toolbar-user.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarUserComponent implements OnInit {

  dropdownOpen: boolean;
  icPerson = icPerson;
  loggedUser: string;

  theme = theme;

  constructor(private popover: PopoverService,
              private cd: ChangeDetectorRef,
              private authService: AuthService,
              private userDataService: UserDataService) { }

  ngOnInit() {
    this.loggedUser = this.userDataService.getLoggedAs();    
  }

  showPopover(originRef: HTMLElement) {
    this.dropdownOpen = true;
    this.cd.markForCheck();

    const popoverRef = this.popover.open({
      content: ToolbarUserDropdownComponent,
      origin: originRef,
      offsetX: -200,
      offsetY: 12,
      position: [
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom'
        },
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
        },
      ]
    });

    popoverRef.afterClosed$.subscribe(() => {
      this.dropdownOpen = false;
      this.cd.markForCheck();
    });
  }
}
