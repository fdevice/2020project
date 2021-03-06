import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MenuItem } from '../interfaces/menu-item.interface';
import { trackById } from '../../../utils/track-by';
import icPerson from '@iconify/icons-ic/twotone-person';
import icSettings from '@iconify/icons-ic/twotone-settings';
import icAccountCircle from '@iconify/icons-ic/twotone-account-circle';
import icMoveToInbox from '@iconify/icons-ic/twotone-move-to-inbox';
import icListAlt from '@iconify/icons-ic/twotone-list-alt';
import icTableChart from '@iconify/icons-ic/twotone-table-chart';
import icCheckCircle from '@iconify/icons-ic/twotone-check-circle';
import icAccessTime from '@iconify/icons-ic/twotone-access-time';
import icDoNotDisturb from '@iconify/icons-ic/twotone-do-not-disturb';
import icOfflineBolt from '@iconify/icons-ic/twotone-offline-bolt';
import icChevronRight from '@iconify/icons-ic/twotone-chevron-right';
import icArrowDropDown from '@iconify/icons-ic/twotone-arrow-drop-down';
import icBusiness from '@iconify/icons-ic/twotone-business';
import icVerifiedUser from '@iconify/icons-ic/twotone-verified-user';
import icLock from '@iconify/icons-ic/twotone-lock';
import icNotificationsOff from '@iconify/icons-ic/twotone-notifications-off';
import { Icon } from '@visurel/iconify-angular';
import { PopoverRef } from '../../popover/popover-ref';
import { AuthService } from 'src/app/auth/auth.service';
import { UserDataService } from 'src/app/dashboard/services/userData.service';

export interface OnlineStatus {
  id: 'online' | 'away' | 'dnd' | 'offline';
  label: string;
  icon: Icon;
  colorClass: string;
}

@Component({
  selector: 'vex-toolbar-user-dropdown',
  templateUrl: './toolbar-user-dropdown.component.html',
  styleUrls: ['./toolbar-user-dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarUserDropdownComponent implements OnInit {

  items: MenuItem[] = [
    {
      id: '1',
      icon: icAccountCircle,
      label: 'Mój Profil',
      description: '(*** Ander Konstrakszyn ***)',
      colorClass: 'text-teal-500',
      route: '/pages/profil'
    },
    {
      id: '2',
      icon: icMoveToInbox,
      label: 'Skrzynka Odbiorcza',
      description: '(*** Ander Konstrakszyn ***)',
      colorClass: 'text-primary-500',
      route: '/apps/chat'
    },
    {
      id: '3',
      icon: icListAlt,
      label: 'Obserwowane Ogłoszenia',
      description: '(*** Ander Konstrakszyn ***)',
      colorClass: 'text-amber-500',
      route: '/apps/scrumboard'
    }
    // {
    //   id: '4',
    //   icon: icTableChart,
    //   label: 'Billing Information',
    //   description: 'Pricing & Current Plan',
    //   colorClass: 'text-purple-500',
    //   route: '/pages/pricing'
    // }
  ];

  // statuses: OnlineStatus[] = [
  //   {
  //     id: 'online',
  //     label: 'Online',
  //     icon: icCheckCircle,
  //     colorClass: 'text-green-500'
  //   },
  //   {
  //     id: 'away',
  //     label: 'Away',
  //     icon: icAccessTime,
  //     colorClass: 'text-orange-500'
  //   },
  //   {
  //     id: 'dnd',
  //     label: 'Do not disturb',
  //     icon: icDoNotDisturb,
  //     colorClass: 'text-red-500'
  //   },
  //   {
  //     id: 'offline',
  //     label: 'Offline',
  //     icon: icOfflineBolt,
  //     colorClass: 'text-gray-500'
  //   }
  // ];

  // activeStatus: OnlineStatus = this.statuses[0];

  trackById = trackById;
  icPerson = icPerson;
  icSettings = icSettings;
  icChevronRight = icChevronRight;
  icArrowDropDown = icArrowDropDown;
  icBusiness = icBusiness;
  icVerifiedUser = icVerifiedUser;
  icLock = icLock;
  icNotificationsOff = icNotificationsOff;

  loggedAs: string;

  constructor(private cd: ChangeDetectorRef,
              private popoverRef: PopoverRef<ToolbarUserDropdownComponent>,
              private authService: AuthService,
              private userDataService: UserDataService) { }

  ngOnInit() {
    this.loggedAs = this.userDataService.getLoggedAs();
  }

  // setStatus(status: OnlineStatus) {
  //   this.activeStatus = status;
  //   this.cd.markForCheck();
  // }

  logout() {
    this.popoverRef.close(); 
    this.authService.logout();  
  }

  close() {   
    this.popoverRef.close();        
  }
}
