export class YouTubeEvidence {
  evidenceId: string;
  evidencedId: string;
  videoId: string;

  constructor(values: Object = {}) {
    Object.assign(this, values);
  }
}
