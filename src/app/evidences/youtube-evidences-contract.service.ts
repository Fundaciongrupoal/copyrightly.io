import { Injectable, NgZone } from '@angular/core';
import { Web3Service } from '../util/web3.service';
import { Observable } from 'rxjs/internal/Observable';
import { ReplaySubject } from 'rxjs';
import { YouTubeEvidence } from './youtubeEvidence';
import { YouTubeEvidenceEvent } from './youtube-evidence-event';
import { Event } from '../util/event';

declare const require: any;
const evidences = require('../../assets/contracts/YouTubeEvidences.json');
const proxy = require('../../assets/contracts/AdminUpgradeabilityProxy.json');

const web3 = require('web3');

@Injectable({
  providedIn: 'root'
})
export class YouTubeEvidencesContractService {
  private ORACLIZE_GASLIMIT = 100000;

  private deployedContract = new ReplaySubject<any>(1);
  private manifestationsAddress: string;

  constructor(private web3Service: Web3Service,
              private ngZone: NgZone) {
    this.web3Service.getNetworkId()
    .subscribe(network_id => {
      if (evidences.networks[network_id]) {
        const deployedAddress = evidences.networks[network_id].address;
        this.manifestationsAddress = proxy.networks[network_id].address;
        this.deployedContract.next(
          new this.web3Service.web3.eth.Contract(evidences.abi, deployedAddress));
      } else {
        this.deployedContract.error(new Error('YouTubeEvidences contract ' +
          'not found in current network with id ' + network_id));
      }
    });
  }

  public addEvidence(evidence: YouTubeEvidence, account: string, price: number): Observable<string> {
    return new Observable((observer) => {
      this.deployedContract.subscribe(contract => {
        contract.methods.check(this.manifestationsAddress, evidence.evidencedId, evidence.videoId, this.ORACLIZE_GASLIMIT)
        .send({from: account, gas: 300000, value: web3.utils.toWei(price)})
        .on('transactionHash', hash =>
          this.ngZone.run(() => {
            observer.next(hash);
            observer.complete();
          }))
        .on('error', error => {
          console.error(error);
          this.ngZone.run(() => {
            observer.error(new Error('Error registering evidence, see log for details'));
            observer.complete();
          });
        });
      }, error => this.ngZone.run(() => { observer.error(error); observer.complete(); }));
      return { unsubscribe() {} };
    });
  }

  public listManifestationEvidences(manifestationHash: string): Observable<YouTubeEvidenceEvent[]> {
    return new Observable((observer) => {
      this.deployedContract.subscribe(contract => {
        contract.getPastEvents('YouTubeEvidenceEvent',
          {filter: {evidencedIdHash: web3.utils.soliditySha3(manifestationHash)}, fromBlock: 0})
        .then(events => {
          observer.next(events.map(event => {
            event.returnValues.evidencedId = manifestationHash;
            const evidenceEvent = new YouTubeEvidenceEvent(event);
            this.web3Service.getBlockDate(event.blockNumber)
            .subscribe(date =>
              this.ngZone.run(() => evidenceEvent.when = date)
            );
            return evidenceEvent;
          }));
          observer.complete();
        })
        .catch(error => {
          console.log(error);
          this.ngZone.run(() => {
            observer.error(new Error('Error listing manifestation\'s evidence, see log for details'));
            observer.complete();
          });
        });
      }, error => this.ngZone.run(() => { observer.error(error); observer.complete(); }));
      return { unsubscribe() {} };
    });
  }

  public watchEvidenceEvents(account: string): Observable<Event> {
    return new Observable((observer) => {
      this.deployedContract.subscribe(contract => {
        contract.events.YouTubeEvidenceEvent({ filter: { evidencer: account }, fromBlock: 'latest' })
        .on('data', event => {
          const evidenceEvent = new YouTubeEvidenceEvent(event);
          this.getEvidence(event.returnValues.evidenceId)
          .subscribe(evidence => {
            evidenceEvent.what.evidencedId = evidence.evidencedId;
            this.web3Service.getBlockDate(event.blockNumber)
            .subscribe(date => {
              this.ngZone.run(() => {
                evidenceEvent.when = date;
                observer.next(evidenceEvent);
                observer.complete();
              });
            });
          });
        })
        .on('error', error => {
          console.log(error);
          this.ngZone.run(() => {
            observer.error(new Error('Error listening to YouTube evidence events, see log for details'));
            observer.complete();
          });
        });
      }, error => this.ngZone.run(() => { observer.error(error); observer.complete(); }));
      return { unsubscribe() {} };
    });
  }

  getEvidence(evidenceId: string): Observable<YouTubeEvidence> {
    return new Observable((observer) => {
      this.deployedContract.subscribe(contract => {
        contract.methods.evidences(evidenceId).call()
        .then(result => {
          this.ngZone.run(() => {
            const evidence = new YouTubeEvidence(result);
            evidence.evidenceId = evidenceId;
            observer.next(evidence);
            observer.complete();
          });
        })
        .catch(error => {
          console.error(error);
          this.ngZone.run(() => {
            observer.error(new Error('Error retrieving evidence, see logs for details'));
            observer.complete();
          });
        });
      }, error => this.ngZone.run(() => { observer.error(error); observer.complete(); }));
      return { unsubscribe() {} };
    });
  }

  getPrice(): Observable<number> {
    return new Observable((observer) => {
      this.deployedContract.subscribe(contract => {
        contract.methods.getPrice(this.ORACLIZE_GASLIMIT).call()
        .then(result => {
          this.ngZone.run(() => {
            observer.next(web3.utils.fromWei(result));
            observer.complete();
          });
        })
        .catch(error => {
          console.error(error);
          this.ngZone.run(() => {
            observer.error(new Error('Error retrieving evidence price, see logs for details'));
            observer.complete();
          });
        });
      }, error => this.ngZone.run(() => { observer.error(error); observer.complete(); }));
      return { unsubscribe() {} };
    });
  }
}
