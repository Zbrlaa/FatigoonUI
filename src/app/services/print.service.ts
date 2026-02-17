import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private ganttImage = signal<string | null>(null);

  /**
   * Definit l'image du diagramme Gantt pour l'impression
   */
  setGanttImage(imageDataUrl: string) {
    this.ganttImage.set(imageDataUrl);
  }

  /**
   * Recupere l'image du diagramme
   */
  getGanttImage() {
    return this.ganttImage();
  }

  /**
   * Reinitialise les donnees
   */
  clearData() {
    this.ganttImage.set(null);
  }
}
