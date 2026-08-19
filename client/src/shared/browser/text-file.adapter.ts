import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TextFileAdapter {
  async readJson(file: File): Promise<unknown> {
    return JSON.parse(await file.text());
  }

  downloadJson(filename: string, value: unknown): void {
    const contents = JSON.stringify(value, null, 2);
    const url = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}
