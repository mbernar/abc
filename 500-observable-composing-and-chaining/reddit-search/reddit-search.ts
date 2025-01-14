import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';

import { RedditImageSearch } from './redditImageSearch';

@Component({
  selector: 'reddit-search',
  moduleId: __moduleName,
  templateUrl: './reddit-search.html',
  providers: [RedditImageSearch]
})
export class RedditSearchComponent {
  subReddit = new FormControl('aww');
  search = new FormControl('');
  results: Observable<string[]>;

  constructor(ris: RedditImageSearch) {
    const validSubReddit$ = this.subReddit.valueChanges
      .startWith(this.subReddit.value)
      .map(sr => sr.trim())
      .filter(sr => sr !== '');

    const validSearch$ = this.search.valueChanges
      .startWith(this.search.value)
      .map(search => search.trim())
      .filter(search => search !== '');

    const combinedCriteria$ = Observable.combineLatest(
      validSubReddit$, validSearch$,
      (subReddit, search) => ({ subReddit, search })
    );

    this.results = combinedCriteria$
      .do(x => console.log('change', x))
      .debounceTime(500)
      .do(x => console.log('after debounce', x))
      .switchMap(val =>
        Observable.merge(
          // Initially, show no results, while waiting.
          Observable.of([]),
          // Replace with results as they arrive, auto retry.
          ris.search(val.subReddit, val.search)
            .retry(3)
        ));
  }
}
