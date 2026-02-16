import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private ganttImage = signal<string | null>(null);

  /**
   * Définit l'image du diagramme Gantt pour l'impression
   */
  setGanttImage(imageDataUrl: string) {
    this.ganttImage.set(imageDataUrl);
  }

  /**
   * Récupère l'image du diagramme
   */
  getGanttImage() {
    return this.ganttImage();
  }

  /**
   * Réinitialise les données
   */
  clearData() {
    this.ganttImage.set(null);
  }
}
