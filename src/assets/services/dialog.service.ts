import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable()
export class DialogService {
  confirm(message?: string): Observable<boolean> {
    alert('Dupa!');
    const confirmation = window.confirm(message || 'Are you sure?');

    return of(confirmation);
  };
}
