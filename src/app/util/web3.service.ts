import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Connect } from 'uport-connect';
import { ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import Web3 from 'web3';

declare let require: any;
declare let window: any;
const TRUFFLE_CONFIG = require('../../../truffle');

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  public useWebSockets = true; // TODO: Disable to improve interoperability with current tools
  public web3: any;
  public  networkId = new ReplaySubject<any>(1);

  private connect: Connect;
  private uPortNetwork = 'rinkeby';
  private uPortAppName = 'copyrightly.io';

  constructor(private ngZone: NgZone) {
    if (typeof window.web3 === 'undefined') {
      // Default, use local network defined by Truffle config if none provided
      if (this.useWebSockets) {
        const localNode = 'ws://' + TRUFFLE_CONFIG.networks.development.host + ':' +
          TRUFFLE_CONFIG.networks.development.port;
        console.log('Using Web3 for local node: ' + localNode);
        this.web3 = new Web3(new Web3.providers.WebsocketProvider(localNode));
      } else {
        const localNode = 'http://' + TRUFFLE_CONFIG.networks.development.host + ':' +
          TRUFFLE_CONFIG.networks.development.port;
        console.log('Using Web3 for local node: ' + localNode);
        this.web3 = new Web3(new Web3.providers.HttpProvider(localNode));
        // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
        // Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      }
    } else {
      if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
      } else if (window.web3) {
        this.web3 = new Web3(window.web3.currentProvider);
      } else {
        this.connect = new Connect(this.uPortAppName,
          { network: this.uPortNetwork, accountType: 'general' });
        this.web3 = new Web3(this.connect.getProvider());
      }
    }
    this.web3.eth.net.getId()
      .then(networkId => {
        this.networkId.next(networkId);
      });
  }

  public getNetworkName(): Observable<string> {
    return this.networkId.pipe(map(network => {
      switch (network) {
        case 1: return 'MainNet';
        case 2: return 'Morden';
        case 3: return 'Ropsten';
        case 4: return 'Rinkeby';
        default: return 'LocalNet';
      }
    }));
  }

  public getAccounts(): Observable<string[]> {
    return new Observable((observer) => {
      this.web3.eth.getAccounts()
        .then(accounts => {
          if (accounts.length === 0) {
            // Request account access if needed
            window.ethereum.enable().then(enabledAccounts =>
              this.ngZone.run(() => {
                if (!enabledAccounts) { enabledAccounts = []; }
                observer.next(enabledAccounts);
                observer.complete();
              })
            ).catch(error => console.log('Error: ' + error));
          } else {
            this.ngZone.run(() => {
              observer.next(accounts);
              observer.complete();
            });
          }
        })
        .catch(error => {
          console.error(error);
          this.ngZone.run(() => {
            observer.error(new Error('Retrieving accounts<br>' +
              'A Web3-enable browser or supporting the ' +
              '<a target="_blank" href="https://metamask.io">MetaMask</a> extension required'));
          });
        });
      return { unsubscribe() {} };
    });
  }

  public getBlockDate(blockNumber: number): Observable<Date> {
    return new Observable((observer) => {
      this.web3.eth.getBlock(blockNumber)
      .then(block => {
        this.ngZone.run(() => {
          const date = block !== null ? new Date(block.timestamp * 1000) : new Date();
          observer.next(date);
          observer.complete();
        });
      })
      .catch(error => {
        console.error(error);
        this.ngZone.run(() => {
          observer.error('Block date not retrieved, see log for details');
          observer.complete();
        });
      });
      return { unsubscribe() {} };
    });
  }
}
