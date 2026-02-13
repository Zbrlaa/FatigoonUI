import { Injectable, signal } from '@angular/core';
import { TvShow } from '../components/gantt-tv/gantt-tv.component';

@Injectable({
  providedIn: 'root'
})
export class PrintService {
  private shows = signal<TvShow[]>([]);
  private channels = signal<string[]>([]);

  /**
   * Définit les données du diagramme Gantt pour l'impression
   */
  setGanttData(shows: TvShow[], channels: string[]) {
    this.shows.set(shows);
    this.channels.set(channels);
  }

  /**
   * Récupère les émissions
   */
  getShows() {
    return this.shows();
  }

  /**
   * Récupère les chaînes
   */
  getChannels() {
    return this.channels();
  }

  /**
   * Réinitialise les données
   */
  clearData() {
    this.shows.set([]);
    this.channels.set([]);
  }
}
