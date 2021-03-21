import { Time, TimeDirection, Callback } from '../types';
import { padTime } from '../utils';

export default class Timer {
  public el: HTMLElement | null;
  public duration: number;
  public direction: TimeDirection;

  protected startTime: number;
  protected currentTime: number;
  protected timeout: NodeJS.Timeout;

  constructor(elementId: string, duration = 0, direction = TimeDirection.forward) {
    this.el = document.getElementById(elementId);
    this.duration = duration * 1000;
    this.direction = direction;
    this.startTime = Date.now();
    this.currentTime = this.isForward ? 0 : duration;

    this.start();
    this.render();
  }

  protected render(): void {
    if (!this.el) return;
    const { s, m, h } = this.time;
    this.el.textContent = `${h}:${m}:${s}`;
  }

  protected start(): void {
    this.timeout = setInterval(() => this.updateTime(), 1000);
  }

  protected emit(event: string, detail?: unknown): void {
    this.el.dispatchEvent(new CustomEvent(event, { detail }));
  }

  public stop(): void {
    clearInterval(this.timeout);
    this.emit('stop');
  }

  public on(event: string, handler: Callback): void {
    return this.el.addEventListener(event, (e) => {
      if (!('detail' in e)) return;
      handler((e));
    });
  }

  protected updateTime(): void {
    this.currentTime = this.isForward ? Date.now() - this.startTime : this.startTime + this.duration - Date.now();
    if (!this.isForward && this.currentTime < 0) {
      this.stop();
      return;
    }
    this.render();
  }

  protected get isForward(): boolean {
    return this.direction === TimeDirection.forward;
  }

  protected get time(): Time {
    const m = padTime(Math.floor(this.currentTime / 1000 / 60));
    const h = padTime(Math.floor(this.currentTime / 1000 / 3600));
    const s = padTime(Math.round(this.currentTime / 1000) % 60);
    return { s, m, h };
  }
}
