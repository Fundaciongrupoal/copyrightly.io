import { Event } from '../util/event';
import { YouTubeEvidence } from './youtubeEvidence';

export class YouTubeEvidenceEvent extends Event {
  what: YouTubeEvidence;

  constructor(event: any) {
    super({ type: event.event, who: event.returnValues.evidencer });
    this.what = new YouTubeEvidence({
      evidenceId: event.returnValues.evidenceId,
      evidencedId: event.returnValues.evidencedId,
      videoId: event.returnValues.videoId
    });
  }
}
