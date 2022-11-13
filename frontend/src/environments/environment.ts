// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  SOCKET_ENDPOINT: 'http://localhost:3001',
  firebaseConfig: {
    apiKey: "AIzaSyBHhc3xQqSmDqwSamfeJdZmpaRQVdnYs60",
    authDomain: "battleship-d8efb.firebaseapp.com",
    projectId: "battleship-d8efb",
    storageBucket: "battleship-d8efb.appspot.com",
    messagingSenderId: "463713644987",
    appId: "1:463713644987:web:a4af20a459cc9d9def149e",
    measurementId: "G-TVT9BJDZ8S"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
