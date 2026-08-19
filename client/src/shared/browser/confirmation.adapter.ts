import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmationAdapter {
  confirm(message: string): boolean {
    return globalThis.confirm(message);
  }
}
